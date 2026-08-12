import { readArgumentValue } from './interactive'
import type {
  InteractiveArgumentControl,
  InteractiveControls as ControlsConfig,
  InteractiveTriggerControl,
} from './interactive'

interface InteractiveControlsProps {
  args: string
  controls: ControlsConfig
  exampleId: string
  onChange: (control: InteractiveArgumentControl, value: number) => void
  onTrigger?: (control: InteractiveTriggerControl) => void
  liveActionsEnabled?: boolean
}

export default function InteractiveControls({
  args,
  controls,
  exampleId,
  onChange,
  onTrigger,
  liveActionsEnabled = false,
}: InteractiveControlsProps) {
  const hasLiveActions = controls.items.some(control => control.kind === 'trigger')
  const hasLiveArguments = controls.items.some(
    control => control.kind !== 'trigger' && control.liveVariable !== undefined,
  )
  const hasRestartArguments = controls.items.some(
    control => control.kind !== 'trigger' && control.liveVariable === undefined,
  )

  const statusLabel = hasLiveActions
    ? `${hasRestartArguments ? 'Some sliders restart' : 'Sliders update live'} · Actions run live`
    : hasLiveArguments
      ? 'Sliders update live'
      : controls.autoRun
        ? 'Auto-runs after changes'
        : ''

  return (
    <section className="interactive-panel" aria-labelledby="interactive-controls-title">
      <div className="interactive-heading">
        <div>
          <h3 id="interactive-controls-title">Interactive controls</h3>
          <p>{controls.description}</p>
        </div>
        {statusLabel !== '' && <span>{statusLabel}</span>}
      </div>
      <div className="interactive-grid">
        {controls.items.map(control => {
          if (control.kind === 'trigger') {
            return (
              <div className="interactive-control interactive-trigger" key={control.id}>
                <div className="interactive-label-row">
                  <span className="interactive-trigger-label">{control.label}</span>
                  <span className="interactive-live-label">Live action</span>
                </div>
                <p>{control.description}</p>
                <button
                  type="button"
                  onClick={() => onTrigger?.(control)}
                  disabled={!liveActionsEnabled || onTrigger === undefined}
                >
                  {control.buttonLabel}
                </button>
              </div>
            )
          }

          const value = readArgumentValue(args, control.argumentIndex, control.defaultValue)
          const inputId = `control-${exampleId}-${control.id}`

          return (
            <div className="interactive-control" key={control.id}>
              <div className="interactive-label-row">
                <label htmlFor={inputId}>{control.label}</label>
                {control.liveVariable !== undefined && (
                  <span className="interactive-live-label">Live</span>
                )}
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
