import { Trace, TraceMemory } from 'trace'
import type { AnimationFrame, MemoryAnimationChannel } from './animation'

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

const errorResult = (
  error: unknown,
  logs: string[] = [],
  animationFrames: AnimationFrame[] = [],
): PlaygroundResult => ({
  output: null,
  logs,
  animationFrames,
  time: 0,
  error: error instanceof Error ? error.message : String(error),
})

const attachLogger = (
  trace: Trace,
  logs: string[],
  animationFrames: AnimationFrame[],
  oneFramePerRun: boolean,
) => {
  trace.logger = (...messages: unknown[]) => {
    const channel = messages[1]
    const value = messages[2]

    if (messages.length === 2 && channel === 'frame') {
      if (!oneFramePerRun) {
        animationFrames.push({ values: {} })
      }
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
}

export class TraceTickSession {
  private readonly trace: Trace | null
  private readonly memory = new TraceMemory()
  private readonly args: number[]
  private readonly parseError: string | null
  private readonly memoryChannels: readonly MemoryAnimationChannel[]

  constructor(
    code: string,
    argumentInput: string,
    memoryChannels: readonly MemoryAnimationChannel[] = [],
  ) {
    this.memoryChannels = memoryChannels
    try {
      this.trace = Trace.parse(code)
      this.args = parseArguments(argumentInput)
      this.parseError = null
    } catch (error) {
      this.trace = null
      this.args = []
      this.parseError = error instanceof Error ? error.message : String(error)
    }
  }

  tick(): PlaygroundResult {
    if (this.trace === null) {
      return errorResult(this.parseError ?? 'Unable to parse Trace code.')
    }

    const logs: string[] = []
    const frame: AnimationFrame = { values: {} }
    attachLogger(this.trace, logs, [frame], true)

    const execution = this.trace.runWithOptions({ args: this.args, memory: this.memory })
    if (execution.status !== 'completed') {
      return {
        output: null,
        logs,
        animationFrames: [],
        time: execution.runtimeMs,
        error: execution.error ?? `Execution ${execution.status}.`,
      }
    }

    for (const source of this.memoryChannels) {
      const buffer = this.memory.getArray(source.array)
      if (buffer === undefined) {
        return {
          output: execution.value,
          logs,
          animationFrames: [],
          time: execution.runtimeMs,
          error: `Animation channel "${source.channel}" reads missing Trace array "${source.array}".`,
        }
      }
      frame.values[source.channel] = Array.from(buffer.subarray(1))
    }

    return {
      output: execution.value,
      logs,
      animationFrames: [frame],
      time: execution.runtimeMs,
      error: null,
    }
  }
}

export const createTraceTickSession = (
  code: string,
  argumentInput: string,
  memoryChannels: readonly MemoryAnimationChannel[] = [],
) => new TraceTickSession(code, argumentInput, memoryChannels)

export function runTraceScript(code: string, argumentInput: string): PlaygroundResult {
  const logs: string[] = []
  const animationFrames: AnimationFrame[] = []

  try {
    const trace = Trace.parse(code)
    attachLogger(trace, logs, animationFrames, false)

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
    return errorResult(error, logs, animationFrames)
  }
}
