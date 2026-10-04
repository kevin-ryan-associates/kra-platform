import type { Metadata } from 'next'
import MethodHero from '@/components/sections/method/MethodHero'
import MethodExposure from '@/components/sections/method/MethodExposure'
import MethodTest from '@/components/sections/method/MethodTest'
import MethodStack from '@/components/sections/method/MethodStack'
import MethodDelivery from '@/components/sections/method/MethodDelivery'
import MethodRegulated from '@/components/sections/method/MethodRegulated'
import MethodEngagement from '@/components/sections/method/MethodEngagement'
import MethodInAction from '@/components/sections/method/MethodInAction'

export const metadata: Metadata = {
  title: 'Method',
  description:
    'Sovereign AI-Native Engineering. The sovereignty test, every component in the stack and why, governed delivery with a complete provenance record, and what it produces for DORA, NIS2, the Cyber Resilience Act and the EU AI Act.',
}

export default function Page() {
  return (
    <main>
      <MethodHero />
      <MethodExposure />
      <MethodTest />
      <MethodStack />
      <MethodDelivery />
      <MethodRegulated />
      <MethodEngagement />
      <MethodInAction />
    </main>
  )
}
