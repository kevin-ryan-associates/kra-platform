import Container from '@/components/Container'
import SectionHeader from '@/components/SectionHeader'

/**
 * The three propositions, as a Venn diagram.
 *
 * Built in HTML and CSS only, no SVG and no image, so the diagram
 * inherits the theme and stays live text for search and screen
 * readers. The geometry lives in globals.css under PROPOSITIONS
 * VENN; every offset there is a stage pixel derived from a radius
 * of 180 and a centre separation of 170.
 *
 * Since 3.2.0 this is the second section, not the first. It answers
 * the modernisation hero's question of why us, so it takes an
 * ordinary section head, and the page's h1 and mark move up into
 * the hero. B36.
 */

const SETS = [
  { k: 'a', title: 'AI-Native Engineering', n: 'Proposition 01' },
  { k: 'b', title: 'Digital Sovereignty', n: 'Proposition 02' },
  { k: 'c', title: 'Ethical Technology', n: 'Proposition 03' },
] as const

const LUNES = [
  { k: 'ab', head: 'Sovereign delivery', body: ['In jurisdiction,', 'at speed'] },
  { k: 'ac', head: 'People centric', body: ['Maximising', 'human potential'] },
  { k: 'bc', head: 'Compliance by design', body: ['Structure,', 'not policy'] },
] as const

const PROPOSITIONS = [
  {
    n: '01',
    accent: 'teal',
    title: 'AI-Native Engineering',
    body:
      'AI is the primary implementer, not an autocomplete. When the machine writes the code, ' +
      'the code stops being the record of what the business decided. We keep people on the ' +
      'decisions and the knowledge somewhere people can still read it.',
    foot: 'Methodology',
  },
  {
    n: '02',
    accent: 'yellow',
    title: 'Digital Sovereignty',
    body:
      'Sovereignty is architectural, not contractual. A European region on a hyperscaler ' +
      'invoice is not control. We build on open source and open weights wherever possible, ' +
      'and hold the remainder to jurisdictional guarantees you can enforce.',
    foot: 'Architecture',
  },
  {
    n: '03',
    accent: 'magenta',
    title: 'Ethical Technology',
    body:
      'Every system encodes a distribution of value, whether anyone chose it or not. We make ' +
      'the choice explicit. Who it is built for, who is paid for it, and who is able to use it.',
    foot: 'Governance',
  },
] as const

export default function PropositionsHero() {
  return (
    <section className="section section--sink phero" id="why" data-accent="blue">
      <Container>
        <SectionHeader
          className="sec-head--tight"
          subtitle="Why us"
          title="Every vendor now sells AI modernisation. Most need your codebase on their models to do it."
          lead="We do not. Modernisation is where our three disciplines meet: a method that rebuilds, an architecture that keeps the work in your jurisdiction, and a record that proves it was done properly."
        />

        <div className="phero__venn venn">
          <div className="venn__stage">
            {SETS.map((s) => (
              <div key={`set-${s.k}`} className={`venn__set venn__set--${s.k}`} />
            ))}

            {SETS.map((s) => (
              <div key={`title-${s.k}`} className={`venn__title venn__title--${s.k}`}>
                {s.title}
                <i>{s.n}</i>
              </div>
            ))}

            {LUNES.map((l) => (
              <div key={l.k} className={`venn__lune venn__lune--${l.k}`}>
                <b>{l.head}</b>
                {l.body[0]}
                <br />
                {l.body[1]}
              </div>
            ))}

            <div className="venn__core">
              <p className="wordmark">KR<i>&amp;</i>A</p>
            </div>

            <div className="venn__arrow" />
            <div className="venn__caller">
              <b>We are here</b>
            </div>
          </div>
        </div>

        <div className="phero__cells cells cells--3">
          {PROPOSITIONS.map((p) => (
            <div className="cell" key={p.n} data-accent={p.accent}>
              <div className="cell__n">{p.n}</div>
              <h3 className="t-h3">{p.title}</h3>
              <p>{p.body}</p>
              <div className="cell__grow" />
              <div className="cell__foot">{p.foot}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
