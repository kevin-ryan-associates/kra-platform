---
title: "ADR-008: Infrastructure-as-Code with Terraform"
---

**Status:** Accepted — tooling choice superseded by [ADR-025](adr-025-adopt-opentofu.md) (OpenTofu), 2026-10-06
**Date:** 2026-02-28
**Decision Makers:** Human + AI
**Prompted By:** ADR-005 (K3s VM), ADR-007 (managed PostgreSQL), and ADR-002 (ACR) define Azure resources that must be provisioned declaratively and reproducibly. ADR-005 also specifies Cloudflare for DNS and CDN. A single IaC framework must manage both Azure and Cloudflare resources in one plan/apply cycle.

## Context

The infrastructure established across ADRs 002, 005, 006, and 007 comprises:

- Azure Spot VM (B2ms) running K3s — ADR-005
- Azure Database for PostgreSQL Flexible Server (B1ms) — ADR-007
- Azure Container Registry (Basic) — ADR-002
- Azure NSG, managed identity, role assignments — ADR-005/007
- Cloudflare DNS records and cache rules for three domains — ADR-005

Today none of this exists. It needs to be provisioned from scratch, and it needs to be reproducible — if the entire environment is destroyed (spot eviction is a VM-level event, but resource group deletion or account migration are real scenarios), rebuilding must be a single command, not a manual clickthrough in the Azure portal.

Kevin is actively pursuing HashiCorp Terraform certification as part of the DevEx/Platform Engineering career pivot. The IaC framework choice should align with this certification path and maximise transferable skills for enterprise contract opportunities.

The framework must also manage resources across two providers (Azure and Cloudflare) in a single workflow. Cloudflare DNS records and cache rules are infrastructure — they belong in the same declarative configuration as the compute and database resources they front.

## Decision Drivers

- **Multi-provider in one workflow:** Azure resources and Cloudflare DNS/cache rules managed in a single plan/apply. No second tool, no manual steps between providers.
- **Enterprise employability:** The framework must be the one enterprise clients expect to see on a DevEx/Platform Engineering CV. Every commit to this repo is a portfolio artefact.
- **Certification alignment:** Kevin is pursuing Terraform certification. The portfolio infrastructure should be the study environment — learning by building, not by reading.
- **Reproducibility:** `terraform apply` from a clean state must produce the complete environment. No implicit dependencies on manual steps or portal configuration.
- **State management:** State must be durable, versioned, and lockable. A solo operator today, but the state backend should support future collaboration if the consultancy grows.
- **Mature provider ecosystem:** The Azure and Cloudflare providers must be production-grade with stable, well-documented resources for every component in the architecture.

## Options Considered

### Option A: Terraform (HashiCorp)

Industry-standard IaC framework. HCL (HashiCorp Configuration Language) is declarative, provider-agnostic, and well-known in enterprise hiring. The `azurerm` provider covers all required Azure resources as first-class objects. The `cloudflare` provider manages DNS records, page rules, and cache configuration. Both providers are maintained by their respective vendors (Microsoft and Cloudflare) and track API changes closely.

State management via Azure Storage Account backend provides locking (via blob lease), versioning, encryption at rest, and durability without additional services.

HashiCorp changed Terraform's licence from MPL-2.0 to BSL 1.1 in August 2023. This restricts competing commercial offerings but does not affect end-user usage, including commercial usage by Kevin Ryan & Associates. The BSL licence explicitly permits using Terraform to manage infrastructure for any purpose.

Terraform certification (HashiCorp Certified: Terraform Associate) exists, is industry-recognised, and is on Kevin's certification roadmap.

### Option B: Bicep (Microsoft)

Azure-native IaC language that compiles to ARM templates. No state file — Azure Resource Manager handles desired-state reconciliation. First-class support for every Azure resource, often ahead of Terraform's `azurerm` provider for new Azure features.

Cannot manage Cloudflare resources. A second tool (Terraform, CLI scripts, or manual configuration) would be needed for DNS records and cache rules. This splits the infrastructure definition across two systems, violating the single-workflow driver.

Bicep skills are Azure-only. If a client runs AWS or GCP, Bicep experience does not transfer. Kevin's Azure credentials (AZ-104, AZ-400 path) already demonstrate Azure proficiency — adding Bicep provides diminishing returns on the CV while Terraform opens multi-cloud contract opportunities.

No state file is both a strength (no state management overhead) and a weakness (no plan/preview of changes across providers, no import of existing resources from other clouds, no refactoring via `terraform state mv`).

