import { describe, expect, it } from 'vitest';
import { parseSource } from '../source';
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

const randomArray = () => Array.from({ length: 30 }, () => Math.floor(Math.random() * 100));
const ascending = (input: number[]) => [...input].sort((x, y) => x - y);

// Every algorithm in the registry is checked, so new ones are tested for free.
describe.each(sortingAlgorithms)('$name', ({ run, reference, source }) => {
  it.each(Object.entries(cases))('sorts %s input', (_, input) => {
    expect(runToEnd(run(input))).toEqual(ascending(input));
    expect(reference(input)).toEqual(ascending(input));
  });

  it('sorts random arrays', () => {
    for (let n = 0; n < 50; n++) {
      const input = randomArray();
      expect(runToEnd(run(input))).toEqual(ascending(input));
      expect(reference(input)).toEqual(ascending(input));
    }
  });

  it('does not mutate its input', () => {
    const input = [3, 1, 2];
    runToEnd(run(input));
    reference(input);
    expect(input).toEqual([3, 1, 2]);
  });

  it('ends on a frame where every position is sorted', () => {
    const steps = [...run([4, 2, 5, 1, 3])];
    const last = steps.at(-1)!;
    expect(last.array).toEqual([1, 2, 3, 4, 5]);
    expect([...last.sorted].sort()).toEqual([0, 1, 2, 3, 4]);
  });

  it('only highlights lines that exist in the example, and uses all of them', () => {
    const { markers } = parseSource(source);
    const used = new Set<string>();
    for (const input of [...Object.values(cases), randomArray()]) {
      for (const step of run(input)) {
        expect(markers.has(step.line), `missing // @step ${step.line}`).toBe(true);
        used.add(step.line);
      }
    }
    expect([...used].sort()).toEqual([...markers.keys()].sort());
  });
});
