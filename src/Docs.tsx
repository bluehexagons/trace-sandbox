import './Docs.css'

const sections = [
  {
    title: 'Overview',
    content: (
      <div>
        <p>
          <strong>Trace</strong> is an esoteric, specialized, functional programming language
          designed to be minimal yet powerful in unconventional ways.
        </p>
        <p>
          All values in Trace are 64-bit floats. The language emphasizes expressive
          one-liners and recursive patterns over traditional control flow.
        </p>
        <ul>
          <li><strong>Version:</strong> 0.1.0</li>
          <li><strong>License:</strong> MIT</li>
          <li><strong>Repository:</strong> <a href="https://github.com/bluehexagons/trace" target="_blank" rel="noopener noreferrer">github.com/bluehexagons/trace</a></li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Comments',
    content: (
      <div>
        <p>Comments start with <code>#</code> and continue to the end of the line.</p>
        <pre><code>{"# This is a comment\n1 + 2  # Inline comment"}</code></pre>
      </div>
    ),
  },
  {
    title: 'Literals & Values',
    content: (
      <div>
        <p>All literals resolve to 64-bit floats.</p>
        <table className="doc-table">
          <thead>
            <tr><th>Syntax</th><th>Description</th><th>Example</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code>42</code></td>
              <td>Number literal</td>
              <td><code>1 + 10</code></td>
            </tr>
            <tr>
              <td><code>15%</code></td>
              <td>Percentage of <code>value</code> variable</td>
              <td><code>{"value = 200; 15%"}</code> → 30</td>
            </tr>
            <tr>
              <td><code>1|2|3|4</code></td>
              <td>Selection (random pick)</td>
              <td><code>1|2|3|4</code></td>
            </tr>
            <tr>
              <td><code>0~1</code></td>
              <td>Range (random float [a,b))</td>
              <td><code>0~100</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    title: 'Variables',
    content: (
      <div>
        <p>Variables are dynamically typed as numbers (floats).</p>
        <pre><code>{"x = 5        # Assignment\nx += 3       # Add and assign (also -=, *=, /=, %%=, **=)\nx++          # Increment (instant, like ++x)\nx--          # Decrement"}</code></pre>
        <p>Variables default to <code>0</code> if not previously assigned.</p>
      </div>
    ),
  },
  {
    title: 'Mathematical Operators',
    content: (
      <div>
        <table className="doc-table">
          <thead>
            <tr><th>Operator</th><th>Description</th><th>Example</th></tr>
          </thead>
          <tbody>
            <tr><td><code>+</code></td><td>Addition</td><td><code>1 + 2</code></td></tr>
            <tr><td><code>-</code></td><td>Subtraction</td><td><code>5 - 3</code></td></tr>
            <tr><td><code>*</code></td><td>Multiplication</td><td><code>4 * 2</code></td></tr>
            <tr><td><code>/</code></td><td>Division</td><td><code>10 / 2</code></td></tr>
            <tr><td><code>%%</code></td><td>Modulus</td><td><code>10 %% 3</code> → 1</td></tr>
            <tr><td><code>%</code></td><td>Percentage of <code>value</code></td><td><code>50%</code></td></tr>
            <tr><td><code>**</code></td><td>Exponentiation</td><td><code>2 ** 8</code> → 256</td></tr>
            <tr><td><code>~</code></td><td>Range (random)</td><td><code>0~1</code></td></tr>
            <tr><td><code>+-</code></td><td>Plusminus (±value)</td><td><code>+-0.5</code></td></tr>
          </tbody>
        </table>
        <h4>Order of Operations</h4>
        <ol>
          <li><code>~</code> (range)</li>
          <li><code>**</code> (power)</li>
          <li><code>*</code>, <code>/</code>, <code>%%</code></li>
          <li><code>+</code>, <code>-</code></li>
          <li><code>&gt;</code>, <code>&lt;</code>, <code>==</code>, <code>!=</code>, <code>&gt;=</code>, <code>&lt;=</code></li>
        </ol>
        <p>Use parentheses <code>( )</code> to group expressions.</p>
      </div>
    ),
  },
  {
    title: 'Conditionals',
    content: (
      <div>
        <p>Boolean logic: <code>0</code> = false, non-zero = true. The true result is <code>1</code>.</p>
        <table className="doc-table">
          <thead>
            <tr><th>Operator</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code></td><td>Comparisons</td></tr>
            <tr><td><code>==</code>, <code>!=</code></td><td>Equality checks</td></tr>
            <tr><td><code>&&</code></td><td>Logical AND</td></tr>
            <tr><td><code>||</code></td><td>Logical OR</td></tr>
            <tr><td><code>^</code></td><td>Exclusive OR</td></tr>
          </tbody>
        </table>
        <h4>Ternary Operator</h4>
        <pre><code>{"x = 7; x > 5 ? 1 : 0    # If x > 5, returns 1, else 0\nx > 5 ? 1                 # Single-branch ternary"}</code></pre>
        <p>Ternary terminates on statement end (semicolon or end of script).</p>
      </div>
    ),
  },
  {
    title: 'Script Parameters',
    content: (
      <div>
        <p>Define parameters at the beginning of a script to accept arguments.</p>
        <pre><code>{"[a, b, c]          # Named parameters\n[n]                # Fixed argument count\n[...]              # Variable arguments (any number)"}</code></pre>
        <h4>Accessing Arguments</h4>
        <table className="doc-table">
          <thead>
            <tr><th>Syntax</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><code>&amp;1</code>, <code>&amp;2</code>, ...</td><td>Access argument by position</td></tr>
            <tr><td><code>&amp;0</code></td><td>Number of arguments passed</td></tr>
            <tr><td><code>&amp;x</code></td><td>Value of variable <code>x</code></td></tr>
          </tbody>
        </table>
        <pre><code>{"# Sum all arguments\n[...] t = 0; i = 1; &0 > 0 ? ()=>{t += &i; i++ <= &0 ? () : t}"}</code></pre>
      </div>
    ),
  },
  {
    title: 'Functions',
    content: (
      <div>
        <h4>Named Functions</h4>
        <pre><code>{"name() => { line1; line2; implicit return }\nname() => implicit return;  # Lambda form (ends in semicolon)"}</code></pre>
        <h4>Anonymous Functions</h4>
        <pre><code>{"() => { do; stuff; implicit return }\n() => implicit return;      # Anonymous lambda"}</code></pre>
        <h4>Function Calls</h4>
        <pre><code>{"name()             # Call named function\n()                # Call current function (recursion)"}</code></pre>
        <h4>Function Parameters (v0.1.0)</h4>
        <p>Named parameters as syntactic sugar over globals:</p>
        <pre><code>{"multiply(x, y) => { x * y };\nmultiply(3, 4)   # Returns 12"}</code></pre>
        <p>Missing arguments default to <code>0</code>.</p>
      </div>
    ),
  },
  {
    title: 'Tail Call Optimization',
    content: (
      <div>
        <p>Use <code>{">func()"}</code> for tail calls that obliterate the current stack frame.</p>
        <pre><code>{"# Loop using TCO\ni = 0;\n() => i++ < 10 ? >() : i"}</code></pre>
        <p>This enables efficient recursion without stack overflow.</p>
      </div>
    ),
  },
  {
    title: 'Echo / Debug Output',
    content: (
      <div>
        <p>Use <code>@...@</code> syntax for debug output.</p>
        <table className="doc-table">
          <thead>
            <tr><th>Syntax</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><code>@echo@</code></td><td>Log text to console</td></tr>
            <tr><td><code>@=var@</code></td><td>Log variable name and value</td></tr>
            <tr><td><code>@&amp;n@</code></td><td>Log result of pointer resolution</td></tr>
          </tbody>
        </table>
        <pre><code>{"x = 42; @=x@; x * 2    # Logs \"x = 42\""}</code></pre>
      </div>
    ),
  },
  {
    title: 'New in v0.1.0',
    content: (
      <div>
        <h4>Function Parameters</h4>
        <p>Cleaner function definitions with named parameters:</p>
        <pre><code>{"add(a, b) => { a + b };\nadd(2, 3)   # Returns 5"}</code></pre>
        <h4>Execution Options</h4>
        <p>Use <code>Trace.runWithOptions()</code> for safety and control:</p>
        <table className="doc-table">
          <thead>
            <tr><th>Option</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><code>maxSteps</code></td><td>Limit token execution count</td></tr>
            <tr><td><code>timeoutMs</code></td><td>Wall-clock timeout in ms</td></tr>
            <tr><td><code>strict</code></td><td>Report unknown names as errors</td></tr>
            <tr><td><code>randomSeed</code></td><td>Deterministic randomness</td></tr>
          </tbody>
        </table>
        <h4>Seeded Randomness</h4>
        <p>Make random operations deterministic with a seed:</p>
        <pre><code>{"# Same seed = same \"random\" values\nrunTraceWithOptions('0~100', { randomSeed: 123 })"}</code></pre>
        <h4>Strict Mode</h4>
        <p>Enable strict mode to catch typos and undefined references:</p>
        <pre><code>{"runTraceWithOptions('unknown + 1', { strict: true })\n# Throws error: \"Unknown variable: unknown\""}</code></pre>
        <h4>Performance Improvements</h4>
        <ul>
          <li>Batched timeout checks (every 1024 steps)</li>
          <li>Pre-parsed function arguments at tokenization</li>
          <li>Pre-split literal arrays</li>
          <li>Optimized Map lookups</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'JavaScript API',
    content: (
      <div>
        <h4>Quick Execution</h4>
        <pre><code>{"import { runTrace, runTraceWithOptions } from 'trace';\n\n# Simple execution\nconst result = runTrace('1 + 10');\n\n# With arguments\nconst sum = runTrace('[...] t = 0; i = 1; &0 > 0 ? ()=>{t += &i; i++ <= &0 ? () : t}', 1, 2, 3, 4);"}</code></pre>
        <h4>Trace Class</h4>
        <pre><code>{"import { Trace } from 'trace';\n\nconst script = Trace.parse('x = 5; x * 2');\nconst output = script.run();"}</code></pre>
        <h4>Structured Execution</h4>
        <pre><code>{"const result = runTraceWithOptions('q++; q < 10 ? () : q', {\n  maxSteps: 1000,\n  timeoutMs: 100,\n  strict: true,\n  randomSeed: 123,\n});\n\n# Result format:\n# {\n#   value: number | null,\n#   steps: number,\n#   runtimeMs: number,\n#   status: 'completed' | 'timeout' | 'step-limit' | 'error',\n#   error?: string\n# }"}</code></pre>
      </div>
    ),
  },
]

export default function Docs() {
  return (
    <div className="docs">
      <header className="docs-header">
        <h1><span className="logo-accent">trace</span> language docs</h1>
        <p className="docs-version">Version 0.1.0</p>
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
