import Container from '@/components/Container'
import SectionHeader from '@/components/SectionHeader'

/** What the process produces against each obligation. Orange. */

const OBLIGATIONS = [
  { o: 'DORA, ICT third-party risk', p: 'Every component is forkable with a documented substitute, which gives exit strategies substance rather than intent.' },
  { o: 'NIS2, supply-chain security', p: 'A declared toolchain inventory, digest-pinned images and a single path from commit to production.' },
  { o: 'Cyber Resilience Act', p: 'Traceability from requirement to released change, recorded as a by-product of normal delivery.' },
  { o: 'EU AI Act, Article 4', p: 'A defined operating model in which named people supervise agents and own every decision to ship.' },
] as const

export default function MethodRegulated() {
  return (
    <section className="section section--sink" id="regulated" data-accent="orange">
      <Container>
        <SectionHeader
          subtitle="For regulated environments"
          title="The evidence comes out of delivery, not a separate exercise."
        />

        <table className="table table--stack">
          <thead>
            <tr>
              <th className="th--obligation">Obligation</th>
              <th>What the process produces</th>
            </tr>
          </thead>
          <tbody>
            {OBLIGATIONS.map((r) => (
              <tr key={r.o}>
                <td className="cred" data-label="Obligation">{r.o}</td>
                <td className="col-body" data-label="What the process produces">{r.p}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mreg__note">
          These map the evidence the process generates. They are not legal advice and not a
          compliance opinion. Confirm obligations with counsel.
        </p>
      </Container>
    </section>
  )
}
