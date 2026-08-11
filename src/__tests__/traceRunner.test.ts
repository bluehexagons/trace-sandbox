import { describe, expect, it } from 'vitest'
import { examples, exampleSections } from '../examples'
import { parseArguments, runTraceScript } from '../traceRunner'

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
      time: expect.any(Number),
      error: null,
    })
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
  })

  for (const example of examples) {
    it(`runs ${example.name}`, () => {
      const result = runTraceScript(example.code, example.args ?? '')

      if (example.expectsError) {
        expect(result.error).not.toBeNull()
        return
      }

      expect(result.error).toBeNull()
      if (example.expectedValue !== undefined) {
        expect(result.output).toBeCloseTo(example.expectedValue, 10)
      }
    })
  }
})
