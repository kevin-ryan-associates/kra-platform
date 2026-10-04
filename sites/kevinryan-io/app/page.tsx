import type { Metadata } from 'next'
import ModernisationHero from '@/components/sections/ModernisationHero'
import PropositionsHero from '@/components/sections/PropositionsHero'
import OurCapabilities from '@/components/sections/OurCapabilities'
import ModernisationAssessment from '@/components/sections/ModernisationAssessment'

export const metadata: Metadata = {
  description:
    'Modernise the systems you cannot afford to break. AI-native legacy modernisation on open-weight models, on infrastructure you control, through your own release process.',
}

export default function Page() {
  return (
    <main>
      <ModernisationHero />
      <PropositionsHero />
      <OurCapabilities />
      <ModernisationAssessment />
    </main>
  )
}
