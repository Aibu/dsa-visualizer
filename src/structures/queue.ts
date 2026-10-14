import source from './queue.example.ts?raw';
import { build, plural, type Mark, type OpRun, type Operation, type StructureInfo } from './types';

/** `items` includes the dead slots before `head`, so the drawing can show them. */
export interface QueueState {
  items: number[];
  head: number;
}

const frame = (items: number[], head: number, line: string, message: string, marks: Mark[] = []) => ({
  state: { items, head },
  line,
  message,
  marks,
});

function* enqueue({ items, head }: QueueState, value: number): OpRun<QueueState> {
  const next = [...items, value];
  yield frame(next, head, 'enqueue', `Add ${value} at the back. Nothing else moves, so enqueue is O(1).`, [
    { at: next.length - 1, tone: 'add' },
  ]);
  return { state: { items: next, head } };
}

function* dequeue({ items, head }: QueueState): OpRun<QueueState> {
  if (head === items.length) {
    yield frame(items, head, 'dequeue-empty', 'The queue is empty, so dequeue returns undefined.');
    return { state: { items, head }, result: undefined };
  }

  const value = items[head];
  yield frame(items, head, 'dequeue', `Read ${value} at the front, index ${head}. It has waited longest, so it goes first.`, [
    { at: head, tone: 'remove' },
  ]);
  head++;
  yield frame(
    items,
    head,
    'dequeue',
    `Move the front to index ${head}. The old slot is simply left behind, because shifting every value down would be O(n). Dequeue returns ${value}.`,
  );

  if (head * 2 >= items.length) {
    const live = items.length - head;
    const dead = Array.from({ length: head }, (_, i) => ({ at: i, tone: 'remove' as const }));
    yield frame(
      items,
      head,
      'compact',
      live === 0
        ? 'Every slot is dead now, so start again with an empty array.'
        : `${plural(head, 'dead slot')} now fill at least half the array, so copy the ${plural(live, 'live value')} down. This copy is O(n), but it only happens after many dequeues, so on average dequeue stays O(1).`,
      dead,
    );
    items = items.slice(head);
    head = 0;
    yield frame(items, head, 'compact', `The dead slots are gone and the front is back at index 0.`);
  }

  return { state: { items, head }, result: value };
}

const enqueueOp: Operation<QueueState> = {
  id: 'enqueue', label: 'Enqueue', takesValue: true, grows: true, complexity: 'O(1)', run: enqueue,
};

export const queue: StructureInfo<QueueState> = {
  id: 'queue',
  name: 'Queue',
  description: 'First in, first out. Like a line at a shop: you join at the back and leave from the front.',
  source,
  empty: { items: [], head: 0 },
  initial: build({ items: [], head: 0 }, enqueueOp, [4, 9, 2, 7]),
  size: (s) => s.items.length - s.head,
  capacity: 8,
  operations: [
    enqueueOp,
    { id: 'dequeue', label: 'Dequeue', takesValue: false, complexity: 'O(1) on average', run: dequeue },
  ],
};
