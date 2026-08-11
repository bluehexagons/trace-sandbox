import { Trace } from 'trace'
import type { AnimationFrame } from './animation'

export interface PlaygroundResult {
  output: number | null
  logs: string[]
  animationFrames: AnimationFrame[]
  time: number
  error: string | null
}

export function parseArguments(input: string): number[] {
  const trimmed = input.trim()
  if (trimmed === '') {
    return []
  }

  const args = trimmed.split(/\s+/).map(Number)
  if (args.some(arg => !Number.isFinite(arg))) {
    throw new Error('Arguments must be finite numbers separated by spaces.')
  }

  return args
}

export function runTraceScript(code: string, argumentInput: string): PlaygroundResult {
  const logs: string[] = []
  const animationFrames: AnimationFrame[] = []

  try {
    const trace = Trace.parse(code)
    trace.logger = (...messages: unknown[]) => {
      const channel = messages[1]
      const value = messages[2]

      if (messages.length === 2 && channel === 'frame') {
        animationFrames.push({ values: {} })
        return
      }

      const currentFrame = animationFrames.at(-1)
      if (
        currentFrame !== undefined &&
        typeof channel === 'string' &&
        typeof value === 'number' &&
        Number.isFinite(value)
      ) {
        const values = currentFrame.values[channel] ?? []
        values.push(value)
        currentFrame.values[channel] = values
        return
      }

      logs.push(messages.map(String).join(' '))
    }
    trace.errorLogger = (...messages: unknown[]) => {
      logs.push(`⚠ ${messages.map(String).join(' ')}`)
    }

    const execution = trace.runWithOptions({ args: parseArguments(argumentInput) })
    if (execution.status !== 'completed') {
      return {
        output: null,
        logs,
        animationFrames,
        time: execution.runtimeMs,
        error: execution.error ?? `Execution ${execution.status}.`,
      }
    }

    return {
      output: execution.value,
      logs,
      animationFrames,
      time: execution.runtimeMs,
      error: null,
    }
  } catch (error) {
    return {
      output: null,
      logs,
      animationFrames,
      time: 0,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
