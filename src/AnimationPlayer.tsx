import { useEffect, useState } from 'react'
import type {
  AnimationFrame,
  AnimationSpec,
  CellsAnimation,
  SceneAnimation,
  WaveAnimation,
} from './animation'
import './AnimationPlayer.css'

interface AnimationPlayerProps {
  frames: AnimationFrame[]
  spec: AnimationSpec
  onTick?: () => AnimationFrame | null
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const firstValue = (frame: AnimationFrame, channel: string) =>
  frame.values[channel]?.[0] ?? 0

function SceneFrame({
  frameIndex,
  frames,
  spec,
}: AnimationPlayerProps & { frameIndex: number; spec: SceneAnimation }) {
  const toX = (value: number) => ((value - spec.xMin) / (spec.xMax - spec.xMin)) * 100
  const toY = (value: number) => 100 - ((value - spec.yMin) / (spec.yMax - spec.yMin)) * 100
  const trailStart = Math.max(0, frameIndex - spec.trailLength + 1)
  const trail = frames.slice(trailStart, frameIndex + 1)

  return (
    <svg className="animation-canvas" viewBox="0 0 100 100" role="img" aria-label={spec.title}>
      <rect className="animation-background" width="100" height="100" rx="2" />
      <line className="animation-axis" x1="0" x2="100" y1={toY(0)} y2={toY(0)} />
      <line className="animation-axis" x1={toX(0)} x2={toX(0)} y1="0" y2="100" />
      {spec.showOrigin && (
        <circle className="animation-origin" cx={toX(0)} cy={toY(0)} r="2.4" />
      )}
      {spec.points.map(point => {
        const current = frames[frameIndex]
        const trailPoints = trail
          .map(frame => `${toX(firstValue(frame, point.x))},${toY(firstValue(frame, point.y))}`)
          .join(' ')

        return (
          <g key={point.label}>
            <polyline
              className="animation-trail"
              points={trailPoints}
              style={{ stroke: point.color }}
            />
            <circle
              cx={toX(firstValue(current, point.x))}
              cy={toY(firstValue(current, point.y))}
              fill={point.color}
              r={point.radius ?? 1.4}
            >
              <title>{point.label}</title>
            </circle>
          </g>
        )
      })}
    </svg>
  )
}

function WaveFrame({
  frameIndex,
  frames,
  spec,
}: AnimationPlayerProps & { frameIndex: number; spec: WaveAnimation }) {
  const trailStart = Math.max(0, frameIndex - spec.trailLength + 1)
  const visibleFrames = frames.slice(trailStart, frameIndex + 1)
  const toY = (value: number) =>
    100 - ((clamp(value, spec.min, spec.max) - spec.min) / (spec.max - spec.min)) * 100

  return (
    <svg className="animation-canvas" viewBox="0 0 100 100" role="img" aria-label={spec.title}>
      <rect className="animation-background" width="100" height="100" rx="2" />
      {[25, 50, 75].map(y => (
        <line key={y} className="animation-grid-line" x1="0" x2="100" y1={y} y2={y} />
      ))}
      {visibleFrames.map((frame, index) => {
        const samples = frame.values[spec.channel] ?? []
        const points = samples
          .map((sample, sampleIndex) => {
            const x = samples.length === 1 ? 50 : (sampleIndex / (samples.length - 1)) * 100
            return `${x},${toY(sample)}`
          })
          .join(' ')
        const opacity = (index + 1) / visibleFrames.length

        return (
          <polyline
            key={trailStart + index}
            className="animation-wave"
            points={points}
            style={{ opacity, stroke: spec.color }}
          />
        )
      })}
    </svg>
  )
}

function CellsFrame({
  frameIndex,
  frames,
  spec,
}: AnimationPlayerProps & { frameIndex: number; spec: CellsAnimation }) {
  const historyStart = Math.max(0, frameIndex - spec.historyRows + 1)
  const history = frames.slice(historyStart, frameIndex + 1)
  const cellCount = frames[0]?.values[spec.channel]?.length ?? 1

  return (
    <svg
      className="animation-canvas animation-cells"
      viewBox={`0 0 ${cellCount} ${spec.historyRows}`}
      role="img"
      aria-label={spec.title}
      preserveAspectRatio="none"
    >
      <rect className="animation-background" width={cellCount} height={spec.historyRows} />
      {history.flatMap((frame, row) =>
        (frame.values[spec.channel] ?? []).map((cell, column) =>
          cell === 0 ? null : (
            <rect
              key={`${historyStart + row}-${column}`}
              x={column}
              y={row}
              width="1.02"
              height="1.02"
              fill={spec.color}
              opacity={clamp(cell, 0, 1)}
            />
          ),
        ),
      )}
    </svg>
  )
}

export default function AnimationPlayer({ frames, spec, onTick }: AnimationPlayerProps) {
  const [liveFrames, setLiveFrames] = useState(frames)
  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(() =>
    typeof window === 'undefined' ? false : !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const availableFrames = onTick === undefined ? frames : liveFrames
  const totalFrames = spec.execution?.frameCount ?? availableFrames.length

  useEffect(() => {
    if (!isPlaying || totalFrames < 2) {
      return
    }

    const interval = window.setInterval(() => {
      if (frameIndex < availableFrames.length - 1) {
        setFrameIndex(frameIndex + 1)
        return
      }

      if (onTick !== undefined && availableFrames.length < totalFrames) {
        const nextFrame = onTick()
        if (nextFrame !== null) {
          setLiveFrames(current => [...current, nextFrame])
          setFrameIndex(frameIndex + 1)
          return
        }
      }

      setIsPlaying(false)
    }, 1000 / spec.framesPerSecond)

    return () => window.clearInterval(interval)
  }, [availableFrames.length, frameIndex, isPlaying, onTick, spec.framesPerSecond, totalFrames])

  const restart = () => {
    setFrameIndex(0)
    setIsPlaying(true)
  }

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else if (frameIndex === availableFrames.length - 1 && availableFrames.length >= totalFrames) {
      restart()
    } else {
      setIsPlaying(true)
    }
  }

  return (
    <div className="animation-player">
      <div className="animation-copy">
        <div>
          <h3>{spec.title}</h3>
          <p>{spec.description}</p>
        </div>
        <span className="animation-frame-count">
          Frame {frameIndex + 1} / {totalFrames}
        </span>
      </div>

      {spec.kind === 'scene' && (
        <SceneFrame frames={availableFrames} spec={spec} frameIndex={frameIndex} />
      )}
      {spec.kind === 'wave' && (
        <WaveFrame frames={availableFrames} spec={spec} frameIndex={frameIndex} />
      )}
      {spec.kind === 'cells' && (
        <CellsFrame frames={availableFrames} spec={spec} frameIndex={frameIndex} />
      )}

      <div className="animation-controls">
        <button type="button" onClick={togglePlayback}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button type="button" onClick={restart}>Restart</button>
        <input
          type="range"
          min="0"
          max={availableFrames.length - 1}
          value={frameIndex}
          onChange={event => {
            setFrameIndex(Number(event.target.value))
            setIsPlaying(false)
          }}
          aria-label="Animation frame"
        />
      </div>
    </div>
  )
}
