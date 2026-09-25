---
name: onboard-flux-site
description: Onboard a new site into Flux CD GitOps in the kra-platform repo.
  Use when adding a new site under k8s/<site>/ — create the plain manifests,
  the flux-system sync Kustomization, and wire it into kustomization.yaml.
  Includes the mandatory kubectl/flux dry-run validation.
---

# Flux Onboard a New Site

## When to Use

- The user asks to add a new site to the platform.
- A new `k8s/<site>/` directory is being created.

## Background

Flux CD is the GitOps entry point (`k8s/flux-system/`). Each site gets:

- plain manifests under `k8s/<site>/` (typically `namespace.yaml`,
  `deployment.yaml`, `service.yaml`, `ingress.yaml`), and
- a `k8s/flux-system/<site>-sync.yaml` `Kustomization` CR pointing
  `spec.path` at `./k8s/<site>`, added to `kustomization.yaml`'s `resources`.

## Procedure

1. Create the site manifest directory and a minimal manifest set (match an
   existing static site like `k8s/ai-native-engineer-io/`):

   ```bash
   mkdir -p k8s/<site>
   # namespace.yaml, deployment.yaml, service.yaml, ingress.yaml
   ```

2. Create the Flux sync CR at `k8s/flux-system/<site>-sync.yaml`:

   ```yaml
   apiVersion: kustomize.toolkit.fluxcd.io/v1
   kind: Kustomization
   metadata:
     name: <site>
     namespace: flux-system
   spec:
     interval: 10m0s
     path: ./k8s/<site>
     prune: true
     sourceRef:
       kind: GitRepository
       name: flux-system
   ```

3. Append `<site>-sync.yaml` to the `resources` list in
   `k8s/flux-system/kustomization.yaml` (keep alphabetical-ish order with the
   existing entries).

4. Validate locally before committing:

   ```bash
   kubectl apply --dry-run=client -f k8s/<site>/
   yamllint -s k8s/<site>/*.yaml k8s/flux-system/<site>-sync.yaml
   flux build kustomization ./k8s/<site>
   ```

5. Commit and push to `main` (Flux reconciles within ~10m; or force a
   reconcile against the live cluster using the `access-k3s-cluster`
   skill).

## Pitfalls

- Forgetting step 3 — the sync CR exists but is never loaded, so Flux never
  reconciles the site. Always edit `kustomization.yaml`.
- `yamllint` catches indentation/quoting bugs Flux would silently reject; run
  it before committing.
- Static HTML sites (`brand-kevinryan-io`, `aiimmigrants-com`,
  `distributedequity-org`) have **no build step** — don't add Next.js/Astro/
  TypeScript tooling to them. The root `build`/`lint` scripts use `--if-present`
  to skip them automatically.
- The `flux build kustomization` command requires the cluster's GitRepository
  to be reachable for a full check; a dry-run `kubectl apply --dry-run=client`
  validates manifest syntax without the cluster.

## Verification

- `kubectl apply --dry-run=client -f k8s/<site>/` prints "created (dry run)"
  for each manifest with no errors.
- `yamllint -s` exits 0.
- `k8s/flux-system/kustomization.yaml` lists `<site>-sync.yaml` in `resources`.
- After push, `flux get kustomizations -n flux-system | grep <site>` shows the
  new CR reconciling (requires the SSH tunnel — see
  `access-k3s-cluster`).
