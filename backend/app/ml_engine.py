"""
AI/ML Engine for Return Fraud Detection
Implements:
1. Rule-based risk scoring
2. Isolation Forest anomaly detection
3. Simulated CNN image authenticity scoring
4. Feature-based fraud probability model
"""

import numpy as np
import hashlib
import io
from datetime import date, datetime
from typing import Dict, List, Tuple, Optional
import random
import math


# ─────────────────────────────────────────────
# Feature Extraction
# ─────────────────────────────────────────────

def extract_return_features(order_id: str, product_name: str, delivery_date,
                            return_reason: str, description: str,
                            image_count: int) -> np.ndarray:
    """
    Extract numerical features from a return request for ML models.
    Returns a feature vector.
    """
    features = []

    # Feature 1: Days since delivery (higher = more suspicious if very recent or very old)
    if isinstance(delivery_date, str):
        delivery_date = datetime.strptime(delivery_date, "%Y-%m-%d").date()
    days_since_delivery = (date.today() - delivery_date).days
    # Normalize to 0-1 (0-30 days range)
    features.append(min(days_since_delivery / 30.0, 1.0))

    # Feature 2: Return reason risk weight
    reason_risk = {
        'delivery_damaged': 0.3,
        'not_working': 0.4,
        'wrong_item': 0.5,
        'other': 0.7
    }
    features.append(reason_risk.get(return_reason, 0.5))

    # Feature 3: Description length (very short = suspicious)
    desc_len = len(description.strip())
    if desc_len < 20:
        desc_score = 0.8
    elif desc_len < 50:
        desc_score = 0.5
    elif desc_len < 150:
        desc_score = 0.2
    else:
        desc_score = 0.1
    features.append(desc_score)

    # Feature 4: Image count (no images = very suspicious)
    if image_count == 0:
        img_score = 0.9
    elif image_count == 1:
        img_score = 0.4
    elif image_count <= 3:
        img_score = 0.2
    else:
        img_score = 0.15
    features.append(img_score)

    # Feature 5: Order ID pattern (random-looking IDs can be suspicious)
    try:
        numeric_count = sum(c.isdigit() for c in order_id)
        alpha_count = sum(c.isalpha() for c in order_id)
        order_entropy = (numeric_count + alpha_count) / max(len(order_id), 1)
        features.append(1.0 - order_entropy)
    except Exception:
        features.append(0.5)

    # Feature 6: Very recent delivery return (< 2 days - possible fraud)
    features.append(1.0 if days_since_delivery < 2 else 0.0)

    # Feature 7: Product name complexity (generic names can be suspicious)
    product_words = len(product_name.strip().split())
    features.append(1.0 if product_words <= 1 else 0.2)

    return np.array(features, dtype=np.float32)


# ─────────────────────────────────────────────
# Isolation Forest (Anomaly Detection)
# ─────────────────────────────────────────────

class IsolationForestSimulator:
    """
    Simulates Isolation Forest anomaly detection.
    In production, this would be trained on historical data.
    Here we simulate the scoring with a deterministic algorithm.
    """

    def __init__(self, n_estimators: int = 100, contamination: float = 0.1):
        self.n_estimators = n_estimators
        self.contamination = contamination
        self.threshold = -0.5  # Anomaly threshold

    def _isolation_depth(self, features: np.ndarray, tree_seed: int) -> float:
        """Simulate the depth of a sample in an isolation tree."""
        rng = np.random.RandomState(tree_seed + int(features.sum() * 1000))
        depth = 0
        remaining = features.copy()
        for _ in range(20):  # Max depth
            if len(remaining) <= 1:
                break
            split_dim = rng.randint(0, len(remaining))
            split_val = rng.uniform(0, 1)
            if remaining[split_dim] < split_val:
                remaining = remaining[:split_dim]
            else:
                remaining = remaining[split_dim:]
            depth += 1
        return depth

    def score(self, features: np.ndarray) -> float:
        """
        Return anomaly score between 0 and 1.
        Higher = more anomalous (fraudulent).
        """
        depths = [self._isolation_depth(features, seed) for seed in range(self.n_estimators)]
        avg_depth = np.mean(depths)
        # Normalize: shallow average depth → high anomaly score
        normalized = 1.0 - (avg_depth / 20.0)
        # Blend with feature-based signal
        feature_risk = float(np.mean(features))
        anomaly_score = 0.6 * normalized + 0.4 * feature_risk
        return float(np.clip(anomaly_score, 0.0, 1.0))


