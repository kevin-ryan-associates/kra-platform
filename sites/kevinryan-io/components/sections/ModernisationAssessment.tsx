import { Fragment } from 'react'
import Container from '@/components/Container'
import SectionHeader from '@/components/SectionHeader'

/**
 * The entry offer. Assessment first: it establishes a baseline,
 * gives the client time to absorb it, and converts into the work
 * without demanding commitment up front.
 *
 * Replaces the DORA-based readiness assessment that sat here
 * until 3.2.0. Green, which that section's deliverables carried.
 */

const DELIVERABLES = [
  {
    n: '01',
    t: 'Estate map',
    p: 'What each system does, written for the people who own it rather than only the people who maintain it.',
    foot: 'For leadership',
  },
  {
    n: '02',
    t: 'Risk register',
    p: 'Dependencies, undocumented logic and single points of knowledge, ranked by exposure.',
    foot: 'For risk and audit',
  },
  {
    n: '03',
    t: 'Rebuild sequence',
    p: 'Which modules to modernise first, ordered by maintenance cost and risk rather than by age.',
    foot: 'For engineering',
  },
  {
    n: '04',
    t: 'Sovereignty exposure',
    p: 'Which tools and models the programme would rely on, tested against licence and runtime control.',
    foot: 'For compliance',
  },
] as const

const TERMS = ['Fixed scope', 'Runs on your infrastructure', 'The findings are yours'] as const

export default function ModernisationAssessment() {
  return (
    <section className="section section--sink massess" id="assessment" data-accent="green">
      <Container>
        <SectionHeader
          className="sec-head--tight"
          subtitle="Where it starts · Modernisation assessment"
          title="Know what you have before you change it."
          lead="A fixed-scope baseline of your legacy estate, produced on your infrastructure. You keep the findings whether or not we do the work."
        />
        <p className="avail massess__terms">
          {TERMS.map((t, i) => (
            <Fragment key={t}>
              {i > 0 ? <span className="avail__sep" aria-hidden="true">/</span> : null}
              <span>{t}</span>
            </Fragment>
          ))}
        </p>

        <div className="cells cells--4">
          {DELIVERABLES.map((d) => (
            <div className="cell cell--phase" key={d.n}>
              <div className="cell__n">{d.n}</div>
              <h3 className="t-h3">{d.t}</h3>
              <p>{d.p}</p>
              <div className="cell__grow" />
              <div className="cell__foot">{d.foot}</div>
            </div>
          ))}
        </div>

        <div className="massess__close">
          <p>
            Thirty years inside enterprise estates, from CERN to NatWest. The first conversation
            costs you nothing.
          </p>
          <a href="/contact" className="btn btn--primary">Book a Discovery Call</a>
        </div>
      </Container>
    </section>
  )
}
