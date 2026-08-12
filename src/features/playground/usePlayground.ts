import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import type { KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import type { Example, ExampleSectionId } from '../examples'
import { examples, exampleSections } from '../examples'
import type { AnimationSpec } from '../animation/types'
import type { InteractiveArgumentControl, InteractiveTriggerControl } from './interactive'
import { readArgumentValue, writeArgumentValue } from './interactive'
import {
  buildEmptySandboxHref,
  buildExampleHref,
  buildSandboxHref,
  parseSandboxUrl,
} from './sandboxUrl'
import { createTraceTickSession, runTraceScript } from '../runner'
import type { TraceTickSession } from '../runner'
import type { SandboxExecutionSettings } from './components/SandboxRunOptions'



const orderedExampleEntries = exampleSections.flatMap(section =>
  examples
    .map((example, index) => ({ example, index }))
    .filter(({ example }) => example.section === section.id),
)

const defaultSandboxSettings: SandboxExecutionSettings = {
  runMode: 'once',
  framesPerSecond: 24,
  yMin: -10,
  yMax: 10,
  setupFunction: 'setup',
  tickFunction: 'tick',
}

const customSeriesColors = ['#a89bff', '#4ade80', '#fbbf24', '#60a5fa', '#f472b6']

const customSandboxExample: Example = {
  id: 'shared-sandbox',
  section: 'foundations' as const,
  name: 'Custom sandbox',
  description: 'An editable Trace script prepopulated from the URL.',
  concepts: ['shareable URL', 'custom script'],
  expected: 'The result of the shared script.',
  challenge: 'Edit the script, then open a new link to share your changes.',
  code: '',
}

const resolveSandboxLocation = (search: string) => {
  const parsed = parseSandboxUrl(search)
  const exampleIndex = parsed.exampleId === null
    ? -1
    : examples.findIndex(example => example.id === parsed.exampleId)
  const sandboxSettings: SandboxExecutionSettings = {
    runMode: parsed.runMode ?? defaultSandboxSettings.runMode,
    framesPerSecond: parsed.framesPerSecond ?? defaultSandboxSettings.framesPerSecond,
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

const currentSearch = () => typeof window === 'undefined' ? '' : window.location.search
const currentUrl = () => typeof window === 'undefined'
  ? 'https://example.invalid/'
  : window.location.href



export function usePlayground() {

  const [initialSandbox] = useState(() => resolveSandboxLocation(currentSearch()))
  const [code, setCode] = useState(initialSandbox.code)
  const [args, setArgs] = useState(initialSandbox.args)
  const [result, setResult] = useState<ReturnType<typeof runTraceScript> | null>(null)
  const [selectedExample, setSelectedExample] = useState<number | null>(
    initialSandbox.selectedExample,
  )
  const [runRevision, setRunRevision] = useState(0)
  const [shareStatus, setShareStatus] = useState('')
  const [liveSessionReady, setLiveSessionReady] = useState(false)
  const [sandboxSettings, setSandboxSettings] = useState(initialSandbox.sandboxSettings)
  const [expandedSections, setExpandedSections] = useState<Set<ExampleSectionId>>(() => {
    const initialSection = initialSandbox.selectedExample === null
      ? exampleSections[0].id
      : examples[initialSandbox.selectedExample].section
    return new Set([initialSection])
  })
  const autoRunTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickSessionRef = useRef<TraceTickSession | null>(null)
  const activeExample = selectedExample === null
    ? {
        ...customSandboxExample,
        name: code.trim() === '' ? 'Empty sandbox' : 'Custom sandbox',
        description: code.trim() === ''
          ? 'Start from a blank Trace script and make the sandbox your own.'
          : customSandboxExample.description,
        concepts: code.trim() === ''
          ? ['blank canvas', 'one-shot or live execution', 'shareable URL']
          : customSandboxExample.concepts,
        expected: code.trim() === ''
          ? 'Whatever your Trace program computes or streams.'
          : customSandboxExample.expected,
        challenge: code.trim() === ''
          ? 'Try a one-shot expression, then switch to setup() + tick() and echo a changing value.'
          : customSandboxExample.challenge,
      }
    : examples[selectedExample]
  const activeSection = exampleSections.find(section => section.id === activeExample.section)
  const canonicalExample = selectedExample === null ? null : examples[selectedExample]
  const activeLessonPosition = selectedExample === null
    ? -1
    : orderedExampleEntries.findIndex(entry => entry.index === selectedExample)
  const customLiveSettings = canonicalExample === null && sandboxSettings.runMode !== 'once'
  const shareHref = buildSandboxHref({
    exampleId: canonicalExample?.id,
    code: canonicalExample !== null && code === canonicalExample.code ? undefined : code,
    args: canonicalExample !== null && args === (canonicalExample.args ?? '') ? undefined : args,
    runMode: customLiveSettings ? sandboxSettings.runMode : undefined,
    framesPerSecond: customLiveSettings ? sandboxSettings.framesPerSecond : undefined,
    yMin: customLiveSettings ? sandboxSettings.yMin : undefined,
    yMax: customLiveSettings ? sandboxSettings.yMax : undefined,
    setupFunction: customLiveSettings && sandboxSettings.runMode === 'functions'
      ? sandboxSettings.setupFunction
      : undefined,
    tickFunction: customLiveSettings && sandboxSettings.runMode === 'functions'
      ? sandboxSettings.tickFunction
      : undefined,
  }, currentUrl())
  const emptySandboxHref = buildEmptySandboxHref(currentUrl())
  const customChannelKey = selectedExample === null && result?.error === null
    ? Object.keys(result.animationFrames[0]?.values ?? {}).join('\u0000')
    : ''
  const customAnimation = useMemo<AnimationSpec | undefined>(() => {
    if (selectedExample !== null || sandboxSettings.runMode === 'once') return undefined

    const channels = customChannelKey === '' ? [] : customChannelKey.split('\u0000')
    const execution = sandboxSettings.runMode === 'functions'
      ? {
          mode: 'live' as const,
          setupFunction: sandboxSettings.setupFunction,
          tickFunction: sandboxSettings.tickFunction,
        }
      : { mode: 'live' as const }

    return {
      kind: 'series',
      title: 'Sandbox live output',
      description: channels.length === 0
        ? 'Add named echoes such as @=value@ to draw streaming values.'
        : 'Each named echo is sampled from persistent Trace memory on every tick.',
      framesPerSecond: Math.min(60, Math.max(1, sandboxSettings.framesPerSecond)),
      execution,
      yMin: sandboxSettings.yMin,
      yMax: sandboxSettings.yMax > sandboxSettings.yMin
        ? sandboxSettings.yMax
        : sandboxSettings.yMin + 1,
      historyLength: 240,
      lines: channels.map((channel, index) => ({
        channel,
        color: customSeriesColors[index % customSeriesColors.length],
        label: channel,
      })),
    }
  }, [customChannelKey, sandboxSettings, selectedExample])
  const activeAnimation = canonicalExample?.animation ?? customAnimation

  const replaceTickSession = useCallback((session: TraceTickSession | null) => {
    tickSessionRef.current = session
    setLiveSessionReady(session !== null)
  }, [])

  const clearScheduledRun = useCallback(() => {
    if (autoRunTimeoutRef.current !== null) {
      clearTimeout(autoRunTimeoutRef.current)
      autoRunTimeoutRef.current = null
    }
  }, [])

  const expandSection = useCallback((section: ExampleSectionId) => {
    setExpandedSections(current => {
      if (current.size === 1 && current.has(section)) return current
      return new Set([section])
    })
  }, [])

  const executeCode = useCallback((argumentInput: string) => {
    const execution = activeAnimation?.execution
    if (execution?.mode === 'live') {
      const session = createTraceTickSession(code, argumentInput, execution)
      const firstTick = session.tick()
      replaceTickSession(firstTick.error === null ? session : null)
      setResult(firstTick)
    } else {
      replaceTickSession(null)
      setResult(runTraceScript(code, argumentInput))
    }
    setRunRevision(revision => revision + 1)
  }, [activeAnimation?.execution, code, replaceTickSession])

  const runAnimationTick = useCallback(() => {
    const session = tickSessionRef.current
    if (session === null) {
      return null
    }

    const tick = session.tick()
    if (tick.error !== null) {
      replaceTickSession(null)
      setResult(current => ({
        output: tick.output,
        logs: [...(current?.logs ?? []), ...tick.logs],
        animationFrames: current?.animationFrames ?? [],
        time: (current?.time ?? 0) + tick.time,
        error: tick.error,
      }))
    }
    return tick.error === null ? tick.animationFrames[0] ?? null : null
  }, [replaceTickSession])

  const runCode = useCallback(() => {
    clearScheduledRun()
    executeCode(args)
  }, [args, clearScheduledRun, executeCode])

  useEffect(() => clearScheduledRun, [clearScheduledRun])
  useEffect(() => () => {
    tickSessionRef.current = null
  }, [])
  useEffect(() => {
    const restoreLocation = () => {
      const sandbox = resolveSandboxLocation(window.location.search)
      clearScheduledRun()
      replaceTickSession(null)
      setSelectedExample(sandbox.selectedExample)
      setCode(sandbox.code)
      setArgs(sandbox.args)
      setSandboxSettings(sandbox.sandboxSettings)
      setResult(null)
      setShareStatus('')
      if (sandbox.selectedExample !== null) {
        expandSection(examples[sandbox.selectedExample].section)
      }
    }

    window.addEventListener('popstate', restoreLocation)
    return () => window.removeEventListener('popstate', restoreLocation)
  }, [clearScheduledRun, expandSection, replaceTickSession])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        runCode()
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        const el = e.currentTarget
        const start = el.selectionStart
        const end = el.selectionEnd
        const next = code.substring(0, start) + '  ' + code.substring(end)
        setCode(next)
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + 2
        })
      }
    },
    [code, runCode],
  )

  const loadExample = (index: number) => {
    clearScheduledRun()
    replaceTickSession(null)
    const ex = examples[index]
    window.history.pushState(null, '', buildExampleHref(ex.id, window.location.href))
    setSelectedExample(index)
    setCode(ex.code)
    setArgs(ex.args ?? '')
    setResult(null)
    setShareStatus('')
    expandSection(ex.section)
    window.scrollTo({ top: 0 })
  }

  const loadAdjacentExample = (offset: -1 | 1) => {
    const target = orderedExampleEntries[activeLessonPosition + offset]
    if (target !== undefined) loadExample(target.index)
  }

  const toggleSection = (section: ExampleSectionId) => {
    setExpandedSections(current => {
      return current.has(section) ? new Set() : new Set([section])
    })
  }

  const followExampleLink = (event: ReactMouseEvent<HTMLAnchorElement>, index: number) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }
    event.preventDefault()
    loadExample(index)
  }

  const loadEmptySandbox = () => {
    clearScheduledRun()
    replaceTickSession(null)
    window.history.pushState(null, '', emptySandboxHref)
    setSelectedExample(null)
    setCode('')
    setArgs('')
    setSandboxSettings(defaultSandboxSettings)
    setResult(null)
    setShareStatus('')
    window.scrollTo({ top: 0 })
  }

  const followEmptySandboxLink = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }
    event.preventDefault()
    loadEmptySandbox()
  }

  const copySandboxLink = async () => {
    try {
      await navigator.clipboard.writeText(new URL(shareHref, window.location.href).href)
      setShareStatus('Link copied')
    } catch {
      setShareStatus('Copy unavailable — use Open in new sandbox')
    }
  }

  const updateSandboxSettings = (update: Partial<SandboxExecutionSettings>) => {
    const finiteUpdate = Object.fromEntries(
      Object.entries(update).filter(([, value]) => typeof value !== 'number' || Number.isFinite(value)),
    ) as Partial<SandboxExecutionSettings>
    clearScheduledRun()
    replaceTickSession(null)
    setResult(null)
    setSandboxSettings(current => ({ ...current, ...finiteUpdate }))
    setShareStatus('')
  }

  const updateControl = (control: InteractiveArgumentControl, value: number) => {
    if (activeExample.controls === undefined || !Number.isFinite(value)) {
      return
    }

    const nextArgs = writeArgumentValue(args, control, value, activeExample.controls.items)
    const liveValue = readArgumentValue(nextArgs, control.argumentIndex, value)
    setArgs(nextArgs)
    setShareStatus('')

    const liveSession = tickSessionRef.current
    if (
      activeAnimation?.execution?.mode === 'live' &&
      liveSession !== null &&
      control.liveVariable !== undefined &&
      liveSession.setVariable(control.liveVariable, liveValue)
    ) {
      return
    }

    replaceTickSession(null)

    if (activeExample.controls.autoRun) {
      clearScheduledRun()
      autoRunTimeoutRef.current = setTimeout(() => {
        autoRunTimeoutRef.current = null
        executeCode(nextArgs)
      }, 140)
    }
  }

  const triggerLiveAction = (control: InteractiveTriggerControl) => {
    tickSessionRef.current?.addToVariable(control.variable, control.amount)
  }

  return {
    activeAnimation,
    activeExample,
    activeLessonPosition,
    activeSection,
    args,
    clearScheduledRun,
    code,
    copySandboxLink,
    currentUrl,
    emptySandboxHref,
    expandedSections,
    followEmptySandboxLink,
    followExampleLink,
    handleKeyDown,
    liveSessionReady,
    loadAdjacentExample,
    orderedExampleEntries,
    replaceTickSession,
    result,
    runAnimationTick,
    runCode,
    runRevision,
    sandboxSettings,
    selectedExample,
    setArgs,
    setCode,
    setShareStatus,
    shareHref,
    shareStatus,
    toggleSection,
    triggerLiveAction,
    updateControl,
    updateSandboxSettings,
  }
}
