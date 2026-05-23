from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.services.github_client import github_client
from app.services.metrics_engine import metrics_engine
from app.cache import profile_cache
import os

app = FastAPI(title="OSS Contributor Scorecard & Tech Stack Profiler")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "github-profiler"}

@app.get("/api/profile/{username}")
async def get_developer_scorecard(username: str):
    username_clean = username.strip().lower()
    if not username_clean:
        raise HTTPException(status_code=400, detail="Username parameter cannot be empty.")
        
    cached_scorecard = profile_cache.get(username_clean)
    if cached_scorecard:
        return {"source": "cache", "data": cached_scorecard}
        
    raw_data = await github_client.fetch_raw_profile_data(username_clean)
    scorecard = metrics_engine.calculate_scorecard(raw_data)
    profile_cache.set(username_clean, scorecard)
    
    return {"source": "network", "data": scorecard}

# MOUNT FRONTEND ASSETS LAST
# This tells FastAPI to serve index.html cleanly when visiting root '/'
@app.get("/")
async def serve_dashboard():
    return FileResponse(os.path.join("static", "index.html"))

# Allows loading app.js or secondary CSS styles out of the static folder context
app.mount("/static", StaticFiles(directory="static"), name="static")