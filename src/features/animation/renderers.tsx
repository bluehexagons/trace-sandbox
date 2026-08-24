import type {
  AnimationFrame,
  BarsAnimation,
  CellsAnimation,
  SceneAnimation,
  SeriesAnimation,
  WaveAnimation,
} from './types';

export interface AnimationFrameRendererProps {
  frames: AnimationFrame[];
  frameIndex: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const firstValue = (frame: AnimationFrame, channel: string) => frame.values[channel]?.[0] ?? 0;

export function SceneFrame({
  frameIndex,
  frames,
  spec,
}: AnimationFrameRendererProps & { spec: SceneAnimation }) {
  const toX = (value: number) => ((value - spec.xMin) / (spec.xMax - spec.xMin)) * 100;
  const toY = (value: number) => 100 - ((value - spec.yMin) / (spec.yMax - spec.yMin)) * 100;
  const trailStart = Math.max(0, frameIndex - spec.trailLength + 1);
  const trail = frames.slice(trailStart, frameIndex + 1);

  return (
    <svg className="animation-canvas" viewBox="0 0 100 100" role="img" aria-label={spec.title}>
      <rect className="animation-background" width="100" height="100" rx="2" />
      <line className="animation-axis" x1="0" x2="100" y1={toY(0)} y2={toY(0)} />
      <line className="animation-axis" x1={toX(0)} x2={toX(0)} y1="0" y2="100" />
      {spec.showOrigin && <circle className="animation-origin" cx={toX(0)} cy={toY(0)} r="2.4" />}
      {spec.points.map((point) => {
        const current = frames[frameIndex];
        const trailPoints = trail
          .map((frame) => `${toX(firstValue(frame, point.x))},${toY(firstValue(frame, point.y))}`)
          .join(' ');

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
        );
      })}
    </svg>
  );
}

export function SeriesFrame({
  frameIndex,
  frames,
  spec,
}: AnimationFrameRendererProps & { spec: SeriesAnimation }) {
  const historyStart = Math.max(0, frameIndex - spec.historyLength + 1);
  const history = frames.slice(historyStart, frameIndex + 1);
  const toX = (index: number) => (history.length === 1 ? 50 : (index / (history.length - 1)) * 100);
  const toY = (value: number) =>
    100 - ((clamp(value, spec.yMin, spec.yMax) - spec.yMin) / (spec.yMax - spec.yMin)) * 100;

  return (
    <svg className="animation-canvas" viewBox="0 0 100 100" role="img" aria-label={spec.title}>
      <rect className="animation-background" width="100" height="100" rx="2" />
      {[25, 50, 75].map((y) => (
        <line key={y} className="animation-grid-line" x1="0" x2="100" y1={y} y2={y} />
      ))}
      {(spec.references ?? []).map((reference) => (
        <line
          key={reference.label}
          className="animation-reference"
          x1="0"
          x2="100"
          y1={toY(reference.value)}
          y2={toY(reference.value)}
          style={{ stroke: reference.color }}
        >
          <title>{reference.label}</title>
        </line>
      ))}
      {spec.lines.map((line) => {
        const points = history
          .map((frame, index) => `${toX(index)},${toY(firstValue(frame, line.channel))}`)
          .join(' ');
        const current = history.at(-1);
        const currentX = toX(history.length - 1);

        return (
          <g key={line.channel}>
            <polyline className="animation-series" points={points} style={{ stroke: line.color }} />
            {current !== undefined && (
              <circle
                cx={currentX}
                cy={toY(firstValue(current, line.channel))}
                fill={line.color}
                r="0.9"
              >
                <title>{line.label}</title>
              </circle>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function BarsFrame({
  frameIndex,
  frames,
  spec,
}: AnimationFrameRendererProps & { spec: BarsAnimation }) {
  const frame = frames[frameIndex];
  const values = frame.values[spec.channel] ?? [];
  const highlighted =
    spec.highlightChannel === undefined ? 0 : Math.trunc(firstValue(frame, spec.highlightChannel));
  const barWidth = values.length === 0 ? 100 : 100 / values.length;
  const heightFor = (value: number) =>
    ((clamp(value, spec.min, spec.max) - spec.min) / (spec.max - spec.min)) * 96;

  return (
    <svg className="animation-canvas" viewBox="0 0 100 100" role="img" aria-label={spec.title}>
      <rect className="animation-background" width="100" height="100" rx="2" />
      {values.map((value, index) => {
        const height = heightFor(value);
        const itemIndex = index + 1;
        const isHighlighted = itemIndex === highlighted || itemIndex === highlighted + 1;
        return (
          <rect
            key={itemIndex}
            className="animation-bar"
            x={index * barWidth + barWidth * 0.08}
            y={98 - height}
            width={barWidth * 0.84}
            height={height}
            fill={isHighlighted ? spec.highlightColor : spec.color}
          >
            <title>{`Item ${itemIndex}: ${value}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

export function WaveFrame({
  frameIndex,
  frames,
  spec,
}: AnimationFrameRendererProps & { spec: WaveAnimation }) {
  const trailStart = Math.max(0, frameIndex - spec.trailLength + 1);
  const visibleFrames = frames.slice(trailStart, frameIndex + 1);
  const toY = (value: number) =>
    100 - ((clamp(value, spec.min, spec.max) - spec.min) / (spec.max - spec.min)) * 100;

  return (
    <svg className="animation-canvas" viewBox="0 0 100 100" role="img" aria-label={spec.title}>
      <rect className="animation-background" width="100" height="100" rx="2" />
      {[25, 50, 75].map((y) => (
        <line key={y} className="animation-grid-line" x1="0" x2="100" y1={y} y2={y} />
      ))}
      {visibleFrames.map((frame, index) => {
        const samples = frame.values[spec.channel] ?? [];
        const points = samples
          .map((sample, sampleIndex) => {
            const x = samples.length === 1 ? 50 : (sampleIndex / (samples.length - 1)) * 100;
            return `${x},${toY(sample)}`;
          })
          .join(' ');
        const opacity = (index + 1) / visibleFrames.length;

        return (
          <polyline
            key={trailStart + index}
            className="animation-wave"
            points={points}
            style={{ opacity, stroke: spec.color }}
          />
        );
      })}
    </svg>
  );
}

export function CellsFrame({
  frameIndex,
  frames,
  spec,
}: AnimationFrameRendererProps & { spec: CellsAnimation }) {
  const historyStart = Math.max(0, frameIndex - spec.historyRows + 1);
  const history = frames.slice(historyStart, frameIndex + 1);
  const cellCount = frames[0]?.values[spec.channel]?.length ?? 1;

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
  );
}
