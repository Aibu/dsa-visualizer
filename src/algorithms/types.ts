/**
 * Every algorithm is a generator that yields a snapshot each time it does
 * something worth seeing. The UI replays the snapshots; tests read the
 * generator's return value. Neither side knows about the other.
 */

export interface Complexity {
  best: string;
  average: string;
  worst: string;
  space: string;
}

export interface AlgorithmInfo<Run, Plain = unknown> {
  id: string;
  name: string;
  description: string;
  complexity: Complexity;
  /** The instrumented generator that drives the animation. */
  run: Run;
  /** The same algorithm written plainly, as you would in an interview. */
  reference: Plain;
  /** Source of the plain version, shown in the code panel. */
  source: string;
}

/**
 * Every step names the line of the plain example it corresponds to, via a
 * `// @step <line>` marker in that file, and says in words what happened.
 */
export interface StepMeta {
  line: string;
  message: string;
}

/** One frame of a sorting algorithm. Indices refer to positions in `array`. */
export interface SortStep extends StepMeta {
  array: number[];
  /** Two positions being compared right now. */
  compare?: [number, number];
  /** Two positions that were just swapped (or written, for merge sort). */
  swap?: [number, number];
  pivot?: number;
  /** Positions that are in their final place. */
  sorted: number[];
}

export type SortAlgorithm = (input: number[]) => Generator<SortStep, number[]>;

/** A grid graph: cell id = row * cols + col. Neighbours are the 4 adjacent cells. */
export interface Grid {
  rows: number;
  cols: number;
  walls: Set<number>;
  start: number;
  goal: number;
}

/** One frame of a graph search. */
export interface GraphStep extends StepMeta {
  current: number | null;
  visited: number[];
  frontier: number[];
  /** Filled only on the final frame when the goal was reached. */
  path: number[];
}

export type GraphAlgorithm = (grid: Grid) => Generator<GraphStep, number[] | null>;

/** Drain a generator, returning its final `return` value. Handy in tests and scripts. */
export function runToEnd<T, R>(gen: Generator<T, R>): R {
  let result = gen.next();
  while (!result.done) result = gen.next();
  return result.value;
}
