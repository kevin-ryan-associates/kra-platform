---
name: librechat-hq-theme-patch
description: Change hq.kevinryan.io LibreChat theming/branding (custom-theme.css, index.html patches, favicons) or upgrade the pinned LibreChat image digest safely. Use for any hq visual change, an image digest bump, or debugging a failed patch-index initContainer.
---

# LibreChat HQ Theme Overlay

## When to Use

- Any visual/branding change to hq.kevinryan.io (theme colors, login page,
  favicons, title, hiding LibreChat branding).
- Upgrading the pinned upstream LibreChat image digest.
- Debugging a stuck `Init:Error` / `CrashLoopBackOff` `patch-index`
  initContainer (a guard fired — upstream drifted).

## Background

hq.kevinryan.io deploys the **upstream pre-built LibreChat image** — there is
no build step, no Dockerfile, no committed app source. All customization is
an **overlay layer** declared in `k8s/hq-kevinryan-io/deployment.yaml`:

- **`patch-index` initContainer**: copies the image's
  `/app/client/dist/index.html` **and** `/app/client/dist/assets/` into an
  `emptyDir`, then `sed`s in the customization: stylesheet `<link>` with a
  `?v=<sha256-8>` cache-buster, `HQ - Kevin Ryan & Associates` title, Tokyo
  Night Moon loading-screen colors, `theme-color` meta, a dark-mode-forcing
  `<script>`, and — in the copied JS bundle — the en-locale login heading
  `com_auth_welcome_back` "Welcome back" → "HQ" (real DOM text, so screen
  readers announce "HQ"; locales are compiled into the bundle, there are
  no runtime i18n files to mount). It then rewrites the asset URLs in
  `index.html` to `?v=<sha256-8 of the patched bundle>` — the service worker
  precaches the app JS by its query-less URL, so the `?v=` is what delivers
  the patched bundle to browsers with a warm SW cache. The patched copies
  are mounted over `/app/client/dist/`. **Post-patch guards** then grep for
  each expected post-condition and `exit 1` with a
  `FATAL:` message if any sed no-opped, so upstream drift fails the rollout
  loudly instead of silently deploying an unthemed site.
- **`librechat-custom` ConfigMap** (`k8s/hq-kevinryan-io/configmap-custom-theme.yaml`):
  `custom-theme.css` (Tokyo Night Moon variable overrides + compiled
  Tailwind utility overrides), a transparent `logo.svg`, and kevinryan.io
  favicons — all mounted file-by-file over `/app/client/dist/`.
- **Image is digest-pinned** (`@sha256:c5db3331…`) in BOTH the initContainer
  and the container, `imagePullPolicy: IfNotPresent`. Never `:latest` — an
  unpinned pull can silently break the sed layer.

The `librechat-custom` ConfigMap (`k8s/hq-kevinryan-io/configmap-custom-theme.yaml`)
is **generated** from sources by `scripts/sync-hq-theme.sh` — never edit it
by hand. Sources (all under `sites/hq-kevinryan-io/`): `custom-theme.css`
(Tokyo Night Moon variable overrides + compiled Tailwind utility overrides),
`logo.svg` (transparent login-logo overlay), and `favicons/` (kevinryan.io
favicons). The script also derives the `?v=<sha256-8>` cache-buster in
`deployment.yaml` from the CSS content — the service worker cache is busted
if, and only if, the CSS actually changed. CI
(`.github/workflows/validate.yml`) runs `scripts/sync-hq-theme.sh --check`
and fails on drift.

## Procedure

### Changing the theme CSS

1. Edit the sources in `sites/hq-kevinryan-io/` (`custom-theme.css`,
   `logo.svg`, `favicons/`). Never edit the generated ConfigMap or the
   `?v=` value by hand.
2. Run `scripts/sync-hq-theme.sh` — it regenerates
   `k8s/hq-kevinryan-io/configmap-custom-theme.yaml` and rewrites the
   `?v=<sha256-8>` cache-buster in `deployment.yaml`.
3. Validate: `yamllint -s k8s/hq-kevinryan-io/` and
   `kubectl apply --dry-run=client --validate=false -f k8s/hq-kevinryan-io/`
   (tunnel must be up — see the `k3s-ssh-tunnel-and-deploy` skill).
4. Review the generated diff, commit (`[hq] …`) and push to `main`; Flux
   deploys. CI re-runs `--check` and fails if anything drifted.

### Upgrading the LibreChat image

1. Get the new digest:
   `docker manifest inspect registry.librechat.ai/danny-avila/librechat:<tag>`
   (or read `imageID` from a temp pod).
2. **Guard-test the new image before touching manifests** — run the full
   patch script (seds + guards, copied verbatim from the `patch-index`
   initContainer) against the pristine `index.html` at the new digest in a
   throwaway pod:

   ```sh
   kubectl -n hq-kevinryan-io run hq-patchtest --rm -i --restart=Never \
     --image=registry.librechat.ai/danny-avila/librechat@sha256:<NEW> \
     --command -- sh -c '<paste the patch-index script, patching a /tmp copy>'
   ```

