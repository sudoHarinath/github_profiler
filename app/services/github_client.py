import asyncio
import httpx
from fastapi import HTTPException
from app.config import GITHUB_PAT, API_VERSION, USER_AGENT

class GitHubAsyncClient:
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": USER_AGENT,
            "X-GitHub-Api-Version": API_VERSION
        }
        if GITHUB_PAT:
            self.headers["Authorization"] = f"Bearer {GITHUB_PAT}"

    async def fetch_raw_profile_data(self, username: str) -> dict:
        """Fetches base profile and repo maps simultaneously via standard asyncio gathering."""
        async with httpx.AsyncClient(headers=self.headers) as client:
            profile_url = f"{self.base_url}/users/{username}"
            repos_url = f"{self.base_url}/users/{username}/repos?per_page=30&sort=updated"
            
            try:
                # Define coroutines cleanly
                profile_task = client.get(profile_url)
                repos_task = client.get(repos_url)
                
                # Execute concurrently via Python event loop
                profile_response, repos_response = await asyncio.gather(profile_task, repos_task)
                
                # Check for bad input (User doesn't exist)
                if profile_response.status_code == 404:
                    raise HTTPException(status_code=404, detail="GitHub profile does not exist.")
                    
                profile_response.raise_for_status()
                repos_response.raise_for_status()
                
                return {
                    "profile": profile_response.json(),
                    "repos": repos_response.json()
                }
                
            except httpx.HTTPStatusError as exc:
                raise HTTPException(
                    status_code=exc.response.status_code, 
                    detail=f"GitHub API error: {exc.response.text}"
                )
            except httpx.RequestError:
                raise HTTPException(
                    status_code=503, 
                    detail="GitHub API is temporarily unreachable or slow."
                )
            
    async def fetch_repo_readme(self, username: str, repo_name: str) -> str:
        """Fetches the raw README.md text content directly from a specific repository."""
        async with httpx.AsyncClient(headers=self.headers) as client:
            # Using the raw media type header directly delivers the markdown string payload
            readme_headers = {**self.headers, "Accept": "application/vnd.github.raw+json"}
            url = f"{self.base_url}/repos/{username}/{repo_name}/readme"
            
            try:
                response = await client.get(url, headers=readme_headers)
                if response.status_code == 404:
                    return "No README.md documentation file found in this repository."
                response.raise_for_status()
                return response.text
            except Exception:
                return "Temporarily unable to retrieve project documentation."

github_client = GitHubAsyncClient()