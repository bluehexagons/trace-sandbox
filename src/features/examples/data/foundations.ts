import type { Example } from '../types'

export const foundationsExamples: Example[] = [
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
}
]
