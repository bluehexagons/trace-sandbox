import type { Example } from '../../types';

export const lorenzAttractorExample: Example = {
  id: 'lorenz-attractor',
  section: 'simulations',
  name: 'Lorenz strange attractor',
  description: 'Integrate a chaotic differential system and draw its evolving phase-space path.',
  concepts: [
    'chaos',
    'persistent memory',
    'differential equations',
    'live time stepping',
    'phase space',
  ],
  expected: 'A continuous trace of the attractor’s two characteristic lobes.',
  challenge: 'Let two runs evolve, perturb one, and watch their trajectories diverge.',
  code: `# Setup and stepping are separate host-callable functions.
setup(rhoInput, sigmaInput, timeStepInput) => {
  frame = 0;
  dt = timeStepInput;
  sigma = sigmaInput;
  rho = rhoInput;
  beta = 2.6666667;
  x = 0.1;
  y = 0;
  z = 0
};

tick() => {
  perturbX != 0 ? () => {
    x += perturbX;
    perturbX = 0
  };

  @=x@;
  @=z@;

  dx = sigma * (y - x);
  dy = x * (rho - z) - y;
  dz = x * y - beta * z;
  x += dx * dt;
  y += dy * dt;
  z += dz * dt;

  frame++
};`,
  args: '28 10 0.008',
  animation: {
    kind: 'scene',
    title: 'Lorenz attractor · x/z projection',
    description: 'The trail reveals a deterministic system whose trajectory never exactly repeats.',
    framesPerSecond: 30,
    execution: { mode: 'live', setupFunction: 'setup', tickFunction: 'tick' },
    xMin: -35,
    xMax: 35,
    yMin: 0,
    yMax: 75,
    trailLength: 220,
    points: [{ x: 'x', y: 'z', color: '#a89bff', label: 'System state', radius: 1.1 }],
  },
  controls: {
    description: 'Explore how system constants change the attractor and its sensitivity.',
    autoRun: true,
    items: [
      {
        id: 'rho',
        label: 'Rho',
        description: 'Moves the system between stable and chaotic regimes.',
        argumentIndex: 0,
        kind: 'range',
        liveVariable: 'rho',
        defaultValue: 28,
        min: 10,
        max: 35,
        step: 0.5,
      },
      {
        id: 'sigma',
        label: 'Sigma',
        description: 'Controls how quickly x follows y.',
        argumentIndex: 1,
        kind: 'range',
        liveVariable: 'sigma',
        defaultValue: 10,
        min: 5,
        max: 15,
        step: 0.5,
      },
      {
        id: 'time-step',
        label: 'Time step',
        description: 'Numerical integration step; large values lose accuracy.',
        argumentIndex: 2,
        kind: 'number',
        liveVariable: 'dt',
        defaultValue: 0.008,
        min: 0.002,
        max: 0.01,
        step: 0.001,
      },
      {
        id: 'perturb-x',
        label: 'Perturb state',
        description: 'Nudge x during the current run to expose sensitive dependence.',
        kind: 'trigger',
        variable: 'perturbX',
        amount: 0.05,
        buttonLabel: 'Nudge x by 0.05',
      },
    ],
  },
};
