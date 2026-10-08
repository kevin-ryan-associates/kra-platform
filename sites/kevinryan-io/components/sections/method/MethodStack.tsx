import Container from '@/components/Container'
import SectionHeader from '@/components/SectionHeader'

/**
 * Every component, its licence, and why. Cyan. The table stacks
 * into labelled rows under 900 rather than scrolling sideways. B46.
 * The Plane row links to Governed delivery, which the paper cites
 * as section 04.
 */

type Row = { layer: string; choice: string; licence: string; why: string; href?: string }

const ROWS: readonly Row[] = [
  { layer: 'Agent harness', choice: 'pi', licence: 'MIT', why: 'KR&A’s skills and lifecycle rules are files committed with the code. Any compatible model endpoint plugs in.' },
  { layer: 'Agent terminal', choice: 'TUIOS', licence: 'MIT', why: 'Agents run side by side in persistent sessions, and every request for human approval lands in one inbox.' },
  { layer: 'Models', choice: 'Mistral, GLM-5.2, Qwen', licence: 'Apache 2.0, MIT', why: 'Open weights pinned by version. Movable to self-hosted inference at any time.' },
  { layer: 'Inference', choice: 'Scaleway Generative APIs', licence: 'Service', why: 'Hosted in Paris. Dedicated deployments where single-region processing is required.' },
  { layer: 'Cloud', choice: 'Scaleway', licence: 'Service', why: 'French provider. Compute, PostgreSQL, storage and edge under one EU contract.' },
  { layer: 'Edge', choice: 'Scaleway Edge, DNS', licence: 'Service', why: 'Removes the last US operator from the request path.' },
  { layer: 'Source, CI', choice: 'GitLab, self-hosted', licence: 'MIT (CE)', why: 'Forge, pipelines and registry, run on our own infrastructure inside the estate.' },
  { layer: 'Infrastructure', choice: 'OpenTofu', licence: 'MPL-2.0', why: 'Linux Foundation fork of Terraform. Same language, open governance.' },
  { layer: 'Orchestration', choice: 'k3s', licence: 'Apache 2.0', why: 'Lightweight CNCF Kubernetes that runs the same on any provider.' },
  { layer: 'Delivery', choice: 'Flux CD', licence: 'Apache 2.0', why: 'Every production change is a reviewed commit the cluster pulls.' },
  { layer: 'Secrets', choice: 'OpenBao, ESO', licence: 'MPL-2.0, Apache 2.0', why: 'One store for platform and developer secrets, injected at runtime.' },
  { layer: 'Work tracking', choice: 'Plane, self-hosted', licence: 'AGPL-3.0', why: 'System of record for scope, agent activity and decisions.', href: '#delivery' },
  { layer: 'Containers', choice: 'Colima, Docker Engine', licence: 'MIT, Apache 2.0', why: 'Drops the proprietary desktop layer, keeps the standard Docker toolchain.' },
  { layer: 'Observability', choice: 'Grafana, Loki, VictoriaMetrics', licence: 'AGPL-3.0, Apache 2.0', why: 'Logs and metrics stay inside the estate they describe.' },
  { layer: 'Workstation', choice: 'chezmoi dotfiles', licence: 'MIT', why: 'One declared inventory installs every tool and the manifest agents read.' },
]

export default function MethodStack() {
  return (
    <section className="section section--sink" id="stack" data-accent="cyan">
      <Container>
        <SectionHeader
          subtitle="Every choice, and why"
          title="One stack, each component replaceable, none of it rented from outside the EU."
        />

        <table className="table table--stack">
          <thead>
            <tr>
              <th>Layer</th>
              <th>Choice</th>
              <th>Licence</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.layer}>
                <td className="vendor" data-label="Layer">{r.layer}</td>
                <td className="cred" data-label="Choice">{r.choice}</td>
                <td className="col-meta" data-label="Licence">{r.licence}</td>
                <td className="col-body" data-label="Why">
                  {r.why}
                  {r.href ? (
                    <>
                      {' '}
                      <a className="link-out" href={r.href}>See governed delivery</a>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="callout mstack__note">
          <span className="callout__label">On model origin</span>
          <p>
            GLM and Qwen are developed in China. Under the test, origin is context rather than
            verdict. The weights are published under MIT and Apache 2.0, run on infrastructure in
            Paris operated by a French provider, and send nothing to their developers. Where a
            client&rsquo;s policy prefers European-origin models, Mistral takes the primary role
            and the harness is unchanged, because the model is a configuration value, not an
            architectural commitment.
          </p>
        </div>
      </Container>
    </section>
  )
}
