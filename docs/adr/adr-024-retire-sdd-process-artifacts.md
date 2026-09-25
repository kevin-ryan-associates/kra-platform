---
title: "ADR-024: Retire the SDD Process and Artifacts"
draft: false
---

**Status:** Accepted
**Date:** 2026-09-25
**Decision Makers:** Human, Agent
**Prompted By:** The Spec-Driven Development (SDD) methodology is retired as the platform's working process. ADR-022 already retired the sddbook.com and specmcp.ai sites; the SDD artifacts themselves (`.sdd/` specifications, scenarios, provenance), the docs-site surfaces that published them, and every active reference to the process across the repo now have to go too.

## Context

The platform previously ran an SDD workflow: specifications and provenance records were authored in `.sdd/` at the repo root, pulled into the docs site through `docs/specs` and `docs/provenance` symlinks, published under an "SDD" sidebar group on docs.kevinryan.io, and copied into the docs Docker build. When ADR-022 retired the sddbook.com / specmcp.ai properties, the internal process artifacts remained. The methodology is now retired entirely: Plane work items (per the agent workflow guide) are the single source of truth for scope and acceptance criteria.

## Decision Drivers

- **Retired methodology.** The SDD process is no longer how work is specified or tracked. Keeping its artifacts published as if current misrepresents the platform's practice.
- **Single source of truth.** Feature and spec work is tracked in the kra-platform-development project in Plane; redundant specification/provenance surfaces drift and confuse.
- **Complete, consistent removal.** Following ADR-022's precedent: no orphaned references may survive in CI, Docker builds, docs, or instruction files. Historical ADR bodies are the only permitted remainder — ADRs are append-only decision-time records.

## Options Considered

### Option A: Keep `.sdd/` in the repo but unpublish it

Retains history but keeps 45 stale files (~552K) and active build plumbing (Docker `COPY .sdd/`, symlink-replacement step) for content that will never be updated again. Rejected — dead weight with a live maintenance surface.

### Option B: Archive `.sdd/` content into Git history only (delete from the working tree)

Git history already preserves every removed file. An in-repo archive copy would duplicate that. Rejected as unnecessary duplication.

### Option C: Remove all SDD artifacts and active references, record the retirement in a new ADR

Chosen. Deletes `.sdd/` (recoverable from history if ever needed), removes the docs-site sidebar sections and symlinks, cleans the docs Dockerfile, updates cross-references in guides and instruction files (AGENTS.md, agent workflow guide), and records the process retirement here. Historical ADRs (ADR-005 through ADR-022) that mention SDD as decision-time context are left untouched, per the append-only policy ADR-022 applied.

## Decision

1. **Delete the artifacts** — the `.sdd/` directory at the repo root (specification/, scenarios/, provenance/ — 45 files) and the `docs/specs` and `docs/provenance` symlinks.
2. **Remove the docs-site surfaces** — the "SDD" sidebar group (Specifications, Provenance autogenerate entries) from `sites/docs-kevinryan-io/astro.config.mjs`.
3. **Clean the docs Docker build** — drop the `COPY .sdd/` step; the remaining `cp -rL` step still resolves the `src/content/docs` → `docs/` symlink.
4. **Update cross-references** — `docs/index.md`, `docs/sites/docs-kevinryan-io.md`, `docs/docker-builds.md`, `docs/directus.md`, `AGENTS.md`, `docs/agent-workflow.md` no longer reference SDD, `.sdd/`, `specs/`, `provenance/`, or "spec-driven" work; instruction files use work-item-driven phrasing (Plane is the source of truth).
5. **Portfolio assessment content** — references to SDD as an industry methodology in the kevinryan.io AI Capabilities Assessment are handled separately by the repo owner (decision point D in the work item); this ADR covers the internal process retirement.

## Consequences

- **Positive:** No stale methodology surfaces; docs site and build pipeline shrink to what is actually maintained; Plane work items are unambiguously the source of truth; repo loses ~552K of retired artifacts.
- **Negative:** Historical specifications and provenance are no longer browsable on docs.kevinryan.io; they remain accessible via Git history.
- **Neutral:** Historical ADR bodies (ADR-005, 006, 008, 009, 013, 014, 015, 020, 022) still mention SDD as decision-time context — intentional, per the append-only ADR policy.
