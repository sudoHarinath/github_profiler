// let chartInstance = null;
// let completeRepositoryDataset = []; // Global memory array for offline filtering manipulations
// let activeSortProperty = 'stars';
// let isSortingDirectionAscending = false;

// document.getElementById('searchBtn').addEventListener('click', executeSearch);
// document.getElementById('usernameInput').addEventListener('keypress', (e) => {
//     if (e.key === 'Enter') executeSearch();
// });

// // Setup Real-time In-Memory Filter Event Receivers
// document.getElementById('matrixSearchInput').addEventListener('input', runDynamicMatrixEvaluation);
// document.getElementById('matrixFilterForks').addEventListener('change', runDynamicMatrixEvaluation);

// // Setup Layout Tab Controllers
// document.getElementById('tabBtn-diagnostic').addEventListener('click', () => switchWorkspaceTab('diagnostic'));
// document.getElementById('tabBtn-matrix').addEventListener('click', () => switchWorkspaceTab('matrix'));

// function switchWorkspaceTab(targetId) {
//     document.querySelectorAll('.workspace-tab').forEach(el => el.classList.add('hidden'));
//     document.querySelectorAll('.tab-btn').forEach(el => {
//         el.className = "tab-btn w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-400 hover:bg-slate-900/40 hover:text-slate-200";
//     });

//     document.getElementById(`tabContent-${targetId}`).classList.remove('hidden');
//     document.getElementById(`tabBtn-${targetId}`).className = "tab-btn w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-cyan-600/10 text-cyan-400 border border-cyan-500/10";
// }

// async function executeSearch() {
//     const username = document.getElementById('usernameInput').value.trim();
//     const errorBanner = document.getElementById('errorBanner');
//     const shell = document.getElementById('workspaceShell');
    
//     errorBanner.classList.add('hidden');
    
//     if (!username) {
//         showError("Please enter a username string parameter.");
//         return;
//     }

//     try {
//         const response = await fetch(`/api/profile/${username}`);
//         const payload = await response.json();

//         if (!response.ok) {
//             showError(payload.detail || "System service fault executing retrieval routing.");
//             shell.classList.add('hidden');
//             return;
//         }

//         const data = payload.data;
//         completeRepositoryDataset = data.raw_matrix; // Capture dataset snapshot
//         shell.classList.remove('hidden');

//         // Hydrate Core Demographics Card
//         document.getElementById('devAvatar').src = data.avatar_url;
//         document.getElementById('devName').innerText = data.name;
//         document.getElementById('devHandle').innerText = `@${data.username}`;
//         document.getElementById('devTenure').innerText = `Ecosystem Tenure: ${data.profile_tenure_years} Years`;
//         document.getElementById('devBio').innerText = data.bio || "No biography statement configured.";

//         // Hydrate Axis A: Velocity Elements
//         document.getElementById('metricCadence').innerText = data.pillars.velocity.cadence_status;
//         document.getElementById('subMetricOriginalCount').innerText = data.pillars.velocity.original_count;
//         document.getElementById('subMetricForkCount').innerText = data.pillars.velocity.forked_count;
//         document.getElementById('subMetricOriginalRatio').innerText = `${data.pillars.velocity.originality_ratio_pct}%`;

//         // Hydrate Axis B: Authority Elements
//         document.getElementById('metricAuthorityTier').innerText = data.pillars.authority.tier;
//         document.getElementById('subMetricStars').innerText = `${data.pillars.authority.stars} ★`;
//         document.getElementById('subMetricForks').innerText = data.pillars.authority.forks;

//         // Hydrate Axis C: Footprint Distributions
//         hydrateSpecializationsList(data.pillars.footprint.framework_distribution);
//         renderLanguagesChart(data.pillars.footprint.languages_percentage);

//         // Run Initial Render of the Interactive Spreadsheet view
//         runDynamicMatrixEvaluation();

//     } catch (err) {
//         showError("The background parsing framework is currently unresponsive.");
//     }
// }

// function showError(msg) {
//     const banner = document.getElementById('errorBanner');
//     banner.innerText = msg;
//     banner.classList.remove('hidden');
// }

// function hydrateSpecializationsList(specs) {
//     const container = document.getElementById('specializationList');
//     container.innerHTML = '';
//     const entries = Object.entries(specs);
    
//     if (entries.length === 0) {
//         container.innerHTML = '<div class="text-xs text-slate-500 italic py-2">No definitive framework signatures detected in original codebases.</div>';
//         return;
//     }

