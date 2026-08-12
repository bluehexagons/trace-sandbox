import { examples, exampleSections } from '../examples'
import { AnimationPlayer } from '../animation'
import InteractiveControls from './components/InteractiveControls'
import SandboxRunOptions from './components/SandboxRunOptions'
import TraceCodeEditor from './components/TraceCodeEditor'
import { buildExampleHref } from './sandboxUrl'
import { usePlayground } from './usePlayground'

export default function Playground() {
  const {
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
  } = usePlayground()

  return (
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
                      ? 'Tab indent · Ctrl+Enter · tick() runs once per playback tick'
                      : 'Tab indent · Ctrl+Enter · @frame@ + named echoes render above'
                    : 'Tab indent · Ctrl+Enter to run'}
                </span>
              </div>
              <TraceCodeEditor
                value={code}
                onChange={event => {
                  clearScheduledRun()
                  replaceTickSession(null)
                  setCode(event.target.value)
                  setShareStatus('')
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter trace code here…"
                rows={Math.min(26, Math.max(9, code.split('\n').length + 1))}
                ariaLabel="trace script editor"
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
  )
}
