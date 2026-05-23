class MetricsEngine:
    @staticmethod
    def calculate_scorecard(raw_data: dict) -> dict:
        profile = raw_data["profile"]
        repos = raw_data["repos"]
        
        # 1. Calculate Language Distribution
        lang_counts = {}
        total_valid_repos = 0
        
        for repo in repos:
            lang = repo.get("language")
            if lang:
                lang_counts[lang] = lang_counts.get(lang, 0) + 1
                total_valid_repos += 1
        
        languages_percentage = {}
        if total_valid_repos > 0:
            for lang, count in lang_counts.items():
                # Convert raw frequencies to crisp percentages
                languages_percentage[lang] = round((count / total_valid_repos) * 100, 1)
        
        # 2. Aggregate Repository Impact Metrics
        total_stars = sum(repo.get("stargazers_count", 0) for repo in repos)
        total_forks = sum(repo.get("forks_count", 0) for repo in repos)
        
        # 3. Compute Baseline OSS Impact Score
        # Formula: Base public presence + (Stars heavily scaled) + (Forks moderately scaled)
        base_calculation = (profile.get("public_repos", 0) * 2) + (total_stars * 10) + (total_forks * 5)
        impact_score = int(base_calculation)
        
        # 4. Determine Developer Classification Archetype
        if total_stars > 100:
            archetype = "High-Impact Maintainer"
        elif profile.get("public_repos", 0) > 20:
            archetype = "Prolific Open-Source Creator"
        elif total_valid_repos == 0:
            archetype = "Exploring Contributor"
        else:
            archetype = "Active Core Developer"
            
        return {
            "username": profile.get("login"),
            "name": profile.get("name") or profile.get("login"),
            "avatar_url": profile.get("avatar_url"),
            "bio": profile.get("bio"),
            "metrics": {
                "public_repos": profile.get("public_repos", 0),
                "followers": profile.get("followers", 0),
                "total_stars": total_stars,
                "total_forks": total_forks,
                "impact_score": impact_score
            },
            "archetype": archetype,
            "languages": dict(sorted(languages_percentage.items(), key=lambda item: item[1], reverse=True))
        }

metrics_engine = MetricsEngine()