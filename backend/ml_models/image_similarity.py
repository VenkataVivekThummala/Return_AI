import os
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import torch.nn as nn
import random
import numpy as np

# Preprocessing for MobileNetV3
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

_model = None
_model_failed = False

def get_model():
    global _model, _model_failed
    if _model is None:
        try:
            _model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
            _model.classifier = nn.Identity()
            _model.eval()
            _model_failed = False
        except Exception as e:
            print(f"Failed to load MobileNetV3 model: {e}")
            _model = None
            _model_failed = True
    return _model

def extract_features(image_path):
    """
    Extracts high-dimensional embeddings and a color histogram.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at {image_path}")
        
    img = Image.open(image_path).convert('RGB')
    
    # 1. Image Histogram for color representation
    # Resize heavily to normalize pixel bulk
    small_img = img.resize((50, 50))
    hist = small_img.histogram()
    # Normalize histogram
    hist_sum = sum(hist)
    # prevent division by zero
    hist_norm = [h / hist_sum for h in hist] if hist_sum > 0 else hist
        
    # 2. Deep feature embeddings
    model = get_model()
    embeddings = None
    if model is None:
        # Fallback to downscaled grayscale flattened pixels for structural similarity!
        small_gray = img.resize((24, 24)).convert('L')
        # Center the pixels around 0 and keep them in a list
        img_array = [(p / 255.0) - 0.5 for p in list(small_gray.getdata())]
        embeddings = img_array
    else:
        try:
            img_t = preprocess(img)
            batch_t = torch.unsqueeze(img_t, 0)
            with torch.no_grad():
                features = model(batch_t)
            embeddings = features.squeeze().tolist()
        except Exception as e:
            print(f"Error extracting embeddings: {e}")
            embeddings = [random.uniform(-1, 1) for _ in range(576)]
            
    return {"hist": hist_norm, "embed": embeddings}

def cosine_similarity(vec1, vec2):
    if len(vec1) != len(vec2):
        return 0.0
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = sum(a * a for a in vec1) ** 0.5
    norm2 = sum(b * b for b in vec2) ** 0.5
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot_product / (norm1 * norm2)

def histogram_intersection(h1, h2):
    """
    Computes Bhattacharyya coefficient or histogram intersection for color similarity.
    """
    if len(h1) != len(h2):
        return 0.0
    # Intersection
    intersection = sum(min(a, b) for a, b in zip(h1, h2))
    return intersection

def compare_images(customer_image_path, shipping_image_paths):
    if not shipping_image_paths:
        return 0.0, "No shipping images found"
    
    try:
        cust_feats = extract_features(customer_image_path)
    except Exception as e:
        print(e)
        return 0.0, "Error analyzing image"
    
    best_score = 0.0
    for shipping_image in shipping_image_paths:
        try:
            ship_feats = extract_features(shipping_image)
        except Exception:
            continue
            
        cnn_sim = cosine_similarity(cust_feats['embed'], ship_feats['embed'])
        color_sim = histogram_intersection(cust_feats['hist'], ship_feats['hist'])
        
        # Deep models often give a baseline ~0.55-0.75 cosine similarity to completely different objects 
        # (like a bottle and a cup) because they share edge semantics and background shapes.
        # We use a highly aggressive scaling function to force these "loose matches" to near 0%.
        
        # 1. Penalize low CNN scores exponentially
        strict_cnn = max(0.0, (cnn_sim - 0.70) / 0.30)
        
        # 2. Multiply by color similarity (different objects usually have different colors)
        # color_sim is in [0, 1]
        composite_score = strict_cnn * (color_sim ** 0.5)
        
        if composite_score > best_score:
            best_score = composite_score
            
    prediction = "Likely Same Product" if best_score > 0.60 else "Possible Different Product"
    return round(best_score, 3), prediction
