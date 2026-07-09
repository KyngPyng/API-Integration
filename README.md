# Advanced Spaceflight News Tracker & Command Dashboard

An interactive, responsive frontend web application that demonstrates real-time asynchronous data orchestration, dynamic DOM filtering, automated feedback systems, and scheduled background operations.

## 🚀 Live Interactivity Features

- **Asynchronous Feed Processor:** Connects to the open-source Spaceflight News API (v4) via a non-blocking `async/await` execution loop to securely parse a multi-tiered array collection of data blocks.
- **Dynamic Component Factory:** Instantiates reusable UI card elements (`<article class="news-card">`) programmatically using vanilla JavaScript DOM manipulation based on incoming server streams.
- **Live Search Query Filter:** Captures real-time text input parameters to match headlines and news sources against localized object states, instantly pruning visible elements without a window reload.
- **DarkSide Mission Control Automated Agent:** A simulated chat assistant panel that manages dedicated event triggers and uses a calibrated processing delay (`setTimeout`) to deliver operational telemetry feedback.
- **Background Interval Synchronization:** Uses background timers (`setInterval`) to perform automated silent cache updates every 60 seconds to guarantee data persistence and freshness.

## 📁 Repository Structure

```text
├── index.html       # Semantic layout hierarchy and DOM terminal grid structure
├── style.css       # Layout tokens, UI presentation layer, and CSS Grid viewports
├── script.js       # Core control engine, API connection routines, and automated listeners
└── README.md       # Project overview and technical operation guide
