import type { SortStep } from '../types';

/**
 * Animated version of quickSort.example.ts. It runs the same Lomuto partition
 * and yields a step every time the plain version would reach a line marked
 * with `// @step`.
 */
export function* quickSort(input: number[]): Generator<SortStep, number[]> {
  const a = [...input];
  const sorted = new Set<number>();
  const snap = (line: string, message: string, extra: Partial<SortStep> = {}): SortStep => ({
    array: [...a],
    sorted: [...sorted],
    line,
    message,
    ...extra,
  });

  function* sort(lo: number, hi: number): Generator<SortStep, void> {
    if (lo >= hi) {
      if (lo === hi) {
        sorted.add(lo);
        yield snap('base-case', `a[${lo}] = ${a[lo]} is a range of one value, so it is already in place.`);
      }
      return;
    }

    const pivot = a[hi];
    yield snap('pick-pivot', `Partition a[${lo}..${hi}] around its last value, ${pivot}.`, { pivot: hi });

    let i = lo;
    for (let j = lo; j < hi; j++) {
      const smaller = a[j] < pivot;
      yield snap(
        'compare',
        smaller
          ? `a[${j}] = ${a[j]} is smaller than ${pivot}, so it belongs on the left side.`
          : `a[${j}] = ${a[j]} is not smaller than ${pivot}, so it stays on the right side.`,
        { pivot: hi, compare: [j, hi] },
      );
      if (smaller) {
        [a[i], a[j]] = [a[j], a[i]];
        yield snap(
          'swap',
          i === j
            ? `${a[i]} is already at the end of the left side. The left side now ends at index ${i}.`
            : `Swap ${a[i]} into index ${i}. The left side now ends at index ${i}.`,
          { pivot: hi, swap: [i, j] },
        );
        i++;
      }
    }

    [a[i], a[hi]] = [a[hi], a[i]];
    sorted.add(i);
    yield snap(
      'place-pivot',
      `Move the pivot ${pivot} to index ${i}. Everything to its left is smaller, so this is its final place.`,
      { swap: [i, hi] },
    );

    yield* sort(lo, i - 1);
    yield* sort(i + 1, hi);
  }

  yield* sort(0, a.length - 1);
  yield snap('done', 'Every value is in its final place. The array is sorted.');
  return a;
}
