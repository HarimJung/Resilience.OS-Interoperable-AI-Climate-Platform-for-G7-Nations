# Resilience.OS: Interoperable AI Climate Platform for G7 Nations

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stack](https://img.shields.io/badge/Tech-FastAPI%20%7C%20React%20%7C%20Gemini-blue)](https://fastapi.tiangolo.com/)
[![Status](https://img.shields.io/badge/Status-Live_Prototype-success)]()
[![Organization](https://img.shields.io/badge/Organization-VisualClimate.org-purple)](https://visualclimate.org)

> **"From Data to Action: An Open-Source, Privacy-First AI Contribution to the G7"**

Resilience.OS is a jurisdiction-agnostic, AI-driven intelligence platform designed to operationalize climate data for public servants across G7 nations. It integrates **Real-time Telemetry (Open-Meteo)** with **Local RAG Inference** to provide secure, explainable policy insights.

---

## 📺 Project Demo
Watch the full demonstration of Resilience.OS in action.

[![Resilience.OS Demo](http://img.youtube.com/vi/lAszFVaE3Ag/maxresdefault.jpg)](https://www.youtube.com/watch?v=lAszFVaE3Ag "Click to Watch the Demo")

---

## 🌍 Key Technical Innovations

### 1. Privacy-First "Local" RAG Architecture Unlike typical AI wrappers, Resilience.OS prioritizes Data Sovereignty.
* **Local Embeddings:** We use `HuggingFaceEmbeddings (all-MiniLM-L6-v2)` running locally. Your sensitive government documents are vectorized on-premise, **never sent to external APIs** for embedding.
* **Vector Store:** Uses `ChromaDB` for high-performance, local document retrieval.

### 2. Neuro-Symbolic "Chain of Thought" Engine
The system does not just "guess". As seen in `backend/main.py`, we utilize a **Structured Prompting** technique that forces the AI to output a JSON Logic Chain:
1.  **Data Observation:** Ingests live data from `Open-Meteo API`.
2.  **Policy Lookup:** Semantic search via ChromaDB.
3.  **Inference & Conclusion:** Synthesizes facts into actions.

### 3. Real-Time G7 Data Interoperability
The frontend (`App.jsx`) is connected to the **Open-Meteo Historical & Forecast API**.
* Fetches live Soil Moisture, Solar Radiation, and Wind Gusts based on coordinates (Toronto, Berlin, Paris).
* Demonstrates instant adaptability to different G7 geolocations without manual reconfiguration.

---

## 📸 System Features

### Unified Command Center
Integrates live sensor data visualization with AI analysis.
> **[Insert Dashboard Screenshot Here]**

### AI Strategic Briefing (Reasoning Chain)
Displays the step-by-step logic and mandatory **Micro-Citations** linking back to specific PDF pages (e.g., "Canada Emission Reduction Plan, p.59").
> **[Insert Reasoning Chain Screenshot Here]**

### Dynamic Policy Library
A "No-Code" knowledge base. Public servants can simply drop PDF files into the `/data` folder. The system auto-tags them by Country (Canada/Germany/France) and Category (Agri/Energy) based on filenames.
> **[Insert Library Screenshot Here]**

---

## ⚙️ Tech Stack & Architecture

Resilience.OS acts as a non-intrusive intelligent overlay.

```mermaid
graph TD
    A[Open-Meteo API] -->|Real-time JSON| B(React Frontend);
    C[PDF Documents] -->|PyPDFLoader| D[Local ChromaDB];
    D -->|Context| E[FastAPI Backend];
    B -->|User Query| E;
    E -->|Gemini 2.0 Flash| F[Reasoning Engine];
    F -->|Structured JSON| B;
```


Frontend: React.js, Tailwind CSS, Lucide Icons, Recharts

Backend: Python FastAPI, Uvicorn

AI & RAG: LangChain, Google Gemini 2.0 Flash, ChromaDB

Embeddings: HuggingFace all-MiniLM-L6-v2 (Local execution)

Data Source: Open-Meteo API (Weather/Soil/Marine data)

🚀 Getting Started (Run Locally)
This repository contains the full source code submitted to the G7 GovAI Grand Challenge.

Prerequisites

Python 3.9+

Node.js 18+

Google Gemini API Key

1. Backend Setup (FastAPI)

Bash
cd backend
pip install -r requirements.txt
# Add your PDF documents to the /data folder
# Create .env file with GOOGLE_API_KEY
python main.py
# Server runs at [http://0.0.0.0:8000](http://0.0.0.0:8000)
2. Frontend Setup (React)

Bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
🛡️ Security & Data Protection
No External Training: Documents are processed via RAG (Retrieval-Augmented Generation) and are not used to train the base LLM.

On-Premise Embeddings: Vectorization happens locally, ensuring document contents do not leave the secure perimeter during the indexing phase.

🤝 Contribution<img width="1054" height="1034" alt="Screenshot 2025-11-29 at 11 53 42 PM" src="https://github.com/user-attachments/assets/6d009bd2-9bea-43de-9c93-8b51d772c6c0" />
<img width="1048" height="1810" alt="Screenshot 2025-11-29 at 11 53 36 PM" src="https://github.com/user-attachments/assets/e5d81ad0-a8f3-4302-b3a5-b658660bbc73" />
<img width="1055" height="1825" alt="Screenshot 2025-11-29 at 11 53 32 PM" src="https://github.com/user-attachments/assets/3ca20a49-015f-4e17-96d7-12448bdaf32a" />
<img width="815" height="1748" alt="Screenshot 2025-11-29 at 11 53 26 PM" src="https://github.com/user-attachments/assets/2193086a-334a-4a4b-b402-509aeeee1059" />
<img width="1375" height="1266" alt="Screenshot 2025-11-29 at 11 53 13 PM" src="https://github.com/user-attachments/assets/3d69d2a3-157f-4efb-8682-1338e089a95c" />
<img width="1274" height="683" alt="Screenshot 2025-11-29 at 11 53 06 PM" src="https://github.com/user-attachments/assets/ee323337-296f-4dd8-99d1-08df8a00aa3e" />

This project is a non-profit contribution by VisualClimate.org. License: MIT License - Free for any G7 nation to fork and deploy.