### Option C: OpenTofu

Open-source fork of Terraform (MPL-2.0 licence), created by the Linux Foundation after HashiCorp's BSL licence change. API-compatible with Terraform 1.5.x. Same HCL syntax, same provider ecosystem, same state format.

Philosophically aligned with open-source values and Kevin's work on Distributed Equity Labs. Practically, enterprise job postings and client RFPs say "Terraform," not "OpenTofu." The OpenTofu provider registry lags Terraform's by minor versions. No vendor-backed certification exists. The project is 18 months old with uncertain long-term adoption trajectory.

The HCL configuration is identical — migration from Terraform to OpenTofu (or back) is a binary swap, not a rewrite. This decision can be revisited if OpenTofu achieves critical mass in the enterprise market without losing any work done today.

## Decision

**Terraform with the `azurerm` and `cloudflare` providers. State stored in an Azure Storage Account with blob lease locking.** Option A.

### Resource scope

Terraform manages the following resources in a single configuration:

**Azure (via `azurerm` provider):**

| Resource | Purpose | ADR |
|----------|---------|-----|
| Resource Group | Logical container for all resources | — |
| Virtual Machine (Spot, B2ms) | K3s compute node | 005 |
| Network Security Group | Ingress rules (80, 443, 6443) | 005 |
| Virtual Network + Subnet | VM and PostgreSQL networking | 005/007 |
| Public IP | VM endpoint for Cloudflare origin pull | 005 |
| Managed Identity (system-assigned) | VM-to-ACR pull, VM-to-PostgreSQL auth | 005/007 |
| PostgreSQL Flexible Server (B1ms) | Umami + Grafana databases | 007 |
| Container Registry (Basic) | Docker image storage | 002 |
| Storage Account | Terraform state backend (bootstrapped separately) | 008 |
| Role Assignments | AcrPull on ACR, PostgreSQL contributor | 005/007 |

**Cloudflare (via `cloudflare` provider):**

| Resource | Purpose | ADR |
|----------|---------|-----|
| DNS A/AAAA records | kevinryan.io, sddbook.com, aiimmigrants.com → VM IP | 005 |
| Cache rules | Static asset TTLs, cache-everything for HTML | 005 |
| SSL/TLS settings | Full (strict) mode per domain | 005 |

### Module structure

```text
infra/
├── main.tf              # Provider config, backend, module calls
├── variables.tf         # Input variables (region, VM size, domain list)
├── outputs.tf           # VM IP, PostgreSQL FQDN, ACR login server
├── modules/
│   ├── compute/         # VM, NIC, NSG, public IP, managed identity
│   ├── database/        # PostgreSQL Flexible Server, databases, firewall rules
│   ├── registry/        # ACR, role assignment for VM identity
│   ├── network/         # VNet, subnets, subnet delegation for PostgreSQL
│   └── cloudflare/      # DNS records, cache rules, TLS settings per domain
└── bootstrap/
    └── state-storage/   # One-time: Storage Account + container for tfstate
```

The `bootstrap/state-storage` module is applied once with local state to create the Storage Account that all subsequent runs use as their backend. This is the standard chicken-and-egg solution for Terraform state on Azure.

### State backend specification

| Parameter | Value |
|-----------|-------|
| **Backend type** | `azurerm` |
| **Storage Account** | `krastatestore` (or similar, globally unique) |
| **Container** | `tfstate` |
| **Key** | `kevinryan-io.tfstate` |
| **Locking** | Blob lease (automatic with `azurerm` backend) |
| **Encryption** | AES-256 at rest (Azure Storage default) |
| **Versioning** | Enabled (blob versioning for state history) |
| **Estimated cost** | < £0.50/month |

### Cloud-init boundary

Terraform provisions the VM and injects a cloud-init script via the `custom_data` argument. Cloud-init handles everything inside the VM: K3s installation, Traefik configuration, kubeconfig setup, and initial kubectl apply of Kubernetes manifests. Terraform does not manage Kubernetes resources directly — the boundary is clean:

- **Terraform manages:** Azure resources, Cloudflare resources, VM provisioning, cloud-init injection.
- **Cloud-init manages:** K3s bootstrap, Traefik IngressRoutes, workload manifests, secrets from Terraform outputs (PostgreSQL connection string, ACR credentials).

This avoids the complexity and fragility of the Terraform Kubernetes provider operating against a K3s API server that may not exist yet during the initial apply.

