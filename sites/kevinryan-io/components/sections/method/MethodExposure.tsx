import Container from '@/components/Container'
import SectionHeader from '@/components/SectionHeader'

/** Three failure modes. Red, because B6 gives red to failure. */

const RISKS = [
  {
    tag: 'Licence change',
    t: 'The terms move after adoption.',
    p: 'In 2021 Docker Desktop became paid for organisations above 250 employees or US$10 million revenue. In 2023 Terraform moved to the Business Source Licence. Neither needed the customer’s consent.',
  },
  {
    tag: 'Jurisdiction',
    t: 'Data residency is not data control.',
    p: 'A provider subject to US law can be compelled under the CLOUD Act to produce data it controls, wherever it is stored. What matters is who can be compelled, not where the server sits.',
  },
  {
    tag: 'Model drift',
    t: 'The vendor holds the compliance posture.',
    p: 'A proprietary model can change without notice, and each silent update is a de facto re-certification event. Open weights pinned to a version change only when the client decides.',
  },
] as const

export default function MethodExposure() {
  return (
    <section className="section section--sink" id="exposure" data-accent="red">
      <Container>
        <SectionHeader
          subtitle="The exposure"
          title="Three ways a toolchain fails a regulated buyer without anyone touching it."
        />
        <div className="cells cells--3">
          {RISKS.map((r) => (
            <div className="cell" key={r.tag}>
              <div className="cell__tag">{r.tag}</div>
              <h3 className="t-h3">{r.t}</h3>
              <p>{r.p}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
