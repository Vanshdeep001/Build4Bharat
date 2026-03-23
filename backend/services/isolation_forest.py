import os
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
from services.synthetic_data import generate_synthetic_data, FEATURES

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "isolation_forest_model.pkl")

model: IsolationForest = None


def train_model():
    """Train Isolation Forest on synthetic data and save the model."""
    global model
    print("🧠 Training Isolation Forest on synthetic data...")

    df = generate_synthetic_data(n_samples=500, anomaly_fraction=0.15)
    X = df[FEATURES]

    model = IsolationForest(
        n_estimators=100,
        contamination=0.15,
        random_state=42,
    )
    model.fit(X)

    joblib.dump(model, MODEL_PATH)
    print("✅ Isolation Forest trained and saved.")


def load_model():
    """Load model from disk, or train if not available."""
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print("✅ Isolation Forest model loaded from disk.")
    else:
        train_model()


def score_submission(submission_data: dict) -> tuple:
    """Score a submission using the Isolation Forest model.
    
    Returns:
        (anomaly_score, is_anomaly) where score is 0-100 and is_anomaly is bool
    """
    global model
    if model is None:
        load_model()

    features = extract_features(submission_data)
    feature_array = np.array([features])

    score = model.decision_function(feature_array)[0]
    prediction = model.predict(feature_array)[0]

    # Convert: more negative = more anomalous → scale to 0-100
    anomaly_score = max(0, min(100, (-score) * 50))
    is_anomaly = prediction == -1

    return anomaly_score, is_anomaly


def extract_features(data: dict) -> list:
    """Extract features from submission/block data for scoring."""
    return [
        data.get("fund_released_pct", 50),
        data.get("physical_progress_pct", 50),
        data.get("beneficiary_disputes", 0),
        data.get("days_since_last_submission", 0),
        data.get("cost_per_beneficiary", 2800),
        data.get("peer_avg_cost", 2800),
    ]
