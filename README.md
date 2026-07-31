# CodeSage 🚀
> **Talk to your repository with CodeSage. Advanced AI-Powered Code Intelligence and Analysis.**

- 🌐 **Vercel Live Demo**: [https://code-sage-dun.vercel.app](https://code-sage-dun.vercel.app)
- 🚀 **Render Live Service**: [https://codesage-lkxu.onrender.com](https://codesage-lkxu.onrender.com)

CodeSage is a modern, high-performance web application designed to analyze Git repositories, summarize commits, index source code embeddings using PostgreSQL vector search (`pgvector`), and provide instant AI-driven code intelligence using **Groq** (`llama-3.3-70b-versatile`).

---

## ✨ Features

- 🧠 **AI Code Intelligence**: Ask any question about your codebase and receive instant, context-aware answers powered by Groq (`llama-3.3-70b-versatile`).
- ⚡ **High-Speed Vector Search**: Uses PostgreSQL `pgvector` embeddings to retrieve relevant source code files in milliseconds.
- 📦 **Automated Git Repo Indexing**: Automatically processes, parses, and indexes code files from GitHub repositories.
- 📝 **Commit Summaries**: Automatically fetches and generates AI bullet-point summaries for git commits.
- 🔐 **Authentication & Session Management**: Built-in user authentication with password hashing (`bcrypt`) and secure session tracking.
- 🎨 **Modern & Responsive UI**: Built with Next.js 15, Tailwind CSS, Lucide icons, and Radix UI components with dynamic dark aesthetics.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Lucide Icons, Radix UI
- **Backend & API**: Next.js Server Actions & API Routes, Vercel AI SDK
- **Database & ORM**: PostgreSQL, Prisma ORM, `pgvector`
- **AI Models**: Groq (`llama-3.3-70b-versatile`), Google Generative AI (`text-embedding-004`)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **PostgreSQL Database**: PostgreSQL database with `pgvector` extension (e.g. Neon, Supabase, Railway, or local Postgres)
- **Groq API Key**: [Get a free Groq API key](https://console.groq.com/)

---

### Environment Setup

Create a `.env` file inside the `client` directory (or copy `.env.example`):

```env
DATABASE_URL="postgresql://user:password@host:5432/neondb?sslmode=require"
NODE_ENV="development"
URL="http://localhost:3000"
GROQ_API_KEY="your-groq-api-key"
GITHUB_ACCESS_TOKEN="your-github-access-token"
GEMINI_API_KEY="your-gemini-api-key"
```

---

### Installation & Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Mohityadav55199/CodeSage.git
   cd CodeSage/client
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Push Prisma Schema to Database**:
   ```bash
   npx prisma db push
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

5. Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
