import Container from '@/components/Container'
import SectionHeader from '@/components/SectionHeader'

const STATS = [
  { num: '30', label: 'Years in technology' },
  { num: '14', label: 'Certifications' },
  { num: '40+', label: 'Enterprise clients' },
  { num: '£20m+', label: 'Programme budgets' },
]

export default function AboutSection() {
  return (
    <section className="section section--sink" id="about" data-accent="cyan">
      <Container>
        <SectionHeader subtitle="About" title="When AI writes the code" />

        <div className="about-cols">
          <div className="prose">
            <p>
              The market has shifted. Anthropic hires generalists with quirky side projects
              over narrow specialists. OpenAI seeks builders who thrive in ambiguity.
              Spotify&rsquo;s best engineers have not written a line of code since December 2025.
              They orchestrate AI agents while making the architectural decisions the machines
              cannot. The signal is clear. When AI fills in the implementation details, you
              need people who think in systems.
            </p>
            <p>
              That is what thirty years of breadth gives you. I have built production
              pipelines, run multi-million-pound delivery programmes and operated platforms for
              Vodafone, Nestl&eacute;, NatWest and the BBC. AI amplifies everything I already
              know, and you cannot shortcut that context. Most contractors are infrastructure
              specialists who have never managed a client engagement, or consultants who have
              never touched a pipeline. I have done both.
            </p>
            <blockquote>
              Grady Booch calls this the third golden age of software engineering, the age of
              systems. I have been building for all three.
              <cite>Kevin Ryan</cite>
            </blockquote>
          </div>

          <div className="prose">
            <p>
              I have been early to every wave. XP and TDD when they were fringe. Agile before
              it was the default. Cloud-native and containerisation before the industry caught
              up. VentureBeat now argues that hiring specialists made sense before AI, and that
              generalists win now. This is the shift I have spent three decades preparing for.
            </p>
            <p>
              I am not theorising about AI-native engineering. I am practising it. Writing{' '}
              <em>The AI-Native Engineer</em> and building the tooling. I conduct the agents.
              They build the software. The entire lifecycle ships through deterministic
              automation.
            </p>

            <div className="stats">
              {STATS.map((s) => (
                <div className="stat" key={s.label}>
                  <span className="stat__v">{s.num}</span>
                  <span className="stat__k">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
