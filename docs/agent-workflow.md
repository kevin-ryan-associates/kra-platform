---
title: Agent Workflow & Project Management
description: How AI coding agents work in this repository — the AGENTS.md contract, project skills, the Plane-based work-item lifecycle, and the .env.agents secret flow.
---

This repository is **agent-native**: it is designed so that AI coding agents can operate across application code, infrastructure, deployment manifests, and documentation with full context and minimal prompting. This guide documents the three pieces of that workflow — the agent contract, the procedural skills, and the project-management lifecycle — plus the secret flow that makes it safe in a public repo.

## AGENTS.md — the Agent Contract

`AGENTS.md` at the repository root is the authoritative contract every agent (and contributor) works under. It defines:

- **Project summary and stack** — the seven sites, their stacks, and which constraints apply where
- **Key constraints** — static export for static sites, the deliberate hq.kevinryan.io exception (upstream LibreChat image, overlay theming)
- **Build commands** — the pnpm workspace commands for install, dev, build, and lint per site
- **Available toolchain** — the locally installed CLI tools (rg, fd, jq, yq, yamllint, kubectl, flux, terraform, tflint, docker, gh) with the rule to prefer them over hand-rolled scripts, and the note that CI only guarantees Node.js 22 + pnpm
- **Documentation conventions** — e.g. never put `#` comments on the same line as a command in Markdown code blocks (line-yanking in the editor)
- **Prohibited patterns** — `any` without justification, custom CSS where Tailwind suffices, server components with runtime fetching, API routes/middleware/server actions, inline styles, index as React key
- **Pre-commit checklist** — build/lint/type checks, alt text, no unjustified dependencies, component size limits

Most of the checklist is **enforced automatically** by Husky + lint-staged at commit time (ESLint, TypeScript, markdownlint); the pre-push hook runs `pnpm build`.

## Agent Skills — `.pi/skills/`

Procedural knowledge lives as version-controlled skills alongside the code. Each is a plain `SKILL.md` readable by any agent or contributor:

| Skill | Purpose |
|-------|---------|
| `k3s-ssh-tunnel-and-deploy` | Open the kr-node1 SSH tunnel and run kubectl/flux against the cluster without hanging |
| `terraform-plan-safe` | Run terraform fmt/validate/plan with `-input=false` and the `.env.agents` → `TF_VAR_*` flow |
| `flux-onboard-site` | Onboard a new site into Flux CD with full dry-run validation |
| `librechat-hq-theme-patch` | Change hq.kevinryan.io theming or bump the LibreChat image digest safely (mandatory throwaway-pod guard test) |
| `plane-platform-development` | Interact with the kra-platform-development Plane project — the ticket lifecycle below |

Skills are **procedural companions** to AGENTS.md: where a skill and AGENTS.md disagree, AGENTS.md wins. When the steps in AGENTS.md change (e.g. the site-onboarding procedure, the secret flow, or the HQ overlay architecture), the corresponding skill must be updated in the same commit so they never drift.

## Project Management — Plane

Features and specifications are tracked in the **kra-platform-development** project in [Plane](https://app.plane.so/kevin-ryan-associates), accessed through the `plane` MCP server configured in the committed `.mcp.json` (remote Streamable HTTP, OAuth — tokens live in the OS keychain, never in this repo).

Every agent working in this repo follows the **ticket lifecycle**:

1. **Before starting** any feature work, check the project for a matching work item — it is the source of truth for scope and acceptance criteria.
2. **Reference the identifier** (`KRA-NN`) in branch names and commit messages.
3. **On start**, move the item to `In Progress` and comment the implementation plan (summary, approach, verification) *before* touching code.
4. **While working**, comment deviations and findings as they occur — root causes, discovered drift, constraints, follow-up work — not batched at the end.
5. **On completion**, move the item to `In Review` with the commit SHA / PR link and verification evidence.
6. **`Done` only on explicit human instruction** — never autonomously, even when CI, deploys, and verification all pass.

New work discovered along the way (bugs, feature ideas, spec gaps) is filed as work items rather than left in conversation.

### Linear history

The project migrated from Linear to Plane on 2026-09-23. All 11 Linear issues were migrated to Plane work items; each carries a backlink. **The Linear and Plane `KRA-NN` numbers do not correspond** — disambiguate any `kra-NN` reference by date: before 2026-09-23 means the Linear issue, after means the Plane work item. Linear remains the read-only historical record.

## Secret Flow — `.env.agents`

The repo is **public**, so secrets are never committed. `.env.agents` (gitignored — guaranteed by `.gitignore`, verified with `git check-ignore`) is the **single source of truth for every secret**. `.env.agents.example` is the committed template with placeholders only.

The split between the two Terraform inputs is rule-based, driven by Terraform's own `sensitive = true` flag:

- **`infra/terraform.tfvars`** (gitignored) — **non-secret config only**: location, VM size, admin username, ACR and Key Vault names, repo identity, the admin SSH public key, and the four Cloudflare zone IDs
- **`.env.agents`** — **every secret**: Azure service-principal credentials (`ARM_*`/`AZURE_*`), ACR access, `KUBECONFIG`, Cloudflare and Flux tokens, and one `TF_VAR_<name>` per sensitive Terraform variable

Terraform reads `TF_VAR_<name>` from the environment natively — no `tfvars` entry needed for secrets. Load before any tool run:

```bash
set -a
source .env.agents
set +a
```

### ADR-012 deviation

[ADR-012](/adr/adr-012-developer-secret-management/) mandates the 1Password CLI flow — `op run --env-file=.env.tpl` with secret *references* and no values on disk. The local `.env.agents` with real values is a **documented convenience deviation**, acceptable only because `.gitignore` guarantees it is never committed to the public repo. The ADR-012 flow remains available via the committed `.env.tpl` (op:// URIs).
