# AI Attribution

This document tracks material AI-assisted work in ARKA.

## 2026-04-29 - Technical Stack Brief

### AI Tool Used
- OpenAI Codex CLI (GPT-5.5)
- Context7 MCP for current documentation checks

### What AI Helped With
- Drafted the ARKA technical stack recommendation for a 1-week hackathon MVP.
- Compared Next.js route handlers, standalone API options, Postgres/Drizzle, 0G Storage, 0G Chain, OpenClaw integration posture, Telegram bot choices, testing, and deployment.
- Used Context7 for current Next.js, Drizzle ORM, and Hardhat documentation checks.
- Used official docs for 0G, Telegram, viem, Vercel, Vitest, Playwright, shadcn/ui, and OpenClaw.

### Files / Areas Affected
- `docs/technical-stack-brief.md`
- `CHANGELOG.md`
- `docs/ai-attribution.md`

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Documentation-only change.
- No code executed.

### Status
- Planning / documentation.

## 2026-04-29 — Planning Docs Consistency + Guardrails

### AI Tool Used
- OpenAI Codex CLI (GPT-5.x)

### What AI Helped With
- Edited planning documents for consistency (Backend/OpenClaw/Database/0G Storage).
- Clarified boundaries: `AuditEvent.status` vs `OpenClaw.triageOutcome` vs `caseResolutionStatus`.
- Cleaned up naming and policy wording to avoid mutating reconciliation facts.
- Wrote a lean trigger-based `AGENTS.md`.

### Files / Areas Affected
- `AGENTS.md`
- `Backend-Final.md`
- `Database.md`
- `Arka - OpenClaw Agent.md`
- `0G Storage Brief.md`
- `CHANGELOG.md`
- `docs/*` (this directory)

### Human Review
- Pending / to be confirmed by repo owner.

### Verification
- Documentation-only change.
- No code executed.
