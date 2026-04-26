import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np

# Initialize a pre-trained ResNet18 solely as a robust feature extractor
class FeatureExtractor(nn.Module):
    def __init__(self):
        super(FeatureExtractor, self).__init__()
        # Use ImageNet weights to extract high-level structural and texture features
        resnet = models.resnet18(weights='DEFAULT')
        # Remove the final classification layer to get the raw 512-dimensional feature vector
        self.features = nn.Sequential(*list(resnet.children())[:-1])
        
        for param in self.features.parameters():
            param.requires_grad = False

    def forward(self, x):
        x = self.features(x)
        return x.view(x.size(0), -1) # Flatten to (batch, 512)

try:
    _feature_extractor = FeatureExtractor()
    _feature_extractor.eval()
except Exception as e:
    print(f"Failed to initialize feature extractor: {e}")
    _feature_extractor = None

_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                         std=[0.229, 0.224, 0.225])
])

def detect_damage(customer_image_path, shipping_image_paths):
    """
    Detects damage/usage by calculating the Deep Feature Distance (deviation)
    between the customer's returned image and the pristine baseline shipping images.
    
    Returns:
        damage_probability: float (0.0 to 1.0)
        damage_level: str ('None', 'Minor', 'Severe')
    """
    if not os.path.exists(customer_image_path) or not shipping_image_paths or _feature_extractor is None:
        return 0.0, "None"
        
    try:
        # 1. Extract feature vector for Customer Image
        cust_img = Image.open(customer_image_path).convert('RGB')
        cust_tensor = _transform(cust_img).unsqueeze(0)
        
        with torch.no_grad():
            cust_features = _feature_extractor(cust_tensor)
            
        # 2. Extract feature vectors for all Baseline Shipping Images
        baseline_features = []
        for path in shipping_image_paths:
            if os.path.exists(path):
                img = Image.open(path).convert('RGB')
                tensor = _transform(img).unsqueeze(0)
                with torch.no_grad():
                    baseline_features.append(_feature_extractor(tensor))
                    
        if not baseline_features:
            return 0.0, "None"
            
        # 3. Calculate minimum Cosine Distance (max similarity) to any baseline image
        cust_features_norm = torch.nn.functional.normalize(cust_features, p=2, dim=1)
        max_sim = 0.0
        
        for b_feat in baseline_features:
            b_feat_norm = torch.nn.functional.normalize(b_feat, p=2, dim=1)
            sim = torch.mm(cust_features_norm, b_feat_norm.transpose(0, 1)).item()
            max_sim = max(max_sim, sim)
            
        # 4. Damage Probability is inversely proportional to similarity
        # If it's the exact same item in pristine condition, similarity is near 1.0
        # Scratches, cracks, or heavy usage drastically alter local texture CNN features, dropping similarity.
        # A similarity drop below 0.8 usually indicates significant physical alterations.
        
        # Calculate Deviation / Damage Score
        damage_prob = 1.0 - max_sim
        
        # Scale the score so minor differences don't trigger 100% damage
        # Typical max_sim for same object slightly rotated is ~0.85 (Damage prob 0.15)
        # Typical max_sim for broken/damaged object is ~0.50 (Damage prob 0.50)
        
        # Mathematical boosting to make the % more representative
        scaled_damage = (damage_prob * 2.5)
        scaled_damage = max(0.01, min(scaled_damage, 0.99))
        
        if scaled_damage < 0.25:
            level = "None"
        elif scaled_damage < 0.60:
            level = "Minor"
        else:
            level = "Severe"
            
        return round(scaled_damage, 3), level
        
    except Exception as e:
        print(f"Error in deep feature damage detection: {e}")
        return 0.0, "None"
