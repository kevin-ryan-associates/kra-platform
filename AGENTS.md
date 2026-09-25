# Agent Rules

## Project Summary

This is a monorepo hosting multiple sites for Kevin Ryan (AI-Native Engineering Consultant), plus shared platform infrastructure (Terraform, K3s manifests, Flux CD GitOps). All sites deploy to a K3s cluster on Azure behind Cloudflare.

### Sites

- **kevinryan.io** — portfolio site. Next.js 16 (App Router, static export), React 19, Tailwind CSS 4. Marketing sections plus the AI Capabilities Assessment.
- **brand.kevinryan.io** — static HTML brand guidelines site (no build step, no Node.js tooling).
- **docs.kevinryan.io** — platform documentation site. Astro Starlight, serves the ADRs and infrastructure guides.
- **hq.kevinryan.io** — LibreChat (upstream pre-built image + customization overlay). Deploys the upstream multi-container image (digest-pinned in `k8s/hq-kevinryan-io/deployment.yaml`, never `:latest`) plus an internal MongoDB, behind the existing `hq.kevinryan.io` IngressRoute. No build step, no Next.js source, no Dockerfile. Theming/branding (Tokyo Night Moon CSS, HQ title, favicons) is applied as an **overlay layer** — a `patch-index` initContainer that seds `index.html` (with fail-loud post-patch guards) and a `librechat-custom` ConfigMap mounted over `/app/client/dist/`.
  See the `librechat-hq-theme-patch` skill before touching any of it.
  Native email/password auth (Auth0 was dropped); Claude endpoint enabled via the bundled `ANTHROPIC_API_KEY`.
- **aiimmigrants.com** — static HTML holding page for the *AI Immigrants* book (no build step, no Node.js tooling).
- **distributedequity.org** — static HTML site for the Distributed Equity License (no build step, no Node.js tooling).
- **ai-native-engineer.io** — the *AI-Native Engineer* book. Astro 5 (plain, no Starlight) generating per-chapter pages from markdown content collections, served as a static export. Custom layout consumes the locked `design-assets/theme.css` (Nord palette, Swiss grid) so the book design is matched exactly.

### Stack

- Next.js 16 (App Router) — kevinryan.io (static export) and hq.kevinryan.io (dynamic server)
- Astro Starlight — docs.kevinryan.io
- Astro (plain) — ai-native-engineer.io
- React 19 (kevinryan.io, hq.kevinryan.io)
- TypeScript (strict mode, kevinryan.io / docs-kevinryan.io / hq.kevinryan.io / ai-native-engineer.io)
- Tailwind CSS 4 — kevinryan.io
- pnpm workspace
- Static sites served by nginx on K3s via Flux CD GitOps

## Key Constraints

Applicable to all **static** sites (kevinryan.io, brand-kevinryan-io, aiimmigrants-com, distributedequity-org, docs-kevinryan-io):

- No server-side runtime dependencies
- All pages must be statically exportable (Next.js `output: 'export'` for kevinryan.io; Astro static build for docs-kevinryan.io)

Applicable to all TypeScript/React sites (kevinryan.io, hq.kevinryan-io, docs-kevinryan-io):

- No `any` type without justification
- No custom CSS when Tailwind suffices (kevinryan.io and hq.kevinryan.io)
- Maximum component size: 200 lines
- One component per file

**Exception — hq.kevinryan.io:** This site deploys LibreChat (a pre-built, server-side Node app + MongoDB) from the upstream image — there is no build step, no Dockerfile, and no committed app source. It is deliberately excluded from the static-export and zero-runtime constraints, and the shared CI deploy workflow auto-skips it (it filters to sites that have both a `Dockerfile` and a `k8s/<site>/deployment.yaml`). Manifest changes deploy via Flux on push to `main`.
It is **not vanilla**: all theming/branding is an overlay (sed-patched `index.html` + ConfigMap-mounted assets) layered on the unmodified upstream image. Any LibreChat image change must go through the `librechat-hq-theme-patch` skill's guard-test procedure — do not bump the image or edit the overlay without it.

## Build Commands

```bash
# Install all workspace dependencies
pnpm install
# Dev server for kevinryan.io at localhost:3000
pnpm dev:kevinryan-io
# Build all sites
pnpm build
# Build specific site
pnpm --filter kevinryan-io build
# Lint specific site
pnpm --filter kevinryan-io lint
```

