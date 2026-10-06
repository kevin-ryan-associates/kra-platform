---
title: "ADR-025: Adopt OpenTofu over Terraform (BUSL)"
---

**Status:** Accepted
**Date:** 2026-10-06
**Decision Makers:** Human + AI
**Prompted By:** HashiCorp relicensed Terraform under the Business Source License (BUSL) from v1.7 onward. The platform's open-source licensing stance (already reflected in the kevinryan.io /method marketing, which advertises OpenTofu as the platform's IaC choice) requires an MPL-2.0 toolchain. KRA-24.

## Context

ADR-008 selected Terraform (then MPL-2.0) as the IaC framework for `infra/`. Since then, HashiCorp switched Terraform to the BUSL, which is not open source (OSI-incompatible, source-available with production-use restrictions for competing tooling). The infrastructure code, state, providers, and workflows all predate that relicensing.

The platform is otherwise fully open source: tflint (MPL-2.0), Kubernetes, Flux, Astro, Next.js, and the K3s stack. Terraform became the single non-open-licensed dependency in the toolchain.

## Decision Drivers

- The platform is a public repo that markets open, AI-native engineering practices; a BUSL-licensed core tool contradicts that stance.
- OpenTofu (Linux Foundation, MPL-2.0) is a drop-in fork of Terraform 1.5.7+: same CLI surface, same HCL language, same provider ecosystem, same `TF_VAR_*` env convention, same azurerm state backend.
- Migration risk must be near-zero: live production infrastructure on Azure, gated applies.

## Options Considered

### Option A: Stay on Terraform (BUSL)

No migration work, but keeps a non-open-source license at the center of the IaC toolchain and accepts HashiCorp's licensing direction.

### Option B: OpenTofu, full swap in one pass

One change swaps the CLI locally, the CI workflow, the docs, and the skills. No state migration needed (same state file, same backend, same lock-file format). tflint is unaffected (MPL-2.0, CLI-agnostic).

### Option C: OpenTofu, staged rollout

Local-first trial, then CI in a second pass. Two rounds of change and a dual-tool drift window, for no additional safety over a verified one-pass swap (the parity plan proves equivalence before anything merges).

## Decision

Adopt **OpenTofu** as the sole IaC CLI, migrating in one pass (Option B):

- Local CLI: `tofu` (v1.13.1) replaces `terraform`.
- CI: `.github/workflows/terraform.yml` becomes `opentofu.yml`, using SHA-pinned `opentofu/setup-opentofu@v2.0.2` with `tofu_version: 1.13.1` pinned to match the local CLI (eliminating the prior CI/local version-lock workaround for decoding plan artifacts).
- No state or backend migration: the azurerm remote state and `.terraform.lock.hcl` carry over unchanged.
- tflint remains the linter (MPL-2.0, works identically against OpenTofu configs).

Verification gate before merge: a local `tofu plan` must produce the same plan as `terraform plan` — verified: both show `0 to add, 1 to change (pre-existing, unrelated), 0 to destroy`.

ADR-008's core decision (single IaC framework, declarative Azure + Cloudflare management) stands unchanged; only the CLI choice is superseded by this ADR.

## Consequences

### Positive

- The entire IaC toolchain is MPL-2.0 open source (OpenTofu + tflint).
- CI and local CLI versions are pinned to the same tofu version, so CI plan artifacts decode locally without downloading a matching binary.
- No state migration, no provider changes beyond constraint re-resolution, no downtime.

### Negative

- `.terraform.lock.hcl` re-keys providers from `registry.terraform.io/*` to `registry.opentofu.org/*` and re-resolves versions within existing constraints on the first `tofu init` (accepted; see Agent Decisions).
- Terraform and OpenTofu cannot alternate on the same working directory without `init -reconfigure` (each records its own backend hash) — irrelevant now that `tofu` is the only CLI.
- `docs/terraform.md` moves to `docs/opentofu.md`, so the old `/terraform/` docs URL 404s (static docs site, no redirect layer; acceptable).

### Risks

- OpenTofu registry mirrors could lag registry.terraform.io for brand-new provider releases — mitigation: constraint re-resolution already landed the same latest versions; CI pins via lock file.
- Fork divergence in future OpenTofu-specific features could break Terraform compatibility — irrelevant; Terraform is no longer used.

## Agent Decisions

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| Accept the lock-file provider re-resolution (azurerm 4.62→4.81.0, azuread 3.8→3.10.0, cloudflare 4.52.5→4.52.9, random 3.8.1→3.9.1) rather than pinning back to the terraform-era versions | All within the declared `~> 4.0`/`~> 3.0` constraints; the parity plan ran against the new versions and showed zero new drift | Yes |
| Pin `tofu_version: 1.13.1` in CI to match local | Removes the CI/local version-lock pitfall (CI terraform 1.16.4 vs local 1.15.8 previously required downloading a matching binary to decode plan artifacts) | Yes |
| Leave kevinryan.io marketing copy mentioning Terraform (historical client work, the 2023 BUSL story) untouched | Historical facts and industry terms, not platform toolchain references; MethodStack already advertises OpenTofu | Review |
| Rename `plan-terraform-safely` skill to `plan-opentofu-safely` and update its pitfalls (incl. the stale "CI passes no TF_VAR_*" claim) | Docs-first, same-commit rule; the stale claim predated the TF_VAR_* secret wiring in CI | Yes |

## References

- [ADR-008: Infrastructure-as-Code with Terraform](adr-008-iac-with-terraform.md) — original IaC decision (tooling choice superseded by this ADR)
- [KRA-24 — Migrate Terraform to OpenTofu](https://app.plane.so/kevin-ryan-associates) — work item with verification evidence
- [OpenTofu](https://opentofu.org) — MPL-2.0, Linux Foundation
- [opentofu/setup-opentofu](https://github.com/opentofu/setup-opentofu) — GitHub Action (pinned v2.0.2)
