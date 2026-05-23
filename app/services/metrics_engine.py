from datetime import datetime, timezone

class MetricsEngine:
    def __init__(self):
        # Anchor point for relative recency evaluations (May 2026)
        self.anchor_date = datetime(2026, 5, 23, tzinfo=timezone.utc)

    def calculate_scorecard(self, raw_data: dict) -> dict:
        profile = raw_data["profile"]
        repos = raw_data["repos"]
        
        original_repos = []
        forked_repos = []
        
        # 1. Pipeline Segmentation
        for repo in repos:
            if repo.get("fork", False):
                forked_repos.append(repo)
            else:
                original_repos.append(repo)
                
        total_original = len(original_repos)
        total_forks = len(forked_repos)
        total_combined = total_original + total_forks
        
        # 2. Axis A: Isolate Velocity & Recency Indicators
        freshness_days = []
        for repo in original_repos:
            pushed_str = repo.get("pushed_at")
            if pushed_str:
                pushed_dt = datetime.fromisoformat(pushed_str.replace("Z", "+00:00"))
                delta = self.anchor_date - pushed_dt
                freshness_days.append(max(delta.days, 0))
                
        avg_days_stale = int(sum(freshness_days) / len(freshness_days)) if freshness_days else None
        
        # Determine human-readable cadence categories without numerical penalty numbers
        if avg_days_stale is None:
            cadence_status = "No original code footprint detected"
        elif avg_days_stale <= 30:
            cadence_status = "Hyper-Active (Pushing code within the last month)"
        elif avg_days_stale <= 90:
            cadence_status = "Steady (Active within the last quarter)"
        elif avg_days_stale <= 180:
            cadence_status = "Moderate (Untouched for several months)"
        else:
            cadence_status = "Dormant (In-active for greater than 6 months)"

        # 3. Axis B: Isolate Community Authority Indicators
        total_stars = sum(repo.get("stargazers_count", 0) for repo in original_repos)
        total_repo_forks = sum(repo.get("forks_count", 0) for repo in original_repos)
        
        if total_stars >= 500:
            authority_tier = "Ecosystem Influencer / Core Maintainer"
        elif total_stars >= 50:
            authority_tier = "Community Validated Creator"
        elif total_stars >= 5:
            authority_tier = "Growing Public Tractions"
        else:
            authority_tier = "Independent Developer Portfolio"

        # 4. Axis C: Compute Detailed Ecosystem Framework Footprint
        stack_signatures = {
            "FastAPI / Python Backend": ["fastapi", "uvicorn", "pydantic", "flask", "django"],
            "React Ecosystem Frontend": ["react", "frontend", "tailwind", "nextjs", "next.js", "vite", "redux"],
            "Node.js Backend": ["express", "nodejs", "node.js", "javascript backend", "npm"],
            "AI / Machine Learning": ["pytorch", "tensorflow", "rag", "llm", "slm", "opencv", "scikit-learn", "agentic"]
        }
        
        detected_frameworks = {stack: 0 for stack in stack_signatures}
        for repo in original_repos:
            search_blob = " ".join([
                (repo.get("name") or "").lower(),
                (repo.get("description") or "").lower(),
                " ".join([t.lower() for t in repo.get("topics", [])])
            ])
            dominant_lang = (repo.get("language") or "").lower()
            if dominant_lang == "python":
                detected_frameworks["FastAPI / Python Backend"] += 1
            if dominant_lang in ["typescript", "javascript"]:
                detected_frameworks["React Ecosystem Frontend"] += 0.5
                detected_frameworks["Node.js Backend"] += 0.5
                
            for stack, keywords in stack_signatures.items():
                if any(kw in search_blob for kw in keywords):
                    detected_frameworks[stack] += 2

        # Filter out stacks with zero traces
        framework_profile = {k: v for k, v in detected_frameworks.items() if v > 0}

        # 5. Build Transparent Interactive Project List Elements
        # This gives the UI the full raw array to let users manipulate and sort data themselves
        compiled_repositories_matrix = []
        for repo in repos:
            compiled_repositories_matrix.append({
                "name": repo.get("name"),
                "is_fork": repo.get("fork", False),
                "language": repo.get("language") or "Unknown",
                "stars": repo.get("stargazers_count", 0),
                "forks": repo.get("forks_count", 0),
                "size_kb": repo.get("size", 0),
                "last_push_days": self._days_ago(repo.get("pushed_at"))
            })

        return {
            "username": profile.get("login"),
            "name": profile.get("name") or profile.get("login"),
            "avatar_url": profile.get("avatar_url"),
            "bio": profile.get("bio"),
            "profile_tenure_years": self._calculate_tenure(profile.get("created_at")),
            
            # Isolated analytical pillars
            "pillars": {
                "velocity": {
                    "cadence_status": cadence_status,
                    "avg_days_since_push": avg_days_stale,
                    "original_count": total_original,
                    "forked_count": total_forks,
                    "originality_ratio_pct": round((total_original / total_combined * 100), 1) if total_combined > 0 else 0
                },
                "authority": {
                    "tier": authority_tier,
                    "stars": total_stars,
                    "forks": total_repo_forks
                },
                "footprint": {
                    "framework_distribution": dict(sorted(framework_profile.items(), key=lambda x: x[1], reverse=True)),
                    "languages_percentage": self._calculate_languages(original_repos)
                }
            },
            "raw_matrix": sorted(compiled_repositories_matrix, key=lambda x: x["stars"], reverse=True)
        }

    def _days_ago(self, date_str: str) -> int:
        if not date_str: return 999
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return max((self.anchor_date - dt).days, 0)

    def _calculate_tenure(self, date_str: str) -> int:
        if not date_str: return 0
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return max(self.anchor_date.year - dt.year, 1)

    @staticmethod
    def _calculate_languages(original_repos: list) -> dict:
        lang_counts = {}
        total = 0
        for repo in original_repos:
            lang = repo.get("language")
            if lang:
                lang_counts[lang] = lang_counts.get(lang, 0) + 1
                total += 1
        if total == 0: return {}
        return dict(sorted({k: round((v / total) * 100, 1) for k, v in lang_counts.items()}.items(), key=lambda x: x[1], reverse=True))

metrics_engine = MetricsEngine()