## Available Toolchain

The following CLI tools are installed in the local environment and should be used when they improve developer or agent workflow. Prefer them over hand-rolled scripts or manual editing for validation, search, and formatting. Run `toolchain` to see the full declared manifest.

> **Scope:** These tools are available locally; the CI runner (`ubuntu-latest`) only guarantees Node.js 22 and pnpm. Do not introduce a dependency on any tool below inside a build script or GitHub Action without also installing it in CI.

### Build & package management

- **`pnpm`** — workspace installs, per-site builds, lint, type checking. The central command for this repo.

### Search & file inspection

- **`rg`** — fast recursive grep across TS/React, k8s, terraform, and workflows.
- **`fd`** — fast file find for locating components, specs, and manifests.
- **`jq`** — parse `package.json`, `tsconfig*.json`, k8s JSON, and GitHub Actions outputs.
- **`yq`** — read/transform the YAML in `k8s/**`, `.github/workflows/**`, and `docker-compose.yml` before editing by hand.
- **`yamllint`** — lint Kubernetes manifests and workflow files before committing; catches indentation and quoting bugs Flux would reject.

### Kubernetes & GitOps

- **`kubectl`** — validate manifests with `kubectl apply --dry-run=client -f k8s/<site>/`.
- **`flux`** — `flux build kustomization ./k8s/<site>` and `flux check`; required when onboarding a new site per the "Adding a new site" steps below.
- **`kubectx`** — switch clusters/contexts when verifying live deployments.

### Infrastructure (infra/)

- **`terraform`** — run `terraform fmt`, `terraform validate`, and (with appropriate creds) `terraform plan` for `infra/` changes.
- **`tflint`** — lint Terraform alongside `terraform validate`.

### Containers

- **`docker`** + **`docker compose`** — build and test site images locally (`sites/<site>/Dockerfile`, `docker-compose.yml`).
- **`colima`** — macOS Docker runtime; start it if Docker is not already running.

### Platform & CI

