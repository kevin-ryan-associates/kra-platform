import Container from '@/components/Container'
import SectionHeader from '@/components/SectionHeader'

const PROJECTS = [
  {
    tag: 'Book', title: 'The AI-Native Engineer', status: 'draft', statusLabel: 'Drafting',
    desc: 'The practices, knowledge and judgement software engineers need when agents write the code. Not a manual. A working body of knowledge for the era of agentic AI.',
    url: 'https://ai-native-engineer.io', host: 'ai-native-engineer.io',
  },
  {
    tag: 'Book', title: 'AI Immigrants', status: 'live', statusLabel: 'Published',
    desc: 'Seventy thousand words on AI governance, the EU AI Act and the societal dynamics of automation. The governance thinking enterprises need before letting AI into production.',
    url: 'https://aiimmigrants.com', host: 'aiimmigrants.com',
  },
  {
    tag: 'Licensing framework', title: 'Distributed Equity', status: 'live', statusLabel: 'Live',
    desc: 'An open-source AI licensing framework. Platforms and developers embed respect for provenance into their architectures. Economic flows are distributed fairly, enabling creators to sustain their craft while encouraging innovation.',
    url: 'https://distributedequity.org', host: 'distributedequity.org',
  },
]

export default function WritingSection() {
  return (
    <section className="section" id="projects" data-accent="yellow">
      <Container>
        <SectionHeader subtitle="Writing & projects" title="Published work" />
        <div className="cells cells--3">
          {PROJECTS.map((p) => (
            <a className="cell" key={p.title} href={p.url} target="_blank" rel="noopener noreferrer">
              <span className="cell__tag">{p.tag}</span>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <span className="cell__grow" />
              <div className="cell__pills">
                <span className={`pill pill--${p.status}`}>{p.statusLabel}</span>
              </div>
              <span className="cell__out">{p.host} <span className="arr">↗</span></span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  )
}
