import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SeriesFrame } from '../animation/renderers';
import { examples } from '../examples';
import { createTraceTickSession } from '../runner';
import {
  buildCustomAnimation,
  discoverLiveChannels,
  defaultSandboxSettings,
  resolveSandboxLocation,
} from './sandboxState';

describe('sandbox state', () => {
  it('loads the first lesson when no URL state is provided', () => {
    expect(resolveSandboxLocation('')).toEqual({
      selectedExample: 0,
      code: examples[0].code,
      args: examples[0].args ?? '',
      sandboxSettings: defaultSandboxSettings,
    });
  });

  it('uses custom code while retaining a known lesson selection', () => {
    const location = resolveSandboxLocation('?example=logistic-map&code=x%20%2B%201&args=2');
    const selectedExample = examples.findIndex((example) => example.id === 'logistic-map');

    expect(location.selectedExample).toBe(selectedExample);
    expect(location.code).toBe('x + 1');
    expect(location.args).toBe('2');
  });

  it('normalizes out-of-range live frame rates restored from a URL', () => {
    expect(
      resolveSandboxLocation('?code=&run=persistent&fps=120').sandboxSettings.framesPerSecond,
    ).toBe(60);
    expect(
      resolveSandboxLocation('?code=&run=persistent&fps=-5').sandboxSettings.framesPerSecond,
    ).toBe(1);
  });

  it('builds live custom output from named channels', () => {
    const animation = buildCustomAnimation(
      null,
      {
        output: 3,
        logs: [],
        animationFrames: [{ values: { first: [1], second: [2] } }],
        time: 0,
        error: null,
      },
      {
        ...defaultSandboxSettings,
        runMode: 'persistent',
        framesPerSecond: 120,
        yMin: 4,
        yMax: 4,
      },
    );

    expect(animation).toMatchObject({
      kind: 'series',
      framesPerSecond: 60,
      yMin: 4,
      yMax: 5,
      lines: [
        { channel: 'first', label: 'first' },
        { channel: 'second', label: 'second' },
      ],
    });
  });

  it('does not create animation for one-shot or lesson runs', () => {
    expect(buildCustomAnimation(0, null, defaultSandboxSettings)).toBeUndefined();
    expect(buildCustomAnimation(null, null, defaultSandboxSettings)).toBeUndefined();
  });

  it('discovers conditional live channels without retaining tick history', () => {
    const session = createTraceTickSession(
      'count++; count > 1 ? () => { output = count; @=output@ }; count',
      '',
      { mode: 'live' },
    );
    const first = session.tick();
    const settings = { ...defaultSandboxSettings, runMode: 'persistent' as const };
    expect(buildCustomAnimation(null, first, settings)).toMatchObject({ lines: [] });
    const second = session.tick();
    const discovered = discoverLiveChannels(first, second)!;
    expect(buildCustomAnimation(null, discovered, settings)).toMatchObject({
      lines: [{ channel: 'output' }],
    });
    expect(discovered.animationFrames).toHaveLength(1);
    expect(first.animationFrames[0].values).not.toHaveProperty('output');
    expect(discoverLiveChannels(discovered, session.tick())).toBe(discovered);
  });

  it('merges prototype-named channels and preserves previous discoveries', () => {
    const base = {
      output: 0,
      logs: [],
      animationFrames: [{ values: { first: [1] } }],
      time: 0,
      error: null,
    };
    const values = Object.assign(Object.create(null), { constructor: [2] });
    values.__proto__ = [3];
    const result = discoverLiveChannels(base, { ...base, animationFrames: [{ values }] })!;
    expect(Object.keys(result.animationFrames[0].values)).toEqual([
      'first',
      'constructor',
      '__proto__',
    ]);
    expect(Object.getPrototypeOf(result.animationFrames[0].values)).toBeNull();
  });

  it.each([
    [1e20, 0],
    [Number.MAX_VALUE, 0],
    [-Number.MAX_VALUE, Number.MAX_VALUE],
    [NaN, 10],
    [0, Infinity],
    [0, Number.MIN_VALUE],
  ])('produces finite SVG coordinates for axis bounds %s/%s', (yMin, yMax) => {
    const spec = buildCustomAnimation(null, null, {
      ...defaultSandboxSettings,
      runMode: 'persistent',
      yMin,
      yMax,
    })!;
    if (spec.kind !== 'series') throw new Error('expected series');
    expect(spec.yMax).toBeGreaterThan(spec.yMin);
    expect(Number.isFinite(spec.yMax - spec.yMin)).toBe(true);
    const markup = renderToStaticMarkup(
      createElement(SeriesFrame, {
        frames: [{ values: { output: [spec.yMin] } }, { values: { output: [spec.yMax] } }],
        frameIndex: 1,
        spec: { ...spec, lines: [{ channel: 'output', label: 'Output', color: '#fff' }] },
      }),
    );
    expect(markup).not.toMatch(/NaN|Infinity/);
  });
});
