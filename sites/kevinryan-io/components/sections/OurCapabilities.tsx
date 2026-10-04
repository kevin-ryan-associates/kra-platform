import Container from '@/components/Container'
import SectionHeader from '@/components/SectionHeader'

/**
 * Our Capabilities. Twelve items grouped four to a proposition.
 *
 * The three groups carry the same accents as the three circles in
 * the Venn above and as the three cards under it, so a reader can
 * follow a colour from the diagram to the work. The section's own
 * accent is cyan; each group overrides it with data-accent.
 *
 * Copy is first person plural throughout. The Kevin page speaks as
 * the person, the rest of the site speaks as the practice. See
 * design-spec/theme-spec.md V1.
 */

const GROUPS = [
  {
    k: 'a',
    n: '01',
    accent: 'teal',
    title: 'AI-Native Engineering',
    items: [
      {
        t: 'Legacy Modernisation',
        p: 'Systems the business depends on and nobody can safely change. We read them, map what the business relies on, and rebuild them module by module, proving each one behaves as the old one did before it reaches production.',
      },
      {
        t: 'Human in the Loop by Design',
        p: 'For business critical systems, the question is not how much a machine can write. It is where a person has to decide, review and sign. We put those control points in the architecture rather than leaving them to individual discipline.',
      },
      /* The practices underneath are BDD, specification discipline and
         API-first. They are deliberately not named here: executive
         readers do not buy acronyms, and we do not lead with
         spec-driven development. */
      {
        t: 'Knowledge That Outlives the Code',
        p: 'Generated code is disposable. What the business agreed is not. We hold that agreement in behaviour specifications, in interface contracts written before implementation, and in tests that read as statements of intent, so the organisation still knows what it built and why.',
      },
      {
        t: 'Engineering Enablement',
        p: 'Practitioner training and co-delivery. Your team is leading the work by the end of it.',
      },
    ],
  },
  {
    k: 'b',
    n: '02',
    accent: 'yellow',
    title: 'Digital Sovereignty',
    items: [
      {
        t: 'Sovereignty Exposure Audit',
        p: 'Every component of your toolchain measured against one test. Forkable under an open licence, and jurisdictional control of data flow at runtime. Vendor domicile does not pass it.',
      },
      {
        t: 'Sovereign Reference Architecture',
        p: 'A working European stack. Git forge, project management, communications, models and orchestration. We run our own business on it.',
      },
      {
        t: 'Migration and Exit Engineering',
        p: 'Off proprietary platforms, with the exit cost established before you commit rather than discovered when you leave.',
      },
      {
        t: 'Model Change Control',
        p: 'An unannounced vendor model update is a re-certification event. With a proprietary model, your compliance posture is set by someone else. Open weights return that decision to you.',
      },
    ],
  },
  {
    k: 'c',
    n: '03',
    accent: 'magenta',
    title: 'Ethical Technology',
    items: [
      {
        t: 'Accessibility Engineering',
        p: 'The European Accessibility Act has applied since June 2025 and is now being enforced. Most digital estates fail it. We find where, fix what matters, and leave the standard in your definition of done rather than in a remediation backlog.',
      },
      {
        t: 'Provenance and Attribution',
        p: 'Where the material came from, who is owed for it, and how the system proves both. The Distributed Equity Licence applied in practice.',
      },
      {
        t: 'Workforce Impact',
        p: 'An AI-native delivery method changes the shape of an engineering organisation. Which roles move, which disappear, and what a fair transition looks like. Nobody selling the method wants to answer this. We put it in the scope.',
      },
      {
        t: 'EU AI Act Article 4 and AI Literacy',
        p: 'Chapter I, universal scope, in force since February 2025. It applies whatever your risk classification, which makes it the first obligation rather than the last. We assess the position and deliver the training that discharges it, at practitioner level rather than awareness level.',
      },
    ],
  },
] as const

export default function OurCapabilities() {
  return (
    <section className="section" id="what-we-do" data-accent="cyan">
      <Container>
        <SectionHeader className="sec-head--tight" subtitle="What we do" title="Our Capabilities" />

        <div className="capintro">
          <p>
            Three convictions, one practice. We do not run them as separate service lines,
            because our clients do not meet them as separate problems. A system built faster
            than it can be specified, running on infrastructure you cannot leave, trained on
            data nobody can account for, is one failure with three names.
          </p>
          <p>
            We work in four modes across all three. We assess, so you know where you stand
            before anyone commits to anything. We train, because a method that does not
            transfer is just another dependency. We build, alongside your engineers rather
            than instead of them. We govern, so the position still holds after we have gone.
          </p>
        </div>

        <div className="capgrid">
          {GROUPS.map((g) => (
            <div className="capgroup" key={g.k} data-accent={g.accent}>
              <div className="capgroup__hd">
                <span className="capgroup__n">{g.n}</span>
                <h3 className="capgroup__t">{g.title}</h3>
              </div>
              {g.items.map((it) => (
                <div className="capitem" key={it.t}>
                  <span className="capitem__t">{it.t}</span>
                  <p>{it.p}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        <p className="capclose">
          An assessment is the cheapest way for both of us to find out whether we are the
          right people for the work.
        </p>
      </Container>
    </section>
  )
}
