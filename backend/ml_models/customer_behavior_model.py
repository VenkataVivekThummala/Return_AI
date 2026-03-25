def calculate_customer_risk(total_orders, total_returns, return_ratio, previous_rejections):
    """
    Detects suspicious return behavior using historical customer data.
    Simulates a Random Forest or Logistic Regression model output.

    Features:
        total_orders
        total_returns
        return_ratio
        previous_rejections
        
    Output:
        Customer Risk Score (0-100)
    """
    # Base risk starts low
    risk = 5.0
    
    # Heuristics that a model would learn:
    if total_orders > 0:
        if return_ratio > 0.5:
            risk += 30.0
        elif return_ratio > 0.2:
            risk += 15.0
            
    # Rejections are a massive red flag
    if previous_rejections > 0:
        risk += 20 * previous_rejections
        
    # High volume of returns
    if total_returns > 5:
        risk += 15.0
        
    # Cap at 100
    risk = min(risk, 100.0)
    
    return round(risk, 2)