//     const maxVal = Math.max(...entries.map(e => e[1]), 1);
//     entries.forEach(([stack, score]) => {
//         const pct = Math.min(Math.round((score / maxVal) * 100), 100);
//         const item = document.createElement('div');
//         item.className = "space-y-1";
//         item.innerHTML = `
//             <div class="flex justify-between text-xs font-semibold">
//                 <span class="text-slate-300 text-[11px]">${stack}</span>
//                 <span class="text-slate-500 font-mono text-[10px]">${pct}% weight</span>
//             </div>
//             <div class="w-full bg-slate-950 rounded-full h-1 border border-slate-900">
//                 <div class="bg-cyan-500 h-1 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
//             </div>
//         `;
//         container.appendChild(item);
//     });
// }

// function runDynamicMatrixEvaluation() {
//     const keyword = document.getElementById('matrixSearchInput').value.toLowerCase();
//     const hideForks = document.getElementById('matrixFilterForks').checked;
//     const tbody = document.getElementById('matrixTableBody');
//     tbody.innerHTML = '';

//     // Step A: Multi-criteria filtering over local memory array
//     let filteredList = completeRepositoryDataset.filter(repo => {
//         const matchesKeyword = repo.name.toLowerCase().includes(keyword);
//         const matchesForkRule = hideForks ? !repo.is_fork : true;
//         return matchesKeyword && matchesForkRule;
//     });

//     // Step B: Sort executing over filtered arrays
//     filteredList.sort((a, b) => {
//         let valA = a[activeSortProperty];
//         let valB = b[activeSortProperty];
        
//         if (valA < valB) return isSortingDirectionAscending ? -1 : 1;
//         if (valA > valB) return isSortingDirectionAscending ? 1 : -1;
//         return 0;
//     });

//     // Step C: Render HTML rows dynamically
//     if (filteredList.length === 0) {
//         tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-500 italic text-xs">No repositories matched your filter criteria.</td></tr>`;
//         return;
//     }

//     filteredList.forEach(repo => {
//         const row = document.createElement('tr');
//         row.className = "hover:bg-slate-900/30 font-medium transition-colors border-b border-slate-900/20";
        
//         const formatPush = repo.last_push_days === 0 ? "Today" : repo.last_push_days === 999 ? "Never" : `${repo.last_push_days}d ago`;
//         const sizeFormatted = repo.size_kb > 1024 ? `${(repo.size_kb / 1024).toFixed(1)} MB` : `${repo.size_kb} KB`;
        
//         row.innerHTML = `
//             <td class="p-3 max-w-[200px] truncate">
//                 <span class="font-bold text-slate-200 text-xs block truncate">${repo.name}</span>
//                 <span class="text-[9px] font-mono uppercase font-bold tracking-wider ${repo.is_fork ? 'text-slate-500' : 'text-cyan-400'}">
//                     ${repo.is_fork ? 'Forked Repo' : `Original • ${repo.language}`}
//                 </span>
//             </td>
//             <td class="p-3 text-center text-slate-300 font-mono text-[11px]">${repo.stars}</td>
//             <td class="p-3 text-center text-slate-400 font-mono text-[11px]">${repo.forks}</td>
//             <td class="p-3 text-center text-slate-400 font-mono text-[11px]">${sizeFormatted}</td>
//             <td class="p-3 text-center text-slate-400 font-mono text-[11px]">${formatPush}</td>
//         `;
//         tbody.appendChild(row);
//     });
// }

// function sortMatrixData(property) {
//     if (activeSortProperty === property) {
//         isSortingDirectionAscending = !isSortingDirectionAscending; // Toggle direction
//     } else {
//         activeSortProperty = property;
//         isSortingDirectionAscending = false; // Default to descending on property change
//     }
//     runDynamicMatrixEvaluation();
// }

// function renderLanguagesChart(languagesData) {
//     const ctx = document.getElementById('languageChart').getContext('2d');
//     if (chartInstance) chartInstance.destroy();

//     const labels = Object.keys(languagesData);
//     const data = Object.values(languagesData);

//     if (labels.length === 0) {
//         labels.push("No Code Traces");
//         data.push(100);
//     }

//     chartInstance = new Chart(ctx, {
//         type: 'doughnut',
//         data: {
//             labels: labels,
//             datasets: [{
//                 data: data,
//                 backgroundColor: ['#22d3ee', '#10b981', '#3b82f6', '#f43f5e', '#eab308', '#475569'],
//                 borderWidth: 0
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 legend: {
//                     position: 'right',
//                     labels: { color: '#94a3b8', boxWidth: 8, font: { size: 9, weight: 'bold' } }
//                 }
//             }
//         }
//     });
// }


let chartInstance = null;
let completeRepositoryDataset = []; 
let activeSortProperty = 'stars';
let isSortingDirectionAscending = false;
let currentlyTargetedUsername = ''; // Track active search handle context

document.getElementById('searchBtn').addEventListener('click', executeSearch);
document.getElementById('usernameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') executeSearch();
});

document.getElementById('matrixSearchInput').addEventListener('input', runDynamicMatrixEvaluation);
document.getElementById('matrixFilterForks').addEventListener('change', runDynamicMatrixEvaluation);

