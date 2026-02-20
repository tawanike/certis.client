# Certis Web

Next.js frontend for the Certis patent drafting platform. Deployed to **Vercel**.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Radix UI, shadcn/ui, Tailwind CSS 4
- **State**: Zustand (persisted auth store)
- **Animations**: Framer Motion
- **Testing**: Vitest + React Testing Library + JSDOM

## Project Structure

```
src/
├── app/                # Next.js App Router pages
│   ├── auth/           # Login, registration, invitation flows
│   ├── matter/         # Matter detail views (claims, risk, specs, chat)
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Dashboard
├── components/         # React components by domain
│   ├── auth/           # Auth forms, guards
│   ├── briefs/         # Brief upload and viewer
│   ├── chat/           # Chat panel with SSE streaming
│   ├── claims/         # Claim tree, diff views
│   ├── intake/         # Invention intake forms
│   ├── matter/         # Matter views and cards
│   ├── risks/          # Risk dashboard, scoring
│   ├── specs/          # Specification viewer
│   ├── layout/         # App shell, sidebar, topbar
│   └── ui/             # shadcn/Radix UI primitives
├── services/           # API client layer
│   ├── auth.service.ts
│   ├── clients.service.ts
│   ├── invitation.service.ts
│   └── matters.service.ts
├── stores/             # Zustand stores
│   └── authStore.ts    # JWT token, user state, persistence
├── types/              # TypeScript interfaces
│   ├── auth.ts
│   ├── matters.ts
│   └── invitation.ts
├── lib/                # Utilities
│   └── api.ts          # Base fetch wrapper (auto JWT, 401 logout)
└── data/               # Static/mock data
```

## Development

### Setup

```bash
npm install
```

### Run

```bash
npm run dev        # Dev server on :3000
```

### Build & Check

```bash
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript checking
npm test           # Vitest
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/v1` | Backend API base URL |

For production (Vercel), set `NEXT_PUBLIC_API_URL` to the production backend URL in the Vercel project settings.

## Deployment

The frontend is deployed to **Vercel** and connects to the backend API server via `NEXT_PUBLIC_API_URL`.

### Vercel Setup

1. Connect the repository to Vercel
2. Set the root directory to `web/`
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://api.your-domain.com/v1`
4. Deploy

### API Connection

All API calls go through `src/lib/api.ts` which:
- Prepends `NEXT_PUBLIC_API_URL` to all endpoints
- Auto-attaches JWT bearer tokens from the auth store
- Handles `FormData` uploads (strips `Content-Type` for multipart)
- Auto-logs out on `401` responses
