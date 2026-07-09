// Add Theme Toggle Selector Nodes
const themeCheckbox = document.getElementById("theme-checkbox");

// DOM Element Registries
const fetchButton = document.getElementById("fetch-btn");
const cacheStatus = document.getElementById("cache-status");
const searchInput = document.getElementById("search-input");
const sourceFilter = document.getElementById("source-filter");
const newsContainer = document.getElementById("news-container");
const skeletonLoader = document.getElementById("skeleton-loader");
const errorBoundary = document.getElementById("error-boundary");
const retryButton = document.getElementById("retry-btn");
const listView = document.getElementById("list-view");
const chartView = document.getElementById("chart-view");
const toggleListBtn = document.getElementById("toggle-list-btn");
const toggleChartBtn = document.getElementById("toggle-chart-btn");

// Application Configuration Metrics
const apiEndpoint = "https://api.spaceflightnewsapi.net/v4/articles/?limit=50";
const CACHE_EXPIRATION_MS = 5 * 60 * 1000; 

let localArticlesCache = [];
let chartInstance = null;
let debounceTimeoutId = null;

// Initialization Routing
document.addEventListener("DOMContentLoaded", () => {
    initializeThemePreference();
    loadUserPreferences();
    evaluateSessionCacheOnLoad();
});

// Persistent Visual Theme Initialization Routines
function initializeThemePreference() {
    const activeTheme = localStorage.getItem("pref_theme") || "dark";
    if (activeTheme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
        themeCheckbox.checked = true;
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        themeCheckbox.checked = false;
    }
}

function switchThemePreference(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("pref_theme", "light");
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("pref_theme", "dark");
    }
    // Force redraw the chart with the correct inverted color bounds if data is loaded
    if (localArticlesCache.length > 0) {
        buildMetricsChart(localArticlesCache);
    }
}

// Cache Evaluation Mechanics
function evaluateSessionCacheOnLoad() {
    const cachedData = sessionStorage.getItem("spaceflight_data");
    const cachedTime = sessionStorage.getItem("spaceflight_timestamp");
    
    if (cachedData && cachedTime) {
        const age = Date.now() - parseInt(cachedTime);
        if (age < CACHE_EXPIRATION_MS) {
            localArticlesCache = JSON.parse(cachedData);
            cacheStatus.textContent = `Active Cache (${Math.round((CACHE_EXPIRATION_MS - age)/1000)}s left)`;
            initializeDataPresentation();
            return;
        }
    }
    cacheStatus.textContent = "Cache Expired / Empty";
}

// Resilient Fetch Engine
async function syncRepositoryDataset(forceRefresh = false) {
    if (!forceRefresh) {
        const cachedTime = sessionStorage.getItem("spaceflight_timestamp");
        if (cachedTime && (Date.now() - parseInt(cachedTime) < CACHE_EXPIRATION_MS)) {
            evaluateSessionCacheOnLoad();
            return;
        }
    }

    errorBoundary.classList.add("hidden");
    newsContainer.classList.add("hidden");
    skeletonLoader.classList.remove("hidden");
    fetchButton.disabled = true;

    try {
        const response = await fetch(apiEndpoint);
        if (response.status === 429) {
            throw new Error("API rate ceiling limit tripped. Please wait before syncing again.");
        }
        if (!response.ok) throw new Error(`Server returned invalid response flag: ${response.status}`);

        const data = await response.json();
        localArticlesCache = data.results || [];

        sessionStorage.setItem("spaceflight_data", JSON.stringify(localArticlesCache));
        sessionStorage.setItem("spaceflight_timestamp", Date.now().toString());
        cacheStatus.textContent = "Cache Status: Synced";

        initializeDataPresentation();

    } catch (err) {
        console.error("Critical Exception Handler:", err);
        displayFaultFallbackUI(err.message);
    } finally {
        skeletonLoader.classList.add("hidden");
        fetchButton.disabled = false;
    }
}

function initializeDataPresentation() {
    newsContainer.classList.remove("hidden");
    searchInput.disabled = false;
    sourceFilter.disabled = false;

    populateFilterDropdown(localArticlesCache);
    applyClientSideFilters(); 
    buildMetricsChart(localArticlesCache);
}

