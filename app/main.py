from fastapi import FastAPI, HTTPException
from app.services.github_client import github_client
from app.services.metrics_engine import metrics_engine
from app.cache import profile_cache

app = FastAPI(title="OSS Contributor Scorecard & Tech Stack Profiler")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "github-profiler"}

@app.get("/api/profile/{username}")
async def get_developer_scorecard(username: str):
    # Sanitize user inputs to protect downstream system lookups
    username_clean = username.strip().lower()
    if not username_clean:
        raise HTTPException(status_code=400, detail="Username parameter cannot be empty.")
        
    # 1. Evaluate cache memory state (Fulfills rate-limiting reduction rules)
    cached_scorecard = profile_cache.get(username_clean)
    if cached_scorecard:
        return {"source": "cache", "data": cached_scorecard}
        
    # 2. Cache Miss -> Fetch structured profile data from GitHub
    raw_data = await github_client.fetch_raw_profile_data(username_clean)
    
    # 3. Calculate metrics and transform raw footprints into metrics
    scorecard = metrics_engine.calculate_scorecard(raw_data)
    
    # 4. Save results to local memory for future optimization
    profile_cache.set(username_clean, scorecard)
    
    return {"source": "network", "data": scorecard}