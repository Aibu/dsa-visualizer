import type { StepMeta } from '../algorithms/types';

/** How a highlighted element should look: being read, just added, about to go, or finished with. */
export type Tone = 'look' | 'add' | 'remove' | 'done';

/**
 * A highlight. `at` is a position for the linear structures (stack, queue,
 * linked list) and a node's value for the tree, where values are unique.
 */
export interface Mark {
  at: number;
  tone: Tone;
}

export interface StructureStep<S> extends StepMeta {
  state: S;
  marks: Mark[];
}

/** What an operation leaves behind: the new state, and what it returned, if anything. */
export interface OpResult<S> {
  state: S;
  result?: unknown;
}

export type OpRun<S> = Generator<StructureStep<S>, OpResult<S>>;

export interface Operation<S> {
  id: string;
  label: string;
  takesValue: boolean;
  /** True when the operation can make the structure bigger. */
  grows?: boolean;
  complexity: string;
  run: (state: S, value: number) => OpRun<S>;
}

export interface StructureInfo<S> {
  id: string;
  name: string;
  description: string;
  /** Source of the plain class, shown in the code panel. */
  source: string;
  empty: S;
  /** What the UI starts with, so there is something to look at. */
  initial: S;
  size: (state: S) => number;
  /** Past this many elements the demo stops growing, so the drawing stays readable. */
  capacity: number;
  operations: Operation<S>[];
}

/** Run one operation to the end, keeping both its steps and its result. */
export function apply<S>(op: Operation<S>, state: S, value = 0) {
  const gen = op.run(state, value);
  const steps: StructureStep<S>[] = [];
  let next = gen.next();
  while (!next.done) {
    steps.push(next.value);
    next = gen.next();
  }
  return { steps, ...next.value };
}

/** Build a starting state by running an operation over a list of values. */
export function build<S>(empty: S, op: Operation<S>, values: number[]): S {
  return values.reduce((state, value) => apply(op, state, value).state, empty);
}

export const plural = (n: number, word: string) => `${n} ${n === 1 ? word : `${word}s`}`;
