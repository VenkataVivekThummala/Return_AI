"""
Tests for ReturnAI backend.

Run with:  python manage.py test app
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta

from app.models import User, ReturnRequest
from app.ml_engine import (
    extract_return_features, compute_risk_score,
    analyze_image_authenticity, IsolationForestSimulator, FraudClassifier,
)
import numpy as np
import io


# ─────────────────────────────────────────────
# ML Engine Tests
# ─────────────────────────────────────────────

class FeatureExtractionTest(TestCase):

    def _features(self, **kwargs):
        defaults = dict(
            order_id='ORD-001',
            product_name='Test Product',
            delivery_date=date.today() - timedelta(days=5),
            return_reason='delivery_damaged',
            description='The product was damaged on arrival',
            image_count=2,
        )
        defaults.update(kwargs)
        return extract_return_features(**defaults)

    def test_returns_7_features(self):
        f = self._features()
        self.assertEqual(len(f), 7)

    def test_no_images_raises_risk(self):
        f_no_img = self._features(image_count=0)
        f_with_img = self._features(image_count=3)
        self.assertGreater(f_no_img[3], f_with_img[3])

    def test_very_short_description_raises_risk(self):
        f_short = self._features(description='Bad')
        f_long = self._features(description='The product arrived damaged with a cracked screen and broken frame.')
        self.assertGreater(f_short[2], f_long[2])

    def test_reason_other_highest_risk(self):
        f_other = self._features(return_reason='other')
        f_damaged = self._features(return_reason='delivery_damaged')
        self.assertGreater(f_other[1], f_damaged[1])

    def test_early_return_flag(self):
        f_early = self._features(delivery_date=date.today())
        f_normal = self._features(delivery_date=date.today() - timedelta(days=10))
        self.assertEqual(f_early[5], 1.0)
        self.assertEqual(f_normal[5], 0.0)


class IsolationForestTest(TestCase):

    def test_score_in_range(self):
        iso = IsolationForestSimulator()
        features = np.array([0.5, 0.4, 0.3, 0.2, 0.5, 0.0, 0.2])
        score = iso.score(features)
        self.assertGreaterEqual(score, 0.0)
        self.assertLessEqual(score, 1.0)

    def test_high_risk_features_score_higher(self):
        iso = IsolationForestSimulator()
        low_risk = np.array([0.1, 0.2, 0.1, 0.1, 0.1, 0.0, 0.1])
        high_risk = np.array([0.9, 0.9, 0.9, 0.9, 0.9, 1.0, 0.9])
        self.assertLess(iso.score(low_risk), iso.score(high_risk))


class FraudClassifierTest(TestCase):

    def test_probability_in_range(self):
        clf = FraudClassifier()
        features = np.array([0.3, 0.3, 0.2, 0.2, 0.3, 0.0, 0.2])
        prob = clf.predict_proba(features)
        self.assertGreaterEqual(prob, 0.0)
        self.assertLessEqual(prob, 1.0)


class CompositeRiskScoreTest(TestCase):

    def _score(self, **kwargs):
        defaults = dict(
            order_id='ORD-TEST-001',
            product_name='Test Product',
            delivery_date=date.today() - timedelta(days=5),
            return_reason='delivery_damaged',
            description='The product arrived with a cracked screen and damaged packaging.',
            image_analyses=[{'manipulation_score': 0.1, 'metadata_flags': [], 'image_hash': 'abc123'}],
        )
        defaults.update(kwargs)
        return compute_risk_score(**defaults)

    def test_returns_all_required_keys(self):
        result = self._score()
        for key in ['risk_score', 'fraud_probability', 'anomaly_score',
                    'image_authenticity_score', 'risk_level', 'risk_factors',
                    'recommended_status', 'ml_analysis']:
            self.assertIn(key, result)

    def test_score_in_valid_range(self):
        result = self._score()
        self.assertGreaterEqual(result['risk_score'], 0.0)
        self.assertLessEqual(result['risk_score'], 1.0)

    def test_no_images_flags_high_risk(self):
        result = self._score(image_analyses=[])
        self.assertIn('No product images provided', result['risk_factors'])
        self.assertGreater(result['risk_score'], 0.4)

    def test_risk_level_mapping(self):
        result = self._score()
        level = result['risk_level']
        score = result['risk_score']
        if score < 0.3:
            self.assertEqual(level, 'LOW')
        elif score < 0.55:
            self.assertEqual(level, 'MEDIUM')
        elif score < 0.75:
            self.assertEqual(level, 'HIGH')
        else:
            self.assertEqual(level, 'CRITICAL')

    def test_ml_analysis_contains_model_versions(self):
        result = self._score()
        self.assertIn('model_versions', result['ml_analysis'])
        self.assertIn('fraud_classifier', result['ml_analysis']['model_versions'])


# ─────────────────────────────────────────────
# API Tests
# ─────────────────────────────────────────────

class AuthAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            email='test_customer@test.com',
            name='Test Customer',
            password='testpass123',
            role='customer',
        )
        self.manager = User.objects.create_user(
            email='test_manager@test.com',
            name='Test Manager',
            password='testpass123',
            role='manager',
        )

    def test_register_customer(self):
        res = self.client.post('/api/register/', {
            'name': 'New User',
            'email': 'new@test.com',
            'password': 'newpass123',
            'role': 'customer',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data)
        self.assertEqual(res.data['user']['role'], 'customer')

    def test_login_success(self):
        res = self.client.post('/api/login/', {
            'email': 'test_customer@test.com',
            'password': 'testpass123',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_login_wrong_password(self):
        res = self.client.post('/api/login/', {
            'email': 'test_customer@test.com',
            'password': 'wrongpassword',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_me_authenticated(self):
        self.client.force_authenticate(user=self.customer)
        res = self.client.get('/api/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'test_customer@test.com')

    def test_get_me_unauthenticated(self):
        res = self.client.get('/api/me/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class ReturnRequestAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            email='c@test.com', name='Customer', password='pass', role='customer'
        )
        self.manager = User.objects.create_user(
            email='m@test.com', name='Manager', password='pass', role='manager'
        )
        self.return_request = ReturnRequest.objects.create(
            customer=self.customer,
            order_id='ORD-TEST-001',
            product_name='Test Product',
            delivery_date=date.today() - timedelta(days=5),
            return_reason='not_working',
            description='Test description for return request',
            status='pending',
            risk_score=0.25,
            fraud_probability=0.20,
            anomaly_score=0.28,
            image_authenticity_score=0.15,
            risk_factors=[],
            ml_analysis={'model_versions': {}, 'features_used': [], 'feature_values': [], 'ensemble_weights': {}, 'image_analyses': []},
        )

    def test_customer_can_view_own_returns(self):
        self.client.force_authenticate(user=self.customer)
        res = self.client.get('/api/my-returns/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_manager_cannot_access_my_returns(self):
        self.client.force_authenticate(user=self.manager)
        res = self.client.get('/api/my-returns/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_can_view_all_returns(self):
        self.client.force_authenticate(user=self.manager)
        res = self.client.get('/api/returns/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('returns', res.data)
        self.assertIn('stats', res.data)

    def test_customer_cannot_view_all_returns(self):
        self.client.force_authenticate(user=self.customer)
        res = self.client.get('/api/returns/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_can_update_status(self):
        self.client.force_authenticate(user=self.manager)
        res = self.client.put(f'/api/update-status/{self.return_request.id}/', {'status': 'approved'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.return_request.refresh_from_db()
        self.assertEqual(self.return_request.status, 'approved')

    def test_customer_cannot_update_status(self):
        self.client.force_authenticate(user=self.customer)
        res = self.client.put(f'/api/update-status/{self.return_request.id}/', {'status': 'approved'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_customer_can_view_own_return_detail(self):
        self.client.force_authenticate(user=self.customer)
        res = self.client.get(f'/api/return/{self.return_request.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['order_id'], 'ORD-TEST-001')

    def test_customer_cannot_view_others_return(self):
        other_customer = User.objects.create_user(
            email='other@test.com', name='Other', password='pass', role='customer'
        )
        self.client.force_authenticate(user=other_customer)
        res = self.client.get(f'/api/return/{self.return_request.id}/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_status_rejected(self):
        self.client.force_authenticate(user=self.manager)
        res = self.client.put(
            f'/api/update-status/{self.return_request.id}/',
            {'status': 'invalid_status'},
            format='json'
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_dashboard_stats(self):
        self.client.force_authenticate(user=self.manager)
        res = self.client.get('/api/dashboard/stats/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        for key in ['total', 'pending', 'approved', 'rejected', 'high_risk']:
            self.assertIn(key, res.data)
