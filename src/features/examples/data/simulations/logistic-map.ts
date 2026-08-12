import type { Example } from '../../types'

export const logisticMapExample: Example = {
  id: 'logistic-map',
  section: 'simulations',
  name: 'Interactive logistic map',
  description: 'Turn one growth parameter and watch a population settle, oscillate, or become chaotic.',
  concepts: ['discrete dynamics', 'persistent memory', 'feedback', 'period doubling', 'chaos'],
  expected: 'A continuous stream plotting population against iteration.',
  challenge: 'Move growth slowly from 3.0 toward 4.0 and look for each period-doubling transition.',
  code: `setup(growthInput, seedInput) => {
growth = growthInput;
population = seedInput;
frame = 0
};

tick() => {
iteration = frame;
@=iteration@;
@=population@;

population = growth * population * (1 - population);
frame++
};`,
  args: '3.82 0.2',
  animation: {
    kind: 'series',
    title: 'Logistic map · population over time',
    description: 'The same equation produces equilibrium, cycles, or chaos as growth changes.',
    framesPerSecond: 30,
    execution: { mode: 'live', setupFunction: 'setup', tickFunction: 'tick' },
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
        liveVariable: 'growth',
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
        liveVariable: 'population',
        defaultValue: 0.2,
        min: 0.01,
        max: 0.99,
        step: 0.01,
      },
    ],
  },
}
