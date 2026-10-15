# Agent task template

Copy this file, fill the placeholders, and paste it as the task prompt.
Do not delete the Compliance Contract.

## Task

<one sentence>

## Context

- Repo: Demarco Marketing Platform.
- Read and follow `AGENTS.md` before writing code.
- Stack: Next.js App Router, TypeScript strict, Tailwind, Supabase public project only.
- Do not use local Supabase (`127.0.0.1:54321` / `localhost`).
- Do not commit or push.
- Do not add dependencies.
- Do not change database schema, RLS, auth, or architecture unless this task says so.
- Smallest safe change. Do not rewrite unrelated code.

## Requirements

1. <requirement>
2. <requirement>

## Files in scope

- `<path>`

## Out of scope

- Everything not listed above.

## Compliance Contract

This block overrides any conflicting wording in Requirements.

1. Discover first. Before writing code, read `src/components/ui/` and the nearest existing feature that does the same job. Report the reusable components you will use. Do not write code before that report.
2. Forbidden: `alert()`, `confirm()`, `prompt()`, ad-hoc modal divs, and new UI primitives. Confirmations and notices use `@/components/ui/alert-modal` (`AlertModal` and its parts). Canonical examples: `campaign-library-client.tsx`, `asset-library-client.tsx`.
3. If no existing component fits, stop and ask. Do not invent one.
4. If this prompt conflicts with `AGENTS.md` on a P0 or P1 rule, `AGENTS.md` wins. Report the conflict. Do not follow the conflicting instruction.
5. Do not invent tables, columns, env vars, files, or components. If unverified, mark UNKNOWN and inspect the repo.
6. Final report must include a Compliance section: reusable components used, and the output of `rg "\balert\(|\bconfirm\(|\bprompt\(" src`.

## Verification

Run and paste output verbatim:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build` when the change touches routes or shared UI.

## Report

1. `git status --short` and one line per changed file.
2. Verbatim command output.
3. Compliance section.
4. Anything you could not verify at runtime.
