import Image from "next/image"
import Container from "@/components/Container"

const INDEX = [
  { n: '01', href: '#about', t: 'About', x: 'Systems' },
  { n: '02', href: '#capabilities', t: 'Capabilities', x: '6' },
  { n: '03', href: '#delivery', t: 'Enterprise delivery', x: '6' },
  { n: '04', href: '#clients', t: 'Notable clients', x: '20' },
  { n: '05', href: '#timeline', t: 'Career arc', x: '1995 →' },
  { n: '06', href: '#projects', t: 'Published work', x: '3' },
  { n: '07', href: '#certs', t: 'Certifications', x: '14' },
  { n: '08', href: '/contact', t: 'Contact', x: '↓' },
]

const META = [
  { k: 'Practice', v: 'AI-Native Engineering · Platform Engineering' },
  { k: 'Entity', v: 'Kevin Ryan & Associates' },
  { k: 'Experience', v: '30 years · 40+ enterprise clients' },
  { k: 'Certified', v: 'GitLab ×6 · GitHub ×4 · LaunchDarkly ×4' },
]

export default function HeroSection() {
  return (
    <section className="section cover" id="top" data-accent="blue">
      <Container>
        <div className="cover__grid">
          <div className="cover__main">
            <h1 className="t-display">Kevin <em>Ryan</em></h1>

            <p className="t-lead cover__lead">
              I used to direct teams of software engineers. Now I coordinate AI agents.
            </p>

            <hr className="rule--accent" />

            <div className="prose cover__prose">
              <p>
                A career building software and shipping products taught me the job was never
                about the tools. It is specification, role clarity and amplifying human
                ingenuity. The tools change. It still takes great teams of people to build
                great products. Agents just mean we do it faster.
              </p>
            </div>

            <div className="actions">
              <a className="btn btn--primary" href="/contact">Get in touch</a>
              <a className="btn" href="#delivery">Case studies <small>· 6</small></a>
              <a className="btn" href="https://docs.kevinryan.io" target="_blank" rel="noopener noreferrer">
                Documentation ↗
              </a>
            </div>

            <div className="meta-panel cover__panel">
              {META.map((r) => (
                <div className="row" key={r.k}>
                  <span className="k">{r.k}</span>
                  <span className="v">{r.v}</span>
                </div>
              ))}
              <div className="row">
                <span className="k">Platform</span>
                <span className="v">
                  <a href="https://docs.kevinryan.io" target="_blank" rel="noopener noreferrer">
                    docs.kevinryan.io
                  </a>
                </span>
              </div>
              <div className="row">
                <span className="k">Email</span>
                <span className="v">
                  <a href="mailto:kevin@kevinryan.io">kevin@kevinryan.io</a>
                </span>
              </div>
              <div className="row">
                <span className="k">Phone</span>
                <span className="v">
                  <a href="tel:+36701674009">+36 70 167 4009</a>
                </span>
              </div>
              <div className="row">
                <span className="k">GitHub</span>
                <span className="v">
                  <a href="https://github.com/devopskev" target="_blank" rel="noopener noreferrer">devopskev ↗</a>
                </span>
              </div>
              <div className="row">
                <span className="k">LinkedIn</span>
                <span className="v">
                  <a href="https://linkedin.com/in/devopskev" target="_blank" rel="noopener noreferrer">devopskev ↗</a>
                </span>
              </div>
            </div>
          </div>

          <aside className="cover__side">
            <figure className="portrait cover__portrait">
              <div className="portrait__frame">
                <Image src="/kevin.jpg" alt="Kevin Ryan" fill priority sizes="(max-width: 900px) 100vw, 420px" />
              </div>
              <figcaption className="portrait__caption">
                <span>Kevin Ryan</span>
                <span>Budapest · London · Dublin</span>
              </figcaption>
            </figure>

            <p className="label cover__toc-label">On this page</p>
            <nav>
              {INDEX.map((i) => (
                <a className="index-row" href={i.href} key={i.n}>
                  <span className="n">{i.n}</span>
                  <span className="t">{i.t}</span>
                  <span className="x">{i.x}</span>
                </a>
              ))}
            </nav>
          </aside>
        </div>
      </Container>
    </section>
  )
}
