import type { Example } from '../../types'

export const predatorPreyExample: Example = {
  id: 'predator-prey',
  section: 'simulations',
  name: 'Predator–prey populations',
  description: 'Compare two population histories as their coupled boom-and-bust cycle unfolds.',
  concepts: ['coupled systems', 'persistent memory', 'feedback loops', 'time series', 'Euler integration'],
  expected: 'Two offset population trails showing predators following changes in prey.',
  challenge: 'Release prey or predators mid-orbit and compare how each intervention shifts the cycle.',
  code: `setup(preyInput, predatorInput, predationInput) => {
prey = preyInput;
predators = predatorInput;
predation = predationInput;
preyGrowth = 1;
predatorDeath = 1.2;
conversion = 0.1;
dt = 0.02;
frame = 0
};

tick() => {
preyRelease != 0 ? () => {
prey += preyRelease;
preyRelease = 0
};
predatorRelease != 0 ? () => {
predators += predatorRelease;
predatorRelease = 0
};

@=prey@;
@=predators@;

preyChange = preyGrowth * prey - predation * prey * predators;
predatorChange = conversion * prey * predators - predatorDeath * predators;
prey += preyChange * dt;
predators += predatorChange * dt;
prey < 0 ? prey = 0;
predators < 0 ? predators = 0;

frame++
};`,
  args: '10 5 0.1',
  animation: {
    kind: 'series',
    title: 'Predator–prey populations over time',
    description: 'Separate trails make the lag between prey growth and predator growth visible.',
    framesPerSecond: 30,
    execution: { mode: 'live', setupFunction: 'setup', tickFunction: 'tick' },
    yMin: 0,
    yMax: 40,
    historyLength: 240,
    lines: [
      { channel: 'prey', color: '#4ade80', label: 'Prey' },
      { channel: 'predators', color: '#f472b6', label: 'Predators' },
    ],
  },
  controls: {
    description: 'Set the initial populations and the strength of encounters between them.',
    autoRun: true,
    items: [
      {
        id: 'prey',
        label: 'Initial prey',
        description: 'Starting size of the prey population.',
        argumentIndex: 0,
        kind: 'range',
        liveVariable: 'prey',
        defaultValue: 10,
        min: 6,
        max: 18,
        step: 0.5,
      },
      {
        id: 'predators',
        label: 'Initial predators',
        description: 'Starting size of the predator population.',
        argumentIndex: 1,
        kind: 'range',
        liveVariable: 'predators',
        defaultValue: 5,
        min: 3.5,
        max: 10,
        step: 0.5,
      },
      {
        id: 'predation',
        label: 'Predation pressure',
        description: 'How often prey–predator encounters remove prey.',
        argumentIndex: 2,
        kind: 'range',
        liveVariable: 'predation',
        defaultValue: 0.1,
        min: 0.08,
        max: 0.16,
        step: 0.01,
      },
      {
        id: 'release-prey',
        label: 'Release prey',
        description: 'Add two prey to the current ecosystem without restarting it.',
        kind: 'trigger',
        variable: 'preyRelease',
        amount: 2,
        buttonLabel: 'Release 2 prey',
      },
      {
        id: 'release-predators',
        label: 'Release predators',
        description: 'Add one predator and watch the phase trajectory respond.',
        kind: 'trigger',
        variable: 'predatorRelease',
        amount: 1,
        buttonLabel: 'Release 1 predator',
      },
    ],
  },
}
