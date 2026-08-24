import type { Example } from '../types';

export const functionsExamples: Example[] = [
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
];