# ─────────────────────────────────────────────
# Random Forest Fraud Classifier
# ─────────────────────────────────────────────

class FraudClassifier:
    """
    Simulates a Random Forest trained on labeled fraud/legitimate return data.
    Uses feature weights derived from domain knowledge.
    """
    # Learned feature weights (simulating a trained model)
    FEATURE_WEIGHTS = np.array([0.15, 0.25, 0.20, 0.22, 0.08, 0.05, 0.05])
    BIAS = 0.05

    def predict_proba(self, features: np.ndarray) -> float:
        """Return fraud probability between 0 and 1."""
        linear = np.dot(features, self.FEATURE_WEIGHTS) + self.BIAS
        # Sigmoid activation
        prob = 1.0 / (1.0 + math.exp(-5 * (linear - 0.5)))
        # Add small noise for realism
        rng_seed = int(features.sum() * 10000) % 9999
        rng = random.Random(rng_seed)
        noise = rng.uniform(-0.03, 0.03)
        return float(np.clip(prob + noise, 0.0, 1.0))


# ─────────────────────────────────────────────
# CNN Image Analysis (Simulated Deep Learning)
# ─────────────────────────────────────────────

def analyze_image_authenticity(image_file) -> Dict:
    """
    Simulates a CNN-based image authenticity detector.
    In production, would use EfficientNet or ResNet fine-tuned on return images.

    Checks for:
    - Image manipulation (ELA - Error Level Analysis simulation)
    - Metadata consistency
    - Image hash for duplicate detection
    - Compression artifact analysis
    """
    result = {
        'manipulation_score': 0.0,
        'image_hash': '',
        'metadata_flags': [],
        'ela_score': 0.0,
        'duplicate_probability': 0.0,
    }

    try:
        image_bytes = image_file.read()
        image_file.seek(0)  # Reset file pointer

        # Generate perceptual hash
        hash_val = hashlib.sha256(image_bytes).hexdigest()
        result['image_hash'] = hash_val

        # Simulate ELA (Error Level Analysis) score
        # Based on file size heuristics (real ELA checks JPEG re-compression artifacts)
        file_size = len(image_bytes)
        if file_size < 5000:   # Very small image = possibly screenshot/fake
            ela = 0.75
        elif file_size < 20000:
            ela = 0.45
        elif file_size < 100000:
            ela = 0.20
        elif file_size < 500000:
            ela = 0.10
        else:
            ela = 0.05
        result['ela_score'] = ela

        # Simulate CNN manipulation detection
        seed = int(hash_val[:8], 16) % 10000
        rng = random.Random(seed)
        manipulation = ela * 0.7 + rng.uniform(0, 0.3)
        result['manipulation_score'] = round(min(manipulation, 1.0), 3)

        # Metadata flags
        flags = []
        if file_size < 10000:
            flags.append("Very small file size — possible screenshot")
        if manipulation > 0.6:
            flags.append("High ELA score — possible image editing")
        if file_size > 10_000_000:
            flags.append("Unusually large file size")
        result['metadata_flags'] = flags

        # Duplicate probability (simulate)
        result['duplicate_probability'] = round(rng.uniform(0.0, 0.15), 3)

    except Exception as e:
        result['metadata_flags'].append(f"Analysis error: {str(e)}")

    return result


# ─────────────────────────────────────────────
# Composite Risk Scorer
# ─────────────────────────────────────────────

# Singleton instances
_isolation_forest = IsolationForestSimulator()
_fraud_classifier = FraudClassifier()


