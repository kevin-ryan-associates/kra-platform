---
name: develop-work-item
description: End-to-end development of a Plane work item in kra-platform — intake,
  implementation, PR, CI, deploy, live verification, and In Review. Use whenever a
  task means implementing a KRA-NN item through to a deployed, verified change, or
  when coordinating code change, deploy, and ticket lifecycle in one pass.
version: 1.1
created: "2026-09-25"
updated: "2026-09-25"
---

# Work-Item Development (End to End)

## When to Use

- Implementing a Plane work item (`KRA-NN`) end to end in this repo: ticket →
  code → PR → CI → deploy → verified live change → In Review.
- Any task that spans a code change, its deployment, and the ticket lifecycle.

This is the **orchestrating workflow** — it does not duplicate the specialist
skills; load them when a step enters their domain:

- `manage-plane-workitems` — Plane MCP mechanics + the mandatory Ticket
  Lifecycle protocol (state transitions, plan/deviation comments, Done rules).
- `access-k3s-cluster` — cluster access, Flux reconciliation, deploy checks.
- `plan-terraform-safely` — any `infra/` change.
- `patch-librechat-theme` — any hq.kevinryan.io change.
- `onboard-flux-site` — adding a new site.

## Procedure

### 1. Intake

- Before starting feature work, check the kra-platform-development project for
  a matching work item (the work item is the source of truth for scope and
  acceptance criteria). If none exists, file one — **with a story point
  estimate** (mandatory — see `manage-plane-workitems` Constants).
- **Always work within the scope of the current iteration** — every work
  item created in Plane MUST be added to the current cycle ("Iteration N")
  at creation time. Never file a work item outside an iteration.
- **If no current iteration exists, create one before filing the item**:
  name it "Iteration N" in numerical order from the last existing iteration
  (`plane_cycle` `list` → highest N → create "Iteration N+1"). Iterations are
  7 days long, Monday of the current week → Sunday (`start_date` = the
  Monday of this week, `end_date` = the following Sunday), so mid-week
  creation still anchors to this week's Monday.
- Add the item to the iteration with `plane_cycle` `manage_workitems`
  `add_ids`, then verify membership with `plane_cycle` `list_workitems`
  (work item reads show `cycle_id: null` even for cycle members — cycle
  tool quirks are in the `manage-plane-workitems` skill).
- **Filing a ticket is not authorization to implement** — start implementation
  only when the user explicitly says so (user correction, 2026-09-25).
- Read the item with `retrieve_by_identifier` before working it.

### 2. Start (Ticket Lifecycle — mandatory)

- Feature branch named `kra-NN` (or a scope name for multi-item batches).
  Never commit work-item changes directly to `main` unless the user explicitly
  instructs otherwise for that change.
- Move the item to **In Progress** and post the implementation plan as a
  comment (summary, files/approach, verification steps) **before any code
  change**. The posted plan is what reviewers diff against.
- Comment deviations and learnings on the item **as they occur** — never
  batched into one end-of-task comment.

### 3. Implement (docs-first)

- **Docs-first**: AGENTS.md and the relevant skills are updated **in the same
  commit** as the implementation change — documentation lands with the change,
  never "later".
- Follow AGENTS.md conventions (static export compatibility, one component
  per file under 200 lines, no `any`, Tailwind over custom CSS, alt text).
- Living docs only (AGENTS.md, README.md, `docs/`) — never edit ADRs; they are
  immutable decision-time records (amendments go through the ADR process).
- There is no root `pnpm lint` — lint per site: `pnpm --filter <site> lint`.

### 4. Commit / PR

- Reference `kra-NN` in branch and commit messages. Merges use merge commits.
- Default flow is branch + PR. Exception: skills-only updates (`.pi/skills/`,
  not tied to a work item) may go straight to `origin/main` (precedents
  `3aaa777`, `5aa7cf3`).
- Tag a semver baseline before major feature work (e.g. `v1.0.0` before
  shipping a feature as `v1.1.0`).
- Husky enforces lint-staged at commit (ESLint, tsc, markdownlint — lines
  ≤ 600 chars). The pre-push hook runs the full site build (`pnpm --filter
  './sites/*' --if-present build`, ~25-30s) + `tflint --recursive` — both must
  pass.
- `gh pr merge` can fail locally on a dirty working tree while the remote
  merge still succeeds — verify with `gh pr view --json state`; stash
  pre-existing changes first, then fast-forward local `main`.
- `deploy.yml` auto-commits image-tag updates to `main` after deploys — a
  push right after may be non-fast-forward; rebase and push again.

### 5. Deploy — never stop after push

After the merge lands on `main`, the job is not done until the change is live:

1. Watch GitHub Actions CI to completion (`gh run watch` / `gh run list`).
2. Watch Flux reconciliation on the cluster until the new image is serving
   (`access-k3s-cluster` skill — tunnel first, `--request-timeout=30s`).
3. Purge the Cloudflare cache for the affected site — a stale page right
   after a successful deploy is **Cloudflare edge cache** (`cf-cache-status:
   HIT`), NOT a Flux failure. `purge_everything` via the Cloudflare API with
   `CLOUDFLARE_API_TOKEN` from `.env.agents` (KRA-17 tracks automating this).
4. Report when the site is live.

### 6. Verify

- When a deployment problem persists after code changes, probe live cluster
  state directly before proposing more code — `gh`, `kubectl`, and SSH access
  are available. Problem-solve, don't guess.
- UI/CSS changes (LibreChat and any visible UI) require **actual visual
  verification** — a screenshot or user confirmation — not just "deployed,
  pod healthy, Cloudflare purged".

### 7. Close (Ticket Lifecycle)

- Once committed/pushed: move the item to **In Review** and comment with the
  commit SHA / PR link + verification evidence.
- **Done only when a human explicitly instructs it** — never autonomously,
  even when CI, deploys, and verification all pass.

## Pitfalls

- Starting implementation when the user only asked to file a ticket.
- Stopping after `git push` — the deploy sequence (CI → Flux → Cloudflare
  purge → report) is part of the work.
- Treating a Cloudflare edge-cache HIT as a deploy failure and "fixing" code
  that already deployed correctly.
- Declaring a UI change verified from pod health alone.
- Batching deviation/learning comments at the end instead of as they occur.
- **Batch flow** (only when the user explicitly directs a series of tickets):
  ONE shared branch for the batch, one commit per ticket (`kra-NN` prefix),
  push after each, each ticket → In Review with evidence, **STOP and ask
  between tickets** ("proceed" = go ahead), ONE PR for the branch at the end.
  Single-ticket default: pick one small low-risk item and run the full
  visible lifecycle.

## Verification

- Item shows In Progress + a plan comment before the first code edit.
- Pre-push hook passed (full site build + tflint); PR green.
- CI completed, Flux reconciled, Cloudflare purged, live site verified —
  visually for UI changes.
- Item is In Review with commit SHA / PR link + evidence; Done only on
  explicit human instruction.