3. If any guard fails, update the seds and guards for the new
   `index.html` shape first — do not just delete the guard.
4. Bump the digest in **both** `patch-index` and the `librechat` container in
   one commit.
5. Watch the rollout:
   `kubectl -n hq-kevinryan-io rollout status deploy/librechat`.

## Pitfalls

- **Never bump one digest without the other** — the initContainer and the
  container must run the same image or the patches target a different
  `index.html` than the app serves.
- **Never revert to `:latest`** — unpinned pulls can no-op the seds
  invisibly (that is the exact failure mode the guards exist to catch).
- **A fired guard is not a bug** — it means upstream changed
  `index.html`; update the seds/guards for the new shape, don't remove them.
- **Never hand-edit `configmap-custom-theme.yaml`** — it is generated by
  `scripts/sync-hq-theme.sh`; hand edits are lost on the next sync and fail
  the CI drift check.
- The `?v=` cache-buster is derived from the CSS content hash — hand-editing
  it, or changing the CSS without running the script, leaves stale CSS
  behind the service worker and fails CI.
- **The `?v=` rewrite on asset URLs in `index.html` is not optional** — the
  SW precaches the app JS by its query-less URL; without it, browsers with
  a warm SW cache keep serving the unpatched bundle ("Welcome back").
- **Precompressed `.br`/`.gz` siblings win over the patched `.js`** — the
  static server serves them when the client sends Accept-Encoding, so the
  patch also deletes them for the patched file. And after any bundle patch
  rollout, **purge the Cloudflare cache** — the edge has the stale
  compressed object cached (s-maxage 86400) for both the query-less and
  `?v=` URLs. Debug what browsers actually receive with
  `curl --compressed` — that is what the server (and the edge) prefer to
  serve.
- **Health probes are `httpGet /health`, not `tcpSocket`** — a tcpSocket
  probe passed at the socket level before the app could serve HTTP, causing
  restart loops. Probe definitions live in `k8s/hq-kevinryan-io/deployment.yaml`.
- **`agent_id is required` when sending a message = no available models** —
  the fix is the `ANTHROPIC_MODELS` env var (comma-separated live model IDs
  from the Anthropic `/v1/models` API), set in
  `k8s/hq-kevinryan-io/configmap.yaml`. Never configure models via
  `librechat.yaml` `endpoints.anthropic.models` — the object format is
  Vertex-only and Zod rejects it → CrashLoopBackOff. An empty Key Vault
  `anthropic-api-key` produces the same symptom — check both.
- **Tailwind utilities compile to LITERAL HEX, and `applyTheme()` sets
  `--surface-*` inline on `<html>` at mount** — `:root`/`.dark` variable
  overrides have NO effect on utility surfaces (`bg-gray-*`); semantic
  classes (`bg-surface-primary`) DO respond. Theme utility surfaces with
  `!important` selector overrides
  (`.dark .dark\:bg-gray-900{background-color:#222436 !important}`) — the
  mechanism the current `custom-theme.css` gray-ramp → Moon-surface mapping
  is built on.
- **When a CSS override appears to fail, check selector specificity FIRST —
  not caching.** Reliable canary: `border-radius:0` on the auth inputs +
  the Continue button.
- **Wait for `kubectl rollout status` before verifying through the edge** —
  probing a freshly-busted `?v=<new>` URL during the Flux reconcile window
  makes Cloudflare cache the stale origin response under the NEW URL:
  `?v=` busts the browser cache, not the edge. If already cached stale, a
  manual zone purge is required.
- Non-English locales still carry upstream strings — only the en locale is
  patched (compiled bundles, solo English user). Guard-test catches wording
  changes on image bumps.
- `kubectl`/`flux` hang without the kr-node1 SSH tunnel (see
  `k3s-ssh-tunnel-and-deploy`); always use `--request-timeout=30s`.

## Verification

- Throwaway-pod guard test: all 9 guards PASS against the target digest.
- `kubectl -n hq-kevinryan-io get pod -l app=librechat` → `1/1 Running`,
  init `patch-index` state `Completed`.
- `curl -s https://hq.kevinryan.io/` shows: `<title>HQ - Kevin Ryan &
  Associates</title>`, `classList.add("dark")`, `content="#222436"`, the
  current `custom-theme.css?v=<sha256-8>`, and `/assets/*.js?v=<hash>`
  URLs.
- The served main bundle contains the patched string (after a Cloudflare
  cache purge):
  `curl -s --compressed https://hq.kevinryan.io/assets/index.*.js | grep -o
  'com_auth_welcome_back:.HQ.'` → `com_auth_welcome_back:`HQ``.
- `scripts/sync-hq-theme.sh --check` reports "hq theme in sync".
