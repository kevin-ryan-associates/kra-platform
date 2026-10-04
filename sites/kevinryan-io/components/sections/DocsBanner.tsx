import Container from '@/components/Container'

export default function DocsBanner() {
  return (
    <section className="section docs-banner" data-accent="cyan1">
      <Container>
        <div className="callout">
          <span className="callout__label">See it in production</span>
          <div className="callout__split">
            <p>
              This entire platform, <strong>seven sites</strong>, one monorepo, full{' '}
              <strong>analytics and observability</strong>, is agent-built,
              specification-driven and deployed through{' '}
              <strong>deterministic automation</strong>. The documentation is the portfolio.
            </p>
            <a className="link-out" href="https://docs.kevinryan.io" target="_blank" rel="noopener noreferrer">
              docs.kevinryan.io ↗
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}
