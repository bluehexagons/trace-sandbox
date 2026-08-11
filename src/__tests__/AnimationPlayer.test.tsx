import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import AnimationPlayer from '../AnimationPlayer'
import type { AnimationFrame, AnimationSpec } from '../animation'

const frames: AnimationFrame[] = [
  { values: { x: [1], y: [2], sample: [0, 1, 0], cell: [0, 1, 0] } },
  { values: { x: [2], y: [3], sample: [1, 0, -1], cell: [1, 1, 0] } },
]

const base = {
  title: 'Test animation',
  description: 'Rendered from Trace output.',
  framesPerSecond: 12,
}

describe('animation player', () => {
  it.each<AnimationSpec>([
    {
      ...base,
      kind: 'scene',
      xMin: 0,
      xMax: 10,
      yMin: 0,
      yMax: 10,
      trailLength: 2,
      points: [{ x: 'x', y: 'y', color: '#fff', label: 'Point' }],
    },
    {
      ...base,
      kind: 'wave',
      channel: 'sample',
      min: -1,
      max: 1,
      trailLength: 2,
      color: '#fff',
    },
    {
      ...base,
      kind: 'cells',
      channel: 'cell',
      historyRows: 2,
      color: '#fff',
    },
  ])('renders $kind output as an accessible SVG with playback controls', spec => {
    const markup = renderToStaticMarkup(<AnimationPlayer frames={frames} spec={spec} />)

    expect(markup).toContain('<svg')
    expect(markup).toContain('aria-label="Test animation"')
    expect(markup).toContain('Frame 1 / 2')
    expect(markup).toContain('Restart')
  })

  it('shows the configured live frame count before later ticks are generated', () => {
    const spec: AnimationSpec = {
      ...base,
      kind: 'wave',
      channel: 'sample',
      min: -1,
      max: 1,
      trailLength: 2,
      color: '#fff',
      execution: { mode: 'live', frameCount: 20 },
    }

    const markup = renderToStaticMarkup(
      <AnimationPlayer frames={frames.slice(0, 1)} spec={spec} onTick={() => null} />,
    )

    expect(markup).toContain('Frame 1 / 20')
  })
})
