import { Trace } from 'trace';
import { parseArguments } from './arguments';
import { attachTraceLogger, errorResult } from './logging';
import type { PlaygroundResult } from './types';
import type { AnimationFrame } from '../animation/types';

export function runTraceScript(code: string, argumentInput: string): PlaygroundResult {
  const logs: string[] = [];
  const animationFrames: AnimationFrame[] = [];

  try {
    const trace = Trace.parse(code);
    attachTraceLogger(trace, logs, animationFrames, false);

    const execution = trace.runWithOptions({ args: parseArguments(argumentInput) });
    if (execution.status !== 'completed') {
      return {
        output: null,
        logs,
        animationFrames,
        time: execution.runtimeMs,
        error: execution.error ?? `Execution ${execution.status}.`,
      };
    }

    return {
      output: execution.value,
      logs,
      animationFrames,
      time: execution.runtimeMs,
      error: null,
    };
  } catch (error) {
    return errorResult(error, logs, animationFrames);
  }
}
