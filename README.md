# Kernel — High-Performance Developer Ecosystem

Kernel is a terminal-inspired, text-centric developer ecosystem built for the next generation of builders. It prioritizes speed, raw aesthetics, and high-signal interactions over bloat and polished UI fluff.

![Kernel Feed](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop)

## 🚀 Features

- **Terminal-First Design**: Pure JetBrains Mono aesthetics with a focus on code and content.
- **High-Profile Ecosystem**: Built-in parody accounts of tech icons (Elon Musk, Sam Altman, Steve Jobs) to make the community feel alive.
- **Discussion Engine**: Deep threading with profile-aware comment previews.
- **Explore & Discover**: Search by hashtags, skills, or projects with a lightning-fast regex-powered backend.
- **Contribution Heatmap**: GitHub-style activity tracking for every developer.
- **Real-time Notifications**: Instant feedback on likes, follows, and bookmarks.

## 🛠 Tech Stack

- **Frontend**: React.js, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, MongoDB (Atlas), Mongoose.
- **Auth**: JWT-based authentication with secure password hashing.
- **Utilities**: Moment.js for time, Axios for networking, React Hot Toast for UX.

## 📦 Installation

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd hacksprint
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file with:
   # PORT=5000
   # MONGO_URI=your_mongodb_atlas_uri
   # JWT_SECRET=your_secret
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Seed the Ecosystem**
   ```bash
   cd backend
   node seed.js
   ```

## 📜 Seeded Accounts (Development)

- **GigaChad Admin**: `praman@kernel.dev` / `password123`
- **Elon Musk**: `elon@kernel.dev` / `password123`
- **Sam Altman**: `sam@kernel.dev` / `password123`

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

---
Built with <3 by Praman Bhogal.