document.getElementById('tabBtn-diagnostic').addEventListener('click', () => switchWorkspaceTab('diagnostic'));
document.getElementById('tabBtn-matrix').addEventListener('click', () => switchWorkspaceTab('matrix'));

function switchWorkspaceTab(targetId) {
    document.querySelectorAll('.workspace-tab').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.className = "tab-btn w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-400 hover:bg-slate-900/40 hover:text-slate-200";
    });
    document.getElementById(`tabContent-${targetId}`).classList.remove('hidden');
    document.getElementById(`tabBtn-${targetId}`).className = "tab-btn w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-cyan-600/10 text-cyan-400 border border-cyan-500/10";
}

async function executeSearch() {
    const username = document.getElementById('usernameInput').value.trim();
    const errorBanner = document.getElementById('errorBanner');
    const shell = document.getElementById('workspaceShell');
    
    errorBanner.classList.add('hidden');
    if (!username) {
        showError("Please enter a username string parameter.");
        return;
    }

    try {
        const response = await fetch(`/api/profile/${username}`);
        const payload = await response.json();

        if (!response.ok) {
            showError(payload.detail || "System service fault executing retrieval routing.");
            shell.classList.add('hidden');
            return;
        }

        const data = payload.data;
        completeRepositoryDataset = data.raw_matrix;
        currentlyTargetedUsername = data.username; // Lock in active context
        shell.classList.remove('hidden');

        document.getElementById('devAvatar').src = data.avatar_url;
        document.getElementById('devName').innerText = data.name;
        document.getElementById('devHandle').innerText = `@${data.username}`;
        document.getElementById('devTenure').innerText = `Ecosystem Tenure: ${data.profile_tenure_years} Years`;
        document.getElementById('devBio').innerText = data.bio || "No biography statement configured.";
        document.getElementById('dataSourceField').innerText = payload.source;

        document.getElementById('metricCadence').innerText = data.pillars.velocity.cadence_status;
        document.getElementById('subMetricOriginalCount').innerText = data.pillars.velocity.original_count;
        document.getElementById('subMetricForkCount').innerText = data.pillars.velocity.forked_count;
        document.getElementById('subMetricOriginalRatio').innerText = `${data.pillars.velocity.originality_ratio_pct}%`;

        document.getElementById('metricAuthorityTier').innerText = data.pillars.authority.tier;
        document.getElementById('subMetricStars').innerText = `${data.pillars.authority.stars} ★`;
        document.getElementById('subMetricForks').innerText = data.pillars.authority.forks;

        hydrateSpecializationsList(data.pillars.footprint.framework_distribution);
        renderLanguagesChart(data.pillars.footprint.languages_percentage);

        runDynamicMatrixEvaluation();

    } catch (err) {
        showError("The background parsing framework is currently unresponsive.");
    }
}

function showError(msg) {
    const banner = document.getElementById('errorBanner');
    banner.innerText = msg;
    banner.classList.remove('hidden');
}

function hydrateSpecializationsList(specs) {
    const container = document.getElementById('specializationList');
    container.innerHTML = '';
    const entries = Object.entries(specs);
    
    if (entries.length === 0) {
        container.innerHTML = '<div class="text-xs text-slate-500 italic py-2">No definitive framework signatures detected in original codebases.</div>';
        return;
    }

    const maxVal = Math.max(...entries.map(e => e[1]), 1);
    entries.forEach(([stack, score]) => {
        const pct = Math.min(Math.round((score / maxVal) * 100), 100);
        const item = document.createElement('div');
        item.className = "space-y-1";
        item.innerHTML = `
            <div class="flex justify-between text-xs font-semibold">
                <span class="text-slate-300 text-[11px]">${stack}</span>
                <span class="text-slate-500 font-mono text-[10px]">${pct}% weight</span>
            </div>
            <div class="w-full bg-slate-950 rounded-full h-1 border border-slate-900">
                <div class="bg-cyan-500 h-1 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
            </div>
        `;
        container.appendChild(item);
    });
}

