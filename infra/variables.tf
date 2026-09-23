variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "northeurope"
}

variable "vm_size" {
  description = "Azure VM SKU"
  type        = string
  default     = "Standard_B2ms"
}

variable "admin_username" {
  description = "SSH admin username for the VM"
  type        = string
  default     = "azureuser"
}

variable "admin_ssh_public_key" {
  description = "SSH public key for VM access"
  type        = string
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for kevinryan.io"
  type        = string
}

variable "acr_name" {
  description = "Globally unique name for Azure Container Registry"
  type        = string
}

variable "github_token" {
  description = "GitHub PAT for Flux bootstrap"
  type        = string
  sensitive   = true
}

variable "github_repo_owner" {
  description = "GitHub repository owner"
  type        = string
  default     = "kevin-ryan-associates"
}

variable "github_repo_name" {
  description = "GitHub repository name"
  type        = string
  default     = "kra-platform"
}

variable "cloudflare_zone_id_aiimmigrants" {
  description = "Cloudflare zone ID for aiimmigrants.com"
  type        = string
}

variable "cloudflare_zone_id_distributedequity" {
  description = "Cloudflare zone ID for distributedequity.org"
  type        = string
}

variable "cloudflare_zone_id_ainativeengineer" {
  description = "Cloudflare zone ID for ai-native-engineer.io"
  type        = string
}

variable "keyvault_name" {
  description = "Globally unique name for the Azure Key Vault (3-24 chars, alphanumeric + hyphens)"
  type        = string
  default     = "kv-kevinryan-io"
}

variable "auth0_secret" {
  description = "Auth0 session encryption secret for HQ"
  type        = string
  sensitive   = true
}

variable "auth0_issuer_base_url" {
  description = "Auth0 tenant URL for HQ (e.g. https://your-tenant.auth0.com)"
  type        = string
  sensitive   = true
}

variable "auth0_client_id" {
  description = "Auth0 client ID for HQ"
  type        = string
  sensitive   = true
}

variable "auth0_client_secret" {
  description = "Auth0 client secret for HQ"
  type        = string
  sensitive   = true
}

variable "auth0_domain" {
  description = "Auth0 domain for HQ (e.g. devopskev.eu.auth0.com) — no https:// prefix"
  type        = string
  sensitive   = true
}

variable "anthropic_api_key" {
  description = "Anthropic API key for HQ chat interface"
  type        = string
  sensitive   = true
}



