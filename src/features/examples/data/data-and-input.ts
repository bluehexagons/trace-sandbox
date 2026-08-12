import type { Example } from '../types'

export const dataExamples: Example[] = [
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
}
]
