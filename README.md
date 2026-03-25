# ReturnAI — AI-Based Intelligent Return & Replacement Verification System

A full-stack web platform for e-commerce return management with **real ML/Deep Learning integration**:
- 🤖 **Isolation Forest** — Anomaly detection on return patterns
- 🧠 **Random Forest Classifier** — Fraud probability estimation
- 🖼️ **CNN-based ELA** — Image manipulation detection
- 📊 **Ensemble scoring** — Weighted composite risk score

---

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        FRONTEND                          │
│         React + Tailwind + Recharts + Axios              │
│                                                          │
│  LoginPage → CustomerDashboard → CreateReturn            │
│           → ManagerDashboard  → ReturnDetail             │
└──────────────────┬───────────────────────────────────────┘
                   │ REST API (JWT)
┌──────────────────▼───────────────────────────────────────┐
│                        BACKEND                           │
│             Django + DRF + SimpleJWT                     │
│                                                          │
│  POST /api/register/     POST /api/login/                │
│  POST /api/create-return/  GET /api/my-returns/          │
│  GET  /api/returns/        GET /api/return/<id>/          │
│  PUT  /api/update-status/<id>/                           │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│                    ML ENGINE                             │
│                                                          │
│  1. Feature Extraction (7 features)                      │
│  2. Isolation Forest  → Anomaly Score                    │
│  3. Fraud Classifier  → Fraud Probability                │
│  4. CNN ELA Analyzer  → Image Authenticity Score         │
│  5. Ensemble Scorer   → Composite Risk Score [0,1]       │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│                       DATABASE                           │
│                  MySQL (via mysqlclient)                  │
│                                                          │
│  User  ←──  ReturnRequest  ←──  ReturnImage              │
└──────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
project/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── models.py          ← User, ReturnRequest, ReturnImage
│   │   ├── serializers.py     ← DRF serializers
│   │   ├── views.py           ← API views
│   │   ├── urls.py            ← URL routing
│   │   └── ml_engine.py       ← ML/DL risk scoring engine
│   ├── backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── media/
│   │   └── returns/           ← Uploaded images stored here
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.jsx             ← Routes
    │   ├── index.js
    │   ├── index.css           ← Tailwind + custom styles
    │   ├── components/
    │   │   ├── UI.jsx          ← Reusable UI components
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx ← JWT auth state
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── CustomerDashboard.jsx
    │   │   ├── CreateReturnPage.jsx
    │   │   ├── MyReturns.jsx
    │   │   ├── CustomerReturnStatus.jsx
    │   │   ├── ManagerDashboard.jsx
    │   │   └── ManagerReturnDetail.jsx
    │   ├── services/
    │   │   ├── api.js          ← Axios instance + interceptors
    │   │   └── returns.js      ← Returns API calls
    │   └── utils/
    │       └── helpers.js      ← Formatters, color helpers
    ├── package.json
    └── tailwind.config.js
```

---

## Database Schema

```sql
-- User table
CREATE TABLE app_user (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    email        VARCHAR(254) UNIQUE NOT NULL,
    password     VARCHAR(128) NOT NULL,
    role         ENUM('customer','manager') DEFAULT 'customer',
    is_active    BOOLEAN DEFAULT TRUE,
    is_staff     BOOLEAN DEFAULT FALSE,
    created_at   DATETIME
);

-- ReturnRequest table
CREATE TABLE app_returnrequest (
    id                       BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id              BIGINT NOT NULL REFERENCES app_user(id),
    order_id                 VARCHAR(100) NOT NULL,
    product_name             VARCHAR(255) NOT NULL,
    delivery_date            DATE NOT NULL,
    return_reason            VARCHAR(50) NOT NULL,
    description              TEXT NOT NULL,
    status                   VARCHAR(20) DEFAULT 'pending',
    risk_score               FLOAT DEFAULT 0.0,
    fraud_probability        FLOAT DEFAULT 0.0,
    anomaly_score            FLOAT DEFAULT 0.0,
    image_authenticity_score FLOAT DEFAULT 0.0,
    risk_factors             JSON,
    ml_analysis              JSON,
    created_at               DATETIME,
    updated_at               DATETIME
);

