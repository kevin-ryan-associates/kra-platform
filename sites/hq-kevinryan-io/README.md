# hq.kevinryan.io — LibreChat (upstream image + theme overlay)

This site is **not a source package**. It deploys the upstream, pre-built
LibreChat image directly (digest-pinned, never `:latest`) — there is no
build step, no Next.js source, and no Dockerfile. The repo holds
configuration reference files, the **theme overlay source** (CSS + favicons),
and the Kubernetes manifests under `k8s/hq-kevinryan-io/`.

> **Before changing theming/branding or the LibreChat image**, read the
> `.pi/skills/patch-librechat-theme/SKILL.md` procedure. The overlay is
> sed-patched onto the upstream `index.html` and guarded — image bumps
> require the throwaway-pod guard test.

## What lives here

| File | Purpose |
|---|---|
| `custom-theme.css` | **Theme source of truth** (Tokyo Night Moon overrides). The ConfigMap is generated from it by `scripts/sync-hq-theme.sh`. |
| `logo.svg` | Transparent 1×1 SVG overlaid on LibreChat's login logo (ConfigMap source). |
| `favicons/` | kevinryan.io favicons (embedded in the `librechat-custom` ConfigMap, mounted over the LibreChat defaults). |
| `librechat.env.example` | Template of the LibreChat env vars for the vanilla subset (copy to `.env` for local dev). |
| `docker-compose.yml` | Local `docker compose up` reference (api + mongodb only). |
| `README.md` | This file. |

## What lives in `k8s/hq-kevinryan-io/`

- `deployment.yaml` — LibreChat api Deployment (image digest-pinned to
  `registry.librechat.ai/danny-avila/librechat@sha256:…`). Includes the
  `patch-index` initContainer that seds `index.html` (theme stylesheet link
  with `?v=` cache-buster, HQ title, dark-mode forcing) and fails loudly
  via post-patch guards if upstream drifted.
- `configmap-custom-theme.yaml` — the `librechat-custom` ConfigMap:
  **generated** by `scripts/sync-hq-theme.sh` from
  `sites/hq-kevinryan-io/` (`custom-theme.css`, `logo.svg`, favicons) —
  never edit by hand. Mounted over `/app/client/dist/`. The same script
  derives the `?v=<sha256-8>` cache-buster in `deployment.yaml`; CI
  (`.github/workflows/validate.yml`) fails on drift.
- `mongodb-statefulset.yaml` + `mongodb-service.yaml` — internal MongoDB
  (unauthenticated for the vanilla install).
- `configmap.yaml` — non-secret env (`DOMAIN_*`, `MONGO_URI`, `SEARCH=false`,
  `ALLOW_*`).
- `externalsecret.yaml` — `librechat-secrets` Secret materialized from Azure
  Key Vault (`JWT_SECRET`, `CREDS_KEY`, `CREDS_IV`, `ANTHROPIC_API_KEY`).
- `pvc-*.yaml` — three RWO PVCs for `/app/data`, `/app/uploads`,
  `/app/client/public/images`.
- `service.yaml`, `ingress.yaml`, `namespace.yaml`, `kustomization.yaml`.

## Why no Dockerfile / CI build?

LibreChat ships a published image on `registry.librechat.ai`. The shared
`.github/workflows/deploy.yml` `detect` job only builds sites that have both a
`Dockerfile` and a `k8s/<site>/deployment.yaml`; because this site has no
Dockerfile, it is automatically skipped. Manifest changes deploy via Flux on
push to `main`.

## Local development

```bash
# Copy the env template and fill in the secrets:
cp librechat.env.example .env
#   JWT_SECRET    = openssl rand -hex 32
#   CREDS_KEY     = openssl rand -hex 32   # must be 32 bytes
#   CREDS_IV      = openssl rand -hex 16   # 16 bytes
#   ANTHROPIC_API_KEY = <your key>

docker compose up
```

Open <http://localhost:3080>.

## First-run secrets (cluster)

Before the first rollout, create these three Azure Key Vault secrets (random
values, not provider-managed):

```bash
az keyvault secret set --vault-name <vault> --name librechat-jwt-secret --value "$(openssl rand -hex 32)"
az keyvault secret set --vault-name <vault> --name librechat-creds-key    --value "$(openssl rand -hex 32)"
az keyvault secret set --vault-name <vault> --name librechat-creds-iv    --value "$(openssl rand -hex 16)"
```

`ANTHROPIC_API_KEY` is reused from the existing `anthropic-api-key` Key Vault
secret.

## Out of scope for the initial install

Meilisearch search, RAG API, admin panel, social/OIDC/SAML login,
`librechat.yaml` presets, MCP/agents, ACR image mirroring, MongoDB
authentication, and Auth0-as-OIDC-IdP wiring are deferred to later
customization passes. (Custom branding/theming **is** now in scope — see the
theme overlay above.)
