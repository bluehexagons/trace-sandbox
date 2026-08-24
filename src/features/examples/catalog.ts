import { exampleSections } from './sections';
import type { Example } from './types';
import { foundationsExamples } from './data/foundations';
import { functionsExamples } from './data/functions';
import { dataExamples } from './data/data-and-input';
import { debuggingExamples } from './data/debugging';
import { systemsExamples } from './data/systems';
import { simulationsExamples } from './data/simulations';
import { experimentsExamples } from './data/experiments';

export const examples: Example[] = [
  ...foundationsExamples,
  ...functionsExamples,
  ...dataExamples,
  ...debuggingExamples,
  ...systemsExamples,
  ...simulationsExamples,
  ...experimentsExamples,
];

export { exampleSections };
export type { Example, ExampleSectionId } from './types';

const sectionIds = new Set(exampleSections.map((section) => section.id));
if (examples.some((example) => !sectionIds.has(example.section))) {
  throw new Error('Example catalog contains an unknown section.');
}
