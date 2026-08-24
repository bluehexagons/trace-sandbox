import type { Example } from '../types';

export const systemsExamples: Example[] = [
  {
    id: 'euclidean-algorithm',
    section: 'systems',
    name: 'Euclidean algorithm',
    description: 'A compact real algorithm: repeatedly replace two values with a remainder pair.',
    concepts: ['algorithm', 'modulus', 'tail recursion', 'invariant'],
    expected: '21 — the greatest common divisor of 1071 and 462.',
    challenge:
      'Try two prime numbers, then add a counter to measure how many recursive calls occur.',
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
    description:
      'Feed commands into a state machine that tracks credit, stock, sales, and refunds.',
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
];
