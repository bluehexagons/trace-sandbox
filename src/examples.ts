import type { AnimationSpec } from './animation'
import type { InteractiveControls } from './interactive'

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
    description: 'Emit frame channels and tune live parameters to explore visual systems.',
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
  controls?: InteractiveControls
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
    concepts: ['script parameters', 'arguments', 'interactive inputs', 'echo'],
    expected: '26 — the perimeter of an 8 by 5 rectangle.',
    challenge: 'Add a third depth argument and return the volume of a box.',
    code: `[width, height]
area = width * height;
perimeter = 2 * (width + height);
@=area@;
perimeter`,
    args: '8 5',
    expectedValue: 26,
    controls: {
      description: 'Change the dimensions; the values are passed to [width, height].',
      autoRun: true,
      items: [
        {
          id: 'width',
          label: 'Width',
          description: 'The rectangle’s horizontal dimension.',
          argumentIndex: 0,
          kind: 'range',
          defaultValue: 8,
          min: 1,
          max: 30,
          step: 1,
        },
        {
          id: 'height',
          label: 'Height',
          description: 'The rectangle’s vertical dimension.',
          argumentIndex: 1,
          kind: 'range',
          defaultValue: 5,
          min: 1,
          max: 30,
          step: 1,
        },
      ],
    },
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
    concepts: ['live ticks', 'persistent memory', 'interactive parameters', 'Euler integration', 'gravity'],
    expected: 'A continuous stream of three differently shaped orbits around a central star.',
    challenge: 'Change body 3’s velocity to 0.7 and watch its orbit become more eccentric.',
    code: `# This script advances one frame each time the host runs it.
[gravityInput, timeStepInput, outerSpeedInput]
initialized == 0 ? gravity = gravityInput;
initialized == 0 ? dt = timeStepInput;
initialized == 0 ? outerSpeed = outerSpeedInput;
initialized == 0 ? frame = 0;
initialized == 0 ? x1 = 18;
initialized == 0 ? y1 = 0;
initialized == 0 ? vx1 = 0;
initialized == 0 ? vy1 = 1.64;
initialized == 0 ? x2 = 0;
initialized == 0 ? y2 = 28;
initialized == 0 ? vx2 = -1.31;
initialized == 0 ? vy2 = 0;
initialized == 0 ? x3 = -38;
initialized == 0 ? y3 = 0;
initialized == 0 ? vx3 = 0;
initialized == 0 ? vy3 = -outerSpeed;
initialized == 0 ? initialized = 1;

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

frame++`,
    args: '48 0.18 1.05',
    animation: {
      kind: 'scene',
      title: 'Orbital system',
      description: 'A symplectic Euler step updates velocity before position on every frame.',
      framesPerSecond: 24,
      execution: { mode: 'live' },
      xMin: -65,
      xMax: 65,
      yMin: -65,
      yMax: 65,
      trailLength: 100,
      showOrigin: true,
      points: [
        { x: 'x1', y: 'y1', color: '#60a5fa', label: 'Inner body', radius: 1.5 },
        { x: 'x2', y: 'y2', color: '#f472b6', label: 'Middle body', radius: 1.7 },
        { x: 'x3', y: 'y3', color: '#4ade80', label: 'Outer body', radius: 1.9 },
      ],
    },
    controls: {
      description: 'Tune the integration and rerun the model to reshape all three trajectories.',
      autoRun: true,
      items: [
        {
          id: 'gravity',
          label: 'Gravity',
          description: 'Strength of the central attraction.',
          argumentIndex: 0,
          kind: 'range',
          defaultValue: 48,
          min: 20,
          max: 80,
          step: 1,
        },
        {
          id: 'time-step',
          label: 'Time step',
          description: 'Simulation time advanced by each frame.',
          argumentIndex: 1,
          kind: 'range',
          defaultValue: 0.18,
          min: 0.05,
          max: 0.3,
          step: 0.01,
        },
        {
          id: 'outer-speed',
          label: 'Outer speed',
          description: 'Initial tangential speed of the green body.',
          argumentIndex: 2,
          kind: 'range',
          defaultValue: 1.05,
          min: 0.6,
          max: 1.5,
          step: 0.01,
        },
      ],
    },
  },
  {
    id: 'lorenz-attractor',
    section: 'animations',
    name: 'Lorenz strange attractor',
    description: 'Integrate a chaotic differential system and draw its evolving phase-space path.',
    concepts: ['chaos', 'persistent memory', 'differential equations', 'live time stepping', 'phase space'],
    expected: 'A continuous trace of the attractor’s two characteristic lobes.',
    challenge: 'Let two runs evolve, perturb one, and watch their trajectories diverge.',
    code: `# Lorenz system: the host preserves state between ticks.
[rhoInput, sigmaInput, timeStepInput]
initialized == 0 ? frame = 0;
initialized == 0 ? dt = timeStepInput;
initialized == 0 ? sigma = sigmaInput;
initialized == 0 ? rho = rhoInput;
initialized == 0 ? beta = 2.6666667;
initialized == 0 ? x = 0.1;
initialized == 0 ? y = 0;
initialized == 0 ? z = 0;
initialized == 0 ? initialized = 1;

perturbX != 0 ? () => {
  x += perturbX;
  perturbX = 0
};

@=x@;
@=z@;

dx = sigma * (y - x);
dy = x * (rho - z) - y;
dz = x * y - beta * z;
x += dx * dt;
y += dy * dt;
z += dz * dt;

frame++`,
    args: '28 10 0.008',
    animation: {
      kind: 'scene',
      title: 'Lorenz attractor · x/z projection',
      description: 'The trail reveals a deterministic system whose trajectory never exactly repeats.',
      framesPerSecond: 30,
      execution: { mode: 'live' },
      xMin: -35,
      xMax: 35,
      yMin: 0,
      yMax: 75,
      trailLength: 220,
      points: [
        { x: 'x', y: 'z', color: '#a89bff', label: 'System state', radius: 1.1 },
      ],
    },
    controls: {
      description: 'Explore how system constants change the attractor and its sensitivity.',
      autoRun: true,
      items: [
        {
          id: 'rho',
          label: 'Rho',
          description: 'Moves the system between stable and chaotic regimes.',
          argumentIndex: 0,
          kind: 'range',
          defaultValue: 28,
          min: 10,
          max: 35,
          step: 0.5,
        },
        {
          id: 'sigma',
          label: 'Sigma',
          description: 'Controls how quickly x follows y.',
          argumentIndex: 1,
          kind: 'range',
          defaultValue: 10,
          min: 5,
          max: 15,
          step: 0.5,
        },
        {
          id: 'time-step',
          label: 'Time step',
          description: 'Numerical integration step; large values lose accuracy.',
          argumentIndex: 2,
          kind: 'number',
          defaultValue: 0.008,
          min: 0.002,
          max: 0.01,
          step: 0.001,
        },
        {
          id: 'perturb-x',
          label: 'Perturb state',
          description: 'Nudge x during the current run to expose sensitive dependence.',
          kind: 'trigger',
          variable: 'perturbX',
          amount: 0.05,
          buttonLabel: 'Nudge x by 0.05',
        },
      ],
    },
  },
  {
    id: 'damped-wave',
    section: 'animations',
    name: 'Damped wave solver',
    description: 'Evolve a one-dimensional wave and render its current array directly from memory.',
    concepts: ['finite differences', 'memory-backed output', 'double buffering', 'arrays', 'wave propagation'],
    expected: 'A continuous wave stream where the pulse splits, reflects, and loses energy.',
    challenge: 'Wait for the first pulse to spread, then inject another and watch them interfere.',
    code: `[couplingInput, dampingInput, pulseHeightInput]
initialize() => {
  distance = i - 21;
  distance < 0 ? distance = -distance;
  current[i] = distance < 5 ? pulseHeight * (1 - distance / 5) : 0;
  previous[i] = current[i];
  i++ <= size ? >initialize() : 0
};

calculateNext() => {
  laplacian = current[i - 1] - 2 * current[i] + current[i + 1];
  next[i] = (2 * current[i] - previous[i] + coupling * laplacian) * damping;
  i++ < size ? >calculateNext() : 0
};

copyNext() => {
  previous[i] = current[i];
  current[i] = next[i];
  i++ <= size ? >copyNext() : 0
};

injectPulse() => {
  distance = i - 21;
  distance < 0 ? distance = -distance;
  current[i] += distance < 5
    ? pulseHeight * pulseTrigger * (1 - distance / 5)
    : 0;
  i++ <= size ? >injectPulse() : 0
};

advance() => {
  # Index 0 stores array size, so boundaries are fixed explicitly.
  next[1] = 0;
  next[size] = 0;
  i = 2;
  calculateNext();
  i = 1;
  copyNext()
};

initialized == 0 ? coupling = couplingInput;
initialized == 0 ? damping = dampingInput;
initialized == 0 ? pulseHeight = pulseHeightInput;
initialized == 0 ? size = 41;
initialized == 0 ? current = [size];
initialized == 0 ? previous = [size];
initialized == 0 ? next = [size];
initialized == 0 ? i = 1;
initialized == 0 ? initialize();
initialized == 0 ? frame = 0;
initialized == 0 ? initialized = 1;

# Leave the initial pulse untouched for the first rendered tick.
frame > 0 ? advance();
pulseTrigger > 0 ? () => {
  i = 1;
  injectPulse();
  pulseTrigger = 0
};
frame++`,
    args: '0.2 0.997 1',
    animation: {
      kind: 'wave',
      title: 'Finite-difference wave',
      description: 'Each polyline reads 41 samples from the current array; older frames fade behind it.',
      framesPerSecond: 18,
      execution: {
        mode: 'live',
        memoryChannels: [{ channel: 'sample', array: 'current' }],
      },
      channel: 'sample',
      min: -1.5,
      max: 1.5,
      trailLength: 5,
      color: '#38bdf8',
    },
    controls: {
      description: 'Change propagation, damping, and the initial pulse, then watch the field respond.',
      autoRun: true,
      items: [
        {
          id: 'coupling',
          label: 'Coupling',
          description: 'How strongly each sample pulls on its neighbors.',
          argumentIndex: 0,
          kind: 'range',
          defaultValue: 0.2,
          min: 0.05,
          max: 0.45,
          step: 0.01,
        },
        {
          id: 'damping',
          label: 'Damping',
          description: 'Energy retained by the field on every step.',
          argumentIndex: 1,
          kind: 'range',
          defaultValue: 0.997,
          min: 0.98,
          max: 1,
          step: 0.001,
        },
        {
          id: 'pulse-height',
          label: 'Pulse height',
          description: 'Amplitude of the initial triangular disturbance.',
          argumentIndex: 2,
          kind: 'range',
          defaultValue: 1,
          min: 0.2,
          max: 1.4,
          step: 0.1,
        },
        {
          id: 'pulse',
          label: 'Center pulse',
          description: 'Inject another triangular pulse without resetting the running field.',
          kind: 'trigger',
          variable: 'pulseTrigger',
          amount: 1,
          buttonLabel: 'Trigger pulse',
        },
      ],
    },
  },
  {
    id: 'elementary-cellular-automaton',
    section: 'animations',
    name: 'Interactive cellular automaton',
    description: 'Choose any elementary rule and grow its structure from one live cell.',
    concepts: ['cellular automata', 'memory-backed output', 'double buffering', 'boolean algebra', 'emergence'],
    expected: 'A continuous stream of generations growing from a single live cell.',
    challenge: 'Compare rules 30, 90, and 110, then reseed the center during each run.',
    code: `[ruleInput]
calculateNext() => {
  left = current[i - 1];
  center = current[i];
  right = current[i + 1];
  neighborhood = left * 4 + center * 2 + right;
  bit = 2 ** neighborhood;
  next[i] = rule %% (bit * 2) >= bit;
  i++ < size ? >calculateNext() : 0
};

copyNext() => {
  current[i] = next[i];
  i++ <= size ? >copyNext() : 0
};

advance() => {
  # Keep the edges dead; arr[0] is the array size, not a cell.
  next[1] = 0;
  next[size] = 0;
  i = 2;
  calculateNext();
  i = 1;
  copyNext()
};

initialized == 0 ? rule = ruleInput;
initialized == 0 ? size = 41;
initialized == 0 ? current = [size];
initialized == 0 ? next = [size];
initialized == 0 ? current[21] = 1;
initialized == 0 ? frame = 0;
initialized == 0 ? initialized = 1;

frame > 0 ? advance();
seedTrigger > 0 ? () => {
  current[21] = 1;
  seedTrigger = 0
};
frame++`,
    args: '30',
    animation: {
      kind: 'cells',
      title: 'Elementary cellular automaton',
      description: 'Each rule number encodes eight neighborhood outcomes as bits.',
      framesPerSecond: 12,
      execution: {
        mode: 'live',
        memoryChannels: [{ channel: 'cell', array: 'current' }],
      },
      channel: 'cell',
      historyRows: 41,
      color: '#a89bff',
    },
    controls: {
      description: 'Enter a Wolfram rule number from 0 to 255 and compare the resulting universe.',
      autoRun: true,
      items: [
        {
          id: 'rule',
          label: 'Rule number',
          description: 'Try 30 for chaos, 90 for a fractal, or 110 for complex structures.',
          argumentIndex: 0,
          kind: 'number',
          defaultValue: 30,
          min: 0,
          max: 255,
          step: 1,
        },
        {
          id: 'seed-center',
          label: 'Seed center',
          description: 'Turn on the center cell in the current generation.',
          kind: 'trigger',
          variable: 'seedTrigger',
          amount: 1,
          buttonLabel: 'Seed center cell',
        },
      ],
    },
  },
  {
    id: 'logistic-map',
    section: 'animations',
    name: 'Interactive logistic map',
    description: 'Turn one growth parameter and watch a population settle, oscillate, or become chaotic.',
    concepts: ['discrete dynamics', 'persistent memory', 'feedback', 'period doubling', 'chaos'],
    expected: 'A continuous stream plotting population against iteration.',
    challenge: 'Move growth slowly from 3.0 toward 4.0 and look for each period-doubling transition.',
    code: `[growthInput, seedInput]
initialized == 0 ? growth = growthInput;
initialized == 0 ? population = seedInput;
initialized == 0 ? frame = 0;
initialized == 0 ? initialized = 1;

iteration = frame;
@=iteration@;
@=population@;

population = growth * population * (1 - population);
frame++`,
    args: '3.82 0.2',
    animation: {
      kind: 'series',
      title: 'Logistic map · population over time',
      description: 'The same equation produces equilibrium, cycles, or chaos as growth changes.',
      framesPerSecond: 30,
      execution: { mode: 'live' },
      yMin: 0,
      yMax: 1,
      historyLength: 180,
      lines: [
        { channel: 'population', color: '#f472b6', label: 'Population' },
      ],
    },
    controls: {
      description: 'Small growth changes can completely reorganize the long-term trajectory.',
      autoRun: true,
      items: [
        {
          id: 'growth',
          label: 'Growth rate',
          description: 'The control parameter responsible for period doubling and chaos.',
          argumentIndex: 0,
          kind: 'range',
          defaultValue: 3.82,
          min: 2.5,
          max: 4,
          step: 0.01,
        },
        {
          id: 'seed',
          label: 'Initial population',
          description: 'Starting population as a fraction of carrying capacity.',
          argumentIndex: 1,
          kind: 'range',
          defaultValue: 0.2,
          min: 0.01,
          max: 0.99,
          step: 0.01,
        },
      ],
    },
  },
  {
    id: 'predator-prey',
    section: 'animations',
    name: 'Predator–prey populations',
    description: 'Compare two population histories as their coupled boom-and-bust cycle unfolds.',
    concepts: ['coupled systems', 'persistent memory', 'feedback loops', 'time series', 'Euler integration'],
    expected: 'Two offset population trails showing predators following changes in prey.',
    challenge: 'Release prey or predators mid-orbit and compare how each intervention shifts the cycle.',
    code: `[preyInput, predatorInput, predationInput]
initialized == 0 ? prey = preyInput;
initialized == 0 ? predators = predatorInput;
initialized == 0 ? predation = predationInput;
initialized == 0 ? preyGrowth = 1;
initialized == 0 ? predatorDeath = 1.2;
initialized == 0 ? conversion = 0.1;
initialized == 0 ? dt = 0.02;
initialized == 0 ? frame = 0;
initialized == 0 ? initialized = 1;

preyRelease != 0 ? () => {
  prey += preyRelease;
  preyRelease = 0
};
predatorRelease != 0 ? () => {
  predators += predatorRelease;
  predatorRelease = 0
};

@=prey@;
@=predators@;

preyChange = preyGrowth * prey - predation * prey * predators;
predatorChange = conversion * prey * predators - predatorDeath * predators;
prey += preyChange * dt;
predators += predatorChange * dt;
prey < 0 ? prey = 0;
predators < 0 ? predators = 0;

frame++`,
    args: '10 5 0.1',
    animation: {
      kind: 'series',
      title: 'Predator–prey populations over time',
      description: 'Separate trails make the lag between prey growth and predator growth visible.',
      framesPerSecond: 30,
      execution: { mode: 'live' },
      yMin: 0,
      yMax: 40,
      historyLength: 240,
      lines: [
        { channel: 'prey', color: '#4ade80', label: 'Prey' },
        { channel: 'predators', color: '#f472b6', label: 'Predators' },
      ],
    },
    controls: {
      description: 'Set the initial populations and the strength of encounters between them.',
      autoRun: true,
      items: [
        {
          id: 'prey',
          label: 'Initial prey',
          description: 'Starting size of the prey population.',
          argumentIndex: 0,
          kind: 'range',
          defaultValue: 10,
          min: 6,
          max: 18,
          step: 0.5,
        },
        {
          id: 'predators',
          label: 'Initial predators',
          description: 'Starting size of the predator population.',
          argumentIndex: 1,
          kind: 'range',
          defaultValue: 5,
          min: 3.5,
          max: 10,
          step: 0.5,
        },
        {
          id: 'predation',
          label: 'Predation pressure',
          description: 'How often prey–predator encounters remove prey.',
          argumentIndex: 2,
          kind: 'range',
          defaultValue: 0.1,
          min: 0.08,
          max: 0.16,
          step: 0.01,
        },
        {
          id: 'release-prey',
          label: 'Release prey',
          description: 'Add two prey to the current ecosystem without restarting it.',
          kind: 'trigger',
          variable: 'preyRelease',
          amount: 2,
          buttonLabel: 'Release 2 prey',
        },
        {
          id: 'release-predators',
          label: 'Release predators',
          description: 'Add one predator and watch the phase trajectory respond.',
          kind: 'trigger',
          variable: 'predatorRelease',
          amount: 1,
          buttonLabel: 'Release 1 predator',
        },
      ],
    },
  },
  {
    id: 'kicked-oscillator',
    section: 'animations',
    name: 'Impulse-driven oscillator',
    description: 'Kick a damped spring while its position and velocity stream through phase space.',
    concepts: ['real-time actions', 'impulses', 'phase space', 'damping', 'persistent memory'],
    expected: 'A decaying phase-space orbit that immediately responds to left and right kicks.',
    challenge: 'Alternate kicks at the natural rhythm and see how large an orbit you can sustain.',
    code: `[stiffnessInput, dampingInput]
initialized == 0 ? stiffness = stiffnessInput;
initialized == 0 ? damping = dampingInput;
initialized == 0 ? dt = 0.05;
initialized == 0 ? position = 8;
initialized == 0 ? velocity = 0;
initialized == 0 ? frame = 0;
initialized == 0 ? initialized = 1;

impulse != 0 ? () => {
  velocity += impulse;
  impulse = 0
};

@=position@;
@=velocity@;

acceleration = -stiffness * position;
velocity += acceleration * dt;
velocity *= damping;
position += velocity * dt;
frame++`,
    args: '0.65 0.997',
    animation: {
      kind: 'scene',
      title: 'Damped oscillator · position/velocity',
      description: 'Each kick changes velocity instantly, moving the system to a new phase orbit.',
      framesPerSecond: 30,
      execution: { mode: 'live' },
      xMin: -18,
      xMax: 18,
      yMin: -12,
      yMax: 12,
      trailLength: 240,
      points: [
        {
          x: 'position',
          y: 'velocity',
          color: '#fbbf24',
          label: 'Oscillator state',
          radius: 1.1,
        },
      ],
    },
    controls: {
      description: 'Tune the spring, then inject impulses directly into the running state.',
      autoRun: true,
      items: [
        {
          id: 'stiffness',
          label: 'Stiffness',
          description: 'Stronger springs pull the mass back more quickly.',
          argumentIndex: 0,
          kind: 'range',
          defaultValue: 0.65,
          min: 0.2,
          max: 1.2,
          step: 0.05,
        },
        {
          id: 'damping',
          label: 'Damping',
          description: 'Velocity retained on each tick; one removes no energy.',
          argumentIndex: 1,
          kind: 'range',
          defaultValue: 0.997,
          min: 0.98,
          max: 1,
          step: 0.001,
        },
        {
          id: 'kick-left',
          label: 'Kick left',
          description: 'Apply a negative velocity impulse to the current orbit.',
          kind: 'trigger',
          variable: 'impulse',
          amount: -3,
          buttonLabel: '← Kick left',
        },
        {
          id: 'kick-right',
          label: 'Kick right',
          description: 'Apply a positive velocity impulse to the current orbit.',
          kind: 'trigger',
          variable: 'impulse',
          amount: 3,
          buttonLabel: 'Kick right →',
        },
      ],
    },
  },
]
