---
title: Node Access — SSH, kubectl, k9s
description: How to reach the K3s nodes over SSH and run kubectl and k9s from your laptop through an SSH tunnel, including key rotation and updating the admin IP allowlist.
---

This runbook documents day-to-day operator access to the two-node K3s cluster running on Azure VMs (`vm-kevinryan-node1` = K3s server, `vm-kevinryan-node2` = K3s agent). It covers SSH, pulling the K3s kubeconfig to your laptop, bringing up an SSH tunnel to the Kubernetes API, and running `kubectl` and `k9s` locally without opening the API port to the internet.

## Why this setup

The Terraform in `infra/` already provisions the SSH plumbing — there is no bastion, VPN, or Tailscale:

- `infra/modules/compute/main.tf` injects an `admin_ssh_key` onto each VM (`admin_username` defaults to `azureuser`).
- `infra/modules/network/main.tf` has an `AllowSSH` NSG rule on port 22, source-scoped to `var.admin_ip` (a single CIDR you supply).
- Both nodes have **static public IPs** (Terraform outputs `node1_public_ip`, `node2_public_ip`).
- Port **6443 is not opened** in the NSG. The K3s API is reached from your laptop through an SSH tunnel to `127.0.0.1:6443` on node1, where the K3s serving certificate has a SAN for `127.0.0.1` — so TLS verifies without `--insecure-skip-tls-verify`.

This keeps the attack surface at one port (22) scoped to a single IP, with no new exposed ports and no extra infra.

## Prerequisites

- `terraform` authenticated to your Azure subscription (same context used for the original `apply`).
- `ssh`, `scp`, `ssh-keygen`.
- `kubectl` and `k9s` on your laptop (`brew install kubectl k9s`, or `brew install kubernetes-cli k9s`).
- A password manager to store the SSH key passphrase and the downloaded kubeconfig (it is a cluster-admin credential).

## 1. Generate an SSH keypair (first time, or rotation)

```bash
ssh-keygen -t ed25519 -C "kevinryan-io-admin" -f ~/.ssh/kr_admin_ed25519
```

Use a passphrase and record it. You will publish the **public** key (`~/.ssh/kr_admin_ed25519.pub`) through Terraform in the next step.

## 2. Update Terraform inputs (SSH key + admin IP allowlist)

Both the SSH public key and the IP allowlist are Terraform inputs, so updates go through `terraform apply` — no manual Azure clicks.

### 2.1 Find your current public IP

```bash
curl -s https://ifconfig.me
```

Append `/32` for the CIDR, e.g. `203.0.113.5/32`.

### 2.2 Update the Terraform inputs

The two inputs live in different files.

`admin_ssh_public_key` — in the gitignored `infra/terraform.tfvars` (live values; do not edit the committed `terraform.tfvars.example`):

```hcl
admin_ssh_public_key = "ssh-ed25519 AAAA... kevinryan-io-admin"
```

`admin_ip` — in the committed `infra/admin-allowlist.tf` (`local.admin_ip`). Update the CIDR and push to `main`; the Terraform Plan and Apply workflow deploys it automatically (no local `terraform apply` needed):

```hcl
locals {
  admin_ip = "203.0.113.5/32"
}
```

- `admin_ip` is the only source address TCP/22 is admitted from. Both nodes share the NSG, so this single value admits you to both.
- `admin_ssh_public_key` is the contents of `~/.ssh/kr_admin_ed25519.pub` as a single line.

### 2.3 Preview the plan

```bash
terraform -chdir=infra plan
```

Confirm:

- Both `azurerm_linux_virtual_machine` resources show `~ update in-place` for `admin_ssh_key` (never a forced replacement — Azure applies a key change without a reboot, so K3s and Flux are uninterrupted).
- The `AllowSSH` NSG rule shows an in-place update for the new source prefix.

If any resource shows it must be **replaced**, stop and re-evaluate before applying.

### 2.4 Apply

```bash
terraform -chdir=infra apply
```

This does not reboot the VMs or touch K3s. It only updates the SSH key on both VMs and the NSG source address.

## 3. Verify SSH to both nodes

```bash
terraform -chdir=infra output -raw node1_public_ip
terraform -chdir=infra output -raw node2_public_ip
```

If `terraform output` is unavailable (backend auth), use the Azure CLI:

```bash
az vm show -d -g rg-kevinryan-io -n vm-kevinryan-node1 --query publicIps -o tsv
az vm show -d -g rg-kevinryan-io -n vm-kevinryan-node2 --query publicIps -o tsv
```

Then connect:

```bash
ssh -i ~/.ssh/kr_admin_ed25519 azureuser@<node1_public_ip>   # expect hostname ...node1...
ssh -i ~/.ssh/kr_admin_ed25519 azureuser@<node2_public_ip>   # expect hostname ...node2...
```

## 4. Pull the K3s kubeconfig to your laptop

The K3s admin kubeconfig lives at `/etc/rancher/k3s/k3s.yaml` on node1, owned by root. Copy it through a readable temp location:

```bash
# On node1 (over SSH): make a readable copy
ssh -i ~/.ssh/kr_admin_ed25519 azureuser@<node1_public_ip> \
  'sudo cp /etc/rancher/k3s/k3s.yaml /home/azureuser/k3s.yaml && sudo chown azureuser:azureuser /home/azureuser/k3s.yaml && sudo chmod 600 /home/azureuser/k3s.yaml'

# Pull it down
scp -i ~/.ssh/kr_admin_ed25519 azureuser@<node1_public_ip>:/home/azureuser/k3s.yaml ~/.kube/kr-k3s.yaml
chmod 600 ~/.kube/kr-k3s.yaml

# Remove the readable copy on the node
ssh -i ~/.ssh/kr_admin_ed25519 azureuser@<node1_public_ip> 'rm /home/azureuser/k3s.yaml'
```

> This kubeconfig is the K3s **cluster-admin** credential. Protect it like a root password. Do not commit it anywhere. If you only need read-only access later, mint a dedicated ServiceAccount token instead (out of scope here).

Leave `server: https://127.0.0.1:6443` unchanged — it matches the SSH tunnel. Optionally rename the context for clarity:

```bash
kubectl --kubeconfig ~/.kube/kr-k3s.yaml config rename-context default kevinryan-io
```

## 5. Bring up the SSH tunnel to the Kubernetes API

```bash
ssh -fN -L 6443:127.0.0.1:6443 -i ~/.ssh/kr_admin_ed25519 azureuser@<node1_public_ip>
```

- `-fN` backgrounds the tunnel after authentication.
- Local port `6443` forwards to `127.0.0.1:6443` on node1, where K3s listens.
- TLS verifies because the K3s serving cert SAN includes `127.0.0.1`.

To tear the tunnel down:

```bash
pkill -f "ssh -fN -L 6443:127.0.0.1:6443"
```

## 6. Run kubectl and k9s

With the tunnel up:

```bash
KUBECONFIG=~/.kube/kr-k3s.yaml kubectl get nodes     # both nodes Ready
KUBECONFIG=~/.kube/kr-k3s.yaml k9s                   # full TUI — flux-system, site namespaces present
```

To avoid repeating `KUBECONFIG`:

```bash
kubectl --kubeconfig ~/.kube/kr-k3s.yaml config use-context kevinryan-io
export KUBECONFIG=~/.kube/kr-k3s.yaml     # add to your shell rc for persistence
```

k9s reads `KUBECONFIG` like kubectl, so once the context is set it opens straight onto the live cluster.

## 7. Convenience: SSH config and tunnel aliases

Add to `~/.ssh/config`:

```sshconfig
Host kr-node1
  HostName <node1_public_ip>
  User azureuser
  IdentityFile ~/.ssh/kr_admin_ed25519

Host kr-node2
  HostName <node2_public_ip>
  User azureuser
  IdentityFile ~/.ssh/kr_admin_ed25519
```

Add shell aliases (in `~/.zshrc` or `~/.bashrc`):

```bash
alias kr-tunnel-up='ssh -fN -L 6443:127.0.0.1:6443 kr-node1'
alias kr-tunnel-down='pkill -f "ssh -fN -L 6443:127.0.0.1:6443"'
```

Then:

```bash
ssh kr-node1            # direct shell on node1
kr-tunnel-up            # API tunnel up
KUBECONFIG=~/.kube/kr-k3s.yaml k9s
kr-tunnel-down          # API tunnel down
```

## When your public IP changes

If `ssh` starts timing out, your public IP has likely rotated. Repeat step 2 (find the IP, update `local.admin_ip` in `infra/admin-allowlist.tf`, push to `main` for the Terraform workflow to apply) — this touches only the NSG rule, not the VMs. The SSH key and kubeconfig do not need to change.

## Rotating the SSH key

To replace the admin key (e.g. a compromised or lost laptop):

1. Generate a new keypair (step 1) under a different path, or overwrite `~/.ssh/kr_admin_ed25519`.
2. Put the new public key in `admin_ssh_public_key` in `terraform.tfvars`.
3. `terraform -chdir=infra apply` — updates the key on both VMs in place.
4. Re-fetch the kubeconfig only if you also rotate cluster credentials (not required for an SSH key rotation).

## Acceptance checklist

- [ ] `terraform -chdir=infra plan` shows `~ update in-place` for both VMs' `admin_ssh_key` and the `AllowSSH` NSG rule — never a forced replacement.
- [ ] `ssh kr-node1` and `ssh kr-node2` succeed with the new key and print the right hostname.
- [ ] With the tunnel up, `KUBECONFIG=~/.kube/kr-k3s.yaml kubectl get nodes` returns both nodes `Ready`.
- [ ] `k9s` opens on the laptop and shows the live K3s cluster (flux-system and site namespaces present).
- [ ] The `admin_ip` in `infra/admin-allowlist.tf` matches the IP you SSH from, and this runbook documents how to update it when it changes.

## Notes and out of scope

- **ed25519** is the recommended key type (modern, short, universally supported by Azure Linux VMs). RSA keys still work.
- No change here requires opening port 6443 in the NSG. The tunnel is the deliberately minimal path.
- The K3s admin kubeconfig is reused for simplicity (cluster-admin). A least-privilege follow-up is a dedicated `ServiceAccount` + bound `ClusterRole` and a kubeconfig minted from its token — not covered here.
- Adding a bastion, Tailscale, or WireGuard overlay would let you drop the per-IP allowlist and route over a stable overlay; trivial to add later if `admin_ip` churn becomes annoying.
- Only `terraform.tfvars` (gitignored) should ever contain a public key or live IPs. Never commit a private key.