## Consequences

### Positive

- Single `terraform plan` previews changes across Azure and Cloudflare — complete visibility before any mutation
- Every Azure resource and Cloudflare record is declarative, version-controlled, and reproducible from a clean state
- Direct alignment with HashiCorp Terraform certification — the portfolio infrastructure is the study environment
- Enterprise clients recognise Terraform immediately — no explanation needed on the CV or in contract conversations
- Azure Storage Account state backend provides locking, versioning, and encryption at near-zero cost
- Clean boundary between Terraform (infrastructure) and cloud-init (configuration) avoids provider dependency cycles
- Module structure maps 1:1 to ADR decisions, making the relationship between architecture decisions and implementation explicit
- Migration to OpenTofu remains trivial (binary swap) if the enterprise market shifts

### Negative

- BSL 1.1 licence is not open source. If Kevin Ryan & Associates were building a competing IaC product, this would matter. For infrastructure provisioning, the licence has no practical restriction. Still, it contradicts the open-source positioning of Distributed Equity Labs in principle if not in practice
- State file contains sensitive values (PostgreSQL admin credentials, connection strings). The Azure Storage Account must have appropriate access controls — storage account key rotation, RBAC, no public blob access. Terraform state should be treated as a secret
- Terraform's Azure provider sometimes lags new Azure features by weeks or months. If a new Flexible Server capability is needed before the provider supports it, there is no escape hatch without dropping to Azure CLI or Bicep for that resource

### Risks

- **State file corruption or deletion:** Loss of the state file makes Terraform unable to manage existing resources without manual `terraform import` for every resource. Mitigation: blob versioning is enabled, providing point-in-time recovery. The bootstrap module is idempotent and can recreate the storage account if needed, but the state itself must be recovered from versioning
- **Provider version drift:** Pinning provider versions (`~> 4.0` for azurerm, `~> 4.0` for cloudflare) prevents unexpected breaking changes. But deferred upgrades accumulate technical debt. Mitigation: monthly `terraform init -upgrade` with plan review, aligned with the charter's monthly review cadence
- **Credential management for CI/CD:** When the CI/CD pipeline (ADR-009) runs `terraform apply`, it needs Azure and Cloudflare credentials. GitHub Actions OIDC federation with Azure AD eliminates long-lived secrets for Azure. Cloudflare API token must be stored as a GitHub Actions secret. Both are implementation details for ADR-009 but constrain this ADR's design
- **Bootstrap chicken-and-egg:** The state storage account must exist before Terraform can use it as a backend. The `bootstrap/state-storage` module uses local state for this one-time operation. If the bootstrap is run from a different machine without the local state, it will attempt to recreate the storage account. Mitigation: after bootstrap, the local state file is committed to the repo (it contains only the storage account, no sensitive data) or documented as a one-time manual step

## Agent Decisions

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| Circular dependency resolved by constructing ACR login server from name variable (`<name>.azurecr.io`) | ACR login server is deterministic. Compute module receives the constructed string; registry module gets the VM principal ID after creation. No `depends_on` needed — clean plan with natural dependency graph | Yes |
| Bootstrap uses `infra/bootstrap/` (flat, no `state-storage/` subdirectory) | Simpler path. ADR specified `bootstrap/state-storage/` as an example; a single `main.tf` in `bootstrap/` is sufficient for the one Storage Account + container | Yes |
| Backend `storage_account_name` left as empty string, set via `-backend-config` at init time | Avoids hardcoding the bootstrap output. Documented in README bootstrap instructions | Yes |
| Network module owns the resource group | Decouples resource group lifecycle from compute. All modules receive `resource_group_name` as input from network module output | Yes |

## References

- [ADR-002: Private images via GHCR](adr-002-private-images-via-ghcr.md) — ACR as replacement registry
- [ADR-005: Host on K3s with Azure Spot VM and Cloudflare CDN](adr-005-k3s-azure-spot-cloudflare-cdn.md) — compute and CDN resources
- [ADR-007: PostgreSQL on Azure Database Flexible Server](adr-007-postgresql-azure-flexible-server.md) — managed database
- [Terraform Azure Provider documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Terraform Cloudflare Provider documentation](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs)
- [Terraform Azure Storage Account backend](https://developer.hashicorp.com/terraform/language/backend/azurerm)
- [HashiCorp Certified: Terraform Associate](https://www.hashicorp.com/en/certification/terraform-associate)
