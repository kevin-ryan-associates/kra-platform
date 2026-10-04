#!/usr/bin/env python3
"""Regenerates design-spec/theme-sheet.html for 002-site-theme.

Run from design-spec/:  python3 mksheet.py

The component CSS is app/globals.css verbatim, with the @theme block
lifted into :root so the custom properties resolve without Tailwind.
Only the specimen chrome is authored here. That is deliberate: the
3.0.0 sheet carried a hand-maintained copy of the component CSS, which
drifted, which is what open item O8 recorded.

The base is sheet-base.html, the 3.0.0 sheet, and never the generator's
own last output. Reading the output back in made the run non-idempotent:
the splices below insert whole blocks, so a second run duplicated the
wordmark, the Venn and the set cards. Nothing here writes to the base.
"""
import re, sys

VERSION = "3.3.0"
GLOBALS = "../app/globals.css"
BASE    = "sheet-base.html"      # the 3.0.0 sheet. Read only, never written.
CHROME  = "sheet-chrome.css"
OUT     = "theme-sheet.html"

old = open(BASE).read()
fonts = "\n".join(re.findall(r'@font-face\{[^}]*\}', old))
css   = open(GLOBALS).read()
theme = re.search(r"@theme \{(.*?)\n\}", css, re.S).group(1)
shim  = ":root{\n" + "\n".join(l for l in theme.split("\n") if re.match(r"\s*--", l)) + "\n}"
css   = css.replace('@import "tailwindcss";', '')
chrome = open(CHROME).read()

# ── body: keep every 3.0.0 block, add the 3.1.0 ones ──────────────
body = old[old.index('<body>')+len('<body>'):old.rindex('</body>')]
body = body.replace('002-site-theme · v3.0.0 · locked', '002-site-theme · v' + VERSION + ' · locked')

# the type specimen table is wider than a phone and was pushing the page
body = body.replace('<table class="scale">', '<div class="scroll-x"><table class="scale">')
body = body.replace('</table>', '</table></div>')
body = body.replace(
  'system renders here. If something on the site is not on this sheet, it is not in the system.',
  'system renders here. If something on the site is not on this sheet, it is not in the system.\n      The component CSS below is app/globals.css verbatim, so this sheet cannot drift from it.')

WORDMARK = '''
  <!-- ══ WORDMARK ══ -->
  <section class="block" data-accent="blue">
    <h2>Wordmark and lockup · B34, B35</h2>
    <div class="phero__head" style="display:inline-block">
      <p class="wordmark" style="font-size:5rem">KR<i>&amp;</i>A</p>
      <p class="phero__name">%s</p>
    </div>
    <p class="note">
      Live text, never an image on this site. The ampersand reads --sec, so it takes the accent of
      whatever section it sits in: <span class="wordmark" style="font-size:var(--text-h2)" data-accent="teal">KR<i>&amp;</i>A</span>
      <span class="wordmark" style="font-size:var(--text-h2)" data-accent="orange">KR<i>&amp;</i>A</span>
      <span class="wordmark" style="font-size:var(--text-h2)" data-accent="magenta">KR<i>&amp;</i>A</span><br>
      The name locks to the mark's ink, not its box. Space Grotesk carries a 0.066em left bearing on
      the K and 0.018em on the right of the A, so the lockup insets by 2.78%% and 0.76%% of the width.
    </p>
  </section>
''' % "".join('<span class="sp"></span>' if ch == ' '
              else '<span>%s</span>' % ('&amp;' if ch == '&' else ch)
              for ch in 'Kevin Ryan & Associates')

SETS = [("a", "AI-Native Engineering", "Proposition 01"),
        ("b", "Digital Sovereignty",   "Proposition 02"),
        ("c", "Ethical Technology",    "Proposition 03")]
LUNES = [("ab", "Sovereign delivery",   "In jurisdiction,", "at speed"),
         ("ac", "People centric",       "Maximising",       "human potential"),
         ("bc", "Compliance by design", "Structure,",       "not policy")]
CARDS = [("01", "teal",    "AI-Native Engineering", "Methodology"),
         ("02", "yellow",  "Digital Sovereignty",   "Architecture"),
         ("03", "magenta", "Ethical Technology",    "Governance")]

