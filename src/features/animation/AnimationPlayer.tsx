import { useEffect, useState } from 'react';
import type { AnimationFrame, AnimationSpec } from './types';
import { BarsFrame, CellsFrame, SceneFrame, SeriesFrame, WaveFrame } from './renderers';
import './animation.css';

interface AnimationPlayerProps {
  frames: AnimationFrame[];
  spec: AnimationSpec;
  onTick?: () => AnimationFrame | null;
  onRestart?: () => void;
}

const retainedFrameCount = (spec: AnimationSpec) => {
  switch (spec.kind) {
    case 'scene':
      return Math.max(1, spec.trailLength);
    case 'series':
      return Math.max(1, spec.historyLength);
    case 'wave':
      return Math.max(1, spec.trailLength);
    case 'cells':
      return Math.max(1, spec.historyRows);
    case 'bars':
      return 1;
  }
};

export default function AnimationPlayer({ frames, spec, onTick, onRestart }: AnimationPlayerProps) {
  const [liveFrames, setLiveFrames] = useState(frames);
  const [frameIndex, setFrameIndex] = useState(0);
  const [streamFrame, setStreamFrame] = useState(1);
  const [isPlaying, setIsPlaying] = useState(() => {
    if (typeof window === 'undefined') return false;
    const canPlayLive = spec.execution?.mode === 'live' && onTick !== undefined;
    if (frames.length < 2 && !canPlayLive) return false;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const isLive = spec.execution?.mode === 'live' && onTick !== undefined;
  const availableFrames = isLive ? liveFrames : frames;
  const visibleFrameIndex = isLive
    ? availableFrames.length - 1
    : Math.min(frameIndex, Math.max(0, availableFrames.length - 1));
  const canPlay = isLive || availableFrames.length > 1;
  const canRestart = !isLive || onRestart !== undefined;
  const framesPerSecond = Math.min(60, Math.max(1, spec.framesPerSecond));
  const playing = canPlay && isPlaying;

  useEffect(() => {
    if (!isLive || !isPlaying) {
      return;
    }

    const interval = window.setInterval(() => {
      const nextFrame = onTick();
      if (nextFrame === null) {
        setIsPlaying(false);
        return;
      }

      setLiveFrames((current) => [...current, nextFrame].slice(-retainedFrameCount(spec)));
      setStreamFrame((current) => current + 1);
    }, 1000 / framesPerSecond);

    return () => window.clearInterval(interval);
  }, [framesPerSecond, isLive, isPlaying, onTick, spec]);

  useEffect(() => {
    if (isLive || !isPlaying || frames.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setFrameIndex((current) => {
        if (current >= frames.length - 1) {
          setIsPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 1000 / framesPerSecond);

    return () => window.clearInterval(interval);
  }, [frames.length, framesPerSecond, isLive, isPlaying]);

  const restart = () => {
    if (isLive && onRestart !== undefined) {
      onRestart();
      return;
    }
    setFrameIndex(0);
    setIsPlaying(availableFrames.length > 1);
  };

  const togglePlayback = () => {
    if (!canPlay) return;
    if (playing) {
      setIsPlaying(false);
    } else if (!isLive && frameIndex === availableFrames.length - 1) {
      restart();
    } else {
      setIsPlaying(true);
    }
  };

  return (
    <div className="animation-player">
      <div className="animation-copy">
        <div>
          <h3>{spec.title}</h3>
          <p>{spec.description}</p>
        </div>
        <span className="animation-frame-count">
          {isLive ? `Frame ${streamFrame} · Live` : `Frame ${frameIndex + 1} / ${frames.length}`}
        </span>
      </div>

      {spec.kind === 'scene' && (
        <SceneFrame frames={availableFrames} spec={spec} frameIndex={visibleFrameIndex} />
      )}
      {spec.kind === 'wave' && (
        <WaveFrame frames={availableFrames} spec={spec} frameIndex={visibleFrameIndex} />
      )}
      {spec.kind === 'cells' && (
        <CellsFrame frames={availableFrames} spec={spec} frameIndex={visibleFrameIndex} />
      )}
      {spec.kind === 'series' && (
        <SeriesFrame frames={availableFrames} spec={spec} frameIndex={visibleFrameIndex} />
      )}
      {spec.kind === 'bars' && (
        <BarsFrame frames={availableFrames} spec={spec} frameIndex={visibleFrameIndex} />
      )}

      {(spec.kind === 'scene' || spec.kind === 'series') && (
        <div className="animation-legend" aria-label="Animation legend">
          {(spec.kind === 'scene' ? spec.points : [...spec.lines, ...(spec.references ?? [])]).map(
            (item) => (
              <span key={item.label}>
                <i style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ),
          )}
        </div>
      )}

      <div className="animation-controls">
        <button type="button" onClick={togglePlayback} disabled={!canPlay}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" onClick={restart} disabled={!canRestart}>
          {isLive ? 'Reset stream' : 'Restart'}
        </button>
        {!isLive && (
          <input
            type="range"
            min="0"
            max={availableFrames.length - 1}
            value={visibleFrameIndex}
            onChange={(event) => {
              setFrameIndex(Number(event.target.value));
              setIsPlaying(false);
            }}
            aria-label="Animation frame"
          />
        )}
      </div>
    </div>
  );
}