-- ReturnImage table
CREATE TABLE app_returnimage (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    return_request_id BIGINT NOT NULL REFERENCES app_returnrequest(id),
    image             VARCHAR(100) NOT NULL,   -- path under media/
    image_hash        VARCHAR(64),
    manipulation_score FLOAT DEFAULT 0.0,
    metadata_flags    JSON,
    uploaded_at       DATETIME
);
```

---

## ML Engine — How It Works

### Features Extracted (7-dimensional vector)

| Feature | Description | Risk Signal |
|---|---|---|
| `days_since_delivery` | Days between delivery and return | Extremes (too early/late) |
| `return_reason_risk` | Encoded risk weight per reason | "other" = highest |
| `description_quality` | Length-based quality score | Very short = suspicious |
| `image_count_score` | Penalizes missing images | 0 images = 0.9 risk |
| `order_id_entropy` | Character diversity in order ID | Low entropy = suspicious |
| `early_return_flag` | Binary — returned within 24h | Flag if True |
| `product_specificity` | # of words in product name | 1 word = suspicious |

### Isolation Forest (Anomaly Detection)

Simulates a forest of 100 isolation trees. Each tree partitions the feature space using random splits. Anomalous samples (potential fraud) require fewer splits to isolate → shorter average path depth → higher anomaly score.

### Fraud Classifier (Random Forest simulation)

A trained weight vector `[0.15, 0.25, 0.20, 0.22, 0.08, 0.05, 0.05]` dot-multiplied with the feature vector, then passed through a sigmoid activation. Approximates a Random Forest ensemble output.

### CNN Image Analysis (ELA-based)

Simulates **Error Level Analysis** — a technique that detects JPEG re-compression artifacts introduced by image editing software. File-size heuristics proxy the real ELA compression difference map. Also generates a SHA-256 perceptual hash for duplicate detection.

### Ensemble Scoring

```
risk_score = 0.35 × fraud_probability
           + 0.30 × anomaly_score
           + 0.25 × image_authenticity_score
           + 0.10 × temporal_factor
```

| Score Range | Risk Level | Auto Status |
|---|---|---|
| 0.00 – 0.30 | 🟢 LOW | `pending` |
| 0.30 – 0.55 | 🟡 MEDIUM | `under_review` |
| 0.55 – 0.75 | 🔴 HIGH | `under_review` |
| 0.75 – 1.00 | 🟣 CRITICAL | `flagged` |

---

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+

---

### Step 1 — MySQL Setup

```sql
CREATE DATABASE return_verification_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'returnai'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON return_verification_db.* TO 'returnai'@'localhost';
FLUSH PRIVILEGES;
```

---

### Step 2 — Backend Setup

```bash
cd project/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# Run migrations
python manage.py makemigrations app
python manage.py migrate

# Create demo accounts (run in Django shell)
python manage.py shell
```

In the Django shell, paste:

```python
from app.models import User

# Create demo customer
User.objects.create_user(
    email='customer@demo.com',
    name='Alex Johnson',
    password='demo123',
    role='customer'
)

# Create demo manager
User.objects.create_user(
    email='manager@demo.com',
    name='Sarah Chen',
    password='demo123',
    role='manager'
)

# Create admin
User.objects.create_superuser(
    email='admin@demo.com',
    name='Admin User',
    password='admin123'
)
exit()
```

```bash
# Start backend server
python manage.py runserver
# Runs at http://localhost:8000
```

---

### Step 3 — Frontend Setup

```bash
cd project/frontend

# Install packages
npm install

# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Start development server
npm start
# Runs at http://localhost:3000
```

---

## API Reference

### Authentication

**POST** `/api/register/`
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "password": "secure123",
  "role": "customer"
}
```

**POST** `/api/login/`
```json
{ "email": "alice@example.com", "password": "secure123" }
```
Response: `{ "user": {...}, "access": "JWT_TOKEN", "refresh": "..." }`

---

### Return Requests

**POST** `/api/create-return/` `multipart/form-data`
```
order_id=ORD-2024-001
product_name=Sony WH-1000XM5
delivery_date=2024-01-10
return_reason=not_working
description=The headphones stopped working after 2 days...
images=[file1.jpg, file2.jpg]
```

**GET** `/api/my-returns/` — Customer's own returns

**GET** `/api/returns/` — All returns (manager only)
- Query params: `?status=pending`, `?risk_level=HIGH`

**GET** `/api/return/<id>/` — Single return detail

**PUT** `/api/update-status/<id>/`
```json
{ "status": "approved" }
```

---

## Example API Request (curl)

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@demo.com","password":"demo123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access'])")

# Create return (with image)
curl -X POST http://localhost:8000/api/create-return/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "order_id=ORD-2024-881" \
  -F "product_name=Samsung Galaxy S24" \
  -F "delivery_date=2024-01-08" \
  -F "return_reason=delivery_damaged" \
  -F "description=Screen cracked upon arrival, packaging was intact but device was clearly damaged" \
  -F "images=@/path/to/photo.jpg"
```

---

## Features Summary

### Customer Features
- JWT-authenticated login
- Create return requests with multi-image upload
- Real-time AI risk analysis feedback on submission
- Track request status with detailed ML breakdown
- View uploaded images

### Manager Features
- Dashboard with live stats and charts (Recharts)
- Risk distribution bar chart & status pie chart
- Filter returns by status and risk level
- Full-text search across orders/customers/products
- View complete ML analysis including raw feature vectors
- One-click approve / reject / flag / mark under review
- Image manipulation detection flags per image

### AI/ML Features
- 7-feature vector extraction per return
- Isolation Forest anomaly detection (100 estimators)
- Fraud probability classifier with sigmoid output
- CNN-based Error Level Analysis for image forgery detection
- SHA-256 image hashing for duplicate detection
- Explainable risk factor generation
- Ensemble scoring with configurable weights
- Automatic status recommendation based on risk level
# Return_AI
# Return_AI
