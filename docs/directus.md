---
title: Directus DAM
description: The Directus headless CMS serving as the shared Digital Asset Management backbone for the platform — deployed at dam.kevinryan.io from the upstream image, backed by Azure PostgreSQL and Blob Storage.
---

Directus is the platform's shared **Digital Asset Management (DAM)** system — an API-first, headless data platform with a visual admin UI, role-based access control, and file management out of the box. It serves at <a href="https://dam.kevinryan.io" target="_blank" rel="noopener noreferrer">dam.kevinryan.io</a> and acts as the operational backbone for the KRA content engine: the single source of truth for content assets (white papers, internal guides, business plans, research PDFs, podcast media, LinkedIn article drafts) that would otherwise get lost, duplicated, or forgotten.

The full build specification is [Spec 0019: Directus DAM](/specs/spec-0019-directus-dam/).

## Stack

| Technology | Version | Role |
|------------|---------|------|
| Directus | 11.17.2 (upstream image) | Headless CMS / DAM |
| Azure PostgreSQL Flexible Server | shared instance | `directus_db` database (shared `pgadmin` user with Umami and Grafana) |
| Azure Blob Storage | `kradirectusblob` / `directus-uploads` container | File/asset storage |
| External Secrets Operator | — | Syncs all credentials from Azure Key Vault |
| Traefik | — | TLS termination via IngressRoute |

## Deployment Reality

Everything runs in the `directus` namespace, managed by Flux from `k8s/directus/`:

- **Deployment** — 1 replica of the upstream `directus/directus:11.17.2` image (no Dockerfile, no build step — the shared CI deploy workflow auto-skips it, same as hq.kevinryan.io). Liveness and readiness probes are `httpGet /server/health` on port 8055.
- **Service** — port 80 → container port 8055.
- **IngressRoute** — Traefik `websecure` entrypoint, `Host(\`dam.kevinryan.io\`)`, TLS on.
- **ExternalSecret** — `directus-secrets`, refreshed hourly from the `azure-keyvault` ClusterSecretStore (see below).

## Secrets and Configuration

All credentials flow from Azure Key Vault via External Secrets Operator — nothing is committed (ADR-018). The ExternalSecret template renders the full environment:

| Group | Variables |
|-------|-----------|
| Database | `DB_CLIENT` (pg), `DB_HOST`, `DB_PORT`, `DB_DATABASE` (`directus_db`), `DB_USER`, `DB_PASSWORD` |
| App crypto | `KEY`, `SECRET` |
| Admin bootstrap | `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| File storage | `STORAGE_LOCATIONS` (azure), `STORAGE_AZURE_ACCOUNT_NAME`/`_KEY`, `STORAGE_AZURE_CONTAINER_NAME` (`directus-uploads`) |
| Public URL | `PUBLIC_URL` (`https://dam.kevinryan.io`) |

The backing Azure resources (the `directus_db` database, the Blob Storage account and container, the Key Vault secrets, the Cloudflare DNS record) are provisioned by Terraform per spec-0019 — the manifests only consume them.

## Relation to Other Services

- **Database sharing** — Directus uses the same Azure PostgreSQL Flexible Server as Umami (`umami_db`) and Grafana (`grafana_db`), each as a separate database on the shared instance.
- **Secrets** — same ESO + Key Vault pattern as every other service that needs credentials.
- **Not a site** — Directus is a shared platform service (like Umami and Grafana), not one of the seven sites; it has no `sites/<name>/` directory.
- **Multi-user** — RBAC enabled; the admin account is bootstrapped on first launch. No Redis — not needed for a single-digit-user DAM workload.

## Licensing

Directus is licensed under BSL 1.1. Organisations under $5M in total annual finances can self-host freely, including production and commercial use — KRA is well under this threshold, so no licence fee applies.
