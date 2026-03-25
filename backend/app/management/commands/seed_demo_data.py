"""
Management command: python manage.py seed_demo_data

Seeds the database with:
- 1 demo customer
- 1 demo manager
- 1 admin superuser
- 10 sample return requests with realistic ML scores
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
import random

from app.models import User, ReturnRequest


class Command(BaseCommand):
    help = 'Seeds the database with demo users and return requests'

    def handle(self, *args, **options):
        self.stdout.write('🌱 Seeding demo data...\n')

        # ── Users ────────────────────────────────────────────
        customer, _ = User.objects.get_or_create(
            email='customer@demo.com',
            defaults={
                'name': 'Alex Johnson',
                'role': 'customer',
            }
        )
        customer.set_password('demo123')
        customer.save()
        self.stdout.write(self.style.SUCCESS('  ✓ Customer: customer@demo.com / demo123'))

        manager, _ = User.objects.get_or_create(
            email='manager@demo.com',
            defaults={
                'name': 'Sarah Chen',
                'role': 'manager',
            }
        )
        manager.set_password('demo123')
        manager.save()
        self.stdout.write(self.style.SUCCESS('  ✓ Manager:  manager@demo.com / demo123'))

        admin, _ = User.objects.get_or_create(
            email='admin@demo.com',
            defaults={
                'name': 'Admin User',
                'role': 'manager',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin.set_password('admin123')
        admin.save()
        self.stdout.write(self.style.SUCCESS('  ✓ Admin:    admin@demo.com  / admin123'))

        # Extra customers
        extra_customers = [
            ('Priya Sharma', 'priya@demo.com'),
            ('David Kim', 'david@demo.com'),
            ('Maria Garcia', 'maria@demo.com'),
        ]
        created_customers = [customer]
        for name, email in extra_customers:
            u, _ = User.objects.get_or_create(email=email, defaults={'name': name, 'role': 'customer'})
            u.set_password('demo123')
            u.save()
            created_customers.append(u)

        # ── Return Requests ───────────────────────────────────
        if ReturnRequest.objects.count() > 0:
            self.stdout.write('  ℹ  Return requests already exist — skipping.\n')
        else:
            sample_returns = [
                {
                    'order_id': 'ORD-2024-8821',
                    'product_name': 'Sony WH-1000XM5 Headphones',
                    'delivery_date': date.today() - timedelta(days=5),
                    'return_reason': 'not_working',
                    'description': 'The right ear cup stopped producing sound after just 2 days of normal use. I have tried resetting but the issue persists.',
                    'status': 'pending',
                    'risk_score': 0.18,
                    'fraud_probability': 0.15,
                    'anomaly_score': 0.20,
                    'image_authenticity_score': 0.10,
                    'risk_factors': [],
                    'customer': customer,
                },
                {
                    'order_id': 'ORD-2024-5543',
                    'product_name': 'Apple iPad Air 5th Gen',
                    'delivery_date': date.today() - timedelta(days=12),
                    'return_reason': 'delivery_damaged',
                    'description': 'Screen had a large crack across the display when I opened the box. The outer packaging looked fine.',
                    'status': 'under_review',
                    'risk_score': 0.41,
                    'fraud_probability': 0.38,
                    'anomaly_score': 0.45,
                    'image_authenticity_score': 0.35,
                    'risk_factors': ['Image authenticity analysis flagged potential manipulation'],
                    'customer': created_customers[1],
                },
                {
                    'order_id': 'ORD-2024-3317',
                    'product_name': 'Nike Air Max 270',
                    'delivery_date': date.today() - timedelta(days=1),
                    'return_reason': 'wrong_item',
                    'description': 'Wrong size.',
                    'status': 'flagged',
                    'risk_score': 0.88,
                    'fraud_probability': 0.92,
                    'anomaly_score': 0.85,
                    'image_authenticity_score': 0.78,
                    'risk_factors': [
                        'Return submitted within 24 hours of delivery',
                        'Very short or vague return description',
                        'No product images provided',
                        'High ELA score — possible image editing',
                        'Fraud classifier flagged high probability pattern',
                        'Unusual return pattern detected by anomaly model',
                    ],
                    'customer': created_customers[2],
                },
                {
                    'order_id': 'ORD-2024-9902',
                    'product_name': 'Samsung 65" QLED TV',
                    'delivery_date': date.today() - timedelta(days=8),
                    'return_reason': 'delivery_damaged',
                    'description': 'The TV arrived with a large crack in the screen panel. The delivery team noted the box was damaged but delivered anyway.',
                    'status': 'approved',
                    'risk_score': 0.12,
                    'fraud_probability': 0.10,
                    'anomaly_score': 0.15,
                    'image_authenticity_score': 0.08,
                    'risk_factors': [],
                    'customer': customer,
                },
                {
                    'order_id': 'ORD-2024-7741',
                    'product_name': 'Dyson V15 Vacuum',
                    'delivery_date': date.today() - timedelta(days=20),
                    'return_reason': 'not_working',
                    'description': 'Suction power dropped significantly after the first week. Cleaned filters multiple times but no improvement.',
                    'status': 'rejected',
                    'risk_score': 0.62,
                    'fraud_probability': 0.58,
                    'anomaly_score': 0.70,
                    'image_authenticity_score': 0.45,
                    'risk_factors': [
                        'Image authenticity analysis flagged potential manipulation',
                        'Fraud classifier flagged high probability pattern',
                    ],
                    'customer': created_customers[3],
                },
                {
                    'order_id': 'ORD-2024-1156',
                    'product_name': 'Logitech MX Master 3S Mouse',
                    'delivery_date': date.today() - timedelta(days=3),
                    'return_reason': 'wrong_item',
                    'description': 'I ordered the graphite color but received the pale grey variant. Both the outer box and device label show the wrong SKU.',
                    'status': 'pending',
                    'risk_score': 0.25,
                    'fraud_probability': 0.22,
                    'anomaly_score': 0.28,
                    'image_authenticity_score': 0.15,
                    'risk_factors': [],
                    'customer': customer,
                },
                {
                    'order_id': 'ORD-2024-6634',
                    'product_name': 'Kindle Paperwhite',
                    'delivery_date': date.today() - timedelta(days=7),
                    'return_reason': 'other',
                    'description': 'Changed mind.',
                    'status': 'under_review',
                    'risk_score': 0.72,
                    'fraud_probability': 0.68,
                    'anomaly_score': 0.75,
                    'image_authenticity_score': 0.70,
                    'risk_factors': [
                        'Unspecified return reason selected',
                        'Very short or vague return description',
                        'Image authenticity analysis flagged potential manipulation',
                        'Unusual return pattern detected by anomaly model',
                    ],
                    'customer': created_customers[1],
                },
                {
                    'order_id': 'ORD-2024-4428',
                    'product_name': 'GoPro Hero 12 Black',
                    'delivery_date': date.today() - timedelta(days=15),
                    'return_reason': 'not_working',
                    'description': 'Camera freezes randomly during recording and sometimes will not power on. Issue started after the first day of use.',
                    'status': 'approved',
                    'risk_score': 0.19,
                    'fraud_probability': 0.17,
                    'anomaly_score': 0.22,
                    'image_authenticity_score': 0.12,
                    'risk_factors': [],
                    'customer': created_customers[2],
                },
                {
                    'order_id': 'ORD-2024-2287',
                    'product_name': 'LEGO Technic Bugatti',
                    'delivery_date': date.today() - timedelta(days=2),
                    'return_reason': 'delivery_damaged',
                    'description': 'Box was completely crushed and several bags of pieces were torn open. Many small pieces are missing.',
                    'status': 'pending',
                    'risk_score': 0.32,
                    'fraud_probability': 0.29,
                    'anomaly_score': 0.35,
                    'image_authenticity_score': 0.28,
                    'risk_factors': ['Image: Very small file size — possible screenshot'],
                    'customer': created_customers[3],
                },
                {
                    'order_id': 'ORD-2024-0091',
                    'product_name': 'iPhone 15 Pro Max',
                    'delivery_date': date.today() - timedelta(days=0),
                    'return_reason': 'wrong_item',
                    'description': 'X',
                    'status': 'flagged',
                    'risk_score': 0.95,
                    'fraud_probability': 0.97,
                    'anomaly_score': 0.93,
                    'image_authenticity_score': 0.88,
                    'risk_factors': [
                        'Return submitted within 24 hours of delivery',
                        'Very short or vague return description',
                        'No product images provided',
                        'Fraud classifier flagged high probability pattern',
                        'Unusual return pattern detected by anomaly model',
                    ],
                    'customer': customer,
                },
            ]

            for i, r in enumerate(sample_returns):
                customer_obj = r.pop('customer')
                ReturnRequest.objects.create(
                    customer=customer_obj,
                    ml_analysis={
                        'model_versions': {
                            'fraud_classifier': 'RandomForest-v2.1',
                            'anomaly_detector': 'IsolationForest-v1.3',
                            'image_analyzer': 'CNN-ELA-v1.0',
                        },
                        'features_used': [
                            'days_since_delivery', 'return_reason_risk', 'description_quality',
                            'image_count_score', 'order_id_entropy', 'early_return_flag', 'product_specificity',
                        ],
                        'feature_values': [round(random.uniform(0, 1), 3) for _ in range(7)],
                        'ensemble_weights': {
                            'fraud_classifier': 0.35, 'anomaly_detector': 0.30,
                            'image_analyzer': 0.25, 'temporal_factor': 0.10,
                        },
                        'image_analyses': [],
                    },
                    **r
                )
            self.stdout.write(self.style.SUCCESS(f'  ✓ Created {len(sample_returns)} sample return requests'))

        self.stdout.write('\n' + self.style.SUCCESS('✅ Demo data seeded successfully!\n'))
        self.stdout.write('  Login at http://localhost:3000\n')
        self.stdout.write('  Customer: customer@demo.com / demo123\n')
        self.stdout.write('  Manager:  manager@demo.com  / demo123\n')
        self.stdout.write('  Admin:    admin@demo.com    / admin123\n')
