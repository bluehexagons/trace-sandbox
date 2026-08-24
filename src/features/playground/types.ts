import type { SandboxRunMode } from './sandboxUrl';

export interface SandboxExecutionSettings {
  runMode: SandboxRunMode;
  framesPerSecond: number;
  yMin: number;
  yMax: number;
  setupFunction: string;
  tickFunction: string;
}
