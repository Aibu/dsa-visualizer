import source from './stack.example.ts?raw';
import { build, plural, type Mark, type OpRun, type Operation, type StructureInfo } from './types';

export interface StackState {
  items: number[];
}

const frame = (items: number[], line: string, message: string, marks: Mark[] = []) => ({
  state: { items },
  line,
  message,
  marks,
});

function* push({ items }: StackState, value: number): OpRun<StackState> {
  const next = [...items, value];
  yield frame(next, 'push', `Put ${value} on top. Nothing else moves, so push is O(1).`, [
    { at: next.length - 1, tone: 'add' },
  ]);
  return { state: { items: next } };
}

function* pop({ items }: StackState): OpRun<StackState> {
  if (items.length === 0) {
    yield frame(items, 'pop-empty', 'The stack is empty, so pop returns undefined.');
    return { state: { items }, result: undefined };
  }
  const top = items[items.length - 1];
  yield frame(items, 'pop', `Take ${top} off the top. It was the last value in, so it is the first out.`, [
    { at: items.length - 1, tone: 'remove' },
  ]);
  const next = items.slice(0, -1);
  yield frame(next, 'pop', `Pop returns ${top}. The stack holds ${plural(next.length, 'value')} now.`);
  return { state: { items: next }, result: top };
}

function* peek({ items }: StackState): OpRun<StackState> {
  if (items.length === 0) {
    yield frame(items, 'peek', 'The stack is empty, so peek returns undefined.');
    return { state: { items }, result: undefined };
  }
  const top = items[items.length - 1];
  yield frame(items, 'peek', `The top is ${top}. Peek reads it and leaves it where it is.`, [
    { at: items.length - 1, tone: 'look' },
  ]);
  return { state: { items }, result: top };
}

const pushOp: Operation<StackState> = {
  id: 'push', label: 'Push', takesValue: true, grows: true, complexity: 'O(1)', run: push,
};

export const stack: StructureInfo<StackState> = {
  id: 'stack',
  name: 'Stack',
  description: 'Last in, first out. Think of a pile of plates: you only ever touch the top one.',
  source,
  empty: { items: [] },
  initial: build({ items: [] }, pushOp, [3, 8, 5]),
  size: (s) => s.items.length,
  capacity: 9,
  operations: [
    pushOp,
    { id: 'pop', label: 'Pop', takesValue: false, complexity: 'O(1)', run: pop },
    { id: 'peek', label: 'Peek', takesValue: false, complexity: 'O(1)', run: peek },
  ],
};
