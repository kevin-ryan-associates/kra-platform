'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MouseEvent } from "react"

/**
 * Left-aligned four-button nav: Home, Method, Contact, Kevin. No wordmark,
 * no section-locus readout. All four are internal routes; clicking one returns
 * to the start of that page — when already on the target page a plain <Link>
 * to the same route is a no-op, so we intercept and smooth-scroll to top.
 */
export default function SiteHeader(): React.JSX.Element {
  const pathname = usePathname()

  const goTop = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    // Normalise current path to match the link's `href` form (no trailing slash).
    const current = pathname.replace(/\/$/, '') || '/'
    if (current === href) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    // Otherwise let next/link navigate; Next scrolls to top on route change.
  }

  return (
    <header className="topbar">
      <nav className="topbar__nav">
        <Link className="tool" href="/" onClick={(e) => goTop(e, '/')}>Home</Link>
        <Link className="tool" href="/method" onClick={(e) => goTop(e, '/method')}>Method</Link>
        <Link className="tool" href="/contact" onClick={(e) => goTop(e, '/contact')}>Contact</Link>
        <Link className="tool" href="/kevin" onClick={(e) => goTop(e, '/kevin')}>Kevin</Link>
      </nav>
    </header>
  )
}