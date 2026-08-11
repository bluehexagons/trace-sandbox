import type { AnimationSpec } from './animation'

export const exampleSections = [
  {
    id: 'foundations',
    title: '1. Foundations',
    description: 'Expressions, state, decisions, and trace’s unusual random operators.',
  },
  {
    id: 'functions',
    title: '2. Functions & flow',
    description: 'Build control flow from calls, recursion, and the standard library.',
  },
  {
    id: 'data',
    title: '3. Data & input',
    description: 'Accept arguments, work with 1-indexed arrays, and transform data.',
  },
  {
    id: 'debugging',
    title: '4. Debugging',
    description: 'Inspect a running program and learn how failures are reported.',
  },
  {
    id: 'systems',
    title: '5. Larger systems',
    description: 'Put the pieces together in algorithms, simulations, and an interpreter.',
  },
  {
    id: 'animations',
    title: '6. Animated output',
    description: 'Emit frame channels that the playground turns into live visualizations.',
  },
] as const

export type ExampleSectionId = (typeof exampleSections)[number]['id']

export interface Example {
  id: string
  section: ExampleSectionId
  name: string
  description: string
  concepts: string[]
  expected: string
  challenge: string
  code: string
  args?: string
  expectedValue?: number
  expectsError?: boolean
  animation?: AnimationSpec
}

