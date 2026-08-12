export interface AnimationFrame {
  values: Record<string, number[]>
}

export interface MemoryAnimationChannel {
  channel: string
  array: string
}

export interface LiveAnimationExecution {
  mode: 'live'
  memoryChannels?: MemoryAnimationChannel[]
  setupFunction?: string
  tickFunction?: string
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

export interface SeriesLine {
  channel: string
  color: string
  label: string
}

export interface SeriesReference {
  value: number
  color: string
  label: string
}

export interface SeriesAnimation extends AnimationBase {
  kind: 'series'
  yMin: number
  yMax: number
  historyLength: number
  lines: SeriesLine[]
  references?: SeriesReference[]
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

export interface BarsAnimation extends AnimationBase {
  kind: 'bars'
  channel: string
  min: number
  max: number
  color: string
  highlightColor: string
  highlightChannel?: string
}

export type AnimationSpec =
  | SceneAnimation
  | SeriesAnimation
  | WaveAnimation
  | CellsAnimation
  | BarsAnimation
