export const executionAndDebugging = [
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
  title: 'Animated Output',
  content: (
    <div>
      <p>
        Animated lessons evaluate their function definitions once, call <code>setup()</code>,
        then call <code>tick()</code> in the same persistent memory environment for each frame.
        Variables and arrays therefore continue from the preceding frame without repeatedly
        running initialization code or pre-rendering the animation.
      </p>
      <pre><code>{`setup() => {
  frame = 0;
  x = 0
};

tick() => {
  @=x@;       # Add x to this tick's frame
  x += 2;
  frame++
};`}</code></pre>
      <h4>Live Frame Protocol</h4>
      <ul>
        <li>The host registers the script’s functions, calls its configured setup function once, and its tick function repeatedly.</li>
        <li>Setup and tick calls share one <code>TraceMemory</code> instance.</li>
        <li><code>@=x@</code> adds one numeric value to channel <code>x</code>.</li>
        <li>Scalar channels use named echoes, while dense output can be read directly from a Trace array.</li>
        <li>Time-series charts draw one labeled trail per channel, such as prey and predators.</li>
        <li>Reference lines distinguish a target constant, such as π, from measured output.</li>
        <li>State-space scenes combine two channels into one trail, such as an orbit’s x/y position.</li>
        <li>Bar charts turn a memory-backed array into a live algorithm visualization.</li>
        <li>Pause stops execution, resume continues the same memory, and Reset starts fresh.</li>
      </ul>
      <p>
        Live playback and the choice of setup/tick function names are sandbox conventions built
        on <code>TraceMemory</code>, not additional language syntax. The wave,
        cellular-automaton, and sorting lessons expose current arrays as memory-backed channels,
        avoiding repeated echo loops. The renderer keeps only the history needed for trails, so
        the Trace program can continue streaming without accumulating every prior frame in
        browser memory.
      </p>
    </div>
  ),
},
{
  title: 'Arrays',
  content: (
    <div>
      <p>Trace supports fixed-size arrays. Arrays are 1-indexed (index 0 stores the size).</p>
      <h4>Creating Arrays</h4>
      <pre><code>{"arr = [5]       # 5-element array, all initialized to 0\narr = [n]       # Size can be any expression"}</code></pre>
      <h4>Reading & Writing</h4>
      <pre><code>{"arr[1] = 10     # Write value 10 to element 1\narr[1]          # Read element at index 1\narr[0]          # Returns array size (5 in above example)\narr            # Reading without index also returns size"}</code></pre>
      <h4>Array Operations</h4>
      <pre><code>{"arr = [3]; arr[1] = 10; arr[2] = 20; arr[3] = 30;\narr[1] + arr[2] + arr[3]  # Returns 60"}</code></pre>
      <p>Compound assignment works: <code>arr[i] += 5</code>, <code>arr[i] *= 2</code>, etc.</p>
      <p>In default mode, out-of-bounds reads return <code>0</code>. In strict mode, they throw errors.</p>
    </div>
  ),
},
{
  title: 'Syntax Errors',
  content: (
    <div>
      <p>Trace provides detailed parse error messages with location indicators.</p>
      <pre><code>{"Trace.parse('1 > < 2')\n# Throws: \"Syntax error at offset 2: unexpected operator\n#           1><2\n#             ^\""}</code></pre>
      <p>Error format shows the offset in preprocessed source, with a <code>^</code> pointer to the exact position.</p>
    </div>
  ),
},
{
  title: 'First-Class Functions',
  content: (
    <div>
      <p>Functions can be stored in variables and passed as arguments.</p>
      <pre><code>{"double(x) => { x * 2 }\nf = double          # Store function reference\nf(5)              # Call via reference - returns 10\n\napply(fn, x) => { fn(x) }\napply(double, 5)  # Pass function as argument - returns 10"}</code></pre>
    </div>
  ),
},
{
  title: 'Standard Library',
  content: (
    <div>
      <p>Optional stdlib functions available via <code>stdlib</code> option in <code>runTraceWithOptions()</code>.</p>
      <h4>Loop Functions</h4>
      <pre><code>{"i = 0; while(i < 3, i++); i              # Returns 3\nfor(i = 0, i < 5, { i++ }); i            # Returns 5\ndo i = 0; dowhile(i++, i < 3); i        # Returns 3"}</code></pre>
      <h4>Array Functions</h4>
      <table className="doc-table">
        <thead>
          <tr><th>Function</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>foreach(arr, fn)</code></td><td>Call fn(elem, index) for each element</td></tr>
          <tr><td><code>mapmut(arr, fn)</code></td><td>Replace elements with fn(elem, index) in place</td></tr>
          <tr><td><code>map(arr, fn)</code></td><td>Return new array with fn(elem, index)</td></tr>
          <tr><td><code>reduce(arr, fn, init?)</code></td><td>Fold with fn(acc, elem, index)</td></tr>
          <tr><td><code>sort(arr, cmp?)</code></td><td>Sort in place (default ascending)</td></tr>
          <tr><td><code>sum(arr)</code></td><td>Return total of all elements</td></tr>
          <tr><td><code>find(arr, pred)</code></td><td>Return 1-based index of first match (0 if none)</td></tr>
        </tbody>
      </table>
      <h4>Enabling Stdlib</h4>
      <pre><code>{"runTraceWithOptions('i = 0; while(i < 3, i++); i', {\n  stdlib: { loops: true, arrays: true }\n});"}</code></pre>
    </div>
  ),
}
]
