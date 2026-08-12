import { Trace, TraceMemory } from 'trace'
import type { AnimationFrame, LiveAnimationExecution } from './animation'

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
  private readonly setupCall: Trace | null
  private readonly setupArgumentNames: string[]
  private readonly tickCall: Trace | null
  private readonly memory = new TraceMemory()
  private readonly args: number[]
  private readonly parseError: string | null
  private readonly execution: LiveAnimationExecution
  private prepared = false

  constructor(
    code: string,
    argumentInput: string,
    execution: LiveAnimationExecution = { mode: 'live' },
  ) {
    this.execution = execution
    try {
      this.trace = Trace.parse(code)
      this.args = parseArguments(argumentInput)
      const functionNames = [execution.setupFunction, execution.tickFunction]
        .filter((name): name is string => name !== undefined)
      const invalidFunction = functionNames.find(name => !/^[a-zA-Z_][\w.]*$/.test(name))
      this.parseError = invalidFunction === undefined
        ? null
        : `Invalid live function name "${invalidFunction}".`
      this.setupArgumentNames = this.args.map((_, index) => `__sandbox_arg_${index + 1}`)
      this.setupCall = execution.setupFunction === undefined || invalidFunction !== undefined
        ? null
        : Trace.parse(`${execution.setupFunction}(${this.setupArgumentNames.join(',')})`)
      this.tickCall = execution.tickFunction === undefined || invalidFunction !== undefined
        ? null
        : Trace.parse(`${execution.tickFunction}()`)
    } catch (error) {
      this.trace = null
      this.setupCall = null
      this.setupArgumentNames = []
      this.tickCall = null
      this.args = []
      this.parseError = error instanceof Error ? error.message : String(error)
    }
  }

  tick(): PlaygroundResult {
    if (this.trace === null || this.parseError !== null) {
      return errorResult(this.parseError ?? 'Unable to parse Trace code.')
    }

    const logs: string[] = []
    const frame: AnimationFrame = { values: {} }
    attachLogger(this.trace, logs, [frame], true)

    let runtimeMs = 0
    const run = (trace: Trace, args: number[] = []) => {
      attachLogger(trace, logs, [frame], true)
      const result = trace.runWithOptions({ args, memory: this.memory })
      runtimeMs += result.runtimeMs
      return result
    }
    const runError = (status: string, error?: string): PlaygroundResult => ({
      output: null,
      logs,
      animationFrames: [],
      time: runtimeMs,
      error: error ?? `Execution ${status}.`,
    })

    if (this.execution.tickFunction !== undefined && !this.prepared) {
      const registration = run(this.trace)
      if (registration.status !== 'completed') {
        return runError(registration.status, registration.error)
      }

      for (const fn of this.memory.functions.values()) {
        attachLogger(fn, logs, [frame], true)
      }

      if (this.execution.setupFunction !== undefined) {
        if (!this.memory.functions.has(this.execution.setupFunction) || this.setupCall === null) {
          return runError('error', `Live setup function "${this.execution.setupFunction}" is not defined.`)
        }
        this.setupArgumentNames.forEach((name, index) => {
          this.memory.variables.set(name, this.args[index])
        })
        const setupResult = run(this.setupCall)
        this.setupArgumentNames.forEach(name => this.memory.variables.delete(name))
        if (setupResult.status !== 'completed') {
          return runError(setupResult.status, setupResult.error)
        }
      }
      this.prepared = true
    }

    for (const fn of this.memory.functions.values()) {
      attachLogger(fn, logs, [frame], true)
    }

    if (
      this.execution.tickFunction !== undefined &&
      !this.memory.functions.has(this.execution.tickFunction)
    ) {
      return runError('error', `Live tick function "${this.execution.tickFunction}" is not defined.`)
    }

    const tickTrace = this.execution.tickFunction === undefined ? this.trace : this.tickCall
    if (tickTrace === null) {
      return runError('error', `Live tick function "${this.execution.tickFunction}" is not defined.`)
    }
    const execution = run(tickTrace, this.execution.tickFunction === undefined ? this.args : [])
    if (execution.status !== 'completed') {
      return {
        output: null,
        logs,
        animationFrames: [],
        time: runtimeMs,
        error: execution.error ?? `Execution ${execution.status}.`,
      }
    }

    for (const source of this.execution.memoryChannels ?? []) {
      const buffer = this.memory.getArray(source.array)
      if (buffer === undefined) {
        return {
          output: execution.value,
          logs,
          animationFrames: [],
          time: runtimeMs,
          error: `Animation channel "${source.channel}" reads missing Trace array "${source.array}".`,
        }
      }
      frame.values[source.channel] = Array.from(buffer.subarray(1))
    }

    return {
      output: execution.value,
      logs,
      animationFrames: [frame],
      time: runtimeMs,
      error: null,
    }
  }

  addToVariable(name: string, amount: number): boolean {
    if (this.trace === null || !Number.isFinite(amount)) {
      return false
    }
    this.memory.variables.set(name, (this.memory.getVariable(name) ?? 0) + amount)
    return true
  }

  setVariable(name: string, value: number): boolean {
    if (this.trace === null || !Number.isFinite(value)) {
      return false
    }
    this.memory.variables.set(name, value)
    return true
  }

  getVariable(name: string): number | undefined {
    return this.memory.getVariable(name)
  }
}

export const createTraceTickSession = (
  code: string,
  argumentInput: string,
  execution: LiveAnimationExecution = { mode: 'live' },
) => new TraceTickSession(code, argumentInput, execution)

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
