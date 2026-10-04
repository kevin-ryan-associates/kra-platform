import Container from '@/components/Container'
import SectionHeader from '@/components/SectionHeader'
import AssessmentContactForm from '@/components/sections/assessment/AssessmentContactForm'

export default function AssessmentCta({ as = 'h2' }: { as?: 'h1' | 'h2' }) {
  /* Carrying the page's h1 means this section opens the page, so it
     takes the page-opening top rather than a between-sections gap. */
  const opensPage = as === 'h1'
  return (
    <section
      className={`section section--sink${opensPage ? ' section--opens' : ''}`}
      data-accent="blue"
    >
      <Container>
        <SectionHeader as={as} subtitle="Interested?" title="LET&rsquo;S ARRANGE A CONVERSATION." />

        <div className="two-col">
          <div className="prose">
            <p className="t-lead">
              If you think we can help, start a conversation. We will be straight about the fit,
              tell you what the work actually involves, and say so if we are not the right people
              for it. No pitch deck.
            </p>
            <p>
              You can also reach out to Kevin directly at{' '}
              <a href="mailto:kevin@kevinryan.io" className="link-out">kevin@kevinryan.io</a> or on{' '}
              <a href="https://linkedin.com/in/devopskev" className="link-out">LinkedIn</a>.
            </p>
          </div>
          <AssessmentContactForm />
        </div>
      </Container>
    </section>
  )
}
