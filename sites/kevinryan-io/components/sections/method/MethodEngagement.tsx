import Container from '@/components/Container'

/**
 * Status and engagement, side by side as in the paper. Each column
 * owns its accent through data-accent, green then blue, so the two
 * eyebrows still walk the ramp. The page's one primary action.
 */
export default function MethodEngagement() {
  return (
    <section className="section" id="engagement" data-accent="blue">
      <Container>
        <div className="two-col">
          <div className="mclose" data-accent="green">
            <span className="sec-mark">Status</span>
            <h2 className="t-h2">We run on it first.</h2>
            <p>
              KR&amp;A&rsquo;s own platform is the reference implementation. It is migrating from a
              US hyperscaler stack to the components above, and the migration is itself run
              through this process, with every step recorded in Plane.
            </p>
          </div>
          <div className="mclose" data-accent="blue">
            <span className="sec-mark">Engagement</span>
            <h2 className="t-h2">Assessment first.</h2>
            <p>
              We baseline your development toolchain against the sovereignty test and give you
              time to absorb the result. It converts into a scoped pilot on one workstream, then
              training and adoption, with no upfront commitment beyond the assessment.
            </p>
            <div className="actions">
              <a href="/contact" className="btn btn--primary">Book a Discovery Call</a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
