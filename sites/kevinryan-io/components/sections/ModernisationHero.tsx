import Container from '@/components/Container'
import StepPanel from '@/components/StepPanel'

/**
 * The home page hero. Legacy modernisation is the entry point to
 * the practice, so it leads the page and carries the page's h1. B36.
 *
 * The top bar has no wordmark, B27, so the mark opens the section.
 * Teal because modernisation is AI-Native Engineering work, and teal
 * is that proposition's set colour.
 *
 * The proof is the Mastercard engagement, anonymised as it is in
 * proposals. It claims only what that engagement delivered.
 */

const PATH = [
  { n: '01', t: 'Read', p: 'The codebase read end to end, and what it does explained in business terms.' },
  { n: '02', t: 'Map', p: 'Dependencies, risks and dead code mapped before a line is changed.' },
  { n: '03', t: 'Rebuild', p: 'Module by module, highest cost and risk first rather than oldest first.' },
  { n: '04', t: 'Verify', p: 'New behaviour proven equivalent to old before anything reaches production.' },
] as const

const CONDITIONS = ['Open weights', 'Your infrastructure', 'Your release process'] as const
export default function ModernisationHero() {
  return (
    <section className="section mhero" id="top" data-accent="teal">
      <Container>
        <div className="mhero__brand">
          <p className="wordmark" aria-label="Kevin Ryan and Associates">KR<i>&amp;</i>A</p>
          <span className="t-meta" aria-hidden="true">Kevin Ryan &amp; Associates</span>
        </div>

        <span className="sec-mark">Legacy modernisation</span>
        <h1 className="mhero__title">
          Modernise the systems you <em>cannot afford to break.</em>
        </h1>

        <div className="mhero__grid">
          <div>
            <p className="t-lead mhero__lead">
              We use AI to read, map and rebuild legacy estates, running open-weight models on
              infrastructure you control. Your code never leaves your jurisdiction, and every
              change goes through your existing release process.
            </p>
            <div className="actions">
              <a href="/contact" className="btn btn--primary">Book a Discovery Call</a>
              <a href="#assessment" className="btn">Where it starts</a>
            </div>
            <div className="mproof">
              <span className="mproof__v">90%</span>
              <p className="mproof__k">
                less manual patching effort for a global payments network, with every change
                approved through the client&rsquo;s own CI/CD process.
              </p>
              <span className="t-meta mproof__src">Client reference, anonymised</span>
            </div>
          </div>

          <StepPanel head={['Modernisation path', 'In your estate']} steps={PATH} foot={CONDITIONS} />
        </div>
      </Container>
    </section>
  )
}
