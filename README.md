# 🐔 AI-Based Smart Broiler Poultry Farming Management System

A full-stack AI-powered web application for broiler poultry farmers to predict profit/loss, calculate costs, manage farm batches, and follow vaccination schedules.

---

## Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Frontend    | Next.js 14, TailwindCSS, Recharts       |
| Backend     | FastAPI (Python), Swagger/OpenAPI docs  |
| Database    | MongoDB Atlas (Motor async driver)      |
| AI/ML       | Scikit-learn Linear Regression + Joblib |
| Deployment  | Vercel (FE) + Render (BE)               |

---

## Project Structure

```
AI-Poultryfrom:
├── frontend/                  # Next.js 14 App
│   └── src/
│       ├── app/
│       │   ├── dashboard/     # Stats overview
│       │   ├── farms/         # Farm batch CRUD
│       │   ├── predict/       # AI prediction
│       │   ├── costs/         # Cost calculator
│       │   ├── schedule/      # Vaccination schedule
│       │   └── history/       # Prediction history
│       ├── components/
│       │   └── layout/        # Sidebar
│       └── lib/
│           ├── api.ts         # All API calls
│           ├── types.ts       # TypeScript types
│           └── utils.ts       # Helpers (formatPKR, etc.)
│
└── backend/                   # FastAPI App
    └── app/
        ├── main.py            # App entry point + CORS
        ├── api/routes/
        │   ├── farms.py       # Farm CRUD + stats
        │   ├── predictions.py # ML predictions + mortality
        │   ├── costs.py       # Cost calculator
        │   └── schedules.py   # Vaccination schedule
        ├── core/
        │   ├── config.py      # Settings (env vars)
        │   └── vaccination_rules.py  # Rule-based schedule
        ├── db/
        │   └── mongodb.py     # MongoDB connection
        ├── models/
        │   ├── farm.py        # Pydantic Farm models
        │   └── prediction.py  # Prediction models
        └── ml/
            ├── train_model.py # Synthetic data + training
            ├── predictor.py   # Load model + predict
            └── model.joblib   # Saved model (auto-generated)
```

---

## Local Setup

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file and fill in your MongoDB URI
cp .env.example .env

# Train ML model (one-time)
python train_model_once.py

# Start dev server
uvicorn app.main:app --reload
```

API docs available at: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
# Edit .env.local → NEXT_PUBLIC_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

App available at: http://localhost:3000

---

## Features

- **Dashboard** — Stats overview: active farms, chick count, predictions, avg profit
- **Farm Batches** — Create, view, update and delete farm batches; track mortality day-by-day
- **AI Prediction** — Linear Regression model predicts profit/loss with cost breakdown + pie chart
- **Cost Calculator** — Detailed breakdown (chick, feed, medicine, labor, utilities) with progress bars
- **Vaccination Schedule** — Interactive 42-day protocol with checkboxes and weekly care guidelines
- **History** — Full prediction history with profit trend chart (line graph)

---

## Deployment

### Backend → Render
1. Push `backend/` to GitHub
2. Create a new **Web Service** on Render
3. Set environment variables:
   - `MONGODB_URI` → your Atlas connection string
   - `ALLOWED_ORIGINS` → your Vercel app URL
4. Render reads `render.yaml` automatically

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import project in Vercel
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL` → your Render service URL

---

## ML Model Details

- **Algorithm**: Linear Regression (scikit-learn Pipeline with StandardScaler)
- **Features**: num_chicks, chick_price, feed_cost/kg, feed/bird, medicine, labor/day, utilities, duration, sell_price/kg, mortality_rate, avg_weight
- **Target**: Profit (PKR)
- **Training Data**: 5,000 synthetic samples (realistic Pakistan market values)
- **Auto-train**: If `model.joblib` is missing, it trains automatically on first API call
