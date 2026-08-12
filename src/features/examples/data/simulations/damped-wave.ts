import type { Example } from '../../types'

export const dampedWaveExample: Example = {
  id: 'damped-wave',
  section: 'simulations',
  name: 'Damped wave solver',
  description: 'Evolve a one-dimensional wave and render its current array directly from memory.',
  concepts: ['finite differences', 'memory-backed output', 'double buffering', 'arrays', 'wave propagation'],
  expected: 'A continuous wave stream where the pulse splits, reflects, and loses energy.',
  challenge: 'Wait for the first pulse to spread, then inject another and watch them interfere.',
  code: `initialize() => {
distance = i - 21;
distance < 0 ? distance = -distance;
current[i] = distance < 5 ? pulseHeight * (1 - distance / 5) : 0;
previous[i] = current[i];
i++ <= size ? >initialize() : 0
};

calculateNext() => {
laplacian = current[i - 1] - 2 * current[i] + current[i + 1];
next[i] = (2 * current[i] - previous[i] + coupling * laplacian) * damping;
i++ < size ? >calculateNext() : 0
};

copyNext() => {
previous[i] = current[i];
current[i] = next[i];
i++ <= size ? >copyNext() : 0
};

injectPulse() => {
distance = i - 21;
distance < 0 ? distance = -distance;
current[i] += distance < 5
  ? pulseHeight * pulseTrigger * (1 - distance / 5)
  : 0;
i++ <= size ? >injectPulse() : 0
};

advance() => {
# Index 0 stores array size, so boundaries are fixed explicitly.
next[1] = 0;
next[size] = 0;
i = 2;
calculateNext();
i = 1;
copyNext()
};

setup(couplingInput, dampingInput, pulseHeightInput) => {
coupling = couplingInput;
damping = dampingInput;
pulseHeight = pulseHeightInput;
size = 41;
current = [size];
previous = [size];
next = [size];
i = 1;
initialize();
frame = 0
};

tick() => {
# Leave the initial pulse untouched for the first rendered tick.
frame > 0 ? advance();
pulseTrigger > 0 ? () => {
i = 1;
injectPulse();
pulseTrigger = 0
};
frame++
};`,
  args: '0.2 0.997 1',
  animation: {
    kind: 'wave',
    title: 'Finite-difference wave',
    description: 'Each polyline reads 41 samples from the current array; older frames fade behind it.',
    framesPerSecond: 18,
    execution: {
      mode: 'live',
      memoryChannels: [{ channel: 'sample', array: 'current' }],
      setupFunction: 'setup',
      tickFunction: 'tick',
    },
    channel: 'sample',
    min: -1.5,
    max: 1.5,
    trailLength: 5,
    color: '#38bdf8',
  },
  controls: {
    description: 'Change propagation, damping, and the initial pulse, then watch the field respond.',
    autoRun: true,
    items: [
      {
        id: 'coupling',
        label: 'Coupling',
        description: 'How strongly each sample pulls on its neighbors.',
        argumentIndex: 0,
        kind: 'range',
        liveVariable: 'coupling',
        defaultValue: 0.2,
        min: 0.05,
        max: 0.45,
        step: 0.01,
      },
      {
        id: 'damping',
        label: 'Damping',
        description: 'Energy retained by the field on every step.',
        argumentIndex: 1,
        kind: 'range',
        liveVariable: 'damping',
        defaultValue: 0.997,
        min: 0.98,
        max: 1,
        step: 0.001,
      },
      {
        id: 'pulse-height',
        label: 'Pulse height',
        description: 'Amplitude of the initial triangular disturbance.',
        argumentIndex: 2,
        kind: 'range',
        liveVariable: 'pulseHeight',
        defaultValue: 1,
        min: 0.2,
        max: 1.4,
        step: 0.1,
      },
      {
        id: 'pulse',
        label: 'Center pulse',
        description: 'Inject another triangular pulse without resetting the running field.',
        kind: 'trigger',
        variable: 'pulseTrigger',
        amount: 1,
        buttonLabel: 'Trigger pulse',
      },
    ],
  },
}
