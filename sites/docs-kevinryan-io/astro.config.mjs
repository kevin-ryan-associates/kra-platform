import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

/* ── Area accents ───────────────────────────────────────────────
   Each documentation area owns one accent from the Tokyo Night Moon
   ramp, mirroring the per-section accents on kevinryan.io. The map is
   keyed off the first path segment so it follows the sidebar groups.

   Set on <html> by an inline head script, which runs during parse and
   so lands before first paint. The astro:after-swap listener covers
   client-side navigation.
   ───────────────────────────────────────────────────────────────── */
const ACCENT_SCRIPT = `
(function () {
  var MAP = [
    [/^\\/(specs|provenance)(\\/|$)/, 'teal'],
    [/^\\/adr(\\/|$)/, 'magenta'],
    [/^\\/(k3s|node-access|terraform|cloudflare|traefik|flux-cd)(\\/|$)/, 'cyan'],
    [/^\\/(ci-cd|docker-builds)(\\/|$)/, 'orange'],
    [/^\\/(observability|umami)(\\/|$)/, 'green'],
    [/^\\/sites(\\/|$)/, 'yellow']
  ];
  function set() {
    var p = location.pathname, a = 'blue';
    for (var i = 0; i < MAP.length; i++) { if (MAP[i][0].test(p)) { a = MAP[i][1]; break; } }
    document.documentElement.dataset.accent = a;
  }
  set();
  document.addEventListener('astro:after-swap', set);
})();
`;

export default defineConfig({
  site: 'https://docs.kevinryan.io',
  integrations: [
    mermaid({
      /* Diagrams are drawn from the palette rather than mermaid's dark
         default, so they sit on the page instead of on top of it. */
      theme: 'base',
      autoTheme: false,
      mermaidConfig: {
        themeVariables: {
          darkMode: true,
          background: '#1a1b26',
          fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
          fontSize: '13px',
          primaryColor: '#1f2335',
          primaryTextColor: '#c8d3f5',
          primaryBorderColor: '#3b4261',
          secondaryColor: '#2f334d',
          secondaryTextColor: '#c8d3f5',
          secondaryBorderColor: '#3b4261',
          tertiaryColor: '#222436',
          tertiaryTextColor: '#a9b1d6',
          tertiaryBorderColor: '#3b4261',
          lineColor: '#737aa2',
          textColor: '#a9b1d6',
          nodeTextColor: '#c8d3f5',
          titleColor: '#c8d3f5',
          clusterBkg: '#1f2335',
          clusterBorder: '#3b4261',
          edgeLabelBackground: '#1a1b26',
          noteBkgColor: '#2f334d',
          noteTextColor: '#c8d3f5',
          noteBorderColor: '#3b4261',
          actorBkg: '#1f2335',
          actorBorder: '#3b4261',
          actorTextColor: '#c8d3f5',
          signalColor: '#828bb8',
          signalTextColor: '#a9b1d6',
        },
      },
    }),
    starlight({
      title: 'kevinryan.io - docs',
      favicon: '/favicon-dark.ico',
      head: [
        {
          tag: 'script',
          attrs: {
            defer: true,
            src: 'https://analytics.kevinryan.io/script.js',
            'data-website-id': '7982fbc0-012b-4c04-8ec3-a9de42462351',
          },
        },
        { tag: 'script', content: ACCENT_SCRIPT },
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/kevin-ryan-associates/kra-platform',
        },
      ],
      customCss: ['./src/styles/custom.css'],
      components: {
        Footer: './src/components/Footer.astro',
      },
      /* Syntax highlighting comes from the bundled tokyo-night Shiki
         theme. Its background is #1a1b26, which is page_bg in the
         palette, so code sits on the sunken surface by construction. */
      expressiveCode: {
        themes: ['tokyo-night'],
        styleOverrides: {
          borderRadius: '0',
          borderWidth: '1px',
          borderColor: '#3b4261',
          codeBackground: '#1a1b26',
          frames: {
            shadowColor: 'transparent',
            editorTabBarBackground: '#1f2335',
            editorTabBarBorderBottomColor: '#3b4261',
            editorActiveTabBackground: '#1a1b26',
            editorActiveTabIndicatorTopColor: 'var(--sec)',
            editorActiveTabBorderColor: '#3b4261',
            editorActiveTabForeground: '#c8d3f5',
            terminalBackground: '#1a1b26',
            terminalTitlebarBackground: '#1f2335',
            terminalTitlebarBorderBottomColor: '#3b4261',
            terminalTitlebarForeground: '#828bb8',
            inlineButtonBorder: '#3b4261',
            inlineButtonForeground: '#828bb8',
          },
          uiFontFamily: "'IBM Plex Mono', ui-monospace, monospace",
          codeFontFamily: "'IBM Plex Mono', ui-monospace, monospace",
          codeFontSize: '0.8125rem',
          codeLineHeight: '1.65',
        },
      },
      sidebar: [
        { label: 'Home', link: '/' },
        {
          label: 'SDD',
          collapsed: true,
          items: [
            {
              label: 'Specifications',
              collapsed: true,
              autogenerate: { directory: 'specs', collapsed: true },
            },
            {
              label: 'Provenance',
              collapsed: true,
              autogenerate: { directory: 'provenance', collapsed: true },
            },
          ],
        },
        {
          label: 'Architecture Decisions',
          collapsed: true,
          autogenerate: { directory: 'adr', collapsed: true },
        },
        { label: 'K3s Architecture', link: '/k3s/' },
        { label: 'Node Access (SSH / kubectl / k9s)', link: '/node-access/' },
        { label: 'Terraform Infrastructure', link: '/terraform/' },
        { label: 'Cloudflare DNS & CDN', link: '/cloudflare/' },
        { label: 'Traefik Ingress', link: '/traefik/' },
        { label: 'Flux CD Deployment', link: '/flux-cd/' },
        { label: 'GitHub Actions Workflows', link: '/ci-cd/' },
        { label: 'Docker Builds', link: '/docker-builds/' },
        { label: 'Observability', link: '/observability/' },
        { label: 'Umami Analytics', link: '/umami/' },
        {
          label: 'Site Architectures',
          collapsed: true,
          items: [
            { label: 'kevinryan.io', link: '/sites/kevinryan-io/' },
            { label: 'docs.kevinryan.io', link: '/sites/docs-kevinryan-io/' },
            { label: 'hq.kevinryan.io', link: '/sites/hq-kevinryan-io/' },
            { label: 'ai-native-engineer.io', link: '/sites/ai-native-engineer-io/' },
            { label: 'brand.kevinryan.io', link: '/sites/brand-kevinryan-io/' },
            { label: 'aiimmigrants.com', link: '/sites/aiimmigrants-com/' },
            { label: 'distributedequity.org', link: '/sites/distributedequity-org/' },
          ],
        },
      ],
    }),
  ],
});
