# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This is the AI Career Navigator — a comprehensive AI-powered career guidance platform for students and professionals, built for the Ignite 2K26 hackathon by Team Sathva.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)
- **Frontend**: React + Vite + TailwindCSS + Framer Motion

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── career-navigator/   # React + Vite frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   ├── integrations-openai-ai-server/  # OpenAI server-side integration
│   └── integrations-openai-ai-react/   # OpenAI React hooks
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

### Frontend (artifacts/career-navigator)
- `/` — Landing page with field selection and hero
- `/onboarding` — Multi-step user profile collection
- `/careers` — AI career recommendations (Safe/Balanced/Dream)
- `/career/:name` — Career detail with simulation, survival analysis, skill gap, job roles, daily plan
- `/roadmap` — AI-generated visual career roadmap
- `/resume` — Resume analyzer (PDF/TXT upload or paste)
- `/courses` — Free and paid courses listing
- `/centers` — Nearby learning centers (Skill India inspired)
- `/chat` — Real-time AI mentor chatbot with streaming

### Backend (artifacts/api-server)
Routes:
- `GET/POST /api/openai/conversations` — Chat conversations
- `GET/DELETE /api/openai/conversations/:id` — Conversation management
- `GET/POST /api/openai/conversations/:id/messages` — Messages with SSE streaming
- `POST /api/career/recommend` — AI career recommendations
- `POST /api/career/simulate` — Career day-in-life simulation
- `POST /api/career/survival` — Survival analysis
- `POST /api/career/skill-gap` — Skill gap analysis
- `POST /api/career/job-roles` — Job roles mapping
- `POST /api/career/daily-plan` — Daily action plan
- `POST /api/career/explain` — Career explanation
- `POST /api/roadmap/generate` — Roadmap generation
- `POST /api/resume/analyze` — Resume analysis
- `POST /api/courses/list` — Course recommendations
- `POST /api/courses/centers` — Learning centers

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection (auto-set by Replit)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI proxy URL (auto-set)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key (auto-set)
- `PORT` — Service port (auto-set per artifact)
- `SESSION_SECRET` — Session secret

## Database Tables

- `conversations` — Chat conversation records
- `messages` — Chat messages with role (user/assistant)
