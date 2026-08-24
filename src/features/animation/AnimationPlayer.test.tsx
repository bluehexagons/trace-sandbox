import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import AnimationPlayer from './AnimationPlayer';
import type { AnimationFrame, AnimationSpec } from './types';

const frames: AnimationFrame[] = [
  {
    values: {
      x: [1],
      y: [2],
      prey: [10],
      predators: [5],
      sample: [0, 1, 0],
      cell: [0, 1, 0],
      values: [30, 10, 20],
      highlight: [1],
    },
  },
  {
    values: {
      x: [2],
      y: [3],
      prey: [11],
      predators: [6],
      sample: [1, 0, -1],
      cell: [1, 1, 0],
      values: [10, 20, 30],
      highlight: [2],
    },
  },
];

const base = {
  title: 'Test animation',
  description: 'Rendered from Trace output.',
  framesPerSecond: 12,
};

describe('animation player', () => {
  it.each<AnimationSpec>([
    {
      ...base,
      kind: 'series',
      yMin: 0,
      yMax: 20,
      historyLength: 20,
      lines: [
        { channel: 'prey', color: '#0f0', label: 'Prey' },
        { channel: 'predators', color: '#f0f', label: 'Predators' },
      ],
    },
    {
      ...base,
      kind: 'scene',
      xMin: 0,
      xMax: 10,
      yMin: 0,
      yMax: 10,
      trailLength: 2,
      points: [{ x: 'x', y: 'y', color: '#fff', label: 'Point' }],
    },
    {
      ...base,
      kind: 'wave',
      channel: 'sample',
      min: -1,
      max: 1,
      trailLength: 2,
      color: '#fff',
    },
    {
      ...base,
      kind: 'cells',
      channel: 'cell',
      historyRows: 2,
      color: '#fff',
    },
    {
      ...base,
      kind: 'bars',
      channel: 'values',
      min: 0,
      max: 100,
      color: '#09f',
      highlightColor: '#fc0',
      highlightChannel: 'highlight',
    },
  ])('renders $kind output as an accessible SVG with playback controls', (spec) => {
    const markup = renderToStaticMarkup(<AnimationPlayer frames={frames} spec={spec} />);

    expect(markup).toContain('<svg');
    expect(markup).toContain('aria-label="Test animation"');
    expect(markup).toContain('Frame 1 / 2');
    expect(markup).toContain('Restart');
  });

  it('renders distinct labeled trails for a multi-series chart', () => {
    const spec: AnimationSpec = {
      ...base,
      kind: 'series',
      yMin: 0,
      yMax: 20,
      historyLength: 20,
      lines: [
        { channel: 'prey', color: '#0f0', label: 'Prey' },
        { channel: 'predators', color: '#f0f', label: 'Predators' },
      ],
      references: [{ value: 12, color: '#fc0', label: 'Target' }],
    };

    const markup = renderToStaticMarkup(<AnimationPlayer frames={frames} spec={spec} />);
    expect(markup.match(/animation-series/g)).toHaveLength(2);
    expect(markup).toContain('Prey');
    expect(markup).toContain('Predators');
    expect(markup).toContain('animation-reference');
    expect(markup).toContain('Target');
  });

  it('renders a memory array as bars and highlights the active pair', () => {
    const spec: AnimationSpec = {
      ...base,
      kind: 'bars',
      channel: 'values',
      min: 0,
      max: 100,
      color: '#09f',
      highlightColor: '#fc0',
      highlightChannel: 'highlight',
    };

    const markup = renderToStaticMarkup(<AnimationPlayer frames={frames} spec={spec} />);
    expect(markup.match(/animation-bar/g)).toHaveLength(3);
    expect(markup.match(/fill="#fc0"/g)).toHaveLength(2);
    expect(markup).toContain('Item 1: 30');
  });

  it('shows an unbounded live stream before later ticks are generated', () => {
    const spec: AnimationSpec = {
      ...base,
      kind: 'wave',
      channel: 'sample',
      min: -1,
      max: 1,
      trailLength: 2,
      color: '#fff',
      execution: { mode: 'live' },
    };

    const markup = renderToStaticMarkup(
      <AnimationPlayer frames={frames.slice(0, 1)} spec={spec} onTick={() => null} />,
    );

    expect(markup).toContain('Frame 1 · Live');
    expect(markup).toContain('Reset stream');
    expect(markup).toContain('<button type="button" disabled="">Reset stream</button>');
  });

  it('disables playback controls when only one frame is available', () => {
    const markup = renderToStaticMarkup(
      <AnimationPlayer
        frames={frames.slice(0, 1)}
        spec={{
          ...base,
          kind: 'bars',
          channel: 'values',
          min: 0,
          max: 100,
          color: '#09f',
          highlightColor: '#fc0',
        }}
      />,
    );

    expect(markup).toContain('<button type="button" disabled="">Play</button>');
  });
});
