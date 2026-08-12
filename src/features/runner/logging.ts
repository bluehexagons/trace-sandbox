import type { Trace } from 'trace'
import type { AnimationFrame } from '../animation/types'

export const attachTraceLogger = (
  trace: Trace,
  logs: string[],
  animationFrames: AnimationFrame[],
  oneFramePerRun: boolean,
) => {
  trace.logger = (...messages: unknown[]) => {
    const channel = messages[1]
    const value = messages[2]

    if (messages.length === 2 && channel === 'frame') {
      if (!oneFramePerRun) animationFrames.push({ values: {} })
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

export const errorResult = (
  error: unknown,
  logs: string[] = [],
  animationFrames: AnimationFrame[] = [],
) => ({
  output: null,
  logs,
  animationFrames,
  time: 0,
  error: error instanceof Error ? error.message : String(error),
})
