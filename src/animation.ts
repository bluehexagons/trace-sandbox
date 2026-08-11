export interface AnimationFrame {
  values: Record<string, number[]>
}

export interface MemoryAnimationChannel {
  channel: string
  array: string
}

export interface LiveAnimationExecution {
  mode: 'live'
  frameCount: number
  memoryChannels?: MemoryAnimationChannel[]
}

interface AnimationBase {
  title: string
  description: string
  framesPerSecond: number
  execution?: LiveAnimationExecution
}

export interface ScenePoint {
  x: string
  y: string
  color: string
  label: string
  radius?: number
}

export interface SceneAnimation extends AnimationBase {
  kind: 'scene'
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  trailLength: number
  showOrigin?: boolean
  points: ScenePoint[]
}

export interface WaveAnimation extends AnimationBase {
  kind: 'wave'
  channel: string
  min: number
  max: number
  trailLength: number
  color: string
}

export interface CellsAnimation extends AnimationBase {
  kind: 'cells'
  channel: string
  historyRows: number
  color: string
}

export type AnimationSpec = SceneAnimation | WaveAnimation | CellsAnimation
