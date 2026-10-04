'use client'

import { FormEvent, useState } from 'react'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/meerpkog'

export default function AssessmentContactForm(): React.JSX.Element {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        setStatus('success')
        form.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="callout" data-accent="green">
        <span className="callout__label">Enquiry sent</span>
        <p>Thanks for reaching out. We will be in touch shortly to arrange a conversation.</p>
      </div>
    )
  }

  return (
    <div className="form-panel">
      <div className="form-panel__hd"><span className="label">Book a Discovery Call</span></div>
      <div className="form-panel__bd">
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="_subject" value="Discovery Call Enquiry" />

          {status === 'error' && (
            <div className="callout callout--error" data-accent="red">
              <span className="callout__label">Something went wrong</span>
              <p>
                Please try again, or email{' '}
                <a href="mailto:kevin@kevinryan.io" className="link-out">kevin@kevinryan.io</a>{' '}
                directly.
              </p>
            </div>
          )}

          <div className="frow">
            <div className="fgroup">
              <label className="label flabel" htmlFor="ar-name">Name</label>
              <input className="field" type="text" id="ar-name" name="name" placeholder="Your name" required />
            </div>
            <div className="fgroup">
              <label className="label flabel" htmlFor="ar-email">Email</label>
              <input className="field" type="email" id="ar-email" name="email" placeholder="you@company.com" required />
            </div>
          </div>

          <div className="frow">
            <div className="fgroup">
              <label className="label flabel" htmlFor="ar-company">Company</label>
              <input className="field" type="text" id="ar-company" name="company" placeholder="Your organisation" required />
            </div>
            <div className="fgroup">
              <label className="label flabel" htmlFor="ar-role">Role</label>
              <select className="field" id="ar-role" name="role" required defaultValue="">
                <option value="" disabled>Select your role</option>
                <option value="CTO / VP Engineering">CTO / VP Engineering</option>
                <option value="Head of Platform / DevOps">Head of Platform / DevOps</option>
                <option value="Engineering Manager">Engineering Manager</option>
                <option value="Head of AI / Innovation">Head of AI / Innovation</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="fgroup">
            <label className="label flabel" htmlFor="ar-eng-size">Engineering Team Size</label>
            <select className="field" id="ar-eng-size" name="engineering_team_size" required defaultValue="">
              <option value="" disabled>Approximate number of engineers</option>
              <option value="< 50">Fewer than 50</option>
              <option value="50-200">50–200</option>
              <option value="200-500">200–500</option>
              <option value="500+">500+</option>
            </select>
          </div>

          <div className="fgroup">
            <label className="label flabel" htmlFor="ar-message">
              What&rsquo;s prompting this? <span className="fnote">(Optional)</span>
            </label>
            <textarea
              className="field"
              id="ar-message"
              name="message"
              placeholder="Tell us briefly about your situation. AI tools in use, what is working, what is not."
              rows={4}
            />
          </div>

          <button className="btn btn--primary" type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Sending…' : 'Book a Discovery Call'}
          </button>

          <p className="label fnote fnote--form">
            No commitment. No pitch deck. A 30-minute conversation about your context.
          </p>
        </form>
      </div>
    </div>
  )
}