VENN = '''
  <!-- ══ PROPOSITIONS VENN ══ -->
  <section class="block" data-accent="blue">
    <h2>Propositions Venn · B37</h2>
    <div class="venn" style="--venn-nudge:0px">
      <div class="venn__stage">
%s
%s
%s
        <div class="venn__core"><p class="wordmark">KR<i>&amp;</i>A</p></div>
        <div class="venn__arrow"></div>
        <div class="venn__caller"><b>We are here</b></div>
      </div>
    </div>
    <p class="note">
      HTML and CSS only. No SVG, no image, no script. A fixed 900 by 700 space that scales as one
      unit, built from a radius of 180 and a centre separation of 170. The overlap captions sit on
      the pole of inaccessibility of their region, the arrow is one border side routed through the
      only corridor that crosses no caption, and the head is a clipped dart hinged on its own tip.
      Set colours are fixed, not section accents: they are a legend.
    </p>
  </section>

  <!-- ══ SET CARDS ══ -->
  <section class="block" data-accent="blue">
    <h2>Set cards · B38</h2>
    <div class="phero__cells cells cells--3" style="margin-top:0">
%s
    </div>
    <p class="note">
      A card that restates a set quotes that set's construction rather than adding a device. The top
      hairline uses the same expression as the ring, color-mix(in srgb, var(--sec) 58%%, transparent),
      so it is the same colour and not an approximation.
    </p>
  </section>
''' % (
  "\n".join('        <div class="venn__set venn__set--%s"></div>' % k for k, _, _ in SETS),
  "\n".join('        <div class="venn__title venn__title--%s">%s<i>%s</i></div>' % (k, t, n) for k, t, n in SETS),
  "\n".join('        <div class="venn__lune venn__lune--%s"><b>%s</b>%s<br>%s</div>' % l for l in LUNES),
  "\n".join('''      <div class="cell" data-accent="%s">
        <div class="cell__n">%s</div>
        <h3>%s</h3>
        <p>One card per set, carrying that set's colour on its top hairline.</p>
        <div class="cell__grow"></div>
        <div class="cell__foot">%s</div>
      </div>''' % (a, n, t, f) for n, a, t, f in CARDS),
)


CAPGROUPS = [
  ("01", "teal",    "AI-Native Engineering", [
    ("Legacy Modernisation",           "Read, map and rebuild, proving each module before release."),
    ("Human in the Loop by Design",    "Where a person has to decide, review and sign."),
    ("Knowledge That Outlives the Code", "Behaviour specifications and interface contracts."),
    ("Engineering Enablement",         "Practitioner training and co-delivery."),
  ]),
  ("02", "yellow",  "Digital Sovereignty", [
    ("Sovereignty Exposure Audit",       "Forkable under an open licence, and control at runtime."),
    ("Sovereign Reference Architecture", "A working European stack. We run our own business on it."),
    ("Migration and Exit Engineering",   "Exit cost established before you commit."),
    ("Model Change Control",             "An unannounced model update is a re-certification event."),
  ]),
  ("03", "magenta", "Ethical Technology", [
    ("Accessibility Engineering",  "The standard in your definition of done, not in a backlog."),
    ("Provenance and Attribution", "The Distributed Equity Licence applied in practice."),
    ("Workforce Impact",           "Which roles move, which disappear, and what is fair."),
    ("EU AI Act Article 4",        "Universal scope, so the first obligation rather than the last."),
  ]),
]

CAPBLOCK = '''
  <!-- \u2550\u2550 CAPABILITY GROUPS \u2550\u2550 -->
  <section class="block" data-accent="cyan">
    <h2>Capability groups \u00b7 B41</h2>
    <div class="capgrid">
%s
    </div>
    <p class="note">
      A list, not a card. The cell grid\u2019s hairline system with none of its behaviour: no hover, no
      accent edge, no pointer, because there is nothing to click. The group head carries the same
      colour expression as the set card above it and as the ring in the Venn, so one hue runs from the
      diagram to the work. Item titles are mono uppercase in --sec. The numeral is --ink-3 rather than
      the cell grid\u2019s --ink-4, because it is read content and has to clear 4.5:1. Three groups do
      not halve, so the grid goes to one column at 1180 rather than leaving an orphan at two.
    </p>
  </section>
''' % "\n".join(
  '''      <div class="capgroup" data-accent="%s">
        <div class="capgroup__hd"><span class="capgroup__n">%s</span><h3 class="capgroup__t">%s</h3></div>
''' % (a, n, t) + "\n".join(
    '        <div class="capitem"><span class="capitem__t">%s</span><p>%s</p></div>' % it
    for it in items) + "\n      </div>"
  for n, a, t, items in CAPGROUPS)