export const examples: Example[] = [
  {
    id: 'expressions-and-precedence',
    section: 'foundations',
    name: 'Expressions & precedence',
    description: 'Build a small price calculation and return the final expression.',
    concepts: ['expressions', 'variables', 'percentages', 'precedence'],
    expected: '220.32 — the discounted price plus 8% tax.',
    challenge: 'Change the discount to 20%, then add parentheses to apply tax before the discount.',
    code: `# The special % literal takes a percentage of "value".
value = 240;
discount = 15%;
afterDiscount = value - discount;
tax = afterDiscount * 0.08;
afterDiscount + tax`,
    expectedValue: 220.32,
  },
  {
    id: 'variables-and-updates',
    section: 'foundations',
    name: 'Variables & updates',
    description: 'Follow a value through assignment, compound updates, and increment.',
    concepts: ['assignment', '+=', '*=', '--'],
    expected: '29.',
    challenge: 'Replace score-- with score **= 2 and predict the new result before running it.',
    code: `score = 10;
score += 5;
score *= 2;
score--;
score`,
    expectedValue: 29,
  },
  {
    id: 'conditional-bands',
    section: 'foundations',
    name: 'Decisions with ternaries',
    description: 'Use single-branch ternaries as conditional updates.',
    concepts: ['comparisons', 'truthiness', 'ternary'],
    expected: '2 — a score of 82 lands in the middle band.',
    challenge: 'Turn this into one nested ternary expression that produces the same result.',
    code: `score = 82;
band = 1;
score >= 75 ? band = 2;
score >= 90 ? band = 3;
band`,
    expectedValue: 2,
  },
  {
    id: 'random-values',
    section: 'foundations',
    name: 'Random values',
    description: 'Compare selection, range, and plus-or-minus random expressions.',
    concepts: ['selection |', 'range ~', 'plusminus +-', 'echo'],
    expected: 'A different sample from 10 (inclusive) to 20 (exclusive).',
    challenge: 'Build a coin flip that returns either -1 or 1 in two different ways.',
    code: `die = 1|2|3|4|5|6;
jitter = +-0.5;
sample = 10~20;
@=die@;
@=jitter@;
sample`,
  },
  {
    id: 'named-functions',
    section: 'functions',
    name: 'Named functions',
    description: 'Package an expression behind named parameters and an implicit return.',
    concepts: ['definition', 'parameters', 'implicit return'],
    expected: '5 — the hypotenuse of a 3–4–5 triangle.',
    challenge: 'Add an area(a, b) function and call it with the same arguments.',
    code: `hypotenuse(a, b) => {
  (a ** 2 + b ** 2) ** 0.5
};

hypotenuse(3, 4)`,
    expectedValue: 5,
  },
  {
    id: 'recursion-as-iteration',
    section: 'functions',
    name: 'Recursion as iteration',
    description: 'Trace’s anonymous self-call can do the work of a conventional loop.',
    concepts: ['anonymous function', 'self-call ()', 'mutable state'],
    expected: '10 after the function calls itself nine times.',
    challenge: 'Change the program to count by twos without changing the limit.',
    code: `count = 0;
() => {
  count++;
  count < 10 ? () : count
};
count`,
    expectedValue: 10,
  },
  {
    id: 'tail-recursive-factorial',
    section: 'functions',
    name: 'Tail-recursive factorial',
    description: 'Carry state through parameters and replace each stack frame with a tail call.',
    concepts: ['recursion', 'accumulator', 'tail call >'],
    expected: '720, or 6 factorial.',
    challenge: 'Try factorial(10, 1), then remove > and compare what the two versions mean.',
    code: `factorial(n, accumulator) => {
  n <= 1 ? accumulator : () => {
    # Evaluate both values before the call: parameters are shared globals.
    nextN = n - 1;
    nextAccumulator = accumulator * n;
    >factorial(nextN, nextAccumulator)
  }
};

factorial(6, 1)`,
    expectedValue: 720,
  },
  {
    id: 'first-class-functions',
    section: 'functions',
    name: 'First-class functions',
    description: 'Select behavior by passing a function reference into another function.',
    concepts: ['function references', 'higher-order functions', 'composition'],
    expected: '36 — the stored result of double(3) is passed into square.',
    challenge: 'Write increment(value), then add it as a third stage in the pipeline.',
    code: `double(value) => { value * 2 };
square(value) => { value ** 2 };
apply(fn, input) => { fn(input) };

doubled = apply(double, 3);
apply(square, doubled)`,
    expectedValue: 36,
  },
  {
    id: 'stdlib-loop',
    section: 'functions',
    name: 'Standard-library loop',
    description: 'Use while when a conventional loop communicates the idea more clearly.',
    concepts: ['stdlib', 'while', 'callable body'],
    expected: '15 — the sum of the integers from 1 through 5.',
    challenge: 'Rewrite the same loop with a tail-recursive named function.',
    code: `total = 0;
i = 1;

while(i <= 5, () => {
  total += i;
  i++
});

total`,
    expectedValue: 15,
  },
  {
    id: 'named-script-parameters',
    section: 'data',
    name: 'Named script parameters',
    description: 'Give incoming arguments readable names at the top of a script.',
    concepts: ['script parameters', 'arguments', 'echo'],
    expected: '26 — the perimeter of an 8 by 5 rectangle.',
    challenge: 'Add a third depth argument and return the volume of a box.',
    code: `[width, height]
area = width * height;
perimeter = 2 * (width + height);
@=area@;
perimeter`,
    args: '8 5',
    expectedValue: 26,
  },
  {
    id: 'variadic-sum',
    section: 'data',
    name: 'Variadic arguments',
    description: 'Walk an arbitrary argument list using &0 as its size and &i as a dynamic pointer.',
    concepts: ['[...]', 'argument pointers', 'dynamic indexing'],
    expected: '25 — the sum of the four supplied arguments.',
    challenge: 'Return the average instead; remember that &0 is the argument count.',
    code: `[...]
total = 0;
i = 1;

&0 > 0 ? () => {
  total += &i;
  i++ <= &0 ? >() : total
} : 0`,
    args: '3 5 8 9',
    expectedValue: 25,
  },
  {
    id: 'array-basics',
    section: 'data',
    name: 'Array basics',
    description: 'Create a fixed-size array, write its 1-indexed elements, and read them back.',
    concepts: ['fixed-size arrays', '1-based indexing', 'arr[0] size'],
    expected: '72 — the sum of four readings.',
    challenge: 'Use readings[0] in the result, then change the array size and add another reading.',
    code: `readings = [4];
readings[1] = 18;
readings[2] = 21;
readings[3] = 16;
readings[4] = 17;

readings[1] + readings[2] + readings[3] + readings[4]`,
    expectedValue: 72,
  },
  {
    id: 'array-iteration',
    section: 'data',
    name: 'Build and reduce an array',
    description: 'Separate array construction from aggregation with two focused functions.',
    concepts: ['arrays', 'recursive traversal', 'separation of concerns'],
    expected: '30 — the sum of [2, 4, 6, 8, 10].',
    challenge: 'Change fill so the array holds squares, then predict the new total.',
    code: `values = [5];

fill() => {
  values[i] = i * 2;
  i++ <= values[0] ? >fill() : 0
};

addAll() => {
  total += values[j];
  j++ <= values[0] ? >addAll() : total
};

i = 1;
fill();
j = 1;
total = 0;
addAll()`,
    expectedValue: 30,
  },
  {
    id: 'array-pipeline',
    section: 'data',
    name: 'Map–reduce pipeline',
    description: 'Transform an array with a callback, then fold the result into one value.',
    concepts: ['map', 'reduce', 'callbacks', 'data pipeline'],
    expected: '55 — 1² + 2² + 3² + 4² + 5².',
    challenge: 'Use mapmut instead of map and inspect how it changes the original values array.',
    code: `values = [5];
values[1] = 1;
values[2] = 2;
values[3] = 3;
values[4] = 4;
values[5] = 5;

square(item, index) => { item ** 2 };
add(total, item, index) => { total + item };

squares = map(values, square);
reduce(squares, add, 0)`,
    expectedValue: 55,
  },
  {
    id: 'echo-debugging',
    section: 'debugging',
    name: 'Trace a calculation',
    description: 'Use echo statements as lightweight checkpoints without changing the result.',
    concepts: ['@text@', '@=variable@', 'console output'],
    expected: '1250, with principal, rate, and interest in the Console panel.',
    challenge: 'Introduce a monthly payment variable and echo the remaining balance.',
    code: `principal = 250000;
annualRate = 0.06;
months = 12;

@loan calculation@;
@=principal@;
@=annualRate@;
interest = principal * annualRate / months;
@=interest@;
interest`,
    expectedValue: 1250,
  },
  {
    id: 'syntax-error',
    section: 'debugging',
    name: 'Read a syntax error',
    description: 'Run malformed code and use the offset and caret to locate the parser failure.',
    concepts: ['parse errors', 'source location', 'diagnosis'],
    expected: 'An error pointing at the incompatible adjacent operators.',
    challenge: 'Fix the expression so it asks whether 1 is greater than -2.',
    code: `# Two comparison operators cannot appear together.
1 > < 2`,
    expectsError: true,
  },
  {
    id: 'euclidean-algorithm',
    section: 'systems',
    name: 'Euclidean algorithm',
    description: 'A compact real algorithm: repeatedly replace two values with a remainder pair.',
    concepts: ['algorithm', 'modulus', 'tail recursion', 'invariant'],
    expected: '21 — the greatest common divisor of 1071 and 462.',
    challenge: 'Try two prime numbers, then add a counter to measure how many recursive calls occur.',
    code: `[a, b]
inputLeft = a;
inputRight = b;

gcd(left, right) => {
  right == 0 ? left : () => {
    # Compute the pair before calling because parameters are shared globals.
    nextLeft = right;
    nextRight = left %% right;
    >gcd(nextLeft, nextRight)
  }
};

gcd(inputLeft, inputRight)`,
    args: '1071 462',
    expectedValue: 21,
  },
  {
    id: 'descriptive-statistics',
    section: 'systems',
    name: 'Descriptive statistics',
    description: 'Load an input dataset, scan it once, and report minimum, maximum, and mean.',
    concepts: ['input loading', 'single-pass scan', 'aggregation', 'reporting'],
    expected: '11, with minimum 4 and maximum 19 in the Console panel.',
    challenge: 'Track the 1-based index of the maximum value as a fourth statistic.',
    code: `[...]
count = &0;
values = [count];
i = 1;
&0 > 0 ? () => {
  values[i] = &i;
  i++ <= &0 ? >() : values[0]
};

scan() => {
  current = values[j];
  total += current;
  current < minimum ? minimum = current;
  current > maximum ? maximum = current;
  j++ <= values[0] ? >scan() : total / values[0]
};

minimum = values[1];
maximum = values[1];
total = 0;
j = 1;
average = scan();
@=minimum@;
@=maximum@;
@=average@;
average`,
    args: '12 7 19 4 13',
    expectedValue: 11,
  },
  {
    id: 'vending-machine',
    section: 'systems',
    name: 'Event-driven vending machine',
    description: 'Feed commands into a state machine that tracks credit, stock, sales, and refunds.',
    concepts: ['event stream', 'state machine', 'guards', 'audit log'],
    expected: '202 — two items dispensed and two credits refunded.',
    challenge: 'Add event 4 to restock the machine, then include it in the sample command stream.',
    code: `# Events: 1 = insert credit, 2 = vend, 3 = refund.
# A vend costs 2 credits. The machine begins with 2 items.
[...]
eventCount = &0;
events = [eventCount];
i = 1;
&0 > 0 ? () => {
  events[i] = &i;
  i++ <= &0 ? >() : events[0]
};

handle(event) => {
  event == 1 ? credit++;
  event == 2 && credit >= 2 && stock > 0 ? () => {
    credit -= 2;
    stock--;
    dispensed++
  };
  event == 3 ? () => {
    refunded += credit;
    credit = 0
  };
  @=event@;
  @=credit@;
  @=stock@
};

processEvents() => {
  handle(events[position]);
  position++ <= events[0]
    ? >processEvents()
    : dispensed * 100 + refunded
};

credit = 0;
stock = 2;
dispensed = 0;
refunded = 0;
position = 1;
processEvents()`,
    args: '1 1 2 1 1 2 1 1 2 3',
    expectedValue: 202,
  },
  {
    id: 'tiny-virtual-machine',
    section: 'systems',
    name: 'Tiny factorial virtual machine',
    description: 'Interpret numeric opcodes stored in memory to compute 6 factorial.',
    concepts: ['interpreter', 'instruction pointer', 'opcodes', 'mutable memory'],
    expected: '720 after the virtual machine halts.',
    challenge: 'Add opcode 5 for addition, then write a short program that uses it.',
    code: `# Opcodes: 0 halt, 1 load, 2 multiply memory,
# 3 decrement memory, 4 jump-if-positive.
memory = [20];
memory[1] = 1;  memory[2] = 1;
memory[3] = 2;  memory[4] = 20;
memory[5] = 3;  memory[6] = 20;
memory[7] = 4;  memory[8] = 20; memory[9] = 3;
memory[10] = 0;
memory[20] = 6;

step() => {
  opcode = memory[ip];
  opcode == 0 ? running = 0;
  opcode == 1 ? () => {
    accumulator = memory[ip + 1];
    ip += 2
  };
  opcode == 2 ? () => {
    address = memory[ip + 1];
    accumulator *= memory[address];
    ip += 2
  };
  opcode == 3 ? () => {
    address = memory[ip + 1];
    memory[address] -= 1;
    ip += 2
  };
  opcode == 4 ? () => {
    address = memory[ip + 1];
    target = memory[ip + 2];
    memory[address] > 0 ? ip = target : ip += 3
  };
  @=opcode@;
  @=accumulator@;
  running ? >step() : accumulator
};

ip = 1;
accumulator = 0;
running = 1;
step()`,
    expectedValue: 720,
  },
  {
    id: 'orbital-system',
    section: 'animations',
    name: 'Three-body orbital system',
    description: 'Integrate three independent bodies around a gravity well and render their paths.',
    concepts: ['animation frames', 'Euler integration', 'gravity', 'state vectors'],
    expected: '144 frames of three differently shaped orbits around a central star.',
    challenge: 'Change body 3’s velocity to 0.7 and watch its orbit become more eccentric.',
    code: `# @frame@ begins a visual frame. Named echoes are its channels.
steps = 144;
frame = 0;
dt = 0.18;
gravity = 48;

x1 = 18;  y1 = 0;   vx1 = 0;     vy1 = 1.64;
x2 = 0;   y2 = 28;  vx2 = -1.31; vy2 = 0;
x3 = -38; y3 = 0;   vx3 = 0;     vy3 = -1.05;

simulate() => {
  @frame@;
  @=x1@; @=y1@;
  @=x2@; @=y2@;
  @=x3@; @=y3@;

  radiusSquared1 = x1 * x1 + y1 * y1;
  radius1 = radiusSquared1 ** 0.5;
  force1 = gravity / (radiusSquared1 * radius1);
  vx1 -= x1 * force1 * dt;
  vy1 -= y1 * force1 * dt;
  x1 += vx1 * dt;
  y1 += vy1 * dt;

  radiusSquared2 = x2 * x2 + y2 * y2;
  radius2 = radiusSquared2 ** 0.5;
  force2 = gravity / (radiusSquared2 * radius2);
  vx2 -= x2 * force2 * dt;
  vy2 -= y2 * force2 * dt;
  x2 += vx2 * dt;
  y2 += vy2 * dt;

  radiusSquared3 = x3 * x3 + y3 * y3;
  radius3 = radiusSquared3 ** 0.5;
  force3 = gravity / (radiusSquared3 * radius3);
  vx3 -= x3 * force3 * dt;
  vy3 -= y3 * force3 * dt;
  x3 += vx3 * dt;
  y3 += vy3 * dt;

  frame++;
  frame < steps ? >simulate() : frame
};

simulate()`,
    expectedValue: 144,
    animation: {
      kind: 'scene',
      title: 'Orbital system',
      description: 'A symplectic Euler step updates velocity before position on every frame.',
      framesPerSecond: 24,
      xMin: -50,
      xMax: 50,
      yMin: -50,
      yMax: 50,
      trailLength: 100,
      showOrigin: true,
      points: [
        { x: 'x1', y: 'y1', color: '#60a5fa', label: 'Inner body', radius: 1.5 },
        { x: 'x2', y: 'y2', color: '#f472b6', label: 'Middle body', radius: 1.7 },
        { x: 'x3', y: 'y3', color: '#4ade80', label: 'Outer body', radius: 1.9 },
      ],
    },
  },
  {
    id: 'lorenz-attractor',
    section: 'animations',
    name: 'Lorenz strange attractor',
    description: 'Integrate a chaotic differential system and draw its evolving phase-space path.',
    concepts: ['chaos', 'differential equations', 'time stepping', 'phase space'],
    expected: '280 frames tracing the attractor’s two characteristic lobes.',
    challenge: 'Change rho from 28 to 20 and compare the long-term behavior.',
    code: `# Lorenz system: tiny changes eventually produce different paths.
steps = 280;
frame = 0;
dt = 0.008;
sigma = 10;
rho = 28;
beta = 2.6666667;
x = 0.1;
y = 0;
z = 0;

simulate() => {
  @frame@;
  @=x@;
  @=z@;

  dx = sigma * (y - x);
  dy = x * (rho - z) - y;
  dz = x * y - beta * z;
  x += dx * dt;
  y += dy * dt;
  z += dz * dt;

  frame++;
  frame < steps ? >simulate() : frame
};

simulate()`,
    expectedValue: 280,
    animation: {
      kind: 'scene',
      title: 'Lorenz attractor · x/z projection',
      description: 'The trail reveals a deterministic system whose trajectory never exactly repeats.',
      framesPerSecond: 30,
      xMin: -25,
      xMax: 25,
      yMin: 0,
      yMax: 55,
      trailLength: 220,
      points: [
        { x: 'x', y: 'z', color: '#a89bff', label: 'System state', radius: 1.1 },
      ],
    },
  },
  {
    id: 'damped-wave',
    section: 'animations',
    name: 'Damped wave solver',
    description: 'Evolve a one-dimensional wave across arrays and emit every sample in every frame.',
    concepts: ['finite differences', 'double buffering', 'arrays', 'wave propagation'],
    expected: '72 frames of a pulse splitting, reflecting, and gradually losing energy.',
    challenge: 'Change the 0.2 coupling term to 0.35 and compare the propagation speed.',
    code: `size = 41;
steps = 72;
current = [size];
previous = [size];
next = [size];

initialize() => {
  distance = i - 21;
  distance < 0 ? distance = -distance;
  current[i] = distance < 5 ? 1 - distance / 5 : 0;
  previous[i] = current[i];
  i++ <= size ? >initialize() : 0
};

emitSamples() => {
  sample = current[i];
  @=sample@;
  i++ <= size ? >emitSamples() : 0
};

calculateNext() => {
  laplacian = current[i - 1] - 2 * current[i] + current[i + 1];
  next[i] = (2 * current[i] - previous[i] + 0.2 * laplacian) * 0.997;
  i++ < size ? >calculateNext() : 0
};

copyNext() => {
  previous[i] = current[i];
  current[i] = next[i];
  i++ <= size ? >copyNext() : 0
};

simulate() => {
  @frame@;
  i = 1;
  emitSamples();
  # Index 0 stores array size, so boundaries are fixed explicitly.
  next[1] = 0;
  next[size] = 0;
  i = 2;
  calculateNext();
  i = 1;
  copyNext();
  frame++;
  frame < steps ? >simulate() : frame
};

i = 1;
initialize();
frame = 0;
simulate()`,
    expectedValue: 72,
    animation: {
      kind: 'wave',
      title: 'Finite-difference wave',
      description: 'Each polyline contains 41 sample echoes; older frames fade behind the newest one.',
      framesPerSecond: 18,
      channel: 'sample',
      min: -1.2,
      max: 1.2,
      trailLength: 5,
      color: '#38bdf8',
    },
  },
  {
    id: 'rule-30',
    section: 'animations',
    name: 'Rule 30 cellular automaton',
    description: 'Generate complex, asymmetric structure from one cell and a three-neighbor rule.',
    concepts: ['cellular automata', 'double buffering', 'boolean algebra', 'emergence'],
    expected: '41 generations growing from a single live cell.',
    challenge: 'Replace the update with left ^ right to discover a different automaton.',
    code: `size = 41;
steps = 41;
current = [size];
next = [size];
current[21] = 1;

emitCells() => {
  cell = current[i];
  @=cell@;
  i++ <= size ? >emitCells() : 0
};

calculateNext() => {
  left = current[i - 1];
  center = current[i];
  right = current[i + 1];
  next[i] = left ^ (center || right);
  i++ < size ? >calculateNext() : 0
};

copyNext() => {
  current[i] = next[i];
  i++ <= size ? >copyNext() : 0
};

simulate() => {
  @frame@;
  i = 1;
  emitCells();
  # Keep the edges dead; arr[0] is the array size, not a cell.
  next[1] = 0;
  next[size] = 0;
  i = 2;
  calculateNext();
  i = 1;
  copyNext();
  frame++;
  frame < steps ? >simulate() : frame
};

frame = 0;
simulate()`,
    expectedValue: 41,
    animation: {
      kind: 'cells',
      title: 'Rule 30 evolution',
      description: 'Every emitted frame becomes a row, revealing order and randomness from one rule.',
      framesPerSecond: 12,
      channel: 'cell',
      historyRows: 41,
      color: '#a89bff',
    },
  },
]
