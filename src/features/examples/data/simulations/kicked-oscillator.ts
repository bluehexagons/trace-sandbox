import type { Example } from '../../types';

export const kickedOscillatorExample: Example = {
  id: 'kicked-oscillator',
  section: 'simulations',
  name: 'Kicked spring response',
  description: 'Kick a damped spring and compare its position with the velocity that drives it.',
  concepts: ['real-time actions', 'impulses', 'harmonic motion', 'phase lag', 'damping'],
  expected:
    'A kick jumps velocity immediately; position stays continuous, then follows with a delayed oscillation.',
  challenge: 'Kick at the natural rhythm to add energy, then kick against it to stop the motion.',
  code: `setup(stiffnessInput, dampingInput) => {
  stiffness = stiffnessInput;
  damping = dampingInput;
  dt = 0.05;
  position = 8;
  velocity = 0;
  frame = 0
};

tick() => {
  impulse != 0 ? () => {
    velocity += impulse;
    impulse = 0
  };

  @=position@;
  @=velocity@;

  acceleration = -stiffness * position;
  velocity += acceleration * dt;
  velocity *= damping;
  position += velocity * dt;
  frame++
};`,
  args: '0.65 0.997',
  animation: {
    kind: 'series',
    title: 'Kicked spring · position and velocity',
    description:
      'A kick creates an immediate velocity jump; position remains continuous and responds afterward.',
    framesPerSecond: 30,
    execution: { mode: 'live', setupFunction: 'setup', tickFunction: 'tick' },
    yMin: -12,
    yMax: 12,
    historyLength: 240,
    lines: [
      { channel: 'position', color: '#60a5fa', label: 'Position' },
      { channel: 'velocity', color: '#fbbf24', label: 'Velocity' },
    ],
  },
  controls: {
    description: 'Tune the spring, then inject impulses directly into the running state.',
    autoRun: true,
    items: [
      {
        id: 'stiffness',
        label: 'Stiffness',
        description: 'Stronger springs pull the mass back more quickly.',
        argumentIndex: 0,
        kind: 'range',
        liveVariable: 'stiffness',
        defaultValue: 0.65,
        min: 0.2,
        max: 1.2,
        step: 0.05,
      },
      {
        id: 'damping',
        label: 'Damping',
        description: 'Velocity retained on each tick; one removes no energy.',
        argumentIndex: 1,
        kind: 'range',
        liveVariable: 'damping',
        defaultValue: 0.997,
        min: 0.98,
        max: 1,
        step: 0.001,
      },
      {
        id: 'kick-left',
        label: 'Kick left',
        description: 'Apply a negative velocity impulse to the current orbit.',
        kind: 'trigger',
        variable: 'impulse',
        amount: -3,
        buttonLabel: '← Kick left',
      },
      {
        id: 'kick-right',
        label: 'Kick right',
        description: 'Apply a positive velocity impulse to the current orbit.',
        kind: 'trigger',
        variable: 'impulse',
        amount: 3,
        buttonLabel: 'Kick right →',
      },
    ],
  },
};
