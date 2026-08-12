import type { Example } from '../../types'

export const orbitalSystemExample: Example = {
  id: 'orbital-system',
  section: 'simulations',
  name: 'Three-body orbital system',
  description: 'Integrate three independent bodies around a gravity well and render their paths.',
  concepts: ['live ticks', 'persistent memory', 'interactive parameters', 'Euler integration', 'gravity'],
  expected: 'A continuous stream of three differently shaped orbits around a central star.',
  challenge: 'Change body 3’s target velocity while it is orbiting and watch the path adapt.',
  code: `# The host calls setup() once, then tick() for every frame.
setup(gravityInput, timeStepInput, outerSpeedInput) => {
  gravity = gravityInput;
  dt = timeStepInput;
  outerSpeed = outerSpeedInput;
  frame = 0;
  x1 = 18;
  y1 = 0;
  vx1 = 0;
  vy1 = 1.64;
  x2 = 0;
  y2 = 28;
  vx2 = -1.31;
  vy2 = 0;
  x3 = -38;
  y3 = 0;
  vx3 = 0;
  vy3 = -outerSpeed
};

tick() => {
  @=x1@; @=y1@;
  @=x2@; @=y2@;
  @=x3@; @=y3@;

  # The live slider changes the target speed without resetting the orbit.
  vy3 += (-outerSpeed - vy3) * 0.1;

  radiusSquared1 = x1 * x1 + y1 * y1;
  radius1 = radiusSquared1 ** 0.5;
  force1 = gravity / (radiusSquared1 * radius1);
  vx1 -= x1 * force1 * dt;
  vy1 -= y1 * force1 * dt;
  x1 += vx1 * dt;
  y1 += vy1 * dt;

  radiusSquared2 = x2 * x2 + y2 * y2;
  radius2 = radiusSquared2 ** 0.5;
  force2 = gravity / (radiusSquared2 * radius2);
  vx2 -= x2 * force2 * dt;
  vy2 -= y2 * force2 * dt;
  x2 += vx2 * dt;
  y2 += vy2 * dt;

  radiusSquared3 = x3 * x3 + y3 * y3;
  radius3 = radiusSquared3 ** 0.5;
  force3 = gravity / (radiusSquared3 * radius3);
  vx3 -= x3 * force3 * dt;
  vy3 -= y3 * force3 * dt;
  x3 += vx3 * dt;
  y3 += vy3 * dt;

  frame++
};`,
  args: '48 0.18 1.05',
  animation: {
    kind: 'scene',
    title: 'Orbital system',
    description: 'A symplectic Euler step updates velocity before position on every frame.',
    framesPerSecond: 24,
    execution: { mode: 'live', setupFunction: 'setup', tickFunction: 'tick' },
    xMin: -65,
    xMax: 65,
    yMin: -65,
    yMax: 65,
    trailLength: 100,
    showOrigin: true,
    points: [
      { x: 'x1', y: 'y1', color: '#60a5fa', label: 'Inner body', radius: 1.5 },
      { x: 'x2', y: 'y2', color: '#f472b6', label: 'Middle body', radius: 1.7 },
      { x: 'x3', y: 'y3', color: '#4ade80', label: 'Outer body', radius: 1.9 },
    ],
  },
  controls: {
    description: 'Tune the integration and rerun the model to reshape all three trajectories.',
    autoRun: true,
    items: [
      {
        id: 'gravity',
        label: 'Gravity',
        description: 'Strength of the central attraction.',
        argumentIndex: 0,
        kind: 'range',
        liveVariable: 'gravity',
        defaultValue: 48,
        min: 20,
        max: 80,
        step: 1,
      },
      {
        id: 'time-step',
        label: 'Time step',
        description: 'Simulation time advanced by each frame.',
        argumentIndex: 1,
        kind: 'range',
        liveVariable: 'dt',
        defaultValue: 0.18,
        min: 0.05,
        max: 0.3,
        step: 0.01,
      },
      {
        id: 'outer-speed',
        label: 'Outer speed',
        description: 'Target tangential speed; changing it steers the current green orbit.',
        argumentIndex: 2,
        kind: 'range',
        liveVariable: 'outerSpeed',
        defaultValue: 1.05,
        min: 0.6,
        max: 1.5,
        step: 0.01,
      },
    ],
  },
}