function displayFaultFallbackUI(message) {
    newsContainer.classList.add("hidden");
    chartView.classList.add("hidden");
    errorBoundary.classList.remove("hidden");
    document.getElementById("error-message").textContent = message;
}

function debounce(func, delay) {
    return (...args) => {
        clearTimeout(debounceTimeoutId);
        debounceTimeoutId = setTimeout(() => func(...args), delay);
    };
}

function applyClientSideFilters() {
    const query = searchInput.value.toLowerCase();
    const activeSource = sourceFilter.value;

    saveUserPreferences();

    const filtered = localArticlesCache.filter(art => {
        const matchesQuery = art.title.toLowerCase().includes(query);
        const matchesSource = (activeSource === "all") || (art.news_site === activeSource);
        return matchesQuery && matchesSource;
    });

    renderNewsCards(filtered);
}

function renderNewsCards(articles) {
    newsContainer.innerHTML = "";
    if (articles.length === 0) {
        newsContainer.innerHTML = "<p style='grid-column:1/-1; text-align:center; color:var(--text-muted);'>No records match search parameters.</p>";
        return;
    }

    articles.forEach(item => {
        const card = document.createElement("article");
        card.className = "news-card";
        card.innerHTML = `
            <div>
                <span class="source-badge">${item.news_site || 'News'}</span>
                <h3>${item.title}</h3>
            </div>
            <a href="${item.url}" target="_blank">View Article →</a>
        `;
        newsContainer.appendChild(card);
    });
}

function populateFilterDropdown(articles) {
    const savedSelected = localStorage.getItem("pref_source") || "all";
    const sources = new Set(articles.map(a => a.news_site).filter(Boolean));
    sourceFilter.innerHTML = '<option value="all">All News Sources</option>';
    
    sources.forEach(src => {
        const opt = document.createElement("option");
        opt.value = src;
        opt.textContent = src;
        if (src === savedSelected) opt.selected = true;
        sourceFilter.appendChild(opt);
    });
}

function saveUserPreferences() {
    localStorage.setItem("pref_search", searchInput.value);
    localStorage.setItem("pref_source", sourceFilter.value);
}

function loadUserPreferences() {
    searchInput.value = localStorage.getItem("pref_search") || "";
    const activeView = localStorage.getItem("pref_view") || "list";
    
    if (activeView === "chart") {
        activateChartView();
    } else {
        activateListView();
    }
}

function buildMetricsChart(articles) {
    const counts = {};
    articles.forEach(a => { counts[a.news_site] = (counts[a.news_site] || 0) + 1; });

    const currentTheme = document.documentElement.getAttribute("data-theme");
    const gridColor = currentTheme === "light" ? "#e2e8f0" : "#1f1f1f";
    const labelColor = currentTheme === "light" ? "#0f172a" : "#f1f5f9";

    if (chartInstance) chartInstance.destroy();
    const ctx = document.getElementById("metricsChart").getContext("2d");
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: 'Cached Metrics',
                data: Object.values(counts),
                backgroundColor: '#10b981'
            }]
        },
        options: { 
            responsive: true,
            scales: {
                x: { grid: { color: gridColor }, ticks: { color: labelColor } },
                y: { grid: { color: gridColor }, ticks: { color: labelColor } }
            },
            plugins: {
                legend: { labels: { color: labelColor } }
            }
        }
    });
}

function activateListView() {
    toggleListBtn.classList.add("active");
    toggleChartBtn.classList.remove("active");
    listView.classList.remove("hidden");
    chartView.classList.add("hidden");
    localStorage.setItem("pref_view", "list");
}

function activateChartView() {
    toggleChartBtn.classList.add("active");
    toggleListBtn.classList.remove("active");
    chartView.classList.remove("hidden");
    listView.classList.add("hidden");
    localStorage.setItem("pref_view", "chart");
}

// Event Triggers Binder
fetchButton.addEventListener("click", () => syncRepositoryDataset(true));
searchInput.addEventListener("input", debounce(applyClientSideFilters, 300));
sourceFilter.addEventListener("change", applyClientSideFilters);
toggleListBtn.addEventListener("click", activateListView);
toggleChartBtn.addEventListener("click", activateChartView);
themeCheckbox.addEventListener("change", switchThemePreference);
retryButton.addEventListener("click", () => {
    sessionStorage.clear();
    syncRepositoryDataset(true);
});
