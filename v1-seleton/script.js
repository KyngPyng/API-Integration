// DOM Element Registry Hooks
const newsFeedContainer = document.getElementById("news-feed-container");
const searchInput = document.getElementById("search-input");
const refreshBtn = document.getElementById("refresh-btn");
const statusBanner = document.getElementById("status-banner");
const chatOutputDisplay = document.getElementById("chat-output-display");
const chatTriggers = document.querySelectorAll(".trigger-chip");

const apiEndpoint = "https://api.spaceflightnewsapi.net/v4/articles/?limit=12";
let cachedArticlesArray = []; // Stores the localized data block state for filtering

// 1. REUSABLE UI COMPONENT FACTORY FUNCTION
function renderNewsFeed(articlesList) {
    newsFeedContainer.innerHTML = ""; // Wipe container canvas clean

    if (articlesList.length === 0) {
        newsFeedContainer.innerHTML = '<div class="initial-placeholder">No articles match your query criteria.</div>';
        return;
    }

    // Programmatically instantiate and structuralize each card component
    articlesList.forEach(item => {
        const cardElement = document.createElement("article");
        cardElement.className = "news-card";

        cardElement.innerHTML = `
            <p class="card-source">${item.news_site || 'Global Orbit'}</p>
            <h3 class="card-title">${item.title}</h3>
            <p class="card-summary">${item.summary || 'No abstract documentation supplied.'}</p>
            <a class="card-link" href="${item.url}" target="_blank">Access Raw Payload →</a>
        `;
        newsFeedContainer.appendChild(cardElement);
    });
}

// 2. ASYNC FETCH LOOP HANDLER
async function executeSynchronizationCycle() {
    try {
        statusBanner.textContent = "Syncing with live network API channels...";
        const response = await fetch(apiEndpoint);
        
        if (!response.ok) throw new Error(`HTTP System Failure: ${response.status}`);
        
        const data = await response.json();
        cachedArticlesArray = data.results || [];
        
        // Execute dynamic generation loop
        renderNewsFeed(cachedArticlesArray);
        
        // Unlock search filtering tools upon data initialization
        searchInput.disabled = false;
        statusBanner.textContent = `Feed state synchronized successfully. Last checkpoint: ${new Date().toLocaleTimeString()}`;
    } catch (error) {
        console.error("Critical Sync Interruption:", error);
        statusBanner.textContent = "Data connection failed. Standing by for auto-reconnect cycle.";
    }
}

// 3. LIVE SEARCH FILTER INPUT LISTENER
searchInput.addEventListener("input", (event) => {
    const rawSearchQuery = event.target.value.toLowerCase().trim();
    
    // Evaluate cached payload state array against query strings
    const filteredResults = cachedArticlesArray.filter(article => {
        const titleMatch = article.title.toLowerCase().includes(rawSearchQuery);
        const sourceMatch = article.news_site && article.news_site.toLowerCase().includes(rawSearchQuery);
        return titleMatch || sourceMatch;
    });

    // Re-render feed instantaneously based on input filtering bounds
    renderNewsFeed(filteredResults);
});

// 4. SIMULATED CHATBOT / AUTO-RESPONDER AUTOMATION
chatTriggers.forEach(chip => {
    chip.addEventListener("click", () => {
        const commandText = chip.textContent;
        const automatedReplyText = chip.getAttribute("data-reply");

        // Display user execution command prompt in display element
        chatOutputDisplay.innerHTML += `<p class="user-msg"><strong>You:</strong> ${commandText}</p>`;
        
        // Automation delay simulator engine to replicate processing
        setTimeout(() => {
            chatOutputDisplay.innerHTML += `<p class="bot-msg"><strong>AI:</strong> ${automatedReplyText}</p>`;
            chatOutputDisplay.scrollTop = chatOutputDisplay.scrollHeight; // Auto-scroll box layout
        }, 350);
    });
});

// 5. TIMED SCHEDULER INITIALIZATION
// Triggers automatic non-blocking sync checks in background every 60 seconds
setInterval(executeSynchronizationCycle, 60000);

// Setup manual interaction listener triggers
refreshBtn.addEventListener("click", executeSynchronizationCycle);

// Initial application runtime launch call
executeSynchronizationCycle();
