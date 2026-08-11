import { useState, useCallback, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { examples } from './examples'
import Docs from './Docs'
import { runTraceScript } from './traceRunner'
import './App.css'

type View = 'playground' | 'docs'

function App() {
  const [view, setView] = useState<View>('playground')
  const [code, setCode] = useState(examples[0].code)
  const [args, setArgs] = useState(examples[0].args ?? '')
  const [result, setResult] = useState<ReturnType<typeof runTraceScript> | null>(null)
  const [selectedExample, setSelectedExample] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const runCode = useCallback(() => {
    setResult(runTraceScript(code, args))
  }, [code, args])

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
    const ex = examples[index]
    setSelectedExample(index)
    setCode(ex.code)
    setArgs(ex.args ?? '')
    setResult(null)
    textareaRef.current?.focus()
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
            <h2 className="sidebar-title">Examples</h2>
            <ul className="example-list">
              {examples.map((ex, i) => (
                <li key={ex.name}>
                  <button
                    type="button"
                    className={`example-btn${selectedExample === i ? ' active' : ''}`}
                    onClick={() => loadExample(i)}
                  >
                    <span className="example-name">{ex.name}</span>
                    <span className="example-desc">{ex.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="workspace">
            <section className="editor-section">
              <div className="editor-toolbar">
                <span className="section-label">Script</span>
                <span className="hint">Ctrl+Enter to run</span>
              </div>
              <textarea
                ref={textareaRef}
                className="editor"
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="Enter trace code here…"
                aria-label="trace script editor"
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
                onChange={e => setArgs(e.target.value)}
                placeholder="Optional: pass numbers to &1, &2, …"
                aria-label="script arguments"
              />
            </section>

            <div className="run-row">
              <button type="button" className="run-btn" onClick={runCode}>
                ▶ Run
              </button>
            </div>

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
