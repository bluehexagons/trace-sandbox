import { describe, expect, it } from 'vitest';
import {
  buildEmptySandboxHref,
  buildExampleHref,
  buildSandboxHref,
  parseSandboxUrl,
} from './sandboxUrl';

const baseUrl = 'https://example.test/trace-sandbox/?old=value#output';

describe('sandbox URLs', () => {
  it('builds stable example links without carrying unrelated URL state', () => {
    expect(buildExampleHref('lorenz-attractor', baseUrl)).toBe(
      '/trace-sandbox/?example=lorenz-attractor',
    );
  });

  it('round-trips multiline Unicode code and arguments', () => {
    const href = buildSandboxHref(
      {
        exampleId: 'logistic-map',
        code: '# λ population\nvalue = 3.8;\nvalue',
        args: '3.8 0.2',
      },
      baseUrl,
    );

    expect(parseSandboxUrl(new URL(href, baseUrl).search)).toEqual({
      exampleId: 'logistic-map',
      code: '# λ population\nvalue = 3.8;\nvalue',
      args: '3.8 0.2',
      runMode: null,
      framesPerSecond: null,
      yMin: null,
      yMax: null,
      setupFunction: null,
      tickFunction: null,
    });
  });

  it('distinguishes an explicitly empty custom script from an absent script', () => {
    expect(parseSandboxUrl('?code=')).toEqual({
      exampleId: null,
      code: '',
      args: null,
      runMode: null,
      framesPerSecond: null,
      yMin: null,
      yMax: null,
      setupFunction: null,
      tickFunction: null,
    });
    expect(parseSandboxUrl('')).toEqual({
      exampleId: null,
      code: null,
      args: null,
      runMode: null,
      framesPerSecond: null,
      yMin: null,
      yMax: null,
      setupFunction: null,
      tickFunction: null,
    });
  });

  it('builds a stable empty sandbox link', () => {
    const href = buildEmptySandboxHref(baseUrl);

    expect(href).toBe('/trace-sandbox/?code=');
    expect(parseSandboxUrl(new URL(href, baseUrl).search).code).toBe('');
  });

  it('preserves an explicitly empty argument list', () => {
    const href = buildSandboxHref({ exampleId: 'logistic-map', args: '' }, baseUrl);

    expect(href).toBe('/trace-sandbox/?example=logistic-map&args=');
    expect(parseSandboxUrl(new URL(href, baseUrl).search).args).toBe('');
  });

  it('round-trips custom live execution settings', () => {
    const href = buildSandboxHref(
      {
        code: 'setup() => { x = 1 }; tick() => { @=x@; x++ };',
        runMode: 'functions',
        framesPerSecond: 24,
        yMin: -5,
        yMax: 20,
        setupFunction: 'setup',
        tickFunction: 'tick',
      },
      baseUrl,
    );

    expect(parseSandboxUrl(new URL(href, baseUrl).search)).toMatchObject({
      runMode: 'functions',
      framesPerSecond: 24,
      yMin: -5,
      yMax: 20,
      setupFunction: 'setup',
      tickFunction: 'tick',
    });
  });
});
