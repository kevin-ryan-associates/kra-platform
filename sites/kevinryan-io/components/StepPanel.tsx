/**
 * A step panel. A meta panel holding an ordered list: a head, the
 * numbered steps, and an optional foot naming the conditions every
 * step runs under. Numerals read --sec from the section around it.
 * See design-spec/theme-spec.md B43.
 */

export type Step = { n: string; t: string; p: string }

export default function StepPanel({
  head,
  steps,
  foot,
}: {
  head: readonly [string, string]
  steps: readonly Step[]
  foot?: readonly string[]
}) {
  return (
    <div className="steps">
      <div className="steps__hd">
        <span>{head[0]}</span>
        <span>{head[1]}</span>
      </div>
      <ol>
        {steps.map((s) => (
          <li className="steps__item" key={s.n}>
            <span className="steps__n">{s.n}</span>
            <div>
              <h3>{s.t}</h3>
              <p>{s.p}</p>
            </div>
          </li>
        ))}
      </ol>
      {foot ? (
        <div className="steps__ft">
          {foot.map((f) => <span key={f}>{f}</span>)}
        </div>
      ) : null}
    </div>
  )
}
