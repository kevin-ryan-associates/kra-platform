# HTTP→HTTPS redirect and SSL/TLS mode are managed via the Cloudflare API, not
# Terraform. Context:
#   - All four zones are on the Free plan, which does not expose the
#     `http_request_dynamic_redirect` ruleset phase (the API returns 404 for it),
#     so a Dynamic Redirect ruleset cannot be created. That was attempted in
#     commit 741a350 and reverted because every apply failed "request is not
#     authorized" (the provider's misleading rendering of a 404 phase gate).
#   - The API token DOES have Zone Settings:Edit (verified: PATCH
#     /zones/{id}/settings/always_use_https returns editable=true), so the
#     Free-plan-native path is the "Always Use HTTPS" zone setting, set to `on`
#     on all four zones via the API.
#   - `cloudflare_zone_settings_override` is NOT used because the provider sends
#     the full settings block on apply, and unspecified fields revert to provider
#     defaults — which would reset ssl mode from `full` to the default and break
#     the origin behind the proxy. Managing one setting safely would require
#     pinning all 11 editable settings, which is brittle.
# Reproduce the redirect config (idempotent):
#   curl -X PATCH -H "Authorization: Bearer $TOKEN" \
#     "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/always_use_https" \
#     -H "Content-Type: application/json" -d '{"value":"on"}'

resource "cloudflare_record" "root" {
  zone_id = var.zone_id
  name    = "@"
  content = var.vm_public_ip
  type    = "A"
  proxied = true
  ttl     = 1
}

resource "cloudflare_record" "www" {
  zone_id = var.zone_id
  name    = "www"
  content = var.vm_public_ip
  type    = "A"
  proxied = true
  ttl     = 1
}

resource "cloudflare_record" "subdomains" {
  for_each = toset(var.subdomains)

  zone_id = var.zone_id
  name    = each.key
  content = var.vm_public_ip
  type    = "A"
  proxied = true
  ttl     = 1
}

locals {
  # Static-site hosts: apex, www, and every subdomain that is NOT a
  # whole-host cache-bypass host. The edge TTL mode is "respect_origin", so
  # what nginx sends is what the edge honors:
  #   - HTML (`Cache-Control: no-cache`) is never cached at the edge — a
  #     deploy is visible the moment the new pod serves it (KRA-17).
  #   - Hashed/immutable assets (`public, max-age=31536000, immutable`) stay
  #     cached at the edge and are still served stale while the origin is down.
  cache_subdomains = [for s in var.subdomains : s if !contains(var.cache_bypass_subdomains, s)]
  cache_expressions = concat(
    ["(http.host eq \"${var.domain}\")", "(http.host eq \"www.${var.domain}\")"],
    [for s in local.cache_subdomains : "(http.host eq \"${s}.${var.domain}\")"]
  )
  cache_expression = join(" or ", local.cache_expressions)

  # Dynamic-app hosts (e.g. the LibreChat app on hq): bypass the cache
  # entirely, on every path — their HTML and auth/API traffic must never be
  # edge-cached.
  bypass_expression = join(
    " or ",
    [for s in var.cache_bypass_subdomains : "(http.host eq \"${s}.${var.domain}\")"]
  )
}

resource "cloudflare_ruleset" "cache" {
  zone_id     = var.zone_id
  name        = "Cache rules for ${var.domain}"
  description = "Cache static site content per origin Cache-Control; serve stale on origin failure; bypass cache for dynamic app hosts"
  kind        = "zone"
  phase       = "http_request_cache_settings"

  # Bypass the cache entirely for dynamic app hosts (e.g. hq.kevinryan.io —
  # LibreChat). Never edge-cache their HTML, API, or auth traffic, so app
  # and overlay deploys are immediately visible. The expressions are
  # mutually exclusive with the static-sites rule below (hosts differ).
  rules {
    action = "set_cache_settings"
    action_parameters {
      cache = false
    }
    expression  = local.bypass_expression
    description = "Bypass cache for dynamic app hosts"
    enabled     = true
  }

  # Static sites: respect the origin Cache-Control (see locals). The edge
  # TTL must NOT override the origin — `override_origin` cached HTML for
  # up to 24h despite nginx's no-cache, which is the KRA-17 root cause.
  rules {
    action = "set_cache_settings"
    action_parameters {
      cache = true
      edge_ttl {
        mode = "respect_origin"
      }
      serve_stale {
        disable_stale_while_updating = false
      }
    }
    expression  = local.cache_expression
    description = "Cache static site content per origin Cache-Control"
    enabled     = true
  }
}
