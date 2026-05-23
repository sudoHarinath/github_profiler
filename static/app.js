let chartInstance = null;

document.getElementById('searchBtn').addEventListener('click', executeSearch);
document.getElementById('usernameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') executeSearch();
});

async function executeSearch() {
    const username = document.getElementById('usernameInput').value.trim();
    const errorBanner = document.getElementById('errorBanner');
    const contentArea = document.getElementById('scorecardContent');
    
    // Reset Views
    errorBanner.classList.add('hidden');
    
    if (!username) {
        showError("Please fill out the username field input parameter.");
        return;
    }

    try {
        const response = await fetch(`/api/profile/${username}`);
        const payload = await response.json();

        if (!response.ok) {
            showError(payload.detail || "An unexpected error occurred during processing.");
            contentArea.classList.add('hidden');
            return;
        }

        const scorecard = payload.data;
        contentArea.classList.remove('hidden');

        // Hydrate Core View Fields
        document.getElementById('devAvatar').src = scorecard.avatar_url;
        document.getElementById('devName').innerText = scorecard.name;
        document.getElementById('devHandle').innerText = `@${scorecard.username}`;
        document.getElementById('devArchetype').innerText = scorecard.archetype;
        document.getElementById('devBio').innerText = scorecard.bio || "No profile bio configured.";
        document.getElementById('dataSourceField').innerText = payload.source;

        // Hydrate Numeric Metrics
        document.getElementById('metricImpact').innerText = scorecard.metrics.impact_score;
        document.getElementById('metricRepos').innerText = scorecard.metrics.public_repos;
        document.getElementById('metricStars').innerText = scorecard.metrics.total_stars;
        document.getElementById('metricForks').innerText = scorecard.metrics.total_forks;

        // Hydrate and Render Visualization Graph
        renderLanguagesChart(scorecard.languages);

    } catch (err) {
        showError("The local web service is temporarily unresponsive.");
    }
}

function showError(msg) {
    const banner = document.getElementById('errorBanner');
    banner.innerText = msg;
    banner.classList.remove('hidden');
}

function renderLanguagesChart(languagesData) {
    const ctx = document.getElementById('languageChart').getContext('2d');
    
    // Destroy previous instance memory allocations to prevent overlay collisions
    if (chartInstance) {
        chartInstance.destroy();
    }

    const labels = Object.keys(languagesData);
    const data = Object.values(languagesData);

    if(labels.length === 0) {
        labels.push("Unknown");
        data.push(100);
    }

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#22d3ee', '#3b82f6', '#a855f7', '#f43f5e', '#eab308', '#10b981'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#94a3b8', boxWidth: 12, font: { size: 11 } }
                }
            }
        }
    });
}