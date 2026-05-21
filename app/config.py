import os

# Secure environment loading — fails safe if token is missing
GITHUB_PAT = os.environ.get("GITHUB_PAT", "")

# Configuration Defaults
API_VERSION = "2026-03-10"
USER_AGENT = "OSS-Contributor-Scorecard-v1"
CACHE_TTL_SECONDS = 600  # 10 minutes cache validity