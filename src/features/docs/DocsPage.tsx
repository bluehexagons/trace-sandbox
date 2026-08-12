import { languageBasics } from './sections/language-basics'
import { executionAndDebugging } from './sections/execution-and-debugging'
import { runtimeAndApi } from './sections/runtime-and-api'

const sections = [
  ...languageBasics,
  ...executionAndDebugging,
  ...runtimeAndApi,
]

export default function DocsPage() {
  return (
    <div className="docs">
      <header className="docs-header">
        <h1><span className="logo-accent">trace</span> language docs</h1>
        <p className="docs-version">Latest Version</p>
      </header>
      <div className="docs-content">
        {sections.map((section) => (
          <section key={section.title} className="docs-section">
            <h2>{section.title}</h2>
            {section.content}
          </section>
        ))}
      </div>
    </div>
  )
}
