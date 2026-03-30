PMDDKY Monitoring & Verification System
Field-Level Execution Intelligence Platform

📌 Overview

Government welfare schemes often face challenges in last-mile delivery, including:

Inaccurate or inflated reporting from field agents
Lack of real-time visibility at block and district levels
No verifiable proof of work completion
Delayed identification of grievances and failures

This project introduces a data-driven monitoring system that ensures ground-level verification, transparency, and accountability using digital tools and structured data pipelines.

Objective

To build a system that:

Captures real, verifiable field data
Enables block-level supervision (BDO)
Provides district-level insights (DM)
Detects operational inconsistencies early
Supports decision-making with structured data

🧠 System Architecture
BDO assigns farmers → Field Agent performs visits (PWA)
   ↓
Data captured (Photo + GPS + Status)
   ↓
Stored securely in backend (MongoDB)
   ↓
Validation + Rule-Based Anomaly Detection
   ↓
BDO Dashboard (block-level monitoring)
   ↓
DM Dashboard (district-level insights)
🧩 Core Components
📱 1. Field Agent PWA

A Progressive Web App designed for field agents working in rural or low-connectivity environments.

Features:
View assigned farmers and visit tasks
Capture:
📷 Photo evidence
📍 GPS coordinates
📊 Work status (Completed / In Progress / Not Completed)
Offline-first design:
Stores data locally (IndexedDB)
Syncs automatically when internet is available

<img width="1600" height="940" alt="image" src="https://github.com/user-attachments/assets/530542a4-3439-4675-8176-4611e7a42c66" />
<img width="911" height="911" alt="image" src="https://github.com/user-attachments/assets/b148b8ec-82dd-4526-9998-f02b53f5b784" /> 
<img width="955" height="852" alt="image" src="https://github.com/user-attachments/assets/8dcb312d-3487-4765-9dcf-44aaeb139840" />
<img width="716" height="1600" alt="image" src="https://github.com/user-attachments/assets/7f0d8edd-e69f-4731-a9a4-c17f67a308a2" />


Purpose:

Ensures accurate and verifiable ground-level data collection.

🧑‍💼 2. BDO Dashboard (Block-Level Control Layer)

The BDO dashboard acts as the execution control center.

Features:
Manage field agents within a block
Assign farmers to specific agents
Monitor:
Scheduled visits
Completed visits
Pending and missed visits
Track agent performance
View anomaly alerts and grievance data
Real-time updates as agents submit data

<img width="1600" height="734" alt="image" src="https://github.com/user-attachments/assets/8ca9689c-1b37-47ad-adfa-830f3c55b64c" />
<img width="1600" height="819" alt="image" src="https://github.com/user-attachments/assets/f3e67066-433d-4aec-9f39-b01c50f27757" />
<img width="1600" height="800" alt="image" src="https://github.com/user-attachments/assets/c6ab373b-7fc1-404e-bcb8-a5cea4516214" />
<img width="1600" height="800" alt="image" src="https://github.com/user-attachments/assets/610c3e38-35be-4046-a192-1d5e777a6a0b" />
<img width="1600" height="810" alt="image" src="https://github.com/user-attachments/assets/9d3fdd89-1da1-4ec5-b94c-7a7832eb757e" />



Purpose:

Provides operational visibility and control at the block level, enabling faster interventions.

🧑‍⚖️ 3. DM Dashboard (District-Level Insight Layer)

The DM dashboard provides a high-level analytical view.

Features:
Aggregated data from all blocks
Identify underperforming blocks
Monitor trends in execution
Detect high-risk areas

<img width="1600" height="798" alt="image" src="https://github.com/user-attachments/assets/8a931581-ec3f-4650-b5d9-7c514a5a1324" />
<img width="1600" height="805" alt="image" src="https://github.com/user-attachments/assets/3854a278-f357-4c8a-a9ed-7e6a15f7c287" />
<img width="1600" height="810" alt="image" src="https://github.com/user-attachments/assets/10499938-e214-44d4-928b-f07ef4030b8c" />



Purpose:

Supports data-driven governance and strategic decision-making.

🔍 Data Verification Model

Each field submission includes:

📷 Photo → proof of activity
📍 GPS → proof of location
⏱️ Timestamp → proof of time

This creates a verifiable audit trail:

WHAT (photo) + WHERE (GPS) + WHEN (time)
⚠️ Anomaly Detection System

The system uses a rule-based anomaly detection engine for identifying irregularities.

🔎 Key Detection Rules:
Repeated submissions from the same GPS location
Submissions without image evidence
Assigned farmers not visited
High number of pending or missed visits
Mismatch between reported completion and grievances

🧠 Design Rationale:
Ensures explainability (critical for government systems)
Works effectively with limited data
Provides clear reasoning for each anomaly

The system is designed to integrate AI models (e.g., Isolation Forest) in the future.

📢 Grievance Integration

The system includes a mechanism to capture and analyze farmer complaints:

Reports of “benefits not received”
Mapping grievances to specific agents and locations
Cross-verification with field submissions

This enables validation of reported data against ground reality.

🗺️ GIS-Based Monitoring

Geospatial data enhances monitoring by:

Visualizing field activity on maps
Identifying clusters of issues
Detecting location-based anomalies
Highlighting unvisited regions

🔐 Security Architecture

The system implements multi-layer security:

🔒 Data in Transit
HTTPS (TLS encryption) for all API communication

🔑 Authentication
JWT-based authentication
Secure session handling

🛡️ Authorization
Role-Based Access Control (RBAC):
Agent → own data only
BDO → block-level data
DM → district-level data

🚫 Protection Mechanisms
Input validation to prevent injection attacks
Rate limiting to prevent abuse
Secure environment variables for sensitive keys

🌐 Offline Capability

Designed for real-world rural deployment:

Data stored locally when offline
Automatic synchronization when connectivity returns
Ensures no data loss during field operations

Data Management :-
MongoDB used for flexible and scalable data storage
Cloudinary used for secure image storage
Aggregation pipelines generate dashboard-ready data

Tech Stack :-
Frontend
React (Vite)
Tailwind CSS
Leaflet (for GIS visualization)
Progressive Web App (PWA)
Backend
FastAPI (Python)
MongoDB
Cloudinary
Additional
JWT Authentication
Socket.IO (real-time updates)
LLM API (for anomaly explanation)

Setup Instructions :-
🔹 Backend Setup
git clone <repo-url>
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
Create .env
MONGO_URI=your_mongo_uri
CLOUDINARY_URL=your_cloudinary_url
JWT_SECRET=your_secret
Run Backend
uvicorn main:app --reload
🔹 Frontend Setup
cd frontend
npm install
npm run dev
Create .env
VITE_API_URL=https://your-backend-url

📊 Demo Data

The system includes seeded data to simulate real-world scenarios:

Multiple blocks with agents and farmers
Mixed visit statuses (completed, pending, missed)
Injected anomalies for demonstration
Grievances for cross-validation

👥 Team Nibbles

Vansh Deep Srivastava

Veer Vikram Singh

Chirrayu Sharma

Khushi Verma

🔮 Future Scope
AI-based anomaly detection (Isolation Forest / ML models)
Integration with Bhashini for multilingual voice input
Blockchain-based audit logs for tamper-proof records
Integration with government infrastructure (NIC systems)

Conclusion :-

This system transforms traditional monitoring into a transparent, verifiable, and data-driven governance model by combining:

Field-level evidence
Structured backend processing
Real-time dashboards
Explainable anomaly detection

It enables a shift from manual reporting to intelligent execution monitoring, improving both efficiency and accountability.
