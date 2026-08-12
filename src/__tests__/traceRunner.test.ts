import { describe, expect, it } from 'vitest'
import { examples, exampleSections } from '../examples'
import type { Example } from '../examples'
import { readArgumentValue } from '../interactive'
import { createTraceTickSession, parseArguments, runTraceScript } from '../traceRunner'

const liveSampleFrames: Record<string, number> = {
  'orbital-system': 144,
  'lorenz-attractor': 280,
  'damped-wave': 72,
  'elementary-cellular-automaton': 41,
  'logistic-map': 180,
  'predator-prey': 260,
  'kicked-oscillator': 180,
  'sorting-visualizer': 120,
  'monte-carlo-pi': 120,
}

const runExample = (example: Example, argumentInput = example.args ?? '') => {
  const execution = example.animation?.execution
  if (execution?.mode !== 'live') {
    return runTraceScript(example.code, argumentInput)
  }

  const session = createTraceTickSession(example.code, argumentInput, execution.memoryChannels)
  const animationFrames = []
  let result = session.tick()
  animationFrames.push(...result.animationFrames)

  const sampleFrames = liveSampleFrames[example.id] ?? 3
  for (let frame = 1; frame < sampleFrames && result.error === null; frame++) {
    result = session.tick()
    animationFrames.push(...result.animationFrames)
  }

  return { ...result, animationFrames }
}

describe('trace runner', () => {
  it('parses whitespace-separated finite numeric arguments', () => {
    expect(parseArguments('  1\t2.5\n-3  ')).toEqual([1, 2.5, -3])
  })

  it('rejects invalid arguments instead of silently dropping them', () => {
    expect(() => parseArguments('1 nope 2')).toThrow(
      'Arguments must be finite numbers separated by spaces.',
    )
  })

  it('runs scripts with arguments and preserves console output', () => {
    expect(runTraceScript('[...] x = &1; @=x@; x * 2', '21')).toEqual({
      output: 42,
      logs: expect.arrayContaining([expect.stringContaining('21')]),
      animationFrames: [],
      time: expect.any(Number),
      error: null,
    })
  })

  it('collects frame markers and repeated named values as animation channels', () => {
    const result = runTraceScript(
      '@frame@; x = 1; @=x@; x = 2; @=x@; @frame@; x = 3; @=x@; 3',
      '',
    )

    expect(result.animationFrames).toEqual([
      { values: { x: [1, 2] } },
      { values: { x: [3] } },
    ])
    expect(result.logs).toEqual([])
  })

  it('runs one tick at a time with persistent state and memory-backed channels', () => {
    const session = createTraceTickSession(
      'initialized == 0 ? () => { output = [2]; output[2] = 3; initialized = 1 }; output[1] += output[2]; output[1]',
      '',
      [{ channel: 'samples', array: 'output' }],
    )

    expect(session.tick()).toMatchObject({
      output: 3,
      animationFrames: [{ values: { samples: [3, 3] } }],
      error: null,
    })
    expect(session.tick()).toMatchObject({
      output: 6,
      animationFrames: [{ values: { samples: [6, 3] } }],
      error: null,
    })
  })

  it('resolves script arguments during guarded first-tick initialization', () => {
    const session = createTraceTickSession(
      '[input] initialized == 0 ? value = input; initialized == 0 ? initialized = 1; value++',
      '7',
    )

    expect(session.tick().output).toBe(8)
    expect(session.tick().output).toBe(9)
  })

  it('reports a missing memory-backed animation array', () => {
    const result = createTraceTickSession('1', '', [
      { channel: 'samples', array: 'missing' },
    ]).tick()

    expect(result.error).toContain('missing Trace array "missing"')
  })

  it('continues ticking without a configured frame limit', () => {
    const session = createTraceTickSession(
      'initialized == 0 ? value = 0; initialized == 0 ? initialized = 1; value++',
      '',
    )

    let result = session.tick()
    for (let tick = 1; tick < 500; tick++) {
      result = session.tick()
    }

    expect(result).toMatchObject({ output: 500, error: null })
  })

  it('returns parse errors in the playground result shape', () => {
    expect(runTraceScript('1 > < 2', '')).toMatchObject({
      output: null,
      logs: [],
      time: 0,
    })
    expect(runTraceScript('1 > < 2', '').error).toContain('offset')
  })
})

