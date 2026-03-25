import random

def detect_damage(customer_image_path):
    """
    Detects whether the returned product shows signs of heavy use or damage.
    Simulates a YOLOv8 object detection or CNN classifier.
    
    Returns:
        damage_probability: float
        damage_level: str ('None', 'Minor', 'Severe')
    """
    # Simulate based on a random probability
    prob = random.uniform(0.0, 1.0)
    
    if prob < 0.6:
        # 60% chance of no damage
        level = "None"
        capped_prob = prob * 0.3  # Map to 0 - 0.18
    elif prob < 0.85:
        # 25% chance of minor damage
        level = "Minor"
        capped_prob = prob * 0.5 + 0.15 # Map to 0.45 - 0.575
    else:
        # 15% chance of severe damage
        level = "Severe"
        capped_prob = prob * 0.2 + 0.8 # Map to 0.97 - 1.0
        
    return round(capped_prob, 3), level
