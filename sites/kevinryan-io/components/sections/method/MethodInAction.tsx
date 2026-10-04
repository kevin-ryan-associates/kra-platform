import Container from '@/components/Container'

/**
 * Closes /method with the evidence: the platform this page describes,
 * documented in the open. The docs banner's construction from /kevin,
 * in its documentation accent, cyan1, on the sunken surface after the
 * engagement section, so it keeps its top rule. B48.
 */
export default function MethodInAction() {
  return (
    <section className="section section--sink docs-banner docs-banner--ruled" data-accent="cyan1">
      <Container>
        <div className="callout">
          <span className="callout__label">See it in action</span>
          <div className="callout__split">
            <p>
              KR&amp;A&rsquo;s own platform is built this way: <strong>seven sites</strong>, one
              monorepo, every change taken through the <strong>work-item lifecycle</strong> above
              and recorded in Plane. The architecture decisions and infrastructure guides are{' '}
              <strong>published in full</strong>.
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