describe('guided examples', () => {
  it('has a unique id and a populated section for every lesson', () => {
    expect(new Set(examples.map(example => example.id)).size).toBe(examples.length)

    for (const section of exampleSections) {
      expect(examples.some(example => example.section === section.id)).toBe(true)
    }

    for (const example of examples) {
      const items = example.controls?.items ?? []
      const argumentControls = items.filter(control => control.kind !== 'trigger')
      const triggers = items.filter(control => control.kind === 'trigger')
      const argumentIndexes = argumentControls.map(control => control.argumentIndex)
      expect(new Set(items.map(control => control.id)).size).toBe(items.length)
      expect(new Set(argumentIndexes).size).toBe(argumentIndexes.length)

      for (const control of argumentControls) {
        expect(readArgumentValue(example.args ?? '', control.argumentIndex, NaN)).toBe(
          control.defaultValue,
        )
        expect(control.argumentIndex).toBeGreaterThanOrEqual(0)
        expect(control.min).toBeLessThanOrEqual(control.defaultValue)
        expect(control.max).toBeGreaterThanOrEqual(control.defaultValue)
        expect(control.step).toBeGreaterThan(0)
      }

      for (const trigger of triggers) {
        expect(trigger.variable).toMatch(/^[a-zA-Z_][\w.]*$/)
        expect(Number.isFinite(trigger.amount)).toBe(true)
        expect(trigger.amount).not.toBe(0)
        expect(example.animation?.execution?.mode).toBe('live')
      }
    }
  })

  for (const example of examples) {
    it(`runs ${example.name}`, () => {
      const result = runExample(example)

      if (example.expectsError) {
        expect(result.error).not.toBeNull()
        return
      }

      expect(result.error).toBeNull()
      if (example.expectedValue !== undefined) {
        expect(result.output).toBeCloseTo(example.expectedValue, 10)
      }

      if (example.animation !== undefined) {
        expect(result.animationFrames.length).toBe(liveSampleFrames[example.id])

        if (example.animation.kind === 'scene') {
          for (const point of example.animation.points) {
            expect(result.animationFrames[0].values[point.x]).toHaveLength(1)
            expect(result.animationFrames[0].values[point.y]).toHaveLength(1)
          }
        } else if (example.animation.kind === 'series') {
          for (const line of example.animation.lines) {
            expect(result.animationFrames[0].values[line.channel]).toHaveLength(1)
          }
        } else {
          expect(result.animationFrames[0].values[example.animation.channel].length).toBeGreaterThan(1)
        }
      }
    })
  }

  for (const example of examples.filter(example => example.animation?.execution?.mode === 'live')) {
    it(`advances ${example.name} between live ticks`, () => {
      const execution = example.animation?.execution
      const session = createTraceTickSession(
        example.code,
        example.args ?? '',
        execution?.memoryChannels,
      )

      const first = session.tick()
      const second = session.tick()
      expect(first.error).toBeNull()
      expect(second.error).toBeNull()
      expect(second.animationFrames[0]?.values).not.toEqual(first.animationFrames[0]?.values)
    })
  }

  for (const example of examples.filter(example =>
    example.controls?.items.some(control => control.kind === 'trigger'),
  )) {
    it(`consumes live actions in ${example.name}`, () => {
      const session = createTraceTickSession(
        example.code,
        example.args ?? '',
        example.animation?.execution?.memoryChannels,
      )
      expect(session.tick().error).toBeNull()

      for (const control of example.controls?.items ?? []) {
        if (control.kind !== 'trigger') continue
        expect(session.addToVariable(control.variable, control.amount)).toBe(true)
        expect(session.tick().error).toBeNull()
        expect(session.getVariable(control.variable)).toBe(0)
      }
    })
  }

  for (const example of examples.filter(example => example.controls !== undefined)) {
    it(`keeps ${example.name} within its declared interactive ranges`, () => {
      const controls = (example.controls?.items ?? []).filter(
        control => control.kind !== 'trigger',
      )
      const combinations = 2 ** controls.length
      const masks = example.animation?.kind === 'scene' || example.animation?.kind === 'series'
        ? Array.from({ length: combinations }, (_, mask) => mask)
        : [0, combinations - 1]

      for (const mask of masks) {
        const args: number[] = []
        controls.forEach((control, index) => {
          args[control.argumentIndex] = mask & (1 << index) ? control.max : control.min
        })

        const result = runExample(example, args.join(' '))
        expect(result.error).toBeNull()

        for (const frame of result.animationFrames) {
          for (const values of Object.values(frame.values)) {
            expect(values.every(Number.isFinite)).toBe(true)
          }

          if (example.animation?.kind === 'scene') {
            for (const point of example.animation.points) {
              const x = frame.values[point.x][0]
              const y = frame.values[point.y][0]
              expect(x).toBeGreaterThanOrEqual(example.animation.xMin)
              expect(x).toBeLessThanOrEqual(example.animation.xMax)
              expect(y).toBeGreaterThanOrEqual(example.animation.yMin)
              expect(y).toBeLessThanOrEqual(example.animation.yMax)
            }
          } else if (example.animation?.kind === 'series') {
            for (const line of example.animation.lines) {
              const value = frame.values[line.channel][0]
              expect(value).toBeGreaterThanOrEqual(example.animation.yMin)
              expect(value).toBeLessThanOrEqual(example.animation.yMax)
            }
          } else if (example.animation?.kind === 'wave') {
            for (const value of frame.values[example.animation.channel]) {
              expect(value).toBeGreaterThanOrEqual(example.animation.min)
              expect(value).toBeLessThanOrEqual(example.animation.max)
            }
          } else if (example.animation?.kind === 'bars') {
            for (const value of frame.values[example.animation.channel]) {
              expect(value).toBeGreaterThanOrEqual(example.animation.min)
              expect(value).toBeLessThanOrEqual(example.animation.max)
            }
          }
        }
      }
    })
  }
})
