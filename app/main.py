from fastapi import FastAPI

app = FastAPI(title="OSS Contributor Scorecard & Tech Stack Profiler")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "github-profiler"}