# PaceBowl Reddit Growth Studio 👾

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed%20with-Cloudflare%20Pages-f38020.svg)](https://pages.cloudflare.com)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success.svg)](https://reddit.pacebowl.com)

A 100% client-side, zero-latency growth engineering studio designed specifically for indie hackers, solopreneurs, and builders navigating Reddit.

Master the Reddit algorithm: generate 15-word viral one-liners, scan comment risk against AutoMod spam filters in real time, explore stage-based subreddit matrices, and craft high-converting showcase titles.

Live Studio: [https://reddit.pacebowl.com](https://reddit.pacebowl.com)

---

## ⚡ Core Features

- **🔥 Viral One-Liner Engine**:
  - Enforces the strict **&le; 15 words rule** tailored for mobile readers.
  - 5 distinct native Redditor humor styles: Deadpan Sarcasm, Self-Deprecating Irony, Brutally Concise Mic-Drop, Hard Truth, and Practical Hacker.
  - One-click copy with instant live word counter.
  - DeepSeek R1 prompt synthesizer for unlimited AI variation.
- **🛡️ AutoMod & Spam Risk Radar**:
  - Real-time client-side heuristic inspection (0 data transmission).
  - Flags external hyperlinks (`http/https`), aggressive marketing keywords, word count bloat, and polite AI disclaimers.
  - 0-100 Health score with exact actionable remediation advice.
- **🧭 Subreddit Directory & Stage Matrix**:
  - Stage 0: 0~50 Karma (`r/AskReddit`, `r/NoStupidQuestions`, `r/aww`).
  - Stage 1: 50~200 Karma (`r/ChatGPT`, `r/Cursor`, `r/StableDiffusion`, `r/LocalLLaMA`).
  - Stage 2: 200+ Karma (`r/SideProject`, `r/indiehackers`, `r/webdev`).
  - Outlines AutoMod strictness, age rules, sorting strategies (`Rising` vs `New`), and promo permissions.
- **🎯 Indie Hacker Showcase Title Crafter**:
  - 6 battle-tested psychological title formulas (The Pain-to-Solution Hook, The Public Build Hook, The Contrarian Take, The Roast Me Request).
  - Generates matching value-first (9:1) post templates with profile sidebar referral callouts (preventing spam filter deletion).
- **📈 Reddit Vacuum & Traffic Playbook**:
  - Summarizes the "Search Vacuum" strategy (identifying when Google SERP is filled with Reddit forum crumbs and capturing it with dedicated micro-tools).

---

## 🚀 Instant 1-Click Deployment (Cloudflare Pages)

### Deploy via Git
1. Push or fork this repository to your GitHub account.
2. In Cloudflare Dashboard, go to **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Select this repository (`reddit-growth-studio`).
4. **Build settings**:
   - Framework preset: `None`
   - Build command: *(leave empty)*
   - Build output directory: `.`
5. Click **Save and Deploy**. Your studio is instantly live globally with zero hosting cost!

---

## 📁 Repository Structure

```text
reddit-growth-studio/
├── index.html        # Complete responsive web application
├── favicon.svg       # Custom Reddit-Orange & Neon Cyan icon
├── favicon.ico       # Standard icon fallback
├── apple-touch-icon.png
├── robots.txt        # Crawler directives
├── sitemap.xml       # SEO sitemap
├── _redirects        # Cloudflare Pages edge redirects & affiliate gateways
├── LICENSE           # MIT License
└── README.md         # Documentation
```

---

## 🤝 Contributing

Contributions, feature suggestions, and pull requests are warmly welcome!

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
