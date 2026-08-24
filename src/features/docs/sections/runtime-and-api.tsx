export const runtimeAndApi = [
  {
    title: 'New in v0.1.0',
    content: (
      <div>
        <h4>Function Parameters</h4>
        <p>Cleaner function definitions with named parameters:</p>
        <pre>
          <code>{'add(a, b) => { a + b };\nadd(2, 3)   # Returns 5'}</code>
        </pre>
        <h4>Execution Options</h4>
        <p>
          Use <code>Trace.runWithOptions()</code> for safety and control:
        </p>
        <table className="doc-table">
          <thead>
            <tr>
              <th>Option</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>maxSteps</code>
              </td>
              <td>Limit token execution count</td>
            </tr>
            <tr>
              <td>
                <code>timeoutMs</code>
              </td>
              <td>Wall-clock timeout in ms</td>
            </tr>
            <tr>
              <td>
                <code>strict</code>
              </td>
              <td>Report unknown names as errors</td>
            </tr>
            <tr>
              <td>
                <code>randomSeed</code>
              </td>
              <td>Deterministic randomness</td>
            </tr>
          </tbody>
        </table>
        <h4>Seeded Randomness</h4>
        <p>Make random operations deterministic with a seed:</p>
        <pre>
          <code>
            {
              '# Same seed = same "random" values\nrunTraceWithOptions(\'0~100\', { randomSeed: 123 })'
            }
          </code>
        </pre>
        <h4>Strict Mode</h4>
        <p>Enable strict mode to catch typos and undefined references:</p>
        <pre>
          <code>
            {
              'runTraceWithOptions(\'unknown + 1\', { strict: true })\n# Throws error: "Unknown variable: unknown"'
            }
          </code>
        </pre>
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
        <pre>
          <code>
            {
              "import { runTrace, runTraceWithOptions } from 'trace';\n\n# Simple execution\nconst result = runTrace('1 + 10');\n\n# With arguments\nconst sum = runTrace('[...] t = 0; i = 1; &0 > 0 ? ()=>{t += &i; i++ <= &0 ? () : t}', 1, 2, 3, 4);"
            }
          </code>
        </pre>
        <h4>Trace Class</h4>
        <pre>
          <code>
            {
              "import { Trace } from 'trace';\n\nconst script = Trace.parse('x = 5; x * 2');\nconst output = script.run();"
            }
          </code>
        </pre>
        <h4>Structured Execution</h4>
        <pre>
          <code>
            {
              "const result = runTraceWithOptions('q++; q < 10 ? () : q', {\n  maxSteps: 1000,\n  timeoutMs: 100,\n  strict: true,\n  randomSeed: 123,\n});\n\n# Result format:\n# {\n#   value: number | null,\n#   steps: number,\n#   runtimeMs: number,\n#   status: 'completed' | 'timeout' | 'step-limit' | 'error',\n#   error?: string\n# }"
            }
          </code>
        </pre>
      </div>
    ),
  },
];
