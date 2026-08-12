import { useState, useCallback, useEffect, useRef } from 'react'
import type { KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import { examples, exampleSections } from './examples'
import type { Example } from './examples'
import AnimationPlayer from './AnimationPlayer'
import Docs from './Docs'
import InteractiveControls from './InteractiveControls'
import { writeArgumentValue } from './interactive'
import type { InteractiveControl } from './interactive'
import { buildExampleHref, buildSandboxHref, parseSandboxUrl } from './sandboxUrl'
import { createTraceTickSession, runTraceScript } from './traceRunner'
import type { TraceTickSession } from './traceRunner'
import './App.css'

type View = 'playground' | 'docs'

const sharedSandboxExample: Example = {
  id: 'shared-sandbox',
  section: 'foundations' as const,
  name: 'Shared sandbox',
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

  if (parsed.code !== null) {
    return {
      selectedExample: exampleIndex === -1 ? null : exampleIndex,
      code: parsed.code,
      args: parsed.args ?? (exampleIndex === -1 ? '' : examples[exampleIndex].args ?? ''),
    }
  }

  const selectedExample = exampleIndex === -1 ? 0 : exampleIndex
  const example = examples[selectedExample]
  return {
    selectedExample,
    code: example.code,
    args: parsed.args ?? example.args ?? '',
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoRunTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickSessionRef = useRef<TraceTickSession | null>(null)
  const activeExample = selectedExample === null
    ? sharedSandboxExample
    : examples[selectedExample]
  const activeSection = exampleSections.find(section => section.id === activeExample.section)
  const canonicalExample = selectedExample === null ? null : examples[selectedExample]
  const shareHref = buildSandboxHref({
    exampleId: canonicalExample?.id,
    code: canonicalExample !== null && code === canonicalExample.code ? undefined : code,
    args: canonicalExample !== null && args === (canonicalExample.args ?? '') ? undefined : args,
  }, currentUrl())

  const clearScheduledRun = useCallback(() => {
    if (autoRunTimeoutRef.current !== null) {
      clearTimeout(autoRunTimeoutRef.current)
      autoRunTimeoutRef.current = null
    }
  }, [])

  const executeCode = useCallback((argumentInput: string) => {
    const execution = activeExample.animation?.execution
    if (execution?.mode === 'live') {
      const session = createTraceTickSession(code, argumentInput, execution.memoryChannels)
      const firstTick = session.tick()
      tickSessionRef.current = firstTick.error === null ? session : null
      setResult(firstTick)
    } else {
      tickSessionRef.current = null
      setResult(runTraceScript(code, argumentInput))
    }
    setRunRevision(revision => revision + 1)
  }, [activeExample.animation?.execution, code])

  const runAnimationTick = useCallback(() => {
    const session = tickSessionRef.current
    if (session === null) {
      return null
    }

    const tick = session.tick()
    if (tick.error !== null) {
      tickSessionRef.current = null
      setResult(current => ({
        output: tick.output,
        logs: [...(current?.logs ?? []), ...tick.logs],
        animationFrames: current?.animationFrames ?? [],
        time: (current?.time ?? 0) + tick.time,
        error: tick.error,
      }))
    }
    return tick.error === null ? tick.animationFrames[0] ?? null : null
  }, [])

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
      tickSessionRef.current = null
      setView('playground')
      setSelectedExample(sandbox.selectedExample)
      setCode(sandbox.code)
      setArgs(sandbox.args)
      setResult(null)
      setShareStatus('')
    }

    window.addEventListener('popstate', restoreLocation)
    return () => window.removeEventListener('popstate', restoreLocation)
  }, [clearScheduledRun])

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
    tickSessionRef.current = null
    const ex = examples[index]
    window.history.pushState(null, '', buildExampleHref(ex.id, window.location.href))
    setSelectedExample(index)
    setCode(ex.code)
    setArgs(ex.args ?? '')
    setResult(null)
    setShareStatus('')
    textareaRef.current?.focus()
  }

  const followExampleLink = (event: ReactMouseEvent<HTMLAnchorElement>, index: number) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }
    event.preventDefault()
    loadExample(index)
  }

  const copySandboxLink = async () => {
    try {
      await navigator.clipboard.writeText(new URL(shareHref, window.location.href).href)
      setShareStatus('Link copied')
    } catch {
      setShareStatus('Copy unavailable — use Open in new sandbox')
    }
  }

  const updateControl = (control: InteractiveControl, value: number) => {
    if (activeExample.controls === undefined || !Number.isFinite(value)) {
      return
    }

    const nextArgs = writeArgumentValue(args, control, value, activeExample.controls.items)
    tickSessionRef.current = null
    setArgs(nextArgs)
    setShareStatus('')

    if (activeExample.controls.autoRun) {
      clearScheduledRun()
      autoRunTimeoutRef.current = setTimeout(() => {
        autoRunTimeoutRef.current = null
        executeCode(nextArgs)
      }, 140)
    }
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
            <h2 className="sidebar-title">Learning path</h2>
            <p className="sidebar-intro">
              Start with expressions, then build toward complete systems. Every lesson is editable.
            </p>
            <nav className="example-nav" aria-label="Trace example lessons">
              {exampleSections.map(section => {
                const sectionExamples = examples
                  .map((example, index) => ({ example, index }))
                  .filter(({ example }) => example.section === section.id)

                return (
                  <section className="example-group" key={section.id}>
                    <h3>{section.title}</h3>
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
                            <span className="example-name">
                              {example.name}
                              {example.controls !== undefined && (
                                <span className="interactive-badge">Interactive</span>
                              )}
                            </span>
                            <span className="example-desc">{example.description}</span>
                          </a>
                        </li>
                      ))}
                    </ol>
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
                      ? 'URL-prepopulated sandbox'
                      : `${activeSection?.title} · Lesson ${selectedExample + 1} of ${examples.length}`}
                  </p>
                  <h2 id="active-lesson-title">{activeExample.name}</h2>
                  <p className="lesson-description">{activeExample.description}</p>
                </div>
                {selectedExample !== null && (
                  <div className="lesson-nav-buttons" aria-label="Lesson navigation">
                    <button
                      type="button"
                      onClick={() => loadExample(selectedExample - 1)}
                      disabled={selectedExample === 0}
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => loadExample(selectedExample + 1)}
                      disabled={selectedExample === examples.length - 1}
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

            <section className="editor-section">
              <div className="editor-toolbar">
                <span className="section-label">Script</span>
                <span className="hint">
                  {activeExample.animation
                    ? activeExample.animation.execution?.mode === 'live'
                      ? 'Ctrl+Enter · code runs once per playback tick'
                      : 'Ctrl+Enter · @frame@ + named echoes render below'
                    : 'Ctrl+Enter to run'}
                </span>
              </div>
              <textarea
                ref={textareaRef}
                className="editor"
                value={code}
                onChange={event => {
                  clearScheduledRun()
                  tickSessionRef.current = null
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

            {activeExample.controls !== undefined && (
              <InteractiveControls
                args={args}
                controls={activeExample.controls}
                exampleId={activeExample.id}
                onChange={updateControl}
              />
            )}

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
                  tickSessionRef.current = null
                  setArgs(event.target.value)
                  setShareStatus('')
                }}
                placeholder="Optional: pass numbers to &1, &2, …"
                aria-label="script arguments"
              />
            </section>

            <div className="run-row">
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

            {result !== null &&
              result.error === null &&
              activeExample.animation !== undefined &&
              result.animationFrames.length > 0 && (
                <section className="animation-section">
                  <div className="output-toolbar">
                    <span className="section-label">Animation output</span>
                    <span className="hint">
                      {activeExample.animation.execution?.mode === 'live'
                        ? 'Generated live from persistent Trace memory'
                        : `Rendered from ${result.animationFrames.length} emitted frames`}
                    </span>
                  </div>
                  <AnimationPlayer
                    key={runRevision}
                    frames={result.animationFrames}
                    spec={activeExample.animation}
                    onTick={activeExample.animation.execution?.mode === 'live'
                      ? runAnimationTick
                      : undefined}
                    onRestart={activeExample.animation.execution?.mode === 'live'
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
