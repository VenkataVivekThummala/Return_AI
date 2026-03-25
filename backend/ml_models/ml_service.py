from .image_similarity import compare_images
from .damage_detection import detect_damage
from .customer_behavior_model import calculate_customer_risk
import sys
import os

# Add to path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.models import ShippingImages, MLAnalysis

def process_return_ml(return_request):
    """
    Master service function that coordinates the three ML models.
    Enforces the CRITICAL rule: Do NOT run ML if no shipping images exist for that order.
    """
    
    # Get associated images (for simplicity just grab the first one the customer uploaded)
    customer_upload = return_request.images.first()
    if not customer_upload:
        return {"error": "No customer image available for analysis."}
        
    order_id = return_request.order_id
    shipping_qs = ShippingImages.objects.filter(order_id=order_id)
    
    # --- CRITICAL RULE ENFORCEMENT ---
    if not shipping_qs.exists():
        # Do NOT run ML.
        return {"error": "No shipping images found for this Order ID."}
        
    shipping_image_paths = [obj.image_path for obj in shipping_qs]
    
    # 1. Image Similarity
    sim_score, sim_prediction = compare_images(customer_upload.image.path, [x.path for x in shipping_image_paths])
    
    # 2. Damage Detection
    damage_prob, damage_level = detect_damage(customer_upload.image.path)
    
    # 3. Customer Behavior Analysis
    customer_risk_score = 0.0
    if hasattr(return_request.customer, 'behavior'):
        behavior = return_request.customer.behavior
        customer_risk_score = calculate_customer_risk(
            total_orders=behavior.total_orders,
            total_returns=behavior.total_returns,
            return_ratio=behavior.return_ratio,
            previous_rejections=behavior.previous_rejections
        )
        # Update behavior stats with this new return
        behavior.total_returns += 1
        behavior.return_ratio = behavior.total_returns / max(behavior.total_orders, 1)
        behavior.risk_score = customer_risk_score
        behavior.save()
        
    # 4. Save to DB
    # Create or update MLAnalysis entry
    ml_record, created = MLAnalysis.objects.get_or_create(
        return_request=return_request,
        defaults={
            'similarity_score': sim_score,
            'similarity_prediction': sim_prediction,
            'damage_level': damage_level,
            'damage_probability': damage_prob,
            'customer_risk_score': customer_risk_score,
            'model_used': {
                'similarity': 'ResNet50',
                'damage': 'YOLOv8',
                'behavior': 'RandomForest'
            }
        }
    )
    
    if not created:
        ml_record.similarity_score = sim_score
        ml_record.similarity_prediction = sim_prediction
        ml_record.damage_level = damage_level
        ml_record.damage_probability = damage_prob
        ml_record.customer_risk_score = customer_risk_score
        ml_record.save()
        
    return {"message": "ML Analysis complete"}
