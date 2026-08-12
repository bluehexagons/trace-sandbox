import { describe, expect, it } from 'vitest'
import { examples } from '../examples'
import {
  buildCustomAnimation,
  defaultSandboxSettings,
  resolveSandboxLocation,
} from './sandboxState'

describe('sandbox state', () => {
  it('loads the first lesson when no URL state is provided', () => {
    expect(resolveSandboxLocation('')).toEqual({
      selectedExample: 0,
      code: examples[0].code,
      args: examples[0].args ?? '',
      sandboxSettings: defaultSandboxSettings,
    })
  })

  it('uses custom code while retaining a known lesson selection', () => {
    const location = resolveSandboxLocation('?example=logistic-map&code=x%20%2B%201&args=2')
    const selectedExample = examples.findIndex(example => example.id === 'logistic-map')

    expect(location.selectedExample).toBe(selectedExample)
    expect(location.code).toBe('x + 1')
    expect(location.args).toBe('2')
  })

  it('normalizes out-of-range live frame rates restored from a URL', () => {
    expect(resolveSandboxLocation('?code=&run=persistent&fps=120').sandboxSettings.framesPerSecond)
      .toBe(60)
    expect(resolveSandboxLocation('?code=&run=persistent&fps=-5').sandboxSettings.framesPerSecond)
      .toBe(1)
  })

  it('builds live custom output from named channels', () => {
    const animation = buildCustomAnimation(null, {
      output: 3,
      logs: [],
      animationFrames: [{ values: { first: [1], second: [2] } }],
      time: 0,
      error: null,
    }, {
      ...defaultSandboxSettings,
      runMode: 'persistent',
      framesPerSecond: 120,
      yMin: 4,
      yMax: 4,
    })

    expect(animation).toMatchObject({
      kind: 'series',
      framesPerSecond: 60,
      yMin: 4,
      yMax: 5,
      lines: [
        { channel: 'first', label: 'first' },
        { channel: 'second', label: 'second' },
      ],
    })
  })

  it('does not create animation for one-shot or lesson runs', () => {
    expect(buildCustomAnimation(0, null, defaultSandboxSettings)).toBeUndefined()
    expect(buildCustomAnimation(null, null, defaultSandboxSettings)).toBeUndefined()
  })
})
