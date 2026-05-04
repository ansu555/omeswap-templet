# avax-agent

Last updated: 2026-05-04

`avax-agent/` is a standalone Next.js visual trading-bot builder that predates the root Omeswap builder integration. It has its own `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `app/`, `components/`, `lib/`, `store/`, and `types/`.

Do not treat this directory as a normal package inside the root Next.js app. It is a separate app and should be run from this directory.

## Run

```bash
cd avax-agent
npm install
npm run dev
```

Open `http://localhost:3000` unless Next chooses another port.

## What It Contains

- `/` landing/home page for the standalone builder.
- `/canvas` visual workflow canvas.
- `/api/agent` OpenRouter-backed assistant route.
- Builder canvas components under `components/canvas/`.
- Node components under `components/nodes/`.
- Executable node and engine code under `lib/`.
- Local store under `store/useStore.ts`.

## Relationship To The Root App

The root app now has its own integrated agent builder at `/agent-builder` using `components/agent-builder/`, `lib/agent-builder/`, `store/agent-builder.ts`, and root API routes.

Use `avax-agent/` for reference or isolated experimentation. Shared production changes should usually target the root builder unless the task explicitly asks for the standalone app.
