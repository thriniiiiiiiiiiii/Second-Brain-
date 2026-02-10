# Knowledge Weaver Backend

A specialized second brain application designed to weave together your notes, insights, and patterns using advanced AI analysis. This backend service powers the Knowledge Weaver frontend with a robust API, database management, and AI integration.

## 🚀 Key Features

*   **Intelligent Note Management**: Create, read, update, and delete notes with AI-powered tagging and summarization.
*   **Pattern Recognition**: Analyze your notes to discover recurring themes and insights over time.
*   **Multi-AI Support**: Flexible architecture supporting Anthropic (Claude), Google (Gemini), and Ollama (Local LLMs) for privacy and choice.
*   **Vector Search**: (Planned/In-progress) Semantic search using embeddings.
*   **Robust Architecture**: Built with modern, type-safe technologies.

## 🛠 Tech Stack

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/) (hosted on [Neon](https://neon.tech/))
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **AI Integration**:
    *   [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai)
    *   [Ollama SDK](https://www.npmjs.com/package/ollama)
    *   [Anthropic SDK](https://www.npmjs.com/package/@anthropic-ai/sdk)

## 🏗 Architecture

The backend is structured to be modular and scalable:

*   **`app/api`**: details RESTful API endpoints for the frontend.
*   **`lib/`**: Contains core logic and service abstractions.
    *   `ai-provider.ts`: Standard interface for AI services.
    *   `gemini.ts`, `ollama.ts`, `claude.ts`: Specific implementations of AI providers.
    *   `pattern-observer.ts`: Logic for detecting patterns across notes.
    *   `scheduler.ts`: Manages background tasks.
*   **`prisma/`**: Database schema definition and migration files.

## 🔧 Setup Instructions

### Prerequisites

*   **Node.js**: v20 or higher
*   **npm**: v10 or higher
*   **PostgreSQL**: A running instance (local or cloud like Neon)

### 1. Clone the Repository

```bash
git clone <repository_url>
cd knowledge-weaver-main/second-brain-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory (`second-brain-backend/.env`). You can use `.env.example` as a template.

**Required Variables:**

```env
# Database Connection
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"

# AI Providers (Choose at least one)
# Gemini (Recommended for speed/cost)
GEMINI_API_KEY="your_gemini_api_key"

# Anthropic (Optional)
ANTHROPIC_API_KEY="your_anthropic_api_key"

# Ollama (Optional - for local execution)
OLLAMA_HOST="http://127.0.0.1:11434"
OLLAMA_MODEL="llama3" 
```

### 4. Database Setup

Synchronize your Prisma schema with the database:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes to the database
npx prisma db push
```

### 5. Run the Development Server

```bash
npm run dev
```

The backend API will be available at `http://localhost:3000`.

## 📝 API Endpoints

*   **`/api/notes`**: GET, POST
*   **`/api/notes/[id]`**: GET, PUT, DELETE
*   **`/api/chat`**: POST (Chat with your knowledge base)
*   **`/api/summarize`**: POST (Generate note summary)
*   **`/api/tags`**: POST (Generate tags for a note)
*   **`/api/patterns`**: GET (Retrieve recognized patterns)

---

Developed for the **Knowledge Weaver** project.
