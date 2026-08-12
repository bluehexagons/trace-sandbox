import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import type { KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import { examples, exampleSections } from './examples'
import type { Example, ExampleSectionId } from './examples'
import AnimationPlayer from './AnimationPlayer'
import Docs from './Docs'
import InteractiveControls from './InteractiveControls'
import SandboxRunOptions from './SandboxRunOptions'
import type { SandboxExecutionSettings } from './SandboxRunOptions'
import type { AnimationSpec } from './animation'
import { readArgumentValue, writeArgumentValue } from './interactive'
import type { InteractiveArgumentControl, InteractiveTriggerControl } from './interactive'
import {
  buildEmptySandboxHref,
  buildExampleHref,
  buildSandboxHref,
  parseSandboxUrl,
} from './sandboxUrl'
import { createTraceTickSession, runTraceScript } from './traceRunner'
import type { TraceTickSession } from './traceRunner'
import './App.css'

type View = 'playground' | 'docs'

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

function App() {
  const [initialSandbox] = useState(() => resolveSandboxLocation(currentSearch()))
  const [view, setView] = useState<View>('playground')
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
      setView('playground')
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
    setView('playground')
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

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <h1 className="logo">
            <span className="logo-accent">trace</span> sandbox
          </h1>
          <nav className="header-links">
            <button
              type="button"
              className={`header-btn${view === 'docs' ? ' active' : ''}`}
              onClick={() => setView('docs')}
            >
              Language docs
            </button>
            <button
              type="button"
              className={`header-btn${view === 'playground' ? ' active' : ''}`}
              onClick={() => setView('playground')}
            >
              Playground
            </button>
            <a href={emptySandboxHref} onClick={followEmptySandboxLink}>
              Empty sandbox
            </a>
            <a
              href="https://github.com/bluehexagons/trace-sandbox"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {view === 'docs' ? (
        <Docs />
      ) : (
        <main className="main">
          <aside className="sidebar">
            <div className="sidebar-heading">
              <div>
                <h2 className="sidebar-title">Examples</h2>
                <p className="sidebar-intro">Learn the language, then explore live systems.</p>
              </div>
              <span className="sidebar-progress">
                {activeLessonPosition === -1 ? 'Custom' : `${activeLessonPosition + 1}/${examples.length}`}
              </span>
            </div>
            <a
              className={`empty-sandbox-link${selectedExample === null ? ' active' : ''}`}
              href={emptySandboxHref}
              onClick={followEmptySandboxLink}
              aria-current={selectedExample === null ? 'page' : undefined}
            >
              <span aria-hidden="true">＋</span>
              Empty sandbox
            </a>
            <nav className="example-nav" aria-label="Trace example lessons">
              {exampleSections.map(section => {
                const sectionExamples = orderedExampleEntries
                  .filter(({ example }) => example.section === section.id)
                const isExpanded = expandedSections.has(section.id)
                const contentId = `example-section-${section.id}`

                return (
                  <section className="example-group" key={section.id}>
                    <h3>
                      <button
                        type="button"
                        className="example-group-toggle"
                        aria-expanded={isExpanded}
                        aria-controls={contentId}
                        onClick={() => toggleSection(section.id)}
                      >
                        <span>{section.title}</span>
                        <span className="example-group-meta">
                          <span>{sectionExamples.length}</span>
                          <span className="example-group-chevron" aria-hidden="true">›</span>
                        </span>
                      </button>
                    </h3>
                    {isExpanded && (
                      <div className="example-group-content" id={contentId}>
                        <p>{section.description}</p>
                        <ol className="example-list">
                          {sectionExamples.map(({ example, index }) => (
                            <li key={example.id}>
                              <a
                                href={buildExampleHref(example.id, currentUrl())}
                                className={`example-btn${selectedExample === index ? ' active' : ''}`}
                                onClick={event => followExampleLink(event, index)}
                                aria-current={selectedExample === index ? 'page' : undefined}
                              >
                                <span className="example-name">{example.name}</span>
                                {example.controls !== undefined && (
                                  <span className="interactive-badge">Live</span>
                                )}
                              </a>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </section>
                )
              })}
            </nav>
          </aside>

          <div className="workspace">
            <section className="lesson-card" aria-labelledby="active-lesson-title">
              <div className="lesson-heading">
                <div>
                  <p className="lesson-position">
                    {selectedExample === null
                      ? code.trim() === '' ? 'General playground' : 'URL-prepopulated sandbox'
                      : `${activeSection?.title} · Lesson ${activeLessonPosition + 1} of ${examples.length}`}
                  </p>
                  <h2 id="active-lesson-title">{activeExample.name}</h2>
                  <p className="lesson-description">{activeExample.description}</p>
                </div>
                {selectedExample !== null && (
                  <div className="lesson-nav-buttons" aria-label="Lesson navigation">
                    <button
                      type="button"
                      onClick={() => loadAdjacentExample(-1)}
                      disabled={activeLessonPosition === 0}
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => loadAdjacentExample(1)}
                      disabled={activeLessonPosition === examples.length - 1}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
              <ul className="concept-list" aria-label="Concepts in this lesson">
                {activeExample.concepts.map(concept => (
                  <li key={concept}>{concept}</li>
                ))}
              </ul>
              <div className="lesson-notes">
                <p>
                  <strong>Expected:</strong> {activeExample.expected}
                </p>
                <p>
                  <strong>Try it:</strong> {activeExample.challenge}
                </p>
              </div>
            </section>

            {selectedExample === null && (
              <SandboxRunOptions
                settings={sandboxSettings}
                onChange={updateSandboxSettings}
              />
            )}

            <div className="run-row run-row-top">
              <button type="button" className="run-btn" onClick={runCode}>
                ▶ {selectedExample === null ? 'Run script' : 'Run example'}
              </button>
              <span className="hint">Run first, then interact with the output or edit the script below.</span>
            </div>

            {activeExample.controls !== undefined && (
              <InteractiveControls
                args={args}
                controls={activeExample.controls}
                exampleId={activeExample.id}
                onChange={updateControl}
                onTrigger={triggerLiveAction}
                liveActionsEnabled={liveSessionReady && result?.error === null}
              />
            )}

            {result !== null &&
              result.error === null &&
              activeAnimation !== undefined &&
              result.animationFrames.length > 0 && (
                <section className="animation-section">
                  <div className="output-toolbar">
                    <span className="section-label">Animation output</span>
                    <span className="hint">
                      {activeAnimation.execution?.mode === 'live'
                        ? 'Generated live from persistent Trace memory'
                        : `Rendered from ${result.animationFrames.length} emitted frames`}
                    </span>
                  </div>
                  <AnimationPlayer
                    key={runRevision}
                    frames={result.animationFrames}
                    spec={activeAnimation}
                    onTick={activeAnimation.execution?.mode === 'live'
                      ? runAnimationTick
                      : undefined}
                    onRestart={activeAnimation.execution?.mode === 'live'
                      ? runCode
                      : undefined}
                  />
                </section>
              )}

            {result !== null && (
              <section className="output-section">
                <div className="output-toolbar">
                  <span className="section-label">Output</span>
                  {result.error === null && (
                    <span className="timing">{result.time.toFixed(2)} ms</span>
                  )}
                </div>

                {result.error ? (
                  <div className="output output-error">
                    <span className="error-label">Error</span>
                    <pre>{result.error}</pre>
                  </div>
                ) : (
                  <div className="output">
                    <div className="result-line">
                      <span className="result-label">Result</span>
                      <span className="result-value">
                        {result.output === null ? 'null' : String(result.output)}
                      </span>
                    </div>
                    {result.logs.length > 0 && (
                      <div className="log-section">
                        <span className="log-label">Console</span>
                        <pre className="log-output">
                          {result.logs.join('\n')}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            <section className="editor-section">
              <div className="editor-toolbar">
                <span className="section-label">Script</span>
                <span className="hint">
                  {activeAnimation
                    ? activeAnimation.execution?.mode === 'live'
                      ? 'Ctrl+Enter · tick() runs once per playback tick'
                      : 'Ctrl+Enter · @frame@ + named echoes render above'
                    : 'Ctrl+Enter to run'}
                </span>
              </div>
              <textarea
                className="editor"
                value={code}
                onChange={event => {
                  clearScheduledRun()
                  replaceTickSession(null)
                  setCode(event.target.value)
                  setShareStatus('')
                }}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="Enter trace code here…"
                aria-label="trace script editor"
                rows={Math.min(26, Math.max(9, code.split('\n').length + 1))}
              />
            </section>

            <section className="args-section">
              <label className="section-label" htmlFor="args-input">
                Arguments
                <span className="hint"> (space-separated numbers, e.g. 1 2 3)</span>
              </label>
              <input
                id="args-input"
                className="args-input"
                type="text"
                value={args}
                onChange={event => {
                  clearScheduledRun()
                  replaceTickSession(null)
                  setArgs(event.target.value)
                  setShareStatus('')
                }}
                placeholder="Optional: pass numbers to &1, &2, …"
                aria-label="script arguments"
              />
            </section>

            <div className="run-row run-row-bottom">
              <button type="button" className="run-btn" onClick={runCode}>
                ▶ Run
              </button>
              <a
                className="sandbox-link"
                href={shareHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in new sandbox ↗
              </a>
              <button type="button" className="sandbox-copy" onClick={copySandboxLink}>
                Copy link
              </button>
              <span className="share-status" aria-live="polite">{shareStatus}</span>
            </div>
          </div>
        </main>
      )}

      <footer className="footer">
        <p>
          trace language by{' '}
          <a href="https://github.com/bluehexagons" target="_blank" rel="noopener noreferrer">
            bluehexagons
          </a>{' '}
          · MIT License
        </p>
      </footer>
    </div>
  )
}

export default App
