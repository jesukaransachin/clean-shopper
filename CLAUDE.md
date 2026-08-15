# CLAUDE.md

Guidance for Claude Code when working in this repo.

## Conventions

### File structure
- Shared components (used across multiple features) live in `src/components/`.
- Feature-specific files live in `src/features/[feature-name]/`.
- Do not place feature-specific files in `src/components/`.
- Do not duplicate shared components inside feature folders.
- `server/` (repo root, sibling to `src/`) holds backend/API code — not frontend code, so it doesn't belong under `src/`. See `docs/backend.md` for how it runs.
