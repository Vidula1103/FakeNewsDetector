# VeritasNLP: Fake News Detection Using NLP

An interactive, high-density full-stack web application that classifies news articles as fake or real. VeritasNLP executes real-time natural language processing and lexical analytics in the browser, with integrated on-demand scraping tools to harvest content from online URLs or Kaggle references.

---

## 📸 Project Screenshots

> *Add screenshots of your application interfaces by dragging images into your repository and linking them in the placeholders below.*

### 1. Main Landing & Dual Classifiers
![Main Application Interface Workspace](https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80)
*Modern high-density user interface featuring direct text input, preloaded mock showcase telemetry examples, and real-time classification feeds.*

### 2. Lexical Token Heatmap & Attention Maps
![Attention Token Map](https://images.unsplash.com/photo-1546074177-3df103027c72?auto=format&fit=crop&w=1200&q=80)
*Syntactic mapping that marks word bias logs (Green background for real associations, Red background for fake associations, or Blue background for document TF-IDF rarity indices).*

---

## 🚀 Key Features

- **High Density Custom Dashboard**: Structured dense terminal aesthetic emphasizing computational statistics over empty canvas whitespace.
- **Multi-Classifier Pipeline**:
  - **Rule-Based Baseline**: Evaluates punctuation levels, screaming CAPS patterns, and Clickbait triggers (e.g. `shocking`, `insider conspiracy`, `satanic`).
  - **TF-IDF Weighting Matrix & Cosine Similarity Centroid**: Pre-computes term frequency penalized by global corpus rarity and measures direct vector distances.
  - **Naive Bayes Probabilistic Posterior Classifier**: Formulates Laplace-smoothed log likelihood ratios, giving precise word weights for downstream heatmaps.
- **Online URL Scraper Proxy**: Integrates a robust custom HTML paragraph content crawler to extract raw texts from live articles on demand.
- **Advanced Linguistic Diagnostics**: Computes Coleman-Liau readability grades, lexical diversity values, and title sensationalism metrics.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vite.dev/), [Tailwind CSS v4](https://tailwindcss.com/), and [Lucide-React](https://lucide.dev/).
- **Backend Server**: [Express](https://expressjs.com/) serving custom APIs and running static distributions in container environments.
- **NLP Algorithms**: Built fully in native TypeScript—eliminating external server overheads for real-time keystroke responsiveness.

---

## 📦 Assembly & Installation Guidelines

### Prerequisites

Ensure you have Node.js (version 20+) installed on your local operating machine.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/veritas-nlp-detector.git
cd veritas-nlp-detector
