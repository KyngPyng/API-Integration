// DOM Element Nodes
const fetchButton = document.getElementById("fetch-btn");
const searchInput = document.getElementById("search-input");
const sourceFilter = document.getElementById("source-filter");
const newsContainer = document.getElementById("news-container");
const statusMessage = document.getElementById("status-message");
const listView = document.getElementById("list-view");
const chartView = document.getElementById("chart-view");
const toggleListBtn = document.getElementById("toggle-list-btn");
const toggleChartBtn = document.getElementById("toggle-chart-btn");

// Global State Arrays
let articlesData = [];
let chartInstance = null;
const apiEndpoint = "https://api.spaceflightnewsapi.net/v4/articles/?limit=50";

// Fetch Engine Initialization
async function syncDashboardDataset() {
    try {
        statusMessage.innerHTML = "<p>Retrieving structural streams... parsing metadata arrays.</p>";
        statusMessage.classList.remove("hidden");
        newsContainer.innerHTML = "";

        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error(`Network failure status: ${response.status}`);
        
        const data = await response.json();
        articlesData = data.results || [];

        if (articlesData.length > 0) {
            statusMessage.classList.add("hidden");
            
            // Enable interactive inputs
            searchInput.disabled = false;
            sourceFilter.disabled = false;

            populateFilterDropdown(articlesData);
            renderNewsDisplay(articlesData);
            buildMetricsChart(articlesData);
        } else {
            statusMessage.innerHTML = "<p>Data mapping empty. No records returned.</p>";
        }
    } catch (error) {
        console.error("Dashboard Engine Exception:", error);
        statusMessage.innerHTML = "<p>Failed to bind API data. Verify connection metrics.</p>";
    }
}

// Render UI Components Dynamically
function renderNewsDisplay(articles) {
    newsContainer.innerHTML = "";
    if (articles.length === 0) {
        newsContainer.innerHTML = "<p class='status-card' style='grid-column: 1/-1;'>No articles match the current filter state.</p>";
        return;
    }

    articles.forEach(item => {
        const card = document.createElement("article");
        card.className = "news-card";

        const sourceStr = item.news_site || "Spaceflight News";

        card.innerHTML = `
            <div>
                <span class="source-badge">${sourceStr}</span>
                <h3>${item.title}</h3>
                <p>${item.summary ? item.summary.substring(0, 140) + '...' : 'No telemetry summary provided.'}</p>
            </div>
            <a href="${item.url}" target="_blank">Analyze Field Report →</a>
        `;
        newsContainer.appendChild(card);
    });
}

// Dropdown Content Aggregator 
function populateFilterDropdown(articles) {
    const sources = new Set(articles.map(a => a.news_site || "Spaceflight News"));
    sourceFilter.innerHTML = '<option value="all">All News Sources</option>';
    
    sources.forEach(src => {
        const opt = document.createElement("option");
        opt.value = src;
        opt.textContent = src;
        sourceFilter.appendChild(opt);
    });
}

// Client-Side Multi-Tier Search Filter Routing
function executeDataFiltering() {
    const query = searchInput.value.toLowerCase();
    const activeSource = sourceFilter.value;

    const filteredDataset = articlesData.filter(article => {
        const matchesQuery = article.title.toLowerCase().includes(query);
        const matchesSource = (activeSource === "all") || (article.news_site === activeSource);
        return matchesQuery && matchesSource;
    });

    renderNewsDisplay(filteredDataset);
}

// Chart.js Data Logic & Initialization
function buildMetricsChart(articles) {
    // Crunch metadata to find volume count parameters per news site
    const counts = {};
    articles.forEach(art => {
        const site = art.news_site || "Spaceflight News";
        counts[site] = (counts[site] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const dataPoints = Object.values(counts);

    // Context teardown to cleanly re-instantiate instances
    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = document.getElementById("metricsChart").getContext("2d");
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Volume of Articles Streamed',
                data: dataPoints,
                backgroundColor: '#38bdf8',
                borderColor: '#0284c7',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#f8fafc' } }
            },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                y: { ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: '#334155' } }
            }
        }
    });
}

// View Display Toggle Listeners
toggleListBtn.addEventListener("click", () => {
    toggleListBtn.classList.add("active");
    toggleChartBtn.classList.remove("active");
    listView.classList.remove("hidden");
    chartView.classList.add("hidden");
});

toggleChartBtn.addEventListener("click", () => {
    toggleChartBtn.classList.add("active");
    toggleListBtn.classList.remove("active");
    chartView.classList.remove("hidden");
    listView.classList.add("hidden");
});

// Event Triggers Binder
fetchButton.addEventListener("click", syncDashboardDataset);
searchInput.addEventListener("input", executeDataFiltering);
sourceFilter.addEventListener("change", executeDataFiltering);
