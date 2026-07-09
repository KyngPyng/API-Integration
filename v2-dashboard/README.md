# Module Milestone: Interactive Data-Driven Dashboard

An interactive analytics interface that connects asynchronously to a public REST endpoint to fetch, structure, and visualize data trends dynamically. This release focuses on layout architecture, client-side data filtering, and canvas chart generation.

## 📊 Core Features

* **Data Visualization (Chart.js):** Aggregates incoming article metadata strings on the fly to count occurrences per news site and displays them inside a responsive horizontal bar chart.
* **Multi-Tier Search & Filter Engine:** Leverages instantaneous text matching and a dynamic category dropdown to let users prune the loaded dataset cleanly without page reloads.
* **Responsive Grid Layout:** Uses CSS Grid matrices (`grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`) and media queries to scale fluidly from compact mobile screens to wide desktop viewports.
* **View Switching State Controls:** Swaps active layout tokens dynamically to let users seamlessly alternate between the standard card layout and the Chart.js analytics view.

## 📁 Folder Structure

```text
API-Integration/
├── index.html         # Milestone 1: Original Basic API Module
├── v2-dashboard/      # Milestone 2: Analytical Interface Module
│   ├── index.html     # Semantic dashboard DOM elements & canvas hooks
│   ├── style.css     # Responsive grid layouts and layout tokens
│   ├── script.js     # Data parsing, filtering, and Chart.js logic
│   └── README.md      # Milestone documentation (This File)
