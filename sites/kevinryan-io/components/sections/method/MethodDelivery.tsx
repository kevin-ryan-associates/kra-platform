import Container from '@/components/Container'
import SectionHeader from '@/components/SectionHeader'
import StepPanel from '@/components/StepPanel'

/**
 * Governed delivery. Magenta. Prose and the work-item lifecycle side
 * by side, then the path every change takes to production. B47.
 */

const LIFECYCLE = [
  { n: '01', t: 'Filed', p: 'The work item enters the current iteration with an estimate and acceptance criteria. Filing is not authorisation to build.' },
  { n: '02', t: 'Planned', p: 'The agent moves the item to In Progress and posts its implementation plan before changing any code. Reviewers diff the result against that plan.' },
  { n: '03', t: 'Logged', p: 'Deviations, root causes and discovered constraints are recorded on the item as they occur.' },
  { n: '04', t: 'Evidenced', p: 'At In Review the item carries the change reference, pipeline result and verification evidence, including visual confirmation for anything a user sees.' },
  { n: '05', t: 'Closed by a human', p: 'No agent moves its own work to Done, even when every check passes.' },
] as const

const CHAIN = ['Work item', 'Branch', 'Merge', 'Pipeline', 'Deploy', 'Live'] as const

export default function MethodDelivery() {
  return (
    <section className="section" id="delivery" data-accent="magenta">
      <Container>
        <SectionHeader
          subtitle="Governed delivery"
          title="From the outside, an agile project. Underneath, a complete provenance record."
        />

        <div className="two-col">
          <div className="prose">
            <p className="t-lead">
              Non-technical stakeholders see what they already know: a backlog, iterations, story
              points and a board in Plane. They need no new tooling and no new vocabulary to
              follow progress.
            </p>
            <p>
              Behind each card, the work item holds the specification, the agent&rsquo;s plan,
              every deviation, the verification evidence and the human decision that closed it.
              The harness enforces this lifecycle through committed rules, not individual
              discipline.
            </p>
          </div>
          <StepPanel head={['Work-item lifecycle', 'Enforced by the harness']} steps={LIFECYCLE} />
        </div>

        <ol className="chain" aria-label="The path every change takes to production">
          {CHAIN.map((c) => <li key={c}>{c}</li>)}
        </ol>
      </Container>
    </section>
  )
}
