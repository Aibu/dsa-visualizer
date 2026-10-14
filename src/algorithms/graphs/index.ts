import type { AlgorithmInfo, GraphAlgorithm } from '../types';
import { bfs } from './bfs';

/** Add a graph algorithm here and it shows up in the UI dropdown. */
export const graphAlgorithms: AlgorithmInfo<GraphAlgorithm>[] = [
  {
    id: 'bfs',
    name: 'Breadth-first search',
    description:
      'Explore outward one ring at a time using a queue. Finds the shortest path on an unweighted graph.',
    complexity: { best: 'O(1)', average: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
    run: bfs,
  },
];
