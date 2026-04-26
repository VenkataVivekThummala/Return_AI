import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# Define the base directory (where this script is)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'ml_models')

# Make sure the directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

def train_customer_behavior_model(csv_path):
    """
    Trains a real Random Forest model on E-commerce return fraud data.
    
    EXPECTED DATASET COLUMNS (Example mapped from Amazon/Flipkart-style data):
    - days_since_delivery: int (0 to 30+)
    - return_reason_risk: float (0.0 to 1.0)
    - description_quality: float (0.0 to 1.0)
    - image_count_score: float (0.0 to 1.0)
    - order_id_entropy: float (0.0 to 1.0)
    - early_return_flag: int (0 or 1)
    - product_specificity: float (0.0 to 1.0)
    - is_fraud: int (0 for legitimate, 1 for fraudulent) - TARGET VARIABLE
    """
    print(f"Loading dataset from {csv_path}...")
    
    try:
        data = pd.read_csv(csv_path)
    except FileNotFoundError:
        print("Dataset not found! Please download an E-commerce Fraud dataset (e.g., from Kaggle).")
        print("If you don't have one, we will generate a synthetic one mapped to Amazon metrics for demonstration.")
        data = generate_synthetic_amazon_data(5000)
    
    # Define features (X) and target (y)
    features = [
        'days_since_delivery',
        'return_reason_risk',
        'description_quality',
        'image_count_score',
        'order_id_entropy',
        'early_return_flag',
        'product_specificity'
    ]
    
    X = data[features]
    y = data['is_fraud']
    
    print("Splitting data into train and test sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForestClassifier...")
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    
    print("Evaluating model...")
    predictions = model.predict(X_test)
    print("\n--- Model Evaluation ---")
    print(f"Accuracy: {accuracy_score(y_test, predictions):.4f}")
    print(classification_report(y_test, predictions))
    
    # Save the model
    model_path = os.path.join(MODEL_DIR, 'behavior_rf_model.joblib')
    print(f"Saving trained model to {model_path}...")
    joblib.dump(model, model_path)
    print("Successfully trained and saved the model! The backend will now use this real model.")


def generate_synthetic_amazon_data(num_samples=1000):
    """
    Generates synthetic data that mimics Amazon/Flipkart customer return behavior 
    if you haven't downloaded a real dataset yet.
    """
    np.random.seed(42)
    
    # Synthetic legitimate data (majority)
    legit_samples = int(num_samples * 0.9)
    legit_data = pd.DataFrame({
        'days_since_delivery': np.random.uniform(0.1, 0.4, legit_samples),  # Typically returning within a few days
        'return_reason_risk': np.random.uniform(0.1, 0.5, legit_samples),   # Valid reasons
        'description_quality': np.random.uniform(0.1, 0.4, legit_samples),  # Good descriptions
        'image_count_score': np.random.uniform(0.1, 0.3, legit_samples),    # Images provided
        'order_id_entropy': np.random.uniform(0.0, 0.3, legit_samples),     # Valid IDs
        'early_return_flag': np.random.choice([0, 1], p=[0.7, 0.3], size=legit_samples),
        'product_specificity': np.random.uniform(0.3, 0.9, legit_samples),
        'is_fraud': 0
    })
    
    # Synthetic fraud data (minority)
    fraud_samples = num_samples - legit_samples
    fraud_data = pd.DataFrame({
        'days_since_delivery': np.random.uniform(0.0, 1.0, fraud_samples),  # Highly erratic
        'return_reason_risk': np.random.uniform(0.6, 1.0, fraud_samples),   # Vague reasons
        'description_quality': np.random.uniform(0.7, 1.0, fraud_samples),  # No/poor descriptions
        'image_count_score': np.random.uniform(0.7, 1.0, fraud_samples),    # No images
        'order_id_entropy': np.random.uniform(0.6, 1.0, fraud_samples),     # Sketchy IDs
        'early_return_flag': np.random.choice([0, 1], p=[0.2, 0.8], size=fraud_samples), # Very rushed
        'product_specificity': np.random.uniform(0.0, 0.3, fraud_samples),
        'is_fraud': 1
    })
    
    df = pd.concat([legit_data, fraud_data]).sample(frac=1).reset_index(drop=True)
    return df

if __name__ == "__main__":
    # Point this to your Kaggle CSV file once downloaded
    real_csv_dataset_path = "ecommerce_behavior_dataset.csv"
    train_customer_behavior_model(real_csv_dataset_path)
