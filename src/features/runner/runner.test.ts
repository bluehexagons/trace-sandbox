import { describe, expect, it } from 'vitest';
import { createTraceTickSession, parseArguments, runTraceScript } from './index';

describe('trace runner', () => {
  it('parses whitespace-separated finite numeric arguments', () => {
    expect(parseArguments('  1\t2.5\n-3  ')).toEqual([1, 2.5, -3]);
  });

  it('rejects invalid arguments instead of silently dropping them', () => {
    expect(() => parseArguments('1 nope 2')).toThrow(
      'Arguments must be finite numbers separated by spaces.',
    );
  });

  it('runs scripts with arguments and preserves console output', () => {
    expect(runTraceScript('[...] x = &1; @=x@; x * 2', '21')).toEqual({
      output: 42,
      logs: expect.arrayContaining([expect.stringContaining('21')]),
      animationFrames: [],
      time: expect.any(Number),
      error: null,
    });
  });

  it('collects frame markers and repeated named values as animation channels', () => {
    const result = runTraceScript('@frame@; x = 1; @=x@; x = 2; @=x@; @frame@; x = 3; @=x@; 3', '');

    expect(result.animationFrames).toEqual([{ values: { x: [1, 2] } }, { values: { x: [3] } }]);
    expect(result.logs).toEqual([]);
  });

  it('runs one tick at a time with persistent state and memory-backed channels', () => {
    const session = createTraceTickSession(
      'initialized == 0 ? () => { output = [2]; output[2] = 3; initialized = 1 }; output[1] += output[2]; output[1]',
      '',
      { mode: 'live', memoryChannels: [{ channel: 'samples', array: 'output' }] },
    );

    expect(session.tick()).toMatchObject({
      output: 3,
      animationFrames: [{ values: { samples: [3, 3] } }],
      error: null,
    });
    expect(session.tick()).toMatchObject({
      output: 6,
      animationFrames: [{ values: { samples: [6, 3] } }],
      error: null,
    });
  });

  it('registers a live script once, runs setup once, and calls only its tick function afterward', () => {
    const session = createTraceTickSession(
      `setup(start) => { value = start; setupCalls++ };
tick() => { @=value@; value++ };`,
      '7e0',
      { mode: 'live', setupFunction: 'setup', tickFunction: 'tick' },
    );

    expect(session.tick()).toMatchObject({
      output: 8,
      animationFrames: [{ values: { value: [7] } }],
      error: null,
    });
    expect(session.tick()).toMatchObject({
      output: 9,
      animationFrames: [{ values: { value: [8] } }],
      error: null,
    });
    expect(session.getVariable('setupCalls')).toBe(1);
  });

  it('changes a live variable without rebuilding the persistent session', () => {
    const session = createTraceTickSession(
      `setup() => { value = 1 };
tick() => { @=value@; value++ };`,
      '',
      { mode: 'live', setupFunction: 'setup', tickFunction: 'tick' },
    );

    expect(session.tick().animationFrames[0].values.value).toEqual([1]);
    expect(session.setVariable('value', 20)).toBe(true);
    expect(session.tick().animationFrames[0].values.value).toEqual([20]);
    expect(session.tick().animationFrames[0].values.value).toEqual([21]);
  });

  it('reports a configured live function that is not defined by the script', () => {
    const result = createTraceTickSession('setup() => { 1 };', '', {
      mode: 'live',
      setupFunction: 'setup',
      tickFunction: 'missing',
    }).tick();

    expect(result.error).toBe('Live tick function "missing" is not defined.');
  });

  it('resolves script arguments during guarded first-tick initialization', () => {
    const session = createTraceTickSession(
      '[input] initialized == 0 ? value = input; initialized == 0 ? initialized = 1; value++',
      '7',
    );

    expect(session.tick().output).toBe(8);
    expect(session.tick().output).toBe(9);
  });

  it('reports a missing memory-backed animation array', () => {
    const result = createTraceTickSession('1', '', {
      mode: 'live',
      memoryChannels: [{ channel: 'samples', array: 'missing' }],
    }).tick();

    expect(result.error).toContain('missing Trace array "missing"');
  });

  it('continues ticking without a configured frame limit', () => {
    const session = createTraceTickSession(
      'initialized == 0 ? value = 0; initialized == 0 ? initialized = 1; value++',
      '',
    );

    let result = session.tick();
    for (let tick = 1; tick < 500; tick++) {
      result = session.tick();
    }

    expect(result).toMatchObject({ output: 500, error: null });
  });

  it('returns parse errors in the playground result shape', () => {
    expect(runTraceScript('1 > < 2', '')).toMatchObject({
      output: null,
      logs: [],
      time: 0,
    });
    expect(runTraceScript('1 > < 2', '').error).toContain('offset');
  });
});