- **`gh`** — inspect workflow runs (`gh run list` / `gh run view`), manage PRs and branches for the builder-agent flow.
- **`git`** — core version control (agents normally use pi's wrappers).

### Code review

- **`delta`** — syntax-highlighted diff pager for reviewing changesets.
- **`hunk`** — review-first diff viewer for AI-authored changesets.

### Not needed here

`glab`, `az`, `cloudflared`, `wrangler`, `cloudflare-speed-cli`, `op`, `cmake`, and the interactive TUIs (`starship`, `htop`, `btop`, `bandwhich`, `dust`, `atuin`, `herdr`, `fzf`, `zoxide`, `eza`, `bat`, `glow`, `tree`, `lazygit`, `lazydocker`, `nvim`, `ghostty`, `MesloLGS NF`) are not relevant to agent workflow on this repo.

## Local credentials (`.env.agents` — single source of truth for secrets)

The repo is **public**, so secrets must never be committed. `.env.agents` (gitignored — confirmed via `git check-ignore .env.agents`) is the **single source of truth for every secret** in the project. `.gitignore` blocks every real-values env filename (`.env*` and `*.env`) and only allows the committed `.env.agents.example` template (placeholders) plus the ADR-012 `.env.tpl` (1Password `op://` references, not values).

The split between the two Terraform inputs is rule-based, driven by Terraform's own `sensitive = true` flag in `infra/variables.tf`:

- **`infra/terraform.tfvars`** (gitignored) holds **non-secret config only**: `location`, `vm_size`, `admin_username`, `acr_name`, `keyvault_name`, `github_repo_owner`, `github_repo_name`, `admin_ssh_public_key` (a public key), and the four `cloudflare_zone_id*` (public identifiers). The committed template is `infra/terraform.tfvars.example`.
- **`.env.agents`** holds **every secret**. Terraform consumes the secret variables via the `TF_VAR_<name>` convention (Terraform reads `TF_VAR_<name>` from the environment natively — no `tfvars` entry needed for them). CLI tools consume their own conventional env vars (`ARM_*`, `AZURE_*`, `CLOUDFLARE_API_TOKEN`, `KUBECONFIG`, …).

This eliminates the prior duplication where secrets were declared in both `terraform.tfvars` and `.env.agents`. Each secret now lives exactly once.

To populate `.env.agents`:

```bash
# One-time: copy the committed template and fill in real values
cp .env.agents.example .env.agents
# (edit .env.agents with real values; the file is gitignored)
```

Then load it before running any tool or Terraform:

```bash
# Load credentials into the current shell (set -a exports every var)
set -a
source .env.agents
set +a

# Authenticate the az CLI with the service principal (one-time per session)
az login --service-principal \
  --username "$ARM_CLIENT_ID" \
  --password  "$ARM_CLIENT_SECRET" \
  --tenant    "$ARM_TENANT_ID"

# Terraform reads TF_VAR_* secrets directly from the environment
# (terraform.tfvars supplies the non-secret config)
cd infra
terraform plan
```

Entries in `.env.agents`:

- **Azure service principal** (assumes the machine is not already authenticated via `az login`): `ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`, `ARM_TENANT_ID`, `ARM_SUBSCRIPTION_ID` (and matching `AZURE_*` aliases). Used by `terraform`, `tflint`, `az`, and `docker`→`az acr login`.
- **Azure Container Registry**: `ACR_NAME`, `ACR_LOGIN_SERVER` — for `docker build`/`push` to ACR.
- **Kubernetes**: `KUBECONFIG` points at `~/.kube/kr-k3s.yaml` (k3s cluster on Azure, `rg-kevinryan-io`). The kubeconfig's server is `127.0.0.1:6443`, so start an SSH tunnel once per session before using `kubectl`/`flux`/`k9s`/`kubectx`:

  ```bash
  ssh -fN -L 6443:127.0.0.1:6443 kr-node1
  ```

  (`kr-node1` is the k3s server VM, defined in `~/.ssh/config`.)
- **Tool credentials (non-`TF_VAR`)**: `CLOUDFLARE_API_TOKEN` (terraform Cloudflare provider + `wrangler`), `CLOUDFLARE_ACCOUNT_ID` (for `wrangler whoami` / account-scoped API), `FLUX_GITHUB_TOKEN`.
- **Terraform secrets** (`TF_VAR_<name>` for every `sensitive = true` variable in `infra/variables.tf`):
  - `TF_VAR_cloudflare_api_token`, `TF_VAR_github_token`
  - Auth0 (HQ app): `TF_VAR_auth0_secret`, `TF_VAR_auth0_client_id`, `TF_VAR_auth0_client_secret`, `TF_VAR_auth0_domain`, `TF_VAR_auth0_issuer_base_url`
  - HQ integrations: `TF_VAR_anthropic_api_key`

> **Deviation from ADR-012:** ADR-012 mandates 1Password CLI (`op run --env-file=.env.tpl -- <cmd>`) with secret *references* and no values on disk. A local `.env.agents` with real values is a convenience deviation for agent workflow. It is acceptable here **only** because `.gitignore` guarantees the file is never committed to this public repo. If you'd prefer the ADR-012 flow, use the committed `.env.tpl` (op:// URIs) and run `op run --env-file=.env.tpl -- <cmd>` instead of sourcing `.env.agents`.

## Directory Structure

```text
kevin-ryan-platform/
├── .github/workflows/      # CI/CD (shared)
├── infra/                  # Terraform (shared across all sites)
├── scripts/                # Helper scripts (sync-hq-theme.sh — regenerates the hq theme ConfigMap)
├── k8s/                    # Kubernetes manifests
│   ├── flux-system/        # Flux CD entry point (peer to site dirs)
│   │   ├── gotk-components.yaml
│   │   ├── gotk-sync.yaml
│   │   ├── kustomization.yaml
│   │   └── <site>-sync.yaml # One Kustomization per site + infra stack
│   ├── kevinryan-io/              # Plain manifests (static export)
│   ├── hq-kevinryan-io/           # Plain manifests (LibreChat + theme overlay)
│   ├── docs-kevinryan-io/         # Plain manifests (Astro static)
│   ├── brand-kevinryan-io/        # Plain manifests (static HTML)
│   ├── aiimmigrants-com/          # Plain manifests (static HTML)
│   ├── distributedequity-org/     # Plain manifests (static HTML)
│   ├── ai-native-engineer-io/     # Plain manifests (Astro static export)
│   ├── directus/                  # Headless CMS (shared)
│   ├── external-secrets/          # ESO controller ensemble
│   ├── external-secrets-store/    # ExternalSecret + SecretStore CRs
│   ├── observability/             # Grafana, Loki, VictoriaMetrics
│   └── umami/                     # Self-hosted analytics
├── sites/                  # Individual site packages
│   ├── kevinryan-io/       # kevinryan.io Next.js app (static export)
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # React components (one per file)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Shared utilities
│   │   ├── public/         # Static assets
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   ├── hq-kevinryan-io/    # hq.kevinryan.io — LibreChat (upstream image + theme overlay)
│   │   ├── custom-theme.css  # theme source of truth (sync script regenerates the ConfigMap)
│   │   ├── logo.svg          # transparent login-logo overlay (ConfigMap source)
│   │   ├── favicons/         # kevinryan.io favicons (in librechat-custom ConfigMap)
│   │   ├── librechat.env.example  # committed env template (secrets via ExternalSecret)
│   │   ├── docker-compose.yml     # local-dev reference (api + mongodb only)
│   │   └── README.md             # no build step, no Dockerfile, no source
│   ├── docs-kevinryan-io/  # docs.kevinryan.io — Astro Starlight
│   │   ├── src/            # Astro content (ADRs, site architecture guides)
│   │   ├── public/         # Static assets
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   ├── brand-kevinryan-io/ # brand.kevinryan.io — static HTML
│   │   ├── public/         # Static assets (index.html, SVGs, PNGs, PDFs)
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── docker-compose.yml
│   ├── aiimmigrants-com/   # aiimmigrants.com — static HTML
│   │   ├── public/         # Static assets (index.html)
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── docker-compose.yml
│   ├── distributedequity-org/ # distributedequity.org — static HTML
│   │   ├── public/
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── docker-compose.yml
│   └── ai-native-engineer-io/ # ai-native-engineer.io — Astro (markdown book)
│       ├── src/            # Astro app, content collections, layouts
│       │   ├── content/chapters/  # one markdown file per chapter
│       │   ├── components/  # Cover, ChapterReader, Gauge, TopRail, ...
│       │   ├── layouts/      # BookLayout (imports canonical theme.css)
│       │   ├── pages/        # index.astro (cover), [slug].astro, search-index.json.ts
│       │   └── styles/       # layout.css (page chrome on top of theme tokens)
│       ├── design-assets/   # locked theme source of truth (tokens.jsonc, theme.css, THEME-SPEC.md)
│       ├── public/          # favicon.svg
│       ├── Dockerfile
│       ├── nginx.conf
│       └── docker-compose.yml
└── pnpm-workspace.yaml
```

### Adding a new site

To onboard a new site into Flux CD:

1. Add plain Kubernetes manifests under `k8s/<site-name>/`.
2. Create `k8s/flux-system/<site-name>-sync.yaml` — a `Kustomization` CR pointing `spec.path` at `./k8s/<site-name>`.
3. Add `<site-name>-sync.yaml` to the `resources` list in `k8s/flux-system/kustomization.yaml`.

> **Note:** `brand-kevinryan-io`, `aiimmigrants-com`, and `distributedequity-org` are pure static HTML sites with no build step.
> TypeScript, Next.js, Astro, Tailwind, ESLint, and related conventions do **not** apply to them.
> The root `build` and `lint` scripts use `--if-present` to skip these packages automatically.

## Project Management (Plane)

Features and specifications for this workspace are tracked in the **kra-platform-development** project in Plane:

- Workspace: `kevin-ryan-associates` (`https://app.plane.so/kevin-ryan-associates`)
- Project: kra-platform-development — work item identifiers `KRA-NN`
- Project ID: `98a0fada-1048-499b-a869-64c422fd26bb`

Access is via the `plane` MCP server, configured in the committed `.mcp.json` (remote Streamable HTTP at `https://mcp.plane.so/http/mcp`, OAuth authentication — tokens live in the OS keychain, never in this repo). No secrets are committed.

> **History:** migrated from Linear to Plane on 2026-09-23. All 11 Linear issues were migrated to Plane work items — the 9 open ones plus the two completed pre-migration (Linear KRA-74/KRA-76 → Plane KRA-11/KRA-12, state Done). Each carries a backlink to its Linear original, and the Plane/Linear numbers do **not** correspond (e.g. Linear KRA-81 → Plane KRA-10).
> Linear (`https://linear.app/kevin-ryan-platform`) remains the read-only historical record. Disambiguate any `kra-NN` reference by date: before 2026-09-23 means the Linear issue, after means the Plane work item.

**Instructions for all agents working in this repo:**

1. Before starting any feature work, check the kra-platform-development project for a matching work item (via the `plane` MCP server — `plane_project` `list`, then `plane_workitem` `list` filtered by project). The work item is the source of truth for scope and acceptance criteria.
2. If a task has a corresponding work item, reference its identifier in commit messages and branch names (e.g. `kra-42`).
3. If you discover new work worth tracking (bugs, feature ideas, spec gaps), file it as a work item in the kra-platform-development project rather than only noting it in conversation.
4. When work on an item starts, move it to **In Progress** and comment on it with the implementation plan (summary, approach, verification steps) before making any code changes.
5. While working, comment on the item as deviations from the posted plan or important findings (root causes, discovered drift, constraints, follow-up work) come up — as they occur, not batched at the end.
6. When the change is complete and committed to GitHub, move the item to **In Review** and comment with the commit SHA / PR link and verification evidence.
7. Move an item to **Done** only when a human operator explicitly instructs it — never autonomously, even when CI, deploys, and verification all pass.

## Agent Skills

Project-scope agent skills live in `.pi/skills/` and are version-controlled alongside the code. They are **procedural companions to this file** — AGENTS.md remains the authoritative source; where a skill and this document disagree, AGENTS.md wins.

The `.pi/skills/` path is a Pi convention, but the `SKILL.md` files are plain Markdown and agent-agnostic — any agent or contributor can read them directly.

- `k3s-ssh-tunnel-and-deploy` — open the kr-node1 SSH tunnel and run `kubectl`/`flux` without hanging (non-interactive flags, explicit request timeouts).
- `terraform-plan-safe` — run `terraform fmt`/`validate`/`plan` against `infra/` with `-input=false` and the `.env.agents` → `TF_VAR_*` source-order flow.
- `flux-onboard-site` — the executable form of the "Adding a new site" steps above, with `kubectl --dry-run`/`yamllint`/`flux build` validation.
- `librechat-hq-theme-patch` — change hq.kevinryan.io theming/branding or upgrade the digest-pinned LibreChat image, with the mandatory throwaway-pod guard test before any image bump.
- `plane-platform-development` — the executable form of "Project Management (Plane)" above: find/file/update work items in the kra-platform-development project via the `plane` MCP server, including the mandatory ticket lifecycle (In Progress + plan comment on start, deviation/learnings comments as they occur, In Review on commit, Done only on human instruction).

When the steps in "Adding a new site" or "Local credentials" above change, update the corresponding skill in the same commit so they do not drift. The same applies to `librechat-hq-theme-patch` whenever the overlay architecture or the image-bump procedure changes.

## When Generating Code

1. Follow TypeScript strict mode conventions
2. Use Tailwind utilities for styling
3. Ensure static export compatibility
4. Include alt attributes on all images
5. Keep components under 200 lines

## Documentation Conventions

- In Markdown code blocks, never put `#` comments on the same line as a command. Place comments on their own line above the command.
- Rationale: yanking a line in AstroVim should grab only the command, not the trailing comment.

Example (correct):

```bash
# Build specific site
pnpm --filter kevinryan-io build
```

Example (prohibited):

```bash
pnpm --filter kevinryan-io build   # Build specific site
```

## Prohibited Patterns

- `any` type without inline justification comment
- `eslint-disable` without inline justification comment
- Custom CSS when Tailwind can achieve the same result
- Server components with runtime data fetching
- API routes, middleware, or server actions
- Inline styles (`style={{ }}`)
- Index as React key

## When Unclear

If a request conflicts with project constraints or specifications, flag the conflict rather than silently deviating. Ask for clarification.

## Pre-Commit Checklist

> **Note:** Husky + lint-staged enforces most of these checks automatically at commit time
> (ESLint, TypeScript type checking, markdownlint). The pre-push hook runs `pnpm build`.
> This checklist remains as a manual reference for anything the hooks don't catch.

Before suggesting code is complete:

- [ ] `pnpm build` would pass
- [ ] `pnpm lint` would pass
- [ ] No TypeScript errors
- [ ] All images have alt text
- [ ] No new dependencies without justification
- [ ] Components under 200 lines
