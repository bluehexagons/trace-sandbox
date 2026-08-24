import type { Example } from '../types';
import { orbitalSystemExample } from './simulations/orbital-system';
import { lorenzAttractorExample } from './simulations/lorenz-attractor';
import { dampedWaveExample } from './simulations/damped-wave';
import { logisticMapExample } from './simulations/logistic-map';
import { predatorPreyExample } from './simulations/predator-prey';
import { kickedOscillatorExample } from './simulations/kicked-oscillator';

export const simulationsExamples: Example[] = [
  orbitalSystemExample,
  lorenzAttractorExample,
  dampedWaveExample,
  logisticMapExample,
  predatorPreyExample,
  kickedOscillatorExample,
];
