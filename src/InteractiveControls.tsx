import { readArgumentValue } from './interactive'
import type { InteractiveControl, InteractiveControls as ControlsConfig } from './interactive'

interface InteractiveControlsProps {
  args: string
  controls: ControlsConfig
  exampleId: string
  onChange: (control: InteractiveControl, value: number) => void
}

export default function InteractiveControls({
  args,
  controls,
  exampleId,
  onChange,
}: InteractiveControlsProps) {
  return (
    <section className="interactive-panel" aria-labelledby="interactive-controls-title">
      <div className="interactive-heading">
        <div>
          <h3 id="interactive-controls-title">Interactive controls</h3>
          <p>{controls.description}</p>
        </div>
        {controls.autoRun && <span>Auto-runs after changes</span>}
      </div>
      <div className="interactive-grid">
        {controls.items.map(control => {
          const value = readArgumentValue(args, control.argumentIndex, control.defaultValue)
          const inputId = `control-${exampleId}-${control.id}`

          return (
            <div className="interactive-control" key={control.id}>
              <div className="interactive-label-row">
                <label htmlFor={inputId}>{control.label}</label>
                <output htmlFor={inputId}>{value}</output>
              </div>
              <p>{control.description}</p>
              <div className="interactive-inputs">
                {control.kind === 'range' && (
                  <input
                    id={inputId}
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={value}
                    onChange={event => onChange(control, event.currentTarget.valueAsNumber)}
                  />
                )}
                <input
                  id={control.kind === 'number' ? inputId : `${inputId}-number`}
                  className="interactive-number"
                  type="number"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={value}
                  onChange={event => onChange(control, event.currentTarget.valueAsNumber)}
                  aria-label={control.kind === 'range' ? `${control.label} numeric value` : undefined}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
