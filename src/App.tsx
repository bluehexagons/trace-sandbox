import { useState, useCallback, useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { examples, exampleSections } from './examples'
import AnimationPlayer from './AnimationPlayer'
import Docs from './Docs'
import InteractiveControls from './InteractiveControls'
import { writeArgumentValue } from './interactive'
import type { InteractiveControl } from './interactive'
import { runTraceScript } from './traceRunner'
import './App.css'

type View = 'playground' | 'docs'

function App() {
  const [view, setView] = useState<View>('playground')
  const [code, setCode] = useState(examples[0].code)
  const [args, setArgs] = useState(examples[0].args ?? '')
  const [result, setResult] = useState<ReturnType<typeof runTraceScript> | null>(null)
  const [selectedExample, setSelectedExample] = useState(0)
  const [runRevision, setRunRevision] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoRunTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeExample = examples[selectedExample]
  const activeSection = exampleSections.find(section => section.id === activeExample.section)

  const clearScheduledRun = useCallback(() => {
    if (autoRunTimeoutRef.current !== null) {
      clearTimeout(autoRunTimeoutRef.current)
      autoRunTimeoutRef.current = null
    }
  }, [])

  const executeCode = useCallback((argumentInput: string) => {
    setResult(runTraceScript(code, argumentInput))
    setRunRevision(revision => revision + 1)
  }, [code])

  const runCode = useCallback(() => {
    clearScheduledRun()
    executeCode(args)
  }, [args, clearScheduledRun, executeCode])

  useEffect(() => clearScheduledRun, [clearScheduledRun])

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
    const ex = examples[index]
    setSelectedExample(index)
    setCode(ex.code)
    setArgs(ex.args ?? '')
    setResult(null)
    textareaRef.current?.focus()
  }

  const updateControl = (control: InteractiveControl, value: number) => {
    if (activeExample.controls === undefined || !Number.isFinite(value)) {
      return
    }

    const nextArgs = writeArgumentValue(args, control, value, activeExample.controls.items)
    setArgs(nextArgs)

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
                          <button
                            type="button"
                            className={`example-btn${selectedExample === index ? ' active' : ''}`}
                            onClick={() => loadExample(index)}
                            aria-current={selectedExample === index ? 'step' : undefined}
                          >
                            <span className="example-name">
                              {example.name}
                              {example.controls !== undefined && (
                                <span className="interactive-badge">Interactive</span>
                              )}
                            </span>
                            <span className="example-desc">{example.description}</span>
                          </button>
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
                    {activeSection?.title} · Lesson {selectedExample + 1} of {examples.length}
                  </p>
                  <h2 id="active-lesson-title">{activeExample.name}</h2>
                  <p className="lesson-description">{activeExample.description}</p>
                </div>
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
                    ? 'Ctrl+Enter · @frame@ + named echoes render below'
                    : 'Ctrl+Enter to run'}
                </span>
              </div>
              <textarea
                ref={textareaRef}
                className="editor"
                value={code}
                onChange={event => {
                  clearScheduledRun()
                  setCode(event.target.value)
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
                  setArgs(event.target.value)
                }}
                placeholder="Optional: pass numbers to &1, &2, …"
                aria-label="script arguments"
              />
            </section>

            <div className="run-row">
              <button type="button" className="run-btn" onClick={runCode}>
                ▶ Run
              </button>
            </div>

            {result !== null &&
              result.error === null &&
              activeExample.animation !== undefined &&
              result.animationFrames.length > 0 && (
                <section className="animation-section">
                  <div className="output-toolbar">
                    <span className="section-label">Animation output</span>
                    <span className="hint">Rendered from {result.animationFrames.length} emitted frames</span>
                  </div>
                  <AnimationPlayer
                    key={runRevision}
                    frames={result.animationFrames}
                    spec={activeExample.animation}
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
