import random

def extract_embeddings(image_path):
    """
    Simulates loading a pretrained ResNet50, removing the classification layer,
    and extracting feature embeddings.
    """
    # In a real model, this would be a high-dimensional vector
    return [random.uniform(0, 1) for _ in range(50)]

def cosine_similarity(vec1, vec2):
    """
    Simulates cosine similarity between two feature vectors.
    """
    if len(vec1) != len(vec2):
        return 0.0
    
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = sum(a * a for a in vec1) ** 0.5
    norm2 = sum(b * b for b in vec2) ** 0.5
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return dot_product / (norm1 * norm2)

def compare_images(customer_image_path, shipping_image_paths):
    """
    Checks whether returned product matches shipped product.
    Returns:
        score: float between 0 and 1
        prediction: str
    """
    if not shipping_image_paths:
        return 0.0, "No shipping images found"
    
    # Simulate feature extraction
    customer_features = extract_embeddings(customer_image_path)
    
    # We compare with the best matching shipping image
    best_score = 0.0
    for shipping_image in shipping_image_paths:
        shipping_features = extract_embeddings(shipping_image)
        # We artificially boost the score here to simulate a working model
        # since random vectors will usually have cosine around 0.75 for non-negative values
        sim_score = min(cosine_similarity(customer_features, shipping_features) + 0.1, 1.0)
        if sim_score > best_score:
            best_score = sim_score
    
    prediction = "Likely Same Product" if best_score > 0.75 else "Possible Different Product"
    return round(best_score, 3), prediction
