import type { AnimationFrame } from '../animation/types';

export interface PlaygroundResult {
  output: number | null;
  logs: string[];
  animationFrames: AnimationFrame[];
  time: number;
  error: string | null;
}
