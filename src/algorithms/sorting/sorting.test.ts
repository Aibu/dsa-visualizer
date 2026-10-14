import { describe, expect, it } from 'vitest';
import { runToEnd } from '../types';
import { sortingAlgorithms } from '.';

const cases: Record<string, number[]> = {
  empty: [],
  single: [7],
  sorted: [1, 2, 3, 4, 5],
  reversed: [5, 4, 3, 2, 1],
  duplicates: [3, 1, 3, 2, 1, 3],
  negatives: [0, -4, 12, -1, 7],
};

// Every algorithm in the registry is checked, so new ones are tested for free.
describe.each(sortingAlgorithms)('$name', ({ run }) => {
  it.each(Object.entries(cases))('sorts %s input', (_, input) => {
    expect(runToEnd(run(input))).toEqual([...input].sort((x, y) => x - y));
  });

  it('sorts random arrays', () => {
    for (let n = 0; n < 50; n++) {
      const input = Array.from({ length: 30 }, () => Math.floor(Math.random() * 100));
      expect(runToEnd(run(input))).toEqual([...input].sort((x, y) => x - y));
    }
  });

  it('does not mutate its input', () => {
    const input = [3, 1, 2];
    runToEnd(run(input));
    expect(input).toEqual([3, 1, 2]);
  });

  it('ends on a frame where every position is sorted', () => {
    const steps = [...run([4, 2, 5, 1, 3])];
    const last = steps.at(-1)!;
    expect(last.array).toEqual([1, 2, 3, 4, 5]);
    expect([...last.sorted].sort()).toEqual([0, 1, 2, 3, 4]);
  });
});
