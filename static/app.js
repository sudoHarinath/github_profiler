let chartInstance = null;

document.getElementById('searchBtn').addEventListener('click', executeSearch);
document.getElementById('usernameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') executeSearch();
});

async function executeSearch() {
    const username = document.getElementById('usernameInput').value.trim();
    const errorBanner = document.getElementById('errorBanner');
    const contentArea = document.getElementById('scorecardContent');
    
    errorBanner.classList.add('hidden');
    
    if (!username) {
        showError("Please fill out the username input parameter.");
        return;
    }

    try {
        const response = await fetch(`/api/profile/${username}`);
        const payload = await response.json();

        if (!response.ok) {
            showError(payload.detail || "An unexpected system anomaly has interrupted processing.");
            contentArea.classList.add('hidden');
            return;
        }

        const scorecard = payload.data;
        const insights = scorecard.recruiter_insights;
        contentArea.classList.remove('hidden');

        // Hydrate Demographics
        document.getElementById('devAvatar').src = scorecard.avatar_url;
        document.getElementById('devName').innerText = scorecard.name;
        document.getElementById('devHandle').innerText = `@${scorecard.username}`;
        document.getElementById('devBio').innerText = scorecard.bio || "No profile biography statement configured.";
        document.getElementById('dataSourceField').innerText = payload.source;

        // Hydrate Recruiter Scoring Pillars
        document.getElementById('metricDCI').innerText = insights.capability_index;
        document.getElementById('metricOriginality').innerText = `${insights.originality_percentage}%`;
        document.getElementById('metricOriginalCount').innerText = scorecard.metrics.original_repos;
        document.getElementById('metricStars').innerText = `${scorecard.metrics.total_stars} ★`;
        
        const freshDays = insights.avg_days_since_push;
        document.getElementById('metricFreshness').innerText = freshDays === null ? "N/A" : `${freshDays} days`;

        // Render Badges and Stack Progress Metrics
        hydrateRecruiterBadges(insights.recruiter_tags);
        hydrateSpecializations(insights.specialization_distribution);

        // Render Language Allocation Graph
        renderLanguagesChart(scorecard.languages);

    } catch (err) {
        showError("The local micro-web service appears to be unresponsive.");
    }
}

function showError(msg) {
    const banner = document.getElementById('errorBanner');
    banner.innerText = msg;
    banner.classList.remove('hidden');
}

function hydrateRecruiterBadges(tags) {
    const container = document.getElementById('recruiterTags');
    container.innerHTML = ''; // Wipe existing children
    
    tags.forEach(tag => {
        const badge = document.createElement('span');
        badge.className = "text-[10px] px-2.5 py-1 rounded-md font-bold tracking-wide border ";
        
        // Context-aware badge styling logic
        if (tag === "Active Shipper") {
            badge.className += "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        } else if (tag === "Independent Creator") {
            badge.className += "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
        } else if (tag === "Community Validated") {
            badge.className += "bg-amber-500/10 text-amber-400 border-amber-500/20";
        } else {
            badge.className += "bg-slate-800 text-slate-400 border-slate-700";
        }
        
        badge.innerText = tag;
        container.appendChild(badge);
    });
}

function hydrateSpecializations(specs) {
    const container = document.getElementById('specializationList');
    container.innerHTML = '';
    
    const entries = Object.entries(specs);
    if (entries.length === 0) {
        container.innerHTML = '<div class="text-xs text-slate-500 italic py-2">No distinctive framework signatures detected in original code.</div>';
        return;
    }

    // Determine scalar factor for relative progress bars (highest score becomes 100%)
    const maxVal = Math.max(...entries.map(e => e[1]), 1);

    entries.forEach(([stack, score]) => {
        const pct = Math.min(Math.round((score / maxVal) * 100), 100);
        
        const wrapper = document.createElement('div');
        wrapper.className = "space-y-1";
        wrapper.innerHTML = `
            <div class="flex justify-between text-xs font-medium">
                <span class="text-slate-300">${stack}</span>
                <span class="text-slate-400 font-mono text-[11px]">${pct}% match</span>
            </div>
            <div class="w-full bg-slate-950 rounded-full h-1.5 border border-slate-900">
                <div class="bg-cyan-500 h-1.5 rounded-full" style="width: ${pct}%"></div>
            </div>
        `;
        container.appendChild(wrapper);
    });
}

function renderLanguagesChart(languagesData) {
    const ctx = document.getElementById('languageChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    const labels = Object.keys(languagesData);
    const data = Object.values(languagesData);

    if (labels.length === 0) {
        labels.push("No Code Traces");
        data.push(100);
    }

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#34d399', '#22d3ee', '#3b82f6', '#f43f5e', '#eab308', '#64748b'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#94a3b8', boxWidth: 10, font: { size: 10 } }
                }
            }
        }
    });
}