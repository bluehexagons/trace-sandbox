import { describe, it, expect } from 'vitest'
import { Trace, runTrace } from 'trace'

describe('trace language', () => {
  describe('basic arithmetic', () => {
    it('adds two numbers', () => {
      expect(runTrace('1 + 10')).toBe(11)
    })

    it('subtracts numbers', () => {
      expect(runTrace('10 - 3')).toBe(7)
    })

    it('multiplies numbers', () => {
      expect(runTrace('4 * 5')).toBe(20)
    })

    it('divides numbers', () => {
      expect(runTrace('10 / 4')).toBe(2.5)
    })

    it('respects order of operations', () => {
      expect(runTrace('2 * (2 * 3) + 12')).toBe(24)
    })

    it('supports exponentiation', () => {
      expect(runTrace('2 ** 8')).toBe(256)
    })

    it('supports modulus (%%)', () => {
      expect(runTrace('10 %% 3')).toBe(1)
    })
  })

  describe('variables', () => {
    it('assigns and reads a variable', () => {
      expect(runTrace('x = 5; x * 2')).toBe(10)
    })

    it('supports +=', () => {
      expect(runTrace('x = 5; x += 3; x')).toBe(8)
    })

    it('supports ++', () => {
      expect(runTrace('x = 0; x++; x')).toBe(1)
    })
  })

  describe('conditionals', () => {
    it('ternary true branch', () => {
      expect(runTrace('5 > 3 ? 1 : 0')).toBe(1)
    })

    it('ternary false branch', () => {
      expect(runTrace('2 > 3 ? 1 : 0')).toBe(0)
    })

    it('equality check', () => {
      expect(runTrace('5 == 5')).toBe(1)
    })

    it('inequality check', () => {
      expect(runTrace('5 != 4')).toBe(1)
    })
  })

  describe('loops (anonymous recursive functions)', () => {
    it('counts to 10 with anonymous self-call', () => {
      expect(runTrace('q = 0; () => { q++; q < 10 ? >() }; q')).toBe(10)
    })

    it('counts to 10 with named function', () => {
      expect(runTrace('add() => { q++; q < 10 ? >add() }; q = 0; add(); q')).toBe(10)
    })
  })

  describe('script arguments', () => {
    it('sums arguments passed to the script', () => {
      const result = runTrace(
        '[...] t = 0; i = 1; &0 > 0 ? () => { t += &i; i++ <= &0 ? () : t }',
        1, 2, 3, 4,
      )
      expect(result).toBe(10)
    })
  })

  describe('Trace class API', () => {
    it('parses and runs a script via Trace.parse()', () => {
      const t = Trace.parse('x = 5; x * 2')
      expect(t.run()).toBe(10)
    })

    it('collects echo (@…@) output via logger override', () => {
      const logs: string[] = []
      const t = Trace.parse('x = 42; @=x@; x')
      t.logger = (_token: string, ...args: unknown[]) =>
        logs.push(args.map(String).join(' '))
      t.run()
      expect(logs.some(l => l.includes('42'))).toBe(true)
    })
  })

  describe('arrays', () => {
    it('creates array and reads size', () => {
      expect(runTrace('arr = [3]; arr')).toBe(3)
    })

    it('reads array element', () => {
      expect(runTrace('arr = [3]; arr[1] = 10; arr[1]')).toBe(10)
    })

    it('writes array element', () => {
      expect(runTrace('arr = [3]; arr[1] = 10; arr[2] = 20; arr[1] + arr[2]')).toBe(30)
    })

    it('supports compound assignment on array elements', () => {
      expect(runTrace('arr = [3]; arr[1] = 5; arr[1] += 3; arr[1]')).toBe(8)
    })
  })

  describe('syntax errors', () => {
    it('throws error for invalid syntax', () => {
      expect(() => Trace.parse('1 > < 2')).toThrow()
    })

    it('error message includes offset and pointer', () => {
      try {
        Trace.parse('1 > < 2')
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        expect(msg).toContain('offset')
        expect(msg).toContain('^')
      }
    })
  })

  describe('first-class functions', () => {
    it('stores function reference in variable', () => {
      expect(runTrace('double(x) => { x * 2 }; f = double; f(5)')).toBe(10)
    })

    it('passes function as argument', () => {
      expect(runTrace('double(x) => { x * 2 }; apply(fn, x) => { fn(x) }; apply(double, 5)')).toBe(10)
    })
  })
})
