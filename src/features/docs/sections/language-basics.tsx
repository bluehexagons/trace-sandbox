export const languageBasics = [
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
         <li><strong>Version:</strong> Latest (post-v0.1.0)</li>
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
  title: 'Interactive Controls',
  content: (
    <div>
      <p>
        Some sandbox lessons expose script arguments as sliders or numeric inputs. Moving a
        control updates the corresponding argument. Live lessons marked <strong>Live</strong>
        also write the mapped variable into the current <code>TraceMemory</code>, so the next
        tick continues from the current state instead of restarting.
      </p>
      <pre><code>{`[growth, seed]
population = seed;
population = growth * population * (1 - population)`}</code></pre>
      <ul>
        <li>The controls and the Arguments field represent the same numeric values.</li>
        <li>You can still edit the argument list directly or change how the script uses it.</li>
        <li>Slider limits keep the supplied examples in useful numerical and visual ranges.</li>
      </ul>
      <p>
        Sliders are a sandbox feature backed by ordinary Trace parameters; they do not add new
        language syntax. Live action buttons instead add a value to a named variable in the
        running <code>TraceMemory</code>. The script consumes and clears that event on its next
        tick, so an impulse does not reset any simulation state.
      </p>
      <pre><code>{`# The host adds to pulseTrigger when the button is pressed.
pulseTrigger > 0 ? () => {
  current[21] += pulseHeight * pulseTrigger;
  pulseTrigger = 0
}`}</code></pre>
      <p>
        Run a live lesson before using its action buttons. Try injecting pulses into the damped
        wave, perturbing the Lorenz system, reshuffling the bubble sort, resetting the π
        experiment, releasing populations, or kicking the spring.
      </p>
    </div>
  ),
},
{
  title: 'Shareable Sandboxes',
  content: (
    <div>
      <p>
        Every lesson has a stable URL using its example id. The links in the learning path can
        be copied, opened in another tab, or used with browser back and forward navigation.
      </p>
      <pre><code>{`?example=logistic-map`}</code></pre>
      <p>
        <strong>Empty sandbox</strong> opens the stable blank URL <code>?code=</code>. Custom
        sandboxes can run once, repeat the whole script with persistent memory, or register
        functions and call <code>setup(...)</code> once followed by <code>tick()</code> per frame.
      </p>
      <p>
        Use <strong>Open in new sandbox</strong> below the editor to create a URL containing the
        current script and arguments. Opening it prepopulates a fresh sandbox without running
        the shared code automatically.
      </p>
      <pre><code>{`?code=value%20%3D%205%3B%20value%20*%202&args=10%2020`}</code></pre>
      <p>
        Live execution settings, playback speed, and chart bounds are included when a custom
        sandbox link is copied, so its streaming behavior is reproducible.
      </p>
      <p>
        A shared script can include an <code>example</code> parameter to retain that lesson’s
        interactive controls and animation renderer.
      </p>
    </div>
  ),
}
]
