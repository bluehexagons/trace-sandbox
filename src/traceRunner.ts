import { Trace } from 'trace'

export interface PlaygroundResult {
  output: number | null
  logs: string[]
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

  try {
    const trace = Trace.parse(code)
    trace.logger = (...messages: unknown[]) => {
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
        time: execution.runtimeMs,
        error: execution.error ?? `Execution ${execution.status}.`,
      }
    }

    return {
      output: execution.value,
      logs,
      time: execution.runtimeMs,
      error: null,
    }
  } catch (error) {
    return {
      output: null,
      logs,
      time: 0,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
