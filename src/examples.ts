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
  {
    name: 'Basic Arrays',
    description: 'Create a fixed-size array, assign values, and read them. Arrays are 1-indexed (index 0 returns size).',
    code: 'arr = [3]; arr[1] = 10; arr[2] = 20; arr[3] = 30; arr[1] + arr[2] + arr[3]',
  },
  {
    name: 'Array with Loop',
    description: 'Fill an array using a loop and sum the elements.',
    code: 'arr = [5]; i = 1; i <= 5 ? ()=>{arr[i] = i * 2; i++ <= 5 ? () : 0}; s = 0; j = 1; j <= arr[0] ? ()=>{s += arr[j]; j++ <= arr[0] ? () : s}',
  },
  {
    name: 'Syntax Error',
    description: 'A script with invalid syntax shows an error with the location marked.',
    code: '1 > < 2',
  },
  {
    name: 'First-Class Functions',
    description: 'Store function references in variables and pass them as arguments.',
    code: 'double(x) => { x * 2 }; f = double; f(5)',
  },
  {
    name: 'Stdlib Loop',
    description: 'Use the standard library while loop (enable stdlib in options).',
    code: 'i = 0; while(i < 3, i++); i',
  },
]
