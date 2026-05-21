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
        """Fetches base profile and repo maps simultaneously via an async context."""
        async with httpx.AsyncClient(headers=self.headers) as client:
            profile_url = f"{self.base_url}/users/{username}"
            repos_url = f"{self.base_url}/users/{username}/repos?per_page=30&sort=updated"
            
            try:
                # Fire network calls concurrently to save latency overhead
                profile_response, repos_response = await httpx.Client.get_all(
                    client.get(profile_url),
                    client.get(repos_url)
                ) if hasattr(httpx, 'Client') else (
                    await client.get(profile_url),
                    await client.get(repos_url)
                )
                
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

github_client = GitHubAsyncClient()