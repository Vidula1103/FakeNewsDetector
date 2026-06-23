# VeritasNLP: Fake News Detection Using NLP

An interactive, high-density full-stack web application that classifies news articles as fake or real. VeritasNLP executes real-time natural language processing and lexical analytics in the browser, with integrated on-demand scraping tools to harvest content from online URLs or Kaggle references.

---

## 📸 Project Screenshots

### 1. screen 1
![Main Application Interface Workspace](https://github.com/Vidula1103/FakeNewsDetector/blob/main/FNP1.png)
### 2. screen 2
![Main Application Interface Workspace](https://github.com/Vidula1103/FakeNewsDetector/blob/main/FNP2.png)
### 3. screen 3
![Main Application Interface Workspace](https://github.com/Vidula1103/FakeNewsDetector/blob/main/FNP3.png)
### 4. screen 4
![Main Application Interface Workspace](https://github.com/Vidula1103/FakeNewsDetector/blob/main/FNP4.png)
### 5. screen 5
![Main Application Interface Workspace](https://github.com/Vidula1103/FakeNewsDetector/blob/main/FNP5.png)
### 6. screen 6
![Main Application Interface Workspace](https://github.com/Vidula1103/FakeNewsDetector/blob/main/FNP6.png)

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


i
