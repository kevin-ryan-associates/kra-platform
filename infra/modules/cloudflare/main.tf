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
  # whole-host cache-bypass host.
  #
  # The edge decides caching by PATH CLASS, not by origin headers: nginx
  # never sends Cache-Control on browsed HTML paths (try_files serves them
  # inside "location /", which sets no header — only literal ".html" URIs
  # get no-cache), so "respect_origin" alone would leave HTML cached at
  # Cloudflare's default ~2h edge TTL (found during live verification).
  #
  #   - Immutable-asset paths (hashed prefixes + asset extensions) → cached
  #     at the edge, still served stale while the origin is down.
  #   - Everything else (HTML, unhashed css/js like brand.css) → cache
  #     bypass: a deploy is visible the moment the new pod serves it (KRA-17).
  cache_subdomains = [for s in var.subdomains : s if !contains(var.cache_bypass_subdomains, s)]
  static_host_expression = join(
    " or ",
    concat(
      ["(http.host eq \"${var.domain}\")", "(http.host eq \"www.${var.domain}\")"],
      [for s in local.cache_subdomains : "(http.host eq \"${s}.${var.domain}\")"]
    )
  )

  asset_extensions = ["svg", "png", "ico", "pdf", "woff2", "woff", "jpg", "jpeg", "webp"]
  asset_path_expressions = concat(
    [
      "starts_with(http.request.uri.path, \"/_next/static/\")",
      "starts_with(http.request.uri.path, \"/_astro/\")",
    ],
    [for ext in local.asset_extensions : "ends_with(http.request.uri.path, \".${ext}\")"]
  )
  asset_path_expression = "(${join(" or ", local.asset_path_expressions)})"

  cache_expression         = "(${local.static_host_expression}) and ${local.asset_path_expression}"
  bypass_static_expression = "(${local.static_host_expression}) and not ${local.asset_path_expression}"

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
  description = "Cache immutable assets and serve stale on origin failure; bypass cache for HTML and dynamic app hosts"
  kind        = "zone"
  phase       = "http_request_cache_settings"

  # Bypass the cache entirely for dynamic app hosts (e.g. hq.kevinryan.io —
  # LibreChat). Never edge-cache their HTML, API, or auth traffic, so app
  # and overlay deploys are immediately visible. Host-disjoint from the
  # static-site rules below. Zones with no bypass subdomains skip this
  # rule entirely (an empty expression is invalid).
  dynamic "rules" {
    for_each = length(local.bypass_expression) > 0 ? [1] : []

    content {
      action = "set_cache_settings"
      action_parameters {
        cache = false
      }
      expression  = local.bypass_expression
      description = "Bypass cache for dynamic app hosts"
      enabled     = true
    }
  }

  # Static sites — immutable-asset paths (hashed prefixes + asset
  # extensions; see locals). Only content-addressed paths match, so a 24h
  # edge TTL is safe and provides serve-stale on origin failure. The
  # original ruleset applied this TTL to EVERY path, edge-caching HTML for
  # up to 24h despite deploys — the KRA-17 root cause.
  rules {
    action = "set_cache_settings"
    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 86400
      }
      serve_stale {
        disable_stale_while_updating = false
      }
    }
    expression  = local.cache_expression
    description = "Cache immutable assets"
    enabled     = true
  }

  # Static sites — everything that is NOT an immutable-asset path: HTML and
  # unhashed assets (brand.css etc.). Never edge-cached, whatever headers
  # the origin sends (nginx sends none on browsed HTML paths — see locals).
  # Mutually exclusive with the asset rule by construction (not <asset>),
  # so evaluation order is irrelevant.
  rules {
    action = "set_cache_settings"
    action_parameters {
      cache = false
    }
    expression  = local.bypass_static_expression
    description = "Bypass cache for HTML and unhashed paths"
    enabled     = true
  }
}
