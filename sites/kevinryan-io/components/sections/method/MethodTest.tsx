import Container from '@/components/Container'
import SectionHeader from '@/components/SectionHeader'

/** The sovereignty test. Teal, the AI-Native Engineering set colour. */

const LIMBS = [
  {
    tag: 'Limb 1 · Forkability',
    t: 'Forkable under an OSI-approved licence.',
    p: 'The capability must be runnable indefinitely without the vendor. Open core fails where the feature that matters sits behind the commercial gate.',
  },
  {
    tag: 'Limb 2 · Runtime control',
    t: 'Jurisdictional control of data flow at runtime.',
    p: 'At execution time, code, prompts, credentials and telemetry traverse only infrastructure in a jurisdiction the client selects. A vendor control plane inside the client’s account fails this limb.',
  },
] as const

export default function MethodTest() {
  return (
    <section className="section" id="test" data-accent="teal">
      <Container>
        <SectionHeader
          subtitle="The test"
          title="Two limbs. Both must hold."
          lead="Every component was selected against the test KR&A applies in client sovereignty assessments. Domicile alone is insufficient: it records where a company is registered, not where the data goes or who can withdraw the capability."
        />
        <div className="cells cells--2">
          {LIMBS.map((l) => (
            <div className="cell" key={l.tag}>
              <div className="cell__tag">{l.tag}</div>
              <h3 className="t-h3">{l.t}</h3>
              <p>{l.p}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
