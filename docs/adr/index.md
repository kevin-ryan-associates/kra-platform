---
title: Architecture Decision Records
description: An index of Architecture Decision Records (ADRs) for the Kevin Ryan platform.
---

Architecture Decision Records (ADRs) document the key technical choices made in this platform, the context that drove them, and their consequences.

## What is an ADR?

An ADR is a short document that captures a significant architectural decision. Each ADR describes:

- **Status** — proposed, accepted, deprecated, or superseded
- **Context** — the situation that called for a decision
- **Decision** — what was decided
- **Consequences** — the trade-offs and outcomes

## Records

| ADR | Title | Status |
|-----|-------|--------|
| [001](./adr-001-containerize-with-nginx-alpine) | Containerize with nginx Alpine | Accepted |
| [002](./adr-002-private-images-via-ghcr) | Private Images via GHCR | Accepted |
| [003](./adr-003-self-host-umami-analytics) | Self-host Umami Analytics | Accepted |
| [004](./adr-004-ghcr-push-with-sha-tagging) | GHCR Push with SHA Tagging | Accepted |
| [005](./adr-005-k3s-azure-spot-cloudflare-cdn) | K3s on Azure Spot with Cloudflare CDN | Accepted |
| [006](./adr-006-observability-grafana-loki-promtail) | Observability with Grafana, Loki, Promtail | Accepted |
| [007](./adr-007-postgresql-azure-flexible-server) | PostgreSQL on Azure Flexible Server | Superseded |
| [008](./adr-008-iac-with-terraform) | Infrastructure as Code with Terraform | Accepted |
| [009](./adr-009-cicd-github-actions-flux) | CI/CD with GitHub Actions and Flux | Accepted |
| [010](./adr-010-acr-primary-retain-ghcr) | ACR Primary, Retain GHCR | Accepted |
| [011](./adr-011-git-hooks-husky-lint-staged) | Git Hooks with Husky and lint-staged | Accepted |
| [012](./adr-012-developer-secret-management) | Developer Secret Management | Accepted |
| [013](./adr-013-monorepo-pnpm-workspaces) | Monorepo with pnpm Workspaces | Accepted |
| [014](./adr-014-migrate-spot-to-ondemand-b2s) | Migrate Spot to On-demand B2s | Accepted |
| [015](./adr-015-origin-tls-cert-management) | Origin TLS Certificate Management | Accepted |
| [016](./adr-016-second-k3s-node-for-observability) | Second K3s Node for Observability | Accepted |
| [017](./adr-017-managed-postgresql-shared-database) | Managed PostgreSQL as Shared Database | Accepted |
| [018](./adr-018-secret-management-keyvault-eso) | Secret Management with Azure Key Vault and External Secrets Operator | Accepted |
| [019](./adr-019-victoria-metrics-lightweight-metrics) | Lightweight Metrics with Victoria Metrics | Accepted |
| [020](./adr-020-email-capture-formspree-static-landing-pages) | Email Capture via Formspree for Static Landing Pages | Accepted |
| [021](./adr-021-auth0-authentication-hq) | Auth0 for HQ Authentication | Superseded |
| [022](./adr-022-retire-sddbook-specmcp-sites) | Retire sddbook.com and specmcp.ai Sites | Accepted |
| [023](./adr-023-librechat-theme-overlay) | LibreChat Theming via Overlay on Upstream Image | Accepted |
| [024](./adr-024-retire-sdd-process-artifacts) | Retire the SDD Process and Artifacts | Accepted |
