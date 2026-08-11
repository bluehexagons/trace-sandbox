import { describe, expect, it } from 'vitest'
import { examples, exampleSections } from '../examples'
import type { Example } from '../examples'
import { readArgumentValue } from '../interactive'
import { createTraceTickSession, parseArguments, runTraceScript } from '../traceRunner'

const runExample = (example: Example, argumentInput = example.args ?? '') => {
  const execution = example.animation?.execution
  if (execution?.mode !== 'live') {
    return runTraceScript(example.code, argumentInput)
  }

  const session = createTraceTickSession(example.code, argumentInput, execution.memoryChannels)
  const animationFrames = []
  let result = session.tick()
  animationFrames.push(...result.animationFrames)

  for (let frame = 1; frame < execution.frameCount && result.error === null; frame++) {
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

  it('reports a missing memory-backed animation array', () => {
    const result = createTraceTickSession('1', '', [
      { channel: 'samples', array: 'missing' },
    ]).tick()

    expect(result.error).toContain('missing Trace array "missing"')
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
      const argumentIndexes = example.controls?.items.map(control => control.argumentIndex) ?? []
      expect(new Set(argumentIndexes).size).toBe(argumentIndexes.length)

      for (const control of example.controls?.items ?? []) {
        expect(readArgumentValue(example.args ?? '', control.argumentIndex, NaN)).toBe(
          control.defaultValue,
        )
        expect(control.argumentIndex).toBeGreaterThanOrEqual(0)
        expect(control.min).toBeLessThanOrEqual(control.defaultValue)
        expect(control.max).toBeGreaterThanOrEqual(control.defaultValue)
        expect(control.step).toBeGreaterThan(0)
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
        expect(result.animationFrames.length).toBe(example.expectedValue)

        if (example.animation.kind === 'scene') {
          for (const point of example.animation.points) {
            expect(result.animationFrames[0].values[point.x]).toHaveLength(1)
            expect(result.animationFrames[0].values[point.y]).toHaveLength(1)
          }
        } else {
          expect(result.animationFrames[0].values[example.animation.channel].length).toBeGreaterThan(1)
        }
      }
    })
  }

  for (const example of examples.filter(example => example.controls !== undefined)) {
    it(`keeps ${example.name} within its declared interactive ranges`, () => {
      const controls = example.controls?.items ?? []
      const combinations = 2 ** controls.length
      const masks = example.animation?.kind === 'scene'
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
          } else if (example.animation?.kind === 'wave') {
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
