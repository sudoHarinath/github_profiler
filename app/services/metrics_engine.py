from datetime import datetime, timezone
import math

class MetricsEngine:
    def __init__(self):
        # Establish anchor date relative to May 2026
        self.anchor_date = datetime(2026, 5, 23, tzinfo=timezone.utc)

    def calculate_scorecard(self, raw_data: dict) -> dict:
        profile = raw_data["profile"]
        repos = raw_data["repos"]
        
        total_repos_count = len(repos)
        original_repos = []
        forked_count = 0
        
        # 1. Pipeline Segmentation: Isolate genuine innovation from forks
        for repo in repos:
            if repo.get("fork", False):
                forked_count += 1
            else:
                original_repos.append(repo)
                
        total_original_count = len(original_repos)
        
        # 2. Compute Core Pillars
        # Pillar A: Originality Ratio
        originality_ratio = (total_original_count / total_repos_count) if total_repos_count > 0 else 0.0
        score_originality = originality_ratio * 25
        
        # Pillar B: Code Volume (Linearly capped at 15 repos for early-career developers)
        score_volume = min(total_original_count / 15, 1.0) * 20
        
        # Pillar C: Community Saturation Curve
        total_stars = sum(repo.get("stargazers_count", 0) for repo in original_repos)
        total_forks = sum(repo.get("forks_count", 0) for repo in original_repos)
        traction_input = total_stars + (total_forks * 2)
        # Mathematical saturation: yields high rewards for junior traction (e.g. 5-20 stars) but tames anomalies
        score_traction = (1.0 - math.exp(-traction_input / 15.0)) * 30
        
        # Pillar D: Code Freshness Evaluation (Relative to May 2026)
        freshness_days = []
        for repo in original_repos:
            pushed_str = repo.get("pushed_at")
            if pushed_str:
                # Normalize ISO Z strings across Python runtimes
                pushed_dt = datetime.fromisoformat(pushed_str.replace("Z", "+00:00"))
                delta = self.anchor_date - pushed_dt
                freshness_days.append(max(delta.days, 0))
                
        if freshness_days:
            avg_days_stale = sum(freshness_days) / len(freshness_days)
            # Full marks if active within 30 days, degrading down to 0 if untouched for a year
            score_freshness = max(0.0, (1.0 - (avg_days_stale / 365.0))) * 25
        else:
            score_freshness = 0.0
            avg_days_stale = 999
            
        # Compile Weighted Developer Capability Index (DCI)
        developer_capability_index = int(score_originality + score_volume + score_traction + score_freshness)
        
        # 3. Stack Heuristic Classification Engine
        # Scans names, descriptions, and topics for ecosystem footprint signatures
        stack_signals = {
            "FastAPI / Python Backend": ["fastapi", "uvicorn", "pydantic", "flask", "django"],
            "React Ecosystem Frontend": ["react", "frontend", "tailwind", "nextjs", "next.js", "vite", "redux"],
            "Node.js Backend": ["express", "nodejs", "node.js", "javascript backend", "npm"],
            "AI / Machine Learning": ["pytorch", "tensorflow", "rag", "llm", "slm", "opencv", "scikit-learn", "agentic"]
        }
        
        detected_experience = {stack: 0 for stack in stack_signals}
        
        for repo in original_repos:
            # Combine textual indicators into a single searchable context stream
            search_blob = " ".join([
                (repo.get("name") or "").lower(),
                (repo.get("description") or "").lower(),
                " ".join([t.lower() for t in repo.get("topics", [])])
            ])
            
            dominant_lang = (repo.get("language") or "").lower()
            if dominant_lang == "python":
                detected_experience["FastAPI / Python Backend"] += 1
            if dominant_lang in ["typescript", "javascript"]:
                detected_experience["React Ecosystem Frontend"] += 0.5
                detected_experience["Node.js Backend"] += 0.5
                
            for stack, keywords in stack_signals.items():
                if any(kw in search_blob for kw in keywords):
                    detected_experience[stack] += 2  # High weight for explicit keywords/topics
                    
        # Filter frameworks out if the engineer has zero trace signatures
        specializations = {k: v for k, v in detected_experience.items() if v > 0}
        sorted_specs = sorted(specializations.items(), key=lambda x: x[1], reverse=True)
        
        # Generate actionable human recruitment tags
        recruiter_tags = []
        if originality_ratio > 0.8 and total_original_count >= 5:
            recruiter_tags.append("Independent Creator")
        if avg_days_stale < 45 and total_original_count > 0:
            recruiter_tags.append("Active Shipper")
        if total_stars > 25:
            recruiter_tags.append("Community Validated")
            
        if not recruiter_tags:
            recruiter_tags.append("Passive Profile")

        return {
            "username": profile.get("login"),
            "name": profile.get("name") or profile.get("login"),
            "avatar_url": profile.get("avatar_url"),
            "bio": profile.get("bio"),
            "recruiter_insights": {
                "capability_index": developer_capability_index,
                "originality_percentage": round(originality_ratio * 100, 1),
                "avg_days_since_push": int(avg_days_stale) if freshness_days else None,
                "recruiter_tags": recruiter_tags,
                "specialization_distribution": dict(sorted_specs[:3])
            },
            "metrics": {
                "original_repos": total_original_count,
                "forked_repos": forked_count,
                "total_stars": total_stars,
                "total_forks": total_forks
            },
            "languages": self._calculate_languages(original_repos)
        }

    @staticmethod
    def _calculate_languages(original_repos: list) -> dict:
        lang_counts = {}
        total = 0
        for repo in original_repos:
            lang = repo.get("language")
            if lang:
                lang_counts[lang] = lang_counts.get(lang, 0) + 1
                total += 1
        if total == 0:
            return {}
        return dict(sorted(
            {k: round((v / total) * 100, 1) for k, v in lang_counts.items()}.items(),
            key=lambda x: x[1], reverse=True
        ))

metrics_engine = MetricsEngine()