import Container from '@/components/Container'

/**
 * Opens /method and carries its h1. The capability paper's own
 * headline, at the h1 step: the display step is the home page's.
 * The contents list makes a long page scannable, using the index
 * rows the /kevin cover already uses.
 */

const CONTENTS = [
  { n: '01', t: 'The exposure', href: '#exposure' },
  { n: '02', t: 'The test', href: '#test' },
  { n: '03', t: 'Every choice, and why', href: '#stack' },
  { n: '04', t: 'Governed delivery', href: '#delivery' },
  { n: '05', t: 'For regulated environments', href: '#regulated' },
  { n: '06', t: 'Status and engagement', href: '#engagement' },
] as const

export default function MethodHero() {
  return (
    <section className="section section--opens mhead" id="top" data-accent="blue">
      <Container>
        <span className="sec-mark">Sovereign AI-Native Engineering</span>
        <h1 className="mhead__title">
          The choices we made, and why they matter in a regulated estate.
        </h1>

        <div className="mhead__grid">
          <p className="t-lead mhead__lead">
            KR&amp;A&rsquo;s methodology puts AI agents at the centre of software delivery. We run
            it on a stack chosen against one rule: nothing the client depends on can be withdrawn,
            repriced or reached by a foreign court through a decision the client did not make.
          </p>
          <nav aria-label="On this page">
            <p className="label mhead__toc-label">On this page</p>
            {CONTENTS.map((c) => (
              <a className="index-row" href={c.href} key={c.n}>
                <span className="n">{c.n}</span>
                <span className="t">{c.t}</span>
                <span className="x" aria-hidden="true">&darr;</span>
              </a>
            ))}
          </nav>
        </div>
      </Container>
    </section>
  )
}
