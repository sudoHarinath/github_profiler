# OSS Architecture Diagnostic Workspace

A full-stack diagnostic workspace that transforms raw GitHub user activity streams into multi-dimensional technical profiles. Built specifically for technical recruiters and engineering managers, this platform avoids arbitrary linear grading systems. Instead, it disaggregates developer footprints into three independent operational pillars (Velocity, Authority, and Technology Footprint), ensuring an unbiased and transparent evaluation of early-career engineers alongside industry veterans.

## 🚀 Step-by-Step Launch Instructions

To launch this application on a fresh system, ensure you have **Python 3.10+** installed, then execute the following sequence in your terminal:

1. **Navigate to the Repository Root:**
   ```bash
   cd github-profiler
Establish a Isolated Virtual Environment & Install Dependencies:

Bash
python3 -m venv myenv
source myenv/bin/activate
pip install -r requirements.txt
Configure Your GitHub Authentication Token (Crucial for Rate Limits):
Export your Personal Access Token (PAT) into your system environment. This securely upgrades your rate ceiling from 60 calls/hour to 5,000 calls/hour:

Bash
export GITHUB_PAT="your_actual_github_pat_token_here"
Launch the Local Asynchronous Application Server:

Bash
uvicorn app.main:app --reload
Interact with the Workspace Canvas:
Open your browser and navigate to: http://127.0.0.1:8000

🛠️ Stack & Architectural Breakdown
Backend Core Engine: Built using FastAPI (Python) to harness native asynchronous concurrency orchestration, rapid data structure parsing, and automatic schema validation with zero compilation overhead.

Asynchronous I/O Client: Utilizes HTTPX paired with Python's native asyncio.gather event loop mechanics to perform non-blocking parallel downstream API queries.

Frontend Visualization Layer: Engineered with structural vanilla JavaScript, compiled with Tailwind CSS layout controls and real-time canvas chart bindings via Chart.js (loaded via secure CDNs to eliminate local npm module installation friction).