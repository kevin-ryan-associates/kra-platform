---
name: k3s-ssh-tunnel-and-deploy
description: Establish the kr-node1 SSH tunnel to the K3s API and run kubectl/flux
  against the kra-platform cluster without hanging the agent. Use before any
  kubectl, flux, kubectx, or k9s command, or when a deploy/inspect task targets
  the live cluster.
---

# K3s SSH Tunnel + Deploy

## When to Use

- Any task that runs `kubectl`, `flux`, `kubectx`, or `k9s` against the live
  K3s cluster on Azure.
- Verifying a deployment, reconciling Flux, or inspecting pods after a push.

## Background

The kubeconfig (`$KUBECONFIG` → `~/.kube/kr-k3s.yaml`) points at
`127.0.0.1:6443`. That only works while an SSH tunnel to the k3s server VM
(`kr-node1`, defined in `~/.ssh/config`) is up. **Without the tunnel, kubectl
and flux hang on connect** — a primary cause of agent freezes that force
`herdr server stop`.

## Procedure

1. Load secrets once per shell session (see the `terraform-plan-safe` skill for
   the full `.env.agents` flow — `KUBECONFIG` is set there):

   ```bash
   set -a && source .env.agents && set +a
   ```

2. Open the tunnel. **Always** use these flags — `-f` backgrounds, `BatchMode`
   prevents password-prompt hangs, `ConnectTimeout` fails fast:

   ```bash
   ssh -fN -o BatchMode=yes -o ConnectTimeout=10 -L 6443:127.0.0.1:6443 kr-node1
   ```

3. Verify the tunnel is alive before touching kubectl:

   ```bash
   nc -z -G 5 127.0.0.1 6443 && echo "tunnel up" || echo "tunnel DOWN"
   ```

4. Run kubectl with an explicit request timeout so a stalled API never blocks
   forever:

   ```bash
   kubectl --request-timeout=30s get pods -A
   flux check
   ```

## Pitfalls

- **Never** run `ssh ... kr-node1` without `-fN` in the bash tool — it
  foregrounds and hangs the agent. If you must keep it foregrounded for
  debugging, pass a `timeout` to the bash tool.
- **Never** run `kubectl`/`flux` without first confirming the tunnel — they
  will hang on connect with no default timeout.
- `BatchMode=yes` makes the SSH fail closed if keys aren't loaded; do not
  remove it to "debug" interactively from the agent.
- If `nc` reports DOWN, the SSH process may have died — `ps -ef | grep
  'ssh -fN.*6443'` and re-run step 2.
- **Node wedge under RAM pressure** (observed on the B2s 4GiB control plane,
  before the B2ms resize): Azure shows `PowerState=VM running` and private-IP
  ping works, but SSH fails with `banner exchange timeout` and the API on
  :6443 fails with `SSL connection timeout`. That is a userspace wedge, not a
  crash. Recovery: `az vm restart` (no tunnel needed) → SSH returns in ~3 min
  → scale the offending deployment to 0 → `flux suspend kustomization <name>
  -n flux-system` → fix the root cause (e.g. VM resize) → `flux resume`.
- **SSH port-22 timeouts from some networks** (NSG IP restriction) can hit
  while all sites serve fine. If the tunnel cannot be established, do NOT
  force a reconcile — every `k8s/flux-system/*-sync.yaml` uses
  `interval: 10m0s`, so Flux self-reconciles within ~10 minutes; verify
  via the live site instead.
- `flux build kustomization` connects to the live cluster by default; the
  offline form needs BOTH flags:
  `flux build kustomization --path <dir> --kustomization-file <cr.yaml>
  --dry-run --in-memory-build`. Pure client-side alternative:
  `kubectl kustomize <dir>` (no standalone `kustomize` binary installed).

## Verification

- `kubectl --request-timeout=30s get nodes` returns the node list within ~5s.
- `flux check` prints "All checks passed" (or reconciles cleanly).
- The agent pane stays responsive (no hang).
