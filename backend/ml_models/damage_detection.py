import os
import numpy as np
from PIL import Image, ImageFilter

def detect_damage(customer_image_path):
    """
    Detects whether the returned product shows signs of heavy use or damage
    using Laplacian edge variance as a heuristic indicator of scratches/cracks.
    
    Returns:
        damage_probability: float
        damage_level: str ('None', 'Minor', 'Severe')
    """
    if not os.path.exists(customer_image_path):
        return 0.0, "None"
        
    try:
        # Convert to grayscale
        img = Image.open(customer_image_path).convert('L')
        # Resize to normalize the measurement scale
        img = img.resize((256, 256))
        
        # Apply FIND_EDGES (effectively a directional derivative/Laplacian)
        edges = img.filter(ImageFilter.FIND_EDGES)
        edge_data = np.array(edges)
        
        # Calculate mean of edges
        mean_edge = np.mean(edge_data)
        
        # A clean, smooth product will have low edge mean. 
        # A scratched, cracked, or severely damaged product will have higher edge artifacts.
        # Normalize arbitrarily to [0, 1] scale for heuristic scoring
        # Typical values: smooth shape ~ 5-10, complex shape ~ 15-25, highly textured/damaged ~ 30-50+
        
        base_score = mean_edge / 40.0
        
        capped_prob = max(0.0, min(base_score, 0.99))
        
        if capped_prob < 0.35:
            level = "None"
        elif capped_prob < 0.65:
            level = "Minor"
        else:
            level = "Severe"
            
        return round(capped_prob, 3), level
        
    except Exception as e:
        print(f"Error in damage detection: {e}")
        return 0.0, "None"
