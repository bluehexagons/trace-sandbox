import type { Example } from '../types'

export const experimentsExamples: Example[] = [
{
  id: 'elementary-cellular-automaton',
  section: 'experiments',
  name: 'Interactive cellular automaton',
  description: 'Choose any elementary rule and grow its structure from one live cell.',
  concepts: ['cellular automata', 'memory-backed output', 'double buffering', 'boolean algebra', 'emergence'],
  expected: 'A continuous stream of generations growing from a single live cell.',
  challenge: 'Compare rules 30, 90, and 110, then reseed the center during each run.',
  code: `calculateNext() => {
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

setup(ruleInput) => {
  rule = ruleInput;
  size = 41;
  current = [size];
  next = [size];
  current[21] = 1;
  frame = 0
};

tick() => {
  frame > 0 ? advance();
  seedTrigger > 0 ? () => {
    current[21] = 1;
    seedTrigger = 0
  };
  frame++
};`,
  args: '30',
  animation: {
    kind: 'cells',
    title: 'Elementary cellular automaton',
    description: 'Each rule number encodes eight neighborhood outcomes as bits.',
    framesPerSecond: 12,
    execution: {
      mode: 'live',
      memoryChannels: [{ channel: 'cell', array: 'current' }],
      setupFunction: 'setup',
      tickFunction: 'tick',
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
        liveVariable: 'rule',
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
  id: 'sorting-visualizer',
  section: 'experiments',
  name: 'Live bubble sort',
  description: 'Watch one neighboring comparison per tick and reshuffle the array without restarting the host.',
  concepts: ['sorting algorithms', 'loop invariants', 'memory-backed output', 'real-time actions', 'algorithm visualization'],
  expected: 'Highlighted pairs trade places until every bar is ordered from shortest to tallest.',
  challenge: 'Shuffle halfway through a pass, or change the comparison to build a descending sort.',
  code: `fillRandom() => {
  values[i] = 1~100;
  i++ <= size ? >fillRandom() : 0
};

setup(sizeInput) => {
  size = sizeInput;
  values = [size];
  i = 1;
  fillRandom();
  scan = 1;
  swapped = 0;
  sorted = 0
};

tick() => {
  shuffleTrigger > 0 ? () => {
    i = 1;
    fillRandom();
    scan = 1;
    swapped = 0;
    sorted = 0;
    shuffleTrigger = 0
  };

  highlight = sorted ? 0 : scan;
  @=highlight@;

  sorted == 0 ? () => {
    left = values[scan];
    right = values[scan + 1];
    left > right ? () => {
      values[scan] = right;
      values[scan + 1] = left;
      swapped = 1
    };
    scan++;
    scan >= size ? () => {
      swapped == 0 ? sorted = 1;
      scan = 1;
      swapped = 0
    }
  };
  sorted
};`,
  args: '24',
  animation: {
    kind: 'bars',
    title: 'Bubble sort · one comparison per tick',
    description: 'Gold marks the pair being compared; each complete pass moves large values to the right.',
    framesPerSecond: 15,
    execution: {
      mode: 'live',
      memoryChannels: [{ channel: 'values', array: 'values' }],
      setupFunction: 'setup',
      tickFunction: 'tick',
    },
    channel: 'values',
    min: 0,
    max: 100,
    color: '#60a5fa',
    highlightColor: '#fbbf24',
    highlightChannel: 'highlight',
  },
  controls: {
    description: 'Choose the problem size, then interrupt the running algorithm with a new permutation.',
    autoRun: true,
    items: [
      {
        id: 'size',
        label: 'Array size',
        description: 'Number of values sorted by the running Trace program.',
        argumentIndex: 0,
        kind: 'range',
        defaultValue: 24,
        min: 8,
        max: 40,
        step: 1,
      },
      {
        id: 'shuffle',
        label: 'Shuffle array',
        description: 'Replace every value and restart the sort inside the same memory environment.',
        kind: 'trigger',
        variable: 'shuffleTrigger',
        amount: 1,
        buttonLabel: 'Shuffle array',
      },
    ],
  },
},
{
  id: 'monte-carlo-pi',
  section: 'experiments',
  name: 'Monte Carlo π estimator',
  description: 'Estimate π from random points in a square and watch statistical noise settle over time.',
  concepts: ['Monte Carlo methods', 'probability', 'convergence', 'persistent memory', 'real-time actions'],
  expected: 'The live estimate wanders at first, then settles near the dashed π reference line.',
  challenge: 'Compare small and large batches, then reset both and see which estimate stabilizes first.',
  code: `setup(batchInput) => {
  batchSize = batchInput;
  inside = 0;
  total = 0;
  frame = 0
};

sampleBatch() => {
  x = 0~1;
  y = 0~1;
  radiusSquared = x * x + y * y;
  radiusSquared <= 1 ? inside++;
  total++;
  sample++;
  sample < batchSize ? >sampleBatch() : 0
};

tick() => {
  resetTrigger > 0 ? () => {
    inside = 0;
    total = 0;
    resetTrigger = 0
  };

  sample = 0;
  sampleBatch();
  estimate = 4 * inside / total;
  @=estimate@;
  @=total@;
  frame++
};`,
  args: '25',
  animation: {
    kind: 'series',
    title: 'Monte Carlo estimate of π',
    description: 'Each tick adds random samples; the dashed line is π, not another estimate.',
    framesPerSecond: 15,
    execution: { mode: 'live', setupFunction: 'setup', tickFunction: 'tick' },
    yMin: 0,
    yMax: 4,
    historyLength: 240,
    lines: [
      { channel: 'estimate', color: '#a78bfa', label: 'Running estimate' },
    ],
    references: [
      { value: 3.141592653589793, color: '#fbbf24', label: 'π reference' },
    ],
  },
  controls: {
    description: 'Batch size controls how much new evidence arrives on each animation tick.',
    autoRun: true,
    items: [
      {
        id: 'batch-size',
        label: 'Samples per tick',
        description: 'Larger batches converge faster but hide more of the early randomness.',
        argumentIndex: 0,
        kind: 'range',
        liveVariable: 'batchSize',
        defaultValue: 25,
        min: 1,
        max: 100,
        step: 1,
      },
      {
        id: 'reset-estimate',
        label: 'Reset estimate',
        description: 'Discard the accumulated sample counts and begin a fresh experiment.',
        kind: 'trigger',
        variable: 'resetTrigger',
        amount: 1,
        buttonLabel: 'Reset experiment',
      },
    ],
  },
}
]
