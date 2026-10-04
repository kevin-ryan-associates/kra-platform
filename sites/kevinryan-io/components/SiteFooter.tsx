export default function SiteFooter(): React.JSX.Element {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="site-footer__inner">
          <span>© {new Date().getFullYear()} Kevin Ryan &amp; Associates. All rights reserved.</span>
          <span>{process.env.NEXT_PUBLIC_COMMIT_SHA}</span>
          <span>
            Amsterdam · Budapest · Dublin · London ·{' '}
            <a href="https://hq.kevinryan.io/" target="_blank" rel="noopener noreferrer">HQ</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
