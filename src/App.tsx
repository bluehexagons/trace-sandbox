import { useState, useCallback, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { Trace } from './lib/trace'
import { examples } from './examples'
import './App.css'

interface RunResult {
  output: number | null
  logs: string[]
  time: number
  error: string | null
}

function App() {
  const [code, setCode] = useState(examples[0].code)
  const [args, setArgs] = useState(examples[0].args ?? '')
  const [result, setResult] = useState<RunResult | null>(null)
  const [selectedExample, setSelectedExample] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const runCode = useCallback(() => {
    const logs: string[] = []
    try {
      const parsedArgs = args.trim()
        ? args.trim().split(/\s+/).map(Number).filter(n => !isNaN(n))
        : []

      const t = Trace.parse(code)
      // Collect @echo@ output — forward all arguments the interpreter passes
      t.logger = (...msgs: unknown[]) => {
        logs.push(msgs.map(m => String(m)).join(' '))
      }
      // Capture error output in the console panel
      t.errorLogger = (...msgs: unknown[]) => {
        logs.push(`⚠ ${msgs.map(m => String(m)).join(' ')}`)
      }

      const start = performance.now()
      const output = t.run(parsedArgs)
      const time = performance.now() - start

      setResult({ output, logs, time, error: null })
    } catch (e) {
      setResult({
        output: null,
        logs,
        time: 0,
        error: e instanceof Error ? e.message : String(e),
      })
    }
  }, [code, args])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        runCode()
      }
      // Allow Tab key to insert spaces instead of leaving the field
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
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="header">
        <div className="header-inner">
          <h1 className="logo">
            <span className="logo-accent">trace</span> sandbox
          </h1>
          <nav className="header-links">
            <a
              href="https://github.com/bluehexagons/trace"
              target="_blank"
              rel="noopener noreferrer"
            >
              Language docs
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

      <main className="main">
        {/* ── Left column: examples ──────────────────────── */}
        <aside className="sidebar">
          <h2 className="sidebar-title">Examples</h2>
          <ul className="example-list">
            {examples.map((ex, i) => (
              <li key={i}>
                <button
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

        {/* ── Right column: editor + output ──────────────── */}
        <div className="workspace">
          {/* Editor */}
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

          {/* Arguments */}
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

          {/* Run button */}
          <div className="run-row">
            <button className="run-btn" onClick={runCode}>
              ▶ Run
            </button>
          </div>

          {/* Output */}
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

      {/* ── Footer ─────────────────────────────────────── */}
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