function runDynamicMatrixEvaluation() {
    const keyword = document.getElementById('matrixSearchInput').value.toLowerCase();
    const hideForks = document.getElementById('matrixFilterForks').checked;
    const tbody = document.getElementById('matrixTableBody');
    tbody.innerHTML = '';

    let filteredList = completeRepositoryDataset.filter(repo => {
        const matchesKeyword = repo.name.toLowerCase().includes(keyword);
        const matchesForkRule = hideForks ? !repo.is_fork : true;
        return matchesKeyword && matchesForkRule;
    });

    filteredList.sort((a, b) => {
        let valA = a[activeSortProperty];
        let valB = b[activeSortProperty];
        if (valA < valB) return isSortingDirectionAscending ? -1 : 1;
        if (valA > valB) return isSortingDirectionAscending ? 1 : -1;
        return 0;
    });

    if (filteredList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-500 italic text-xs">No repositories matched your filter criteria.</td></tr>`;
        return;
    }

    filteredList.forEach((repo, idx) => {
        const rowId = `repo-row-${idx}`;
        const detailId = `repo-detail-${idx}`;
        
        // Base Data Row
        const tr = document.createElement('tr');
        tr.id = rowId;
        tr.className = "hover:bg-slate-900/40 font-medium transition-colors border-b border-slate-900/20 cursor-pointer";
        
        const formatPush = repo.last_push_days === 0 ? "Today" : repo.last_push_days === 999 ? "Never" : `${repo.last_push_days}d ago`;
        const sizeFormatted = repo.size_kb > 1024 ? `${(repo.size_kb / 1024).toFixed(1)} MB` : `${repo.size_kb} KB`;
        
        tr.innerHTML = `
            <td class="p-3 max-w-[200px] truncate">
                <span class="font-bold text-slate-200 text-xs block truncate">${repo.name}</span>
                <span class="text-[9px] font-mono uppercase font-bold tracking-wider ${repo.is_fork ? 'text-slate-500' : 'text-cyan-400'}">
                    ${repo.is_fork ? 'Forked Repo' : `Original • ${repo.language}`}
                </span>
            </td>
            <td class="p-3 text-center text-slate-300 font-mono text-[11px]">${repo.stars}</td>
            <td class="p-3 text-center text-slate-400 font-mono text-[11px]">${repo.forks}</td>
            <td class="p-3 text-center text-slate-400 font-mono text-[11px]">${sizeFormatted}</td>
            <td class="p-3 text-center text-slate-400 font-mono text-[11px]">${formatPush}</td>
        `;

        // Expandable Detail Row
        const detailTr = document.createElement('tr');
        detailTr.id = detailId;
        detailTr.className = "hidden bg-slate-950/60 transition-all";
        detailTr.innerHTML = `
            <td colspan="5" class="p-4 border-b border-slate-900/40 text-xs">
                <div class="flex flex-col gap-2">
                    <div class="text-slate-400 leading-relaxed font-normal"><span class="font-bold text-slate-500">README Snippet:</span> <span id="summary-${idx}">Loading documentation...</span></div>
                    <div class="flex items-center gap-2 mt-1 flex-wrap">
                        <span class="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Detected Keywords:</span>
                        <div id="keywords-${idx}" class="flex flex-wrap gap-1"></div>
                    </div>
                </div>
            </td>
        `;

        // Bind Lazy Loading On-Click Action
        tr.addEventListener('click', () => toggleRepositoryRowExpansion(idx, repo.name));

        tbody.appendChild(tr);
        tbody.appendChild(detailTr);
    });
}

async function toggleRepositoryRowExpansion(index, repoName) {
    const detailRow = document.getElementById(`repo-detail-${index}`);
    const summaryField = document.getElementById(`summary-${index}`);
    const keywordsField = document.getElementById(`keywords-${index}`);

    // Toggle close if already open
    if (!detailRow.classList.contains('hidden')) {
        detailRow.classList.add('hidden');
        return;
    }

    detailRow.classList.remove('hidden');

    // Only make the API request if we haven't loaded it yet
    if (summaryField.innerText === "Loading documentation...") {
        try {
            const res = await fetch(`/api/repo/${currentlyTargetedUsername}/${repoName}`);
            const payload = await res.json();

            if (!res.ok) {
                summaryField.innerText = "Failed to load project parameters.";
                return;
            }

            summaryField.innerText = `"${payload.insights.summary}"`;
            keywordsField.innerHTML = '';

            if (payload.insights.keywords.length === 0) {
                keywordsField.innerHTML = '<span class="text-[10px] text-slate-600 italic">None identified</span>';
                return;
            }

            payload.insights.keywords.forEach(kw => {
                const chip = document.createElement('span');
                chip.className = "px-1.5 py-0.5 rounded bg-slate-900 text-[10px] text-cyan-400 font-mono border border-slate-800";
                chip.innerText = kw;
                keywordsField.appendChild(chip);
            });

        } catch (err) {
            summaryField.innerText = "Error establishing network response.";
        }
    }
}

function sortMatrixData(property) {
    if (activeSortProperty === property) {
        isSortingDirectionAscending = !isSortingDirectionAscending;
    } else {
        activeSortProperty = property;
        isSortingDirectionAscending = false;
    }
    runDynamicMatrixEvaluation();
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
                backgroundColor: ['#22d3ee', '#10b981', '#3b82f6', '#f43f5e', '#eab308', '#475569'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#94a3b8', boxWidth: 8, font: { size: 9, weight: 'bold' } }
                }
            }
        }
    });
}