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

# CHANGE THIS LINE: Remove the trailing "/readme" from the path string
@app.get("/api/repo/{username}/{repo_name}")
async def get_repo_readme_insights(username: str, repo_name: str):
    username_clean = username.strip().lower()
    repo_clean = repo_name.strip()
    
    cache_key = f"readme:{username_clean}:{repo_clean}"
    cached_readme = profile_cache.get(cache_key)
    if cached_readme:
        return {"source": "cache", "insights": cached_readme}
        
    raw_readme_text = await github_client.fetch_repo_readme(username_clean, repo_clean)
    
    # Simple Keyword Extraction Engine
    target_keywords = [
        "docker", "kubernetes", "aws", "prisma", "graphql", "redux", "pytest",
        "jest", "ci/cd", "postgresql", "mongodb", "redis", "auth0", "jwt"
    ]
    detected = [kw for kw in target_keywords if kw in raw_readme_text.lower()]
    
    clean_lines = [line.strip("#* \t") for line in raw_readme_text.split("\n") if line.strip()]
    summary_snippet = clean_lines[0] if clean_lines else "No description available."
    if len(summary_snippet) > 120:
        summary_snippet = summary_snippet[:120] + "..."
        
    insights = {
        "summary": summary_snippet,
        "keywords": detected
    }
    
    profile_cache.set(cache_key, insights)
    return {"source": "network", "insights": insights}

# Allows loading app.js or secondary CSS styles out of the static folder context
app.mount("/static", StaticFiles(directory="static"), name="static")