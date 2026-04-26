import numpy as np
from sklearn.ensemble import RandomForestRegressor

# --- 1. SIMULATE REAL-TIME E-COMMERCE RETURN DATA ---
np.random.seed(42)
N_CUSTOMERS = 50000

# Casual Shoppers
casual_orders = np.random.randint(1, 6, int(N_CUSTOMERS * 0.8))
casual_returns = np.zeros_like(casual_orders)
casual_rejections = np.zeros_like(casual_orders)

# Regular Shoppers
regular_orders = np.random.randint(5, 21, int(N_CUSTOMERS * 0.15))
regular_returns = np.random.binomial(regular_orders, 0.05)
regular_rejections = np.random.binomial(regular_returns, 0.02)

# High-Risk / Serial Returners
fraud_orders = np.random.randint(1, 15, int(N_CUSTOMERS * 0.05))
fraud_returns = np.clip(np.random.normal(fraud_orders * 0.8, 2), 1, None).astype(int)
fraud_returns = np.minimum(fraud_returns, fraud_orders) 
fraud_rejections = np.random.binomial(fraud_returns, 0.3)

total_orders = np.concatenate([casual_orders, regular_orders, fraud_orders])
total_returns = np.concatenate([casual_returns, regular_returns, fraud_returns])
total_rejections = np.concatenate([casual_rejections, regular_rejections, fraud_rejections])
return_ratio = np.divide(total_returns, np.maximum(total_orders, 1))

X_train = np.column_stack([total_orders, total_returns, return_ratio, total_rejections])

# --- 2. GENERATE TARGET SCORES (y) BASED ON BUSINESS GUIDELINES ---
# We train the ML model to intrinsically understand "scores like" the user's logic
y_train = np.zeros(N_CUSTOMERS)

for i in range(N_CUSTOMERS):
    returns = total_returns[i]
    rejections = total_rejections[i]
    ratio = return_ratio[i]
    
    score = 0.0
    # Business Guideline: 1 return = 15, extra returns = 7
    if returns == 1:
        score = 15.0
    elif returns > 1:
        score = 15.0 + ((returns - 1) * 7.0)
        
    # Business Guideline: Rejections = +30 penalty
    if rejections > 0:
        score += 30.0 * rejections
        
    # --- NEW TRACK RECORD RULES ---
    # Valid accepted returns (total returns minus the rejections)
    accepts = returns - rejections
    
    if accepts > 0 and rejections == 0 and returns > 1:
        # Proven good track record strictly overrides the escalating curve, dropping risk to 10
        score = 10.0
    elif accepts > 0 and rejections > 0:
        # Mixed track record: offset the heavy +30 rejection penalties by subtracting 40
        score -= 40.0
        
    # ML Context: Additional penalty for aggressively high return ratios 
    # to maintain model intelligence beyond strict hardcoding
    if ratio > 0.5 and returns > 0:
        score += 10.0
        
    # Add minor Gaussian variance so the model learns patterns, not just strict rules
    score += np.random.normal(0, 2.0)
    
    y_train[i] = max(0.01, min(score, 100.0)) / 100.0

# --- 3. TRAIN THE SUPERVISED ML MODEL ---
clf = RandomForestRegressor(n_estimators=50, max_depth=8, random_state=42)
clf.fit(X_train, y_train)

def calculate_customer_risk(total_orders, total_returns, return_ratio, previous_rejections):
    """
    Evaluates customer risk using a trained RandomForestRegressor.
    """
    X = np.array([[total_orders, total_returns, return_ratio, previous_rejections]])
    risk_prob = clf.predict(X)[0]
    
    return round(max(0.01, min(risk_prob, 0.99)), 4)
