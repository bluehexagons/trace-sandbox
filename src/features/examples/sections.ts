export const exampleSections = [
  {
    id: 'foundations',
    title: '1. Foundations',
    description: 'Expressions, state, decisions, and trace’s unusual random operators.',
  },
  {
    id: 'functions',
    title: '2. Functions & flow',
    description: 'Build control flow from calls, recursion, and the standard library.',
  },
  {
    id: 'data',
    title: '3. Data & input',
    description: 'Accept arguments, work with 1-indexed arrays, and transform data.',
  },
  {
    id: 'debugging',
    title: '4. Debugging',
    description: 'Inspect a running program and learn how failures are reported.',
  },
  {
    id: 'systems',
    title: '5. Larger systems',
    description: 'Put the pieces together in algorithms, simulations, and an interpreter.',
  },
  {
    id: 'simulations',
    title: '6. Dynamic systems',
    description: 'Explore motion, feedback, chaos, and waves in continuously running models.',
  },
  {
    id: 'experiments',
    title: '7. Algorithms & experiments',
    description: 'Visualize computation, emergence, and randomized mathematical evidence.',
  },
] as const

export type ExampleSectionId = (typeof exampleSections)[number]['id']
