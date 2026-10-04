/**
 * The modernisation path. A meta panel holding an ordered list:
 * four stages, then the three conditions every stage runs under.
 * The numerals read --sec from the hero that contains it.
 */

const STEPS = [
  { n: '01', t: 'Read', p: 'The codebase read end to end, and what it does explained in business terms.' },
  { n: '02', t: 'Map', p: 'Dependencies, risks and dead code mapped before a line is changed.' },
  { n: '03', t: 'Rebuild', p: 'Module by module, highest cost and risk first rather than oldest first.' },
  { n: '04', t: 'Verify', p: 'New behaviour proven equivalent to old before anything reaches production.' },
] as const

const CONDITIONS = ['Open weights', 'Your infrastructure', 'Your release process'] as const

export default function ModernisationPath() {
  return (
    <div className="mpath">
      <div className="mpath__hd">
        <span>Modernisation path</span>
        <span>In your estate</span>
      </div>
      <ol>
        {STEPS.map((s) => (
          <li className="mpath__step" key={s.n}>
            <span className="mpath__n">{s.n}</span>
            <div>
              <h3>{s.t}</h3>
              <p>{s.p}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mpath__ft">
        {CONDITIONS.map((c) => <span key={c}>{c}</span>)}
      </div>
    </div>
  )
}