MODERN = '''
  <!-- ══ MODERNISATION HERO AND PATH ══ -->
  <section class="block" data-accent="teal">
    <h2>Modernisation hero and step panel · B42, B43</h2>
    <div class="mhero__brand">
      <p class="wordmark">KR<i>&amp;</i>A</p>
      <span class="t-meta">Kevin Ryan &amp; Associates</span>
    </div>
    <span class="sec-mark">Legacy modernisation</span>
    <p class="mhero__title">Modernise the systems you <em>cannot afford to break.</em></p>
    <div class="mhero__grid">
      <div>
        <p class="t-lead mhero__lead">The lead, the actions and the proof sit against the path.</p>
        <div class="actions">
          <button class="btn btn--primary" type="button">Book a Discovery Call</button>
          <button class="btn" type="button">Where it starts</button>
        </div>
        <div class="mproof">
          <span class="mproof__v">90%%</span>
          <p class="mproof__k">A figure in --sec over a stat top rule, with its caption.</p>
          <span class="t-meta mproof__src">Source line</span>
        </div>
      </div>
      <div class="steps">
        <div class="steps__hd"><span>Modernisation path</span><span>In your estate</span></div>
        <ol>
%s
        </ol>
        <div class="steps__ft"><span>Open weights</span><span>Your infrastructure</span><span>Your release process</span></div>
      </div>
    </div>
    <p class="note">
      The home page opens on the entry offer. The title is the display step, once per page, with a
      15ch measure rather than .t-display's 11ch. The path is a meta panel holding an ordered list;
      its rows take the hover surface and no accent edge, because nothing is clickable.
    </p>
  </section>

  <!-- ══ MODERNISATION ASSESSMENT ══ -->
  <section class="block massess" data-accent="green">
    <h2>Modernisation assessment · B44</h2>
    <p class="avail massess__terms"><span>Fixed scope</span><span class="avail__sep">/</span><span>Runs on your infrastructure</span><span class="avail__sep">/</span><span>The findings are yours</span></p>
    <div class="cells cells--4">
%s
    </div>
    <div class="massess__close">
      <p>One sentence at the h3 step, paired with the primary action.</p>
      <button class="btn btn--primary" type="button">Book a Discovery Call</button>
    </div>
  </section>
''' % (
  "\n".join('          <li class="steps__item"><span class="steps__n">%s</span><div><h3>%s</h3><p>%s</p></div></li>' % st
    for st in [("01", "Read", "Explained in business terms."), ("02", "Map", "Before a line is changed."),
               ("03", "Rebuild", "Highest cost and risk first."), ("04", "Verify", "Proven equivalent before release.")]),
  "\n".join('      <div class="cell cell--phase"><div class="cell__n">%s</div><h3 class="t-h3">%s</h3><p>Deliverable.</p><div class="cell__grow"></div><div class="cell__foot">%s</div></div>' % d
    for d in [("01", "Estate map", "For leadership"), ("02", "Risk register", "For risk and audit"),
              ("03", "Rebuild sequence", "For engineering"), ("04", "Sovereignty exposure", "For compliance")]),
)

CHAINBLOCK = '''
  <!-- ══ DELIVERY CHAIN ══ -->
  <section class="block" data-accent="magenta">
    <h2>Delivery chain · B47</h2>
    <ol class="chain">
      <li>Work item</li><li>Branch</li><li>Merge</li><li>Pipeline</li><li>Deploy</li><li>Live</li>
    </ol>
    <p class="note">
      The path every change takes, on the cell grid\u2019s hairlines. The last step takes --sec because
      it is the only one a user sees. Tables beside it on /method stack into labelled rows under
      900 rather than scrolling, .table--stack, B46.
    </p>
  </section>
'''

FORM = '''  <!-- ══ FORM ══ -->
  <section class="block" data-accent="blue">
    <h2>Form controls · B39, B40</h2>
    <div class="grid2">
      <div class="form-panel">
        <div class="form-panel__hd"><span class="label">Every control in the system</span></div>
        <div class="form-panel__bd">
          <div class="frow">
            <div class="fgroup">
              <label class="label flabel" for="ts-name">Text</label>
              <input class="field" id="ts-name" type="text" placeholder="Your name">
            </div>
            <div class="fgroup">
              <label class="label flabel" for="ts-email">Email, filled</label>
              <input class="field" id="ts-email" type="email" value="you@company.com">
            </div>
          </div>
          <div class="fgroup">
            <label class="label flabel" for="ts-role">Select, on its empty option</label>
            <select class="field" id="ts-role" required>
              <option value="" disabled selected>Select your role</option>
              <option>CTO / VP Engineering</option>
              <option>Head of Platform / DevOps</option>
            </select>
          </div>
          <div class="fgroup">
            <label class="label flabel" for="ts-msg">Textarea <span class="fnote">(optional)</span></label>
            <textarea class="field" id="ts-msg" rows="3" placeholder="Tell us briefly about your situation."></textarea>
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <button class="btn btn--primary" type="button">Primary</button>
            <button class="btn" type="button">Secondary</button>
            <button class="btn" type="button" disabled>Disabled</button>
          </div>
          <p class="note" style="margin-top:var(--sp-3)">
            color-scheme is dark, so the select popup, the caret and the scrollbars follow the page
            rather than the OS. appearance is none on the field, the select and the button, so Safari
            adds no radius and no inner shadow. Autofill is overridden with an inset shadow, the only
            mechanism Chrome honours. Focus takes the ring inwards, because an outline at 3px offset
            collides with the panel edge. Invalid uses :user-invalid, so it fires after interaction.
          </p>
        </div>
      </div>
      <div class="empty-state">
        <h3 style="font-family:var(--font-display);font-weight:600;font-size:var(--text-h3);margin:0 0 var(--sp-1)">Nothing here yet</h3>
        <p style="color:var(--ink-3);font-size:var(--text-ui);margin:0">The dashed border appears on the empty state and nowhere else in the system.</p>
      </div>
    </div>
  </section>
'''

# splice: wordmark after the type scale block, venn and cards before the form,
# and the form block replaced wholesale
anchor = body.index('  <!-- ══ FORM ══ -->')
end    = body.index('  <!-- ══ CONSTRAINTS ══ -->')
body   = body[:anchor] + MODERN + "\n" + CHAINBLOCK + "\n" + VENN + "\n" + CAPBLOCK + "\n" + FORM + "\n" + body[end:]

m = re.search(r'(  <!-- ══ PROSE ══ -->|  <!-- ══ CONTROLS ══ -->)', body)
insert_at = m.start() if m else body.index('  <!-- ══ FORM ══ -->')
body = body[:insert_at] + WORDMARK + "\n" + body[insert_at:]

# new constraints, matching the new behaviour statements
body = body.replace('      <li>One primary button per view.</li>',
'''      <li>One primary button per view.</li>
      <li>The wordmark is live text. Its ampersand reads the section accent.</li>
      <li>One h1 per page. Section heads are h2.</li>
      <li>Native form chrome is suppressed. color-scheme is dark.</li>
      <li>/kevin speaks as a person. Every other page speaks as the firm.</li>
      <li>A capability group is a list, not a card. No hover, nothing to click.</li>
      <li>The display step appears once per page.</li>
      <li>A table never scrolls sideways on a phone. It stacks.</li>
      <li>A proof figure claims only what the referenced engagement delivered.</li>''')

body = body.replace('same faces through @fontsource. No request leaves the origin to render type.',
'''same faces through @fontsource. No request leaves the origin to render type.<br>
      The component CSS in this file is app/globals.css verbatim. Regenerate with design-spec/mksheet.py
      rather than editing by hand.''')

open(OUT, "w").write(
  '<!DOCTYPE html>\n<html lang="en-GB">\n<head>\n<meta charset="utf-8">\n'
  '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
  '<title>Theme sheet · Kevin Ryan &amp; Associates · 002-site-theme v' + VERSION + '</title>\n'
  '<style>' + fonts + '</style>\n'
  '<style>' + shim + '</style>\n'
  '<style>' + css + '</style>\n'
  '<style>' + chrome + '</style>\n'
  '</head>\n<body>' + body + '</body>\n</html>\n')
print("theme-sheet.html", len(open(OUT).read()), "bytes")
