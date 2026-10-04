import Container from '@/components/Container'
import SectionHeader from '@/components/SectionHeader'

type Row = { vendor?: string; cred: string; via: string; href?: string }

const ROWS: Row[] = [
  { vendor: 'Anthropic', cred: 'Claude Certified Associate', via: 'Credly', href: 'https://www.credly.com/badges/3ac48a7b-ce0f-49df-b32d-3bf47e8203b3/public_url' },
  { cred: 'Claude Partner - Claude Code', via: 'Credly', href: 'https://www.credly.com/badges/2922627c-5a15-4d9b-97b7-a6de2149ae09/public_url' },

  { vendor: 'GitHub', cred: 'Administration', via: 'Credly', href: 'https://www.credly.com/badges/02e9c449-9385-4c95-9cfa-e72765f0d4de' },
  { cred: 'Actions', via: 'Credly', href: 'https://www.credly.com/badges/b4a9987d-3a31-4cf3-8ee9-53607a4ef572' },
  { cred: 'Advanced Security', via: 'Credly', href: 'https://www.credly.com/badges/74bdfd55-a572-46a9-9c00-5d4158385ca9' },
  { cred: 'Foundations', via: 'Credly', href: 'https://www.credly.com/badges/2cf756b5-013f-4336-adda-1af6ce3c11c8/public_url' },

  { vendor: 'GitLab', cred: 'Partner Technical Engineer', via: 'Credly', href: 'https://www.credly.com/badges/60bf5ece-b4b0-4bec-9c56-fc4d227fc689' },
  { cred: 'DevOps Professional', via: 'Credly', href: 'https://www.credly.com/badges/73b62343-d671-4477-b412-2d833dc4ea42/public_url' },
  { cred: 'Security Specialist', via: 'Credly', href: 'https://www.credly.com/badges/a64f651f-aa8c-4000-bf6e-9e5d3070dcb6/public_url' },
  { cred: 'Services Engineer Professional', via: 'Credly', href: 'https://www.credly.com/badges/90be4ffc-c869-4d0c-8143-99fcbe7099d5/public_url' },
  { cred: 'Migration Services Specialist', via: 'Credly', href: 'https://www.credly.com/badges/5ed58594-5438-45df-b57a-f2f8ef7435eb/public_url' },
  { cred: 'CI/CD Associate', via: 'Credly', href: 'https://www.credly.com/badges/9340463c-a5d4-418e-9342-c18b145344e4/public_url' },

  { vendor: 'LaunchDarkly', cred: 'Platinum Developer', via: 'Skilljar', href: 'https://verify.skilljar.com/c/b7tc7cjjjdv9' },
  { cred: 'Gold Developer', via: 'Skilljar', href: 'https://verify.skilljar.com/c/xvvkdsp227on' },
  { cred: 'Silver Developer', via: 'Skilljar', href: 'https://verify.skilljar.com/c/cw4ix2japf23' },
  { cred: 'Bronze Developer', via: 'Skilljar', href: 'https://verify.skilljar.com/c/8m35pkrme9s8' },

  { vendor: 'Education', cred: 'Hons, Digital Media', via: 'Birmingham City' },
  { cred: 'AI and Ethics', via: 'Trinity Dublin' },
  { cred: 'MA Applied Linguistics', via: 'Pannonia · planned' },
]

export default function CertificationsSection() {
  return (
    <section className="section section--sink" id="certs" data-accent="green">
      <Container>
        <SectionHeader subtitle="Certifications" title="Verified expertise" />

        <table className="table">
          <thead>
            <tr>
              <th className="th--vendor">Vendor</th>
              <th>Credential</th>
              <th className="th--go">Verify</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.cred}>
                <td className="vendor">{r.vendor ?? ''}</td>
                <td className="cred">{r.cred}</td>
                <td className="go">
                  {r.href ? (
                    <a href={r.href} target="_blank" rel="noopener noreferrer">{r.via} ↗</a>
                  ) : (
                    r.via
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="callout certs-callout">
          <span className="callout__label">UK Agile Awards · 2014</span>
          <p>
            <strong>Best Use of Agile in the Private Sector.</strong> National recognition for
            enterprise agile delivery excellence.
          </p>
        </div>
      </Container>
    </section>
  )
}
