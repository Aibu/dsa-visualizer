import type { SortStep } from '../types';

/**
 * Quick sort with the Lomuto partition scheme: the last element of each
 * range is the pivot, smaller elements are moved to its left, then the pivot
 * drops into its final position and both sides are sorted recursively.
 */
export function* quickSort(input: number[]): Generator<SortStep, number[]> {
  const a = [...input];
  const sorted = new Set<number>();
  const snap = (extra: Partial<SortStep> = {}): SortStep => ({
    array: [...a],
    sorted: [...sorted],
    ...extra,
  });

  function* sort(lo: number, hi: number): Generator<SortStep, void> {
    if (lo > hi) return;
    if (lo === hi) {
      sorted.add(lo);
      yield snap();
      return;
    }

    const pivotValue = a[hi];
    let i = lo; // everything in [lo, i) is smaller than the pivot

    for (let j = lo; j < hi; j++) {
      yield snap({ pivot: hi, compare: [j, hi] });
      if (a[j] < pivotValue) {
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          yield snap({ pivot: hi, swap: [i, j] });
        }
        i++;
      }
    }

    [a[i], a[hi]] = [a[hi], a[i]];
    sorted.add(i);
    yield snap({ swap: [i, hi] });

    yield* sort(lo, i - 1);
    yield* sort(i + 1, hi);
  }

  yield* sort(0, a.length - 1);
  yield snap();
  return a;
}