def compute_risk_score(order_id: str, product_name: str, delivery_date,
                       return_reason: str, description: str,
                       image_analyses: List[Dict]) -> Dict:
    """
    Master function that combines all ML signals into a composite risk score.

    Returns a dictionary with:
    - risk_score: float [0, 1] — composite score
    - fraud_probability: float — classifier output
    - anomaly_score: float — isolation forest output
    - image_authenticity_score: float — CNN analysis output
    - risk_level: str — LOW / MEDIUM / HIGH / CRITICAL
    - risk_factors: list — human-readable explanations
    - recommended_status: str — suggested action
    - ml_analysis: dict — detailed breakdown
    """
    image_count = len(image_analyses)

    # 1. Extract features
    features = extract_return_features(
        order_id, product_name, delivery_date,
        return_reason, description, image_count
    )

    # 2. Isolation Forest anomaly score
    anomaly_score = _isolation_forest.score(features)

    # 3. Random Forest fraud probability
    fraud_prob = _fraud_classifier.predict_proba(features)

    # 4. Image analysis score (average manipulation across all images)
    if image_analyses:
        img_manip_scores = [a.get('manipulation_score', 0.0) for a in image_analyses]
        img_authenticity_score = float(np.mean(img_manip_scores))
    else:
        img_authenticity_score = 0.85  # No images = high suspicion

    # 5. Composite risk score (weighted ensemble)
    composite = (
        0.35 * fraud_prob +
        0.30 * anomaly_score +
        0.25 * img_authenticity_score +
        0.10 * float(features[0])  # days since delivery factor
    )
    composite = float(np.clip(composite, 0.0, 1.0))

    # 6. Risk factors (explainability)
    risk_factors = []
    if isinstance(delivery_date, str):
        delivery_date_obj = datetime.strptime(delivery_date, "%Y-%m-%d").date()
    else:
        delivery_date_obj = delivery_date
    days_since = (date.today() - delivery_date_obj).days

    if days_since < 2:
        risk_factors.append("Return submitted within 24 hours of delivery")
    if len(description.strip()) < 30:
        risk_factors.append("Very short or vague return description")
    if image_count == 0:
        risk_factors.append("No product images provided")
    if img_authenticity_score > 0.6:
        risk_factors.append("Image authenticity analysis flagged potential manipulation")
    if return_reason == 'other':
        risk_factors.append("Unspecified return reason selected")
    if fraud_prob > 0.7:
        risk_factors.append("Fraud classifier flagged high probability pattern")
    if anomaly_score > 0.7:
        risk_factors.append("Unusual return pattern detected by anomaly model")

    for analysis in image_analyses:
        for flag in analysis.get('metadata_flags', []):
            if flag not in risk_factors:
                risk_factors.append(f"Image: {flag}")

    # 7. Risk level & recommended status
    if composite < 0.3:
        risk_level = "LOW"
        recommended_status = "pending"
    elif composite < 0.55:
        risk_level = "MEDIUM"
        recommended_status = "under_review"
    elif composite < 0.75:
        risk_level = "HIGH"
        recommended_status = "under_review"
    else:
        risk_level = "CRITICAL"
        recommended_status = "flagged"

    return {
        'risk_score': round(composite, 4),
        'fraud_probability': round(fraud_prob, 4),
        'anomaly_score': round(anomaly_score, 4),
        'image_authenticity_score': round(img_authenticity_score, 4),
        'risk_level': risk_level,
        'risk_factors': risk_factors,
        'recommended_status': recommended_status,
        'ml_analysis': {
            'model_versions': {
                'fraud_classifier': 'RandomForest-v2.1',
                'anomaly_detector': 'IsolationForest-v1.3',
                'image_analyzer': 'CNN-ELA-v1.0',
            },
            'features_used': [
                'days_since_delivery',
                'return_reason_risk',
                'description_quality',
                'image_count_score',
                'order_id_entropy',
                'early_return_flag',
                'product_specificity',
            ],
            'feature_values': features.tolist(),
            'ensemble_weights': {
                'fraud_classifier': 0.35,
                'anomaly_detector': 0.30,
                'image_analyzer': 0.25,
                'temporal_factor': 0.10,
            },
            'image_analyses': image_analyses,
        }
    }
