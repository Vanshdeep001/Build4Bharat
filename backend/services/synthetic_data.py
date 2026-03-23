import numpy as np
import pandas as pd


def generate_synthetic_data(n_samples=500, anomaly_fraction=0.15):
    """Generate synthetic training data for Isolation Forest model."""
    np.random.seed(42)
    n_normal = int(n_samples * (1 - anomaly_fraction))
    n_anomalies = n_samples - n_normal

    # Normal records
    normal_data = {
        "fund_released_pct": np.random.uniform(20, 80, n_normal),
        "physical_progress_pct": np.random.uniform(20, 80, n_normal),
        "beneficiary_disputes": np.random.randint(0, 15, n_normal),
        "days_since_last_submission": np.random.randint(0, 20, n_normal),
        "cost_per_beneficiary": np.random.uniform(1500, 4500, n_normal),
        "peer_avg_cost": np.full(n_normal, 2800),
    }

    # Anomalous records — various types
    quarter = n_anomalies // 4
    remainder = n_anomalies - (quarter * 4)

    anomaly_data = {
        "fund_released_pct": np.concatenate([
            np.random.uniform(70, 95, quarter + remainder),  # fund ahead
            np.random.uniform(20, 60, quarter),
            np.random.uniform(20, 60, quarter),
            np.random.uniform(20, 60, quarter),
        ]),
        "physical_progress_pct": np.concatenate([
            np.random.uniform(10, 40, quarter + remainder),  # fund ahead — low progress
            np.random.uniform(20, 60, quarter),
            np.random.uniform(20, 60, quarter),
            np.random.uniform(20, 60, quarter),
        ]),
        "beneficiary_disputes": np.concatenate([
            np.random.randint(5, 15, quarter + remainder),
            np.random.randint(35, 50, quarter),  # high disputes
            np.random.randint(0, 10, quarter),
            np.random.randint(0, 10, quarter),
        ]),
        "days_since_last_submission": np.concatenate([
            np.random.randint(0, 20, quarter + remainder),
            np.random.randint(0, 20, quarter),
            np.random.randint(0, 20, quarter),
            np.random.randint(45, 60, quarter),  # inactivity
        ]),
        "cost_per_beneficiary": np.concatenate([
            np.random.uniform(2000, 4000, quarter + remainder),
            np.random.uniform(2000, 4000, quarter),
            np.random.uniform(6500, 8000, quarter),  # cost outlier
            np.random.uniform(2000, 4000, quarter),
        ]),
        "peer_avg_cost": np.full(n_anomalies, 2800),
    }

    normal_df = pd.DataFrame(normal_data)
    anomaly_df = pd.DataFrame(anomaly_data)

    df = pd.concat([normal_df, anomaly_df], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    return df


FEATURES = [
    "fund_released_pct",
    "physical_progress_pct",
    "beneficiary_disputes",
    "days_since_last_submission",
    "cost_per_beneficiary",
    "peer_avg_cost",
]
