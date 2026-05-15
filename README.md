# 📟 Kernel — Developer Social Ecosystem

> **Build. Connect. Ship.**  
> A high-fidelity, terminal-native social platform for indie hackers and developers.

![Kernel Banner](https://images.unsplash.com/photo-1614332287897-cdc485fa562d?auto=format&fit=crop&q=80&w=1200)

## 🚀 The Vision
Kernel is more than just a social network; it's an operational workspace for developers. Built with a raw, high-density terminal aesthetic, it provides a distraction-free environment for sharing technical journals, showcasing repositories, and connecting with the global developer collective.

## ✨ Core Features

### 1. 📟 Terminal Interface (UI/UX)
- High-contrast, dark-mode-first design.
- Neumorphic terminal elements and hard-shadow aesthetics.
- Custom-built command palette (⌘+K) for rapid navigation.

### 2. 📁 Repository Showcase (CRUD)
- Ship your projects with direct GitHub API integration.
- Automated tech-stack detection and tagging.
- Live links and source code previews.

### 3. ✍️ Technical Journals (Blogs)
- High-fidelity Markdown support.
- Community discussions with real-time engagement.
- Categorized discovery by tech stack.

### 4. 🧬 Developer Ecosystem
- **Real-Time Messaging**: Built with Socket.io for instant developer-to-developer handshakes.
- **Social Graph**: Follow other engineers, track their activity heatmaps, and build your network.
- **Interactive Feed**: Likes, Bookmarks, and nested comments for deep technical discussions.

## 🛠️ Technical Stack

- **Frontend**: React.js, TailwindCSS, Lucide Icons, Socket.io-client.
- **Backend**: Node.js, Express.js, Socket.io.
- **Database**: MongoDB Atlas (Aggregated Schema Design).
- **Deployment**: Vercel (Frontend), Render (Backend).

## 🔧 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/praman07/Kernel.git

# Setup Backend
cd backend
npm install
# Create .env with MONGO_URI, JWT_SECRET, PORT
npm start

# Setup Frontend
cd ../frontend
npm install
# Create .env with VITE_API_URL
npm run dev
```

## 🌍 Deployment Links
- **Live App**: [kernel-gules.vercel.app](https://kernel-gules.vercel.app)
- **API Status**: [kernel-olze.onrender.com/api](https://kernel-olze.onrender.com/api)

---
Built with 💙 by the Kernel Collective.
`exit 0`
