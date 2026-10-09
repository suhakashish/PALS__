# CatchUp — What Did I Miss?

A fast, private, local-first chat catch-up dashboard. Skip the endless scrolling and get a prioritized breakdown of your unread group chat messages, action items, deadlines, and project updates.

Hosted on GitHub: [suhakashish/PALS__](https://github.com/suhakashish/PALS__)

---

## ✨ Features

- ⚡ **Local-First & Private:** All conversation analysis runs 100% locally in your browser. No message data is sent to external servers.
- 🎯 **Personalized Action Items:** Detects personal mentions (`@Name`), assignments, and tasks tailored to your profile.
- 🚨 **Priority & Urgency Scoring:** Flags critical, time-sensitive updates and highlights urgent announcements.
- 📅 **Deadlines & Meetings:** Parses dates, times, review sessions, and schedule changes.
- 💡 **Key Decisions & Updates:** Summarizes consensus, project direction, and status updates.
- 📋 **Next Action Checklist:** Generates an actionable step-by-step to-do list.

---

## 📁 Repository Structure

```plaintext
PALS__/
├── .gitignore        # Git ignore rules for OS, IDEs, and local environments
├── README.md         # Project documentation and setup guide
├── index.html        # Main application markup & dashboard structure
├── style.css         # Modern styling and responsive design tokens
└── script.js         # Text normalization, keyword scoring & report generator
```

---

## 🚀 Getting Started

### Running the App Locally

Because CatchUp is built with standard web technologies (HTML5, CSS3, ES6 JavaScript), no build tools or compilation steps are required:

#### Option 1: Direct File Open
Simply double-click `index.html` or open it directly in any modern browser (Chrome, Edge, Firefox, Safari).

#### Option 2: Local HTTP Server (Python)
If you have Python installed:
```bash
python -m http.server 8000
```
Then visit [http://localhost:8000](http://localhost:8000) in your browser.

---

## 🛠️ Git Configuration

Your Git author credentials configured for this repository:
```bash
git config user.name "Suha"
git config user.email "suhakashish.07@gmail.com"
```

---

## 📄 License

MIT / Open Source — See project repository for details.
