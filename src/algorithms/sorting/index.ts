import type { AlgorithmInfo, SortAlgorithm } from '../types';
import { quickSort } from './quickSort';
import { quickSort as quickSortReference } from './quickSort.example';
import quickSortSource from './quickSort.example.ts?raw';

export type PlainSort = (input: number[]) => number[];

/** Add a sorting algorithm here and it shows up in the UI dropdown. */
export const sortingAlgorithms: AlgorithmInfo<SortAlgorithm, PlainSort>[] = [
  {
    id: 'quick-sort',
    name: 'Quick sort',
    description:
      'Pick a pivot, move smaller values to its left and larger to its right, then sort each side the same way.',
    complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' },
    run: quickSort,
    reference: quickSortReference,
    source: quickSortSource,
  },
];
