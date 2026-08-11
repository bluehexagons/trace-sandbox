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
]
