import type { AnimationSpec } from '../animation/types'
import type { Example } from '../examples'
import { examples, exampleSections } from '../examples'
import type { PlaygroundResult } from '../runner'
import {
  parseSandboxUrl,
} from './sandboxUrl'
import type { SandboxExecutionSettings } from './types'

export const orderedExampleEntries = exampleSections.flatMap(section =>
  examples
    .map((example, index) => ({ example, index }))
    .filter(({ example }) => example.section === section.id),
)

export const defaultSandboxSettings: SandboxExecutionSettings = {
  runMode: 'once',
  framesPerSecond: 24,
  yMin: -10,
  yMax: 10,
  setupFunction: 'setup',
  tickFunction: 'tick',
}

export const normalizeFramesPerSecond = (value: number) =>
  Math.min(60, Math.max(1, Number.isFinite(value) ? value : defaultSandboxSettings.framesPerSecond))

const customSeriesColors = ['#a89bff', '#4ade80', '#fbbf24', '#60a5fa', '#f472b6']

export const customSandboxExample: Example = {
  id: 'shared-sandbox',
  section: 'foundations',
  name: 'Custom sandbox',
  description: 'An editable Trace script prepopulated from the URL.',
  concepts: ['shareable URL', 'custom script'],
  expected: 'The result of the shared script.',
  challenge: 'Edit the script, then open a new link to share your changes.',
  code: '',
}

export interface ResolvedSandboxLocation {
  selectedExample: number | null
  code: string
  args: string
  sandboxSettings: SandboxExecutionSettings
}

export function resolveSandboxLocation(search: string): ResolvedSandboxLocation {
  const parsed = parseSandboxUrl(search)
  const exampleIndex = parsed.exampleId === null
    ? -1
    : examples.findIndex(example => example.id === parsed.exampleId)
  const sandboxSettings: SandboxExecutionSettings = {
    runMode: parsed.runMode ?? defaultSandboxSettings.runMode,
    framesPerSecond: normalizeFramesPerSecond(
      parsed.framesPerSecond ?? defaultSandboxSettings.framesPerSecond,
    ),
    yMin: parsed.yMin ?? defaultSandboxSettings.yMin,
    yMax: parsed.yMax ?? defaultSandboxSettings.yMax,
    setupFunction: parsed.setupFunction ?? defaultSandboxSettings.setupFunction,
    tickFunction: parsed.tickFunction ?? defaultSandboxSettings.tickFunction,
  }

  if (parsed.code !== null) {
    return {
      selectedExample: exampleIndex === -1 ? null : exampleIndex,
      code: parsed.code,
      args: parsed.args ?? (exampleIndex === -1 ? '' : examples[exampleIndex].args ?? ''),
      sandboxSettings,
    }
  }

  const selectedExample = exampleIndex === -1 ? 0 : exampleIndex
  const example = examples[selectedExample]
  return {
    selectedExample,
    code: example.code,
    args: parsed.args ?? example.args ?? '',
    sandboxSettings,
  }
}

export const currentSearch = () => typeof window === 'undefined' ? '' : window.location.search
export const currentUrl = () => typeof window === 'undefined'
  ? 'https://example.invalid/'
  : window.location.href

export function buildCustomAnimation(
  selectedExample: number | null,
  result: PlaygroundResult | null,
  settings: SandboxExecutionSettings,
): AnimationSpec | undefined {
  if (selectedExample !== null || settings.runMode === 'once') return undefined

  const customChannelKey = result?.error === null
    ? Object.keys(result.animationFrames[0]?.values ?? {}).join('\u0000')
    : ''
  const channels = customChannelKey === '' ? [] : customChannelKey.split('\u0000')
  const execution = settings.runMode === 'functions'
    ? {
        mode: 'live' as const,
        setupFunction: settings.setupFunction,
        tickFunction: settings.tickFunction,
      }
    : { mode: 'live' as const }

  return {
    kind: 'series',
    title: 'Sandbox live output',
    description: channels.length === 0
      ? 'Add named echoes such as @=value@ to draw streaming values.'
      : 'Each named echo is sampled from persistent Trace memory on every tick.',
    framesPerSecond: Math.min(60, Math.max(1, settings.framesPerSecond)),
    execution,
    yMin: settings.yMin,
    yMax: settings.yMax > settings.yMin ? settings.yMax : settings.yMin + 1,
    historyLength: 240,
    lines: channels.map((channel, index) => ({
      channel,
      color: customSeriesColors[index % customSeriesColors.length],
      label: channel,
    })),
  }
}
