import type { Example } from '../types';

export const debuggingExamples: Example[] = [
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
];
