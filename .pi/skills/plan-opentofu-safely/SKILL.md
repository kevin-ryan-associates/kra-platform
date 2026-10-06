---
name: plan-opentofu-safely
description: Run tofu fmt/validate/plan against infra/ without hanging the
  agent and without leaking secrets. Use for any infra/ change — OpenTofu
  reads TF_VAR_ secrets from the environment, so the .env.agents source-order
  flow matters, and -input=false is mandatory to avoid interactive-prompt
  freezes.
version: 2.0
created: "2026-09-24"
updated: "2026-10-06"
---

# OpenTofu Plan (Safe, Non-interactive)

## When to Use

- Any edit to `infra/` (variables, main, modules).
- Before committing infra changes or when the user asks for a plan.

## Background

The platform uses **OpenTofu** (`tofu`, MPL-2.0, Linux Foundation) — migrated
from HashiCorp Terraform for licensing reasons in KRA-24 / ADR-025. `tofu`
is a drop-in fork: same CLI surface, same `TF_VAR_*` env convention, same
`ARM_*` auth env, same azurerm state backend, same `.tf`/`terraform.tfvars`
filenames. The state file and lock file carry over unchanged (see Pitfalls
for the lock-file registry note).

Secrets are split by rule, driven by the `sensitive = true` flag in
`infra/variables.tf`:

- `infra/terraform.tfvars` (gitignored) — **non-secret config only**:
  `location`, `vm_size`, `admin_username`, `admin_ssh_public_key`, `acr_name`,
  `keyvault_name`, `github_repo_owner`, `github_repo_name`, and the
  `cloudflare_zone_id*` public identifiers. Template: `infra/terraform.tfvars.example`.
- `.env.agents` (gitignored, single source of truth for secrets) — every
  `sensitive = true` variable, injected as `TF_VAR_<name>` (OpenTofu reads
  these natively; no tfvars entry needed).

`admin_ip` is **not** a tfvars/env value — it lives in `infra/admin-allowlist.tf`
as `local.admin_ip`. Edit the CIDR there and push to main to deploy via CI/CD.

Sensitive variables (set in `.env.agents` as `TF_VAR_*`):
`cloudflare_api_token`, `github_token`, `auth0_secret`, `auth0_client_id`,
`auth0_client_secret`, `auth0_domain`, `auth0_issuer_base_url`,
`anthropic_api_key`.

## Procedure

1. Ensure `.env.agents` exists (`cp .env.agents.example .env.agents` if not),
   then load it into the current shell:

   ```bash
   set -a && source .env.agents && set +a
   ```

2. Format and validate from `infra/`:

   ```bash
   cd infra
   tofu fmt
   tofu init -input=false
   tofu validate
   ```

3. Plan with `tflint` and `-input=false` (mandatory — without it, plan can
   prompt and hang the agent). Pass a `timeout` to the bash tool for safety:

   ```bash
   tflint
   tofu plan -input=false -out=/tmp/kr-tfplan.tfplan
   ```

4. To apply (only when the user explicitly asks): apply the saved plan with
   `-input=false` and `-auto-approve` only after the user confirms:

   ```bash
   tofu apply -input=false -auto-approve /tmp/kr-tfplan.tfplan
   ```

## Pitfalls

- **Never** run `tofu plan`/`apply`/`init` without `-input=false` — an
  interactive prompt blocks the MCP call and forces `herdr server stop`.
- The `.terraform/` working directory records **which CLI last initialized
  it**. Alternating `terraform` and `tofu` on the same directory makes each
  CLI demand `init -reconfigure` (each records its own backend hash). Since
  the migration, `tofu` is the only CLI — plain `tofu init` just works. If a
  stale terraform-era directory complains about the backend, run
  `tofu init -input=false -reconfigure` once (same backend, no state copy).
- `.terraform.lock.hcl` is maintained by `tofu init` and pins providers under
  `registry.opentofu.org/*` (OpenTofu's default registry, which mirrors
  registry.terraform.io). A terraform-era lock file gets re-keyed and
  re-resolved on the first `tofu init` — expect provider version bumps within
  the declared constraints, not just hash additions.
- Do **not** put `TF_VAR_*` secrets into `terraform.tfvars` — that duplicates
  them and risks committing secrets to a public repo. `.env.agents` is the
  single source.
- Do **not** set `admin_ip` via tfvars or env — edit `infra/admin-allowlist.tf`
  and push to main; CI/CD applies it.
- `tofu apply` without `-auto-approve` will prompt — always pair with
  `-auto-approve` and a saved plan, and only after explicit user confirmation.
- The repo is **public** — never let a secret reach stdout in a way that gets
  committed. `tofu plan` masks sensitive values; verify the mask holds.
- `tofu state push` fails with "cannot overwrite existing state with
  serial N…" on a serial match — bump `serial` +1 in the pulled JSON
  (preserve the `lineage` UUID) before pushing back.
- **`TF_VAR_anthropic_api_key` is empty both in `.env.agents` and in the
  GitHub Actions secret** — plans show `azurerm_key_vault_secret.
  anthropic_api_key` value → null (a pre-existing, known 1-in-place drift;
  tofu and terraform show it identically), and an approved CI apply would
  break hq's Claude endpoint. Verify env vars without printing values;
  populate both before any apply.
- CI passes the `TF_VAR_*` secrets listed above and reads `tofu_version:
  1.13.1` (pinned in `opentofu.yml`, matching the local CLI), but it cannot
  read the gitignored `terraform.tfvars` — for non-secret variables CI
  applies the **infra variable defaults**, so defaults are live values;
  stale defaults are apply hazards.
- The tofu apply job is gated on the `production` environment — unapproved
  runs queue indefinitely (`gh run cancel` stale ones); decode the tfplan
  artifact before approving. Since CI pins tofu 1.13.1 to match local, the
  local `tofu show` decodes CI artifacts directly — run it **from `infra/`**
  (provider plugins are cached there); running it elsewhere fails with
  "Failed to load plugin schemas".
- After `az ad app credential reset --id <appId> --append --years 1`, the
  new secret is unusable for ~30-60s (AADSTS7000215) until Azure AD replicas
  converge — wait ~45s and retry. `--append` preserves existing credentials
  (incl. OIDC federated).
- When a plan needs **new** Azure Key Vault secrets, create them proactively
  (`az keyvault secret set`, values via `openssl rand`) — never just document
  them as manual prerequisites.

## Verification

- `tofu fmt` exits 0 with no diff.
- `tofu validate` prints "Success!".
- `tflint` exits 0.
- `tofu plan` completes within the bash `timeout` and shows only masked
  sensitive values.
