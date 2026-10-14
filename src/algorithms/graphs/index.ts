import type { AlgorithmInfo, GraphAlgorithm, Grid } from '../types';
import { bfs } from './bfs';
import { bfs as bfsReference } from './bfs.example';
import bfsSource from './bfs.example.ts?raw';

export type PlainGraphSearch = (grid: Grid) => number[] | null;

/** Add a graph algorithm here and it shows up in the UI dropdown. */
export const graphAlgorithms: AlgorithmInfo<GraphAlgorithm, PlainGraphSearch>[] = [
  {
    id: 'bfs',
    name: 'Breadth first search',
    description:
      'Explore outward one ring at a time using a queue. Finds the shortest path on an unweighted graph.',
    complexity: { best: 'O(1)', average: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
    run: bfs,
    reference: bfsReference,
    source: bfsSource,
  },
];
