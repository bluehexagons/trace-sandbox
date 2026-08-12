import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import InteractiveControls from '../InteractiveControls'
import { readArgumentValue, writeArgumentValue } from '../interactive'
import type {
  InteractiveArgumentControl,
  InteractiveControls as ControlsConfig,
} from '../interactive'

const argumentControls: InteractiveArgumentControl[] = [
  {
    id: 'speed',
    label: 'Speed',
    description: 'How quickly the model advances.',
    argumentIndex: 0,
    kind: 'range',
    defaultValue: 2,
    min: 1,
    max: 5,
    step: 0.5,
  },
  {
    id: 'count',
    label: 'Count',
    description: 'How many items to create.',
    argumentIndex: 1,
    kind: 'number',
    defaultValue: 10,
    min: 1,
    max: 20,
    step: 1,
  },
]

const controls: ControlsConfig = {
  description: 'Tune the model.',
  autoRun: true,
  items: [
    ...argumentControls,
    {
      id: 'pulse',
      label: 'Pulse',
      description: 'Affect the running model.',
      kind: 'trigger',
      variable: 'pulseTrigger',
      amount: 1,
      buttonLabel: 'Trigger pulse',
    },
  ],
}

describe('interactive argument controls', () => {
  it('reads finite arguments and falls back for missing values', () => {
    expect(readArgumentValue('3.5', 0, 2)).toBe(3.5)
    expect(readArgumentValue('3.5', 1, 10)).toBe(10)
  })

  it('updates one argument, fills configured defaults, and clamps the result', () => {
    expect(writeArgumentValue('', argumentControls[1], 30, controls.items)).toBe('2 20')
    expect(writeArgumentValue('3 10 99', argumentControls[0], 4.5, controls.items)).toBe('4.5 10 99')
    expect(writeArgumentValue('3 10', argumentControls[0], NaN, controls.items)).toBe('3 10')
  })

  it('renders range and numeric inputs with the current argument values', () => {
    const markup = renderToStaticMarkup(
      <InteractiveControls
        args="3.5 12"
        controls={controls}
        exampleId="test"
        onChange={vi.fn()}
        onTrigger={vi.fn()}
        liveActionsEnabled
      />,
    )

    expect(markup).toContain('Interactive controls')
    expect(markup).toContain('Sliders restart · Actions run live')
    expect(markup).toContain('type="range"')
    expect(markup).toContain('value="3.5"')
    expect(markup).toContain('value="12"')
    expect(markup).toContain('Trigger pulse')
    expect(markup).not.toContain('disabled')
  })
})
