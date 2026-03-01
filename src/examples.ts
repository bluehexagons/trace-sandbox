export interface Example {
  name: string
  description: string
  code: string
  args?: string
}

export const examples: Example[] = [
  {
    name: 'Hello, Math!',
    description: 'Basic arithmetic — the simplest trace script.',
    code: '1 + 10',
  },
  {
    name: 'Variables',
    description: 'Assign a variable and use it in an expression.',
    code: 'x = 5; x * 2',
  },
  {
    name: 'Ternary / Conditionals',
    description: 'Use the ternary operator to branch on a condition.',
    code: 'x = 7; x > 5 ? 1 : 0',
  },
  {
    name: 'Counter Loop',
    description: 'An anonymous function that loops via self-call until q reaches 10.',
    code: 'q = 0; () => { q++; q < 10 ? >() }; q',
  },
  {
    name: 'Named Function',
    description: 'Define and call a named recursive function.',
    code: 'add() => { q++; q < 10 ? >add() }; q = 0; add(); q',
  },
  {
    name: 'Sum of Arguments',
    description: 'Pass arguments to a script and sum them all.',
    code: '[...] t = 0; i = 1; &0 > 0 ? () => { t += &i; i++ <= &0 ? () : t }',
    args: '1 2 3 4',
  },
  {
    name: 'Order of Operations',
    description: 'trace respects standard math precedence.',
    code: '2 * (2 * 3) + 12',
  },
  {
    name: 'Power & Modulus',
    description: 'Exponentiation (**) and modulus (%%).',
    code: 'a = 2 ** 8; b = a %% 100; b',
  },
  {
    name: 'Echo / Debug',
    description: 'Use @…@ to log values mid-script (shown in output below).',
    code: 'x = 42; @=x@; x * 2',
  },
  {
    name: 'Random Range',
    description: '0~1 picks a random float between 0 (inclusive) and 1 (exclusive).',
    code: '0~100',
  },
  {
    name: 'Selection (Array Literal)',
    description: '1|2|3|4 randomly selects one of the values.',
    code: '1|2|3|4',
  },
]
