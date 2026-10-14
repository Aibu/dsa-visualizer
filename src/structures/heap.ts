import source from './heap.example.ts?raw';
import { build, type Mark, type OpRun, type Operation, type StructureInfo } from './types';

/** The heap's array. The drawing shows it both as the array and as the tree it encodes. */
export interface HeapState {
  items: number[];
}

const frame = (items: number[], line: string, message: string, marks: Mark[] = []) => ({
  state: { items: [...items] },
  line,
  message,
  marks,
});

const look = (at: number): Mark => ({ at, tone: 'look' });

function* push({ items: before }: HeapState, value: number): OpRun<HeapState> {
  const items = [...before, value];
  let i = items.length - 1;
  yield frame(items, 'push', `Put ${value} in the next free spot, index ${i}, so the tree stays complete. Now float it up.`, [
    { at: i, tone: 'add' },
  ]);

  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (items[parent] <= items[i]) {
      yield frame(
        items,
        'up-check',
        `Its parent ${items[parent]} is not larger than ${items[i]}, so the heap order holds. Done.`,
        [look(parent), { at: i, tone: 'add' }],
      );
      return { state: { items } };
    }
    yield frame(items, 'up-check', `${items[i]} is smaller than its parent ${items[parent]}, so they are in the wrong order.`, [
      look(parent),
      look(i),
    ]);
    [items[parent], items[i]] = [items[i], items[parent]];
    i = parent;
    yield frame(
      items,
      'up-swap',
      i === 0
        ? `Swap them. ${value} is now the root, the smallest value in the heap.`
        : `Swap them. ${value} moves up to index ${i}.`,
      [{ at: i, tone: 'add' }],
    );
  }
  return { state: { items } };
}

function* pop({ items: before }: HeapState): OpRun<HeapState> {
  const items = [...before];
  if (items.length === 0) {
    yield frame(items, 'pop-empty', 'The heap is empty, so pop returns undefined.');
    return { state: { items }, result: undefined };
  }

  const top = items[0];
  yield frame(items, 'pop', `The smallest value is always the root: ${top}. Take it out.`, [{ at: 0, tone: 'remove' }]);

  const last = items.pop()!;
  if (items.length === 0) {
    yield frame(items, 'pop-last', `${top} was the only value, so the heap is empty now.`);
  } else {
    items[0] = last;
    yield frame(
      items,
      'pop-last',
      `Move the last value, ${last}, into the hole at the root, so the tree stays complete. It is probably too big for the top, so sink it down.`,
      [look(0)],
    );

    let i = 0;
    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;
      if (left < items.length && items[left] < items[smallest]) smallest = left;
      if (right < items.length && items[right] < items[smallest]) smallest = right;

      const children = [left, right].filter((c) => c < items.length);
      const kids = children.map((c) => items[c]).join(' and ');
      if (smallest === i) {
        yield frame(
          items,
          'down-done',
          children.length === 0
            ? `${items[i]} has no children left, so it has reached the bottom. Done.`
            : `${items[i]} is not larger than its ${children.length === 1 ? 'child' : 'children'} ${kids}, so the heap order holds. Done.`,
          [look(i)],
        );
        break;
      }
      yield frame(
        items,
        'down-check',
        `Compare ${items[i]} with its ${children.length === 1 ? 'child' : 'children'} ${kids}. The smallest is ${items[smallest]}, below it.`,
        [look(i), ...children.map(look)],
      );
      [items[i], items[smallest]] = [items[smallest], items[i]];
      i = smallest;
      yield frame(items, 'down-swap', `Swap them, so the smaller value sits above. ${last} moves down to index ${i}.`, [look(i)]);
    }
  }

  yield frame(items, 'pop-return', `Pop returns ${top}. Both moves took one step per level, so pop is O(log n).`);
  return { state: { items }, result: top };
}

function* peek({ items }: HeapState): OpRun<HeapState> {
  yield frame(
    items,
    'peek',
    items.length === 0 ? 'The heap is empty, so peek returns undefined.' : `The root is ${items[0]}, the smallest value. No searching needed.`,
    items.length === 0 ? [] : [look(0)],
  );
  return { state: { items }, result: items[0] };
}

const pushOp: Operation<HeapState> = {
  id: 'push', label: 'Push', takesValue: true, grows: true, complexity: 'O(log n)', run: push,
};

export const heap: StructureInfo<HeapState> = {
  id: 'heap',
  name: 'Min heap',
  description:
    'Always hands you the smallest value first. Priority queues, Dijkstra and heap sort are all built on one.',
  source,
  empty: { items: [] },
  initial: build({ items: [] }, pushOp, [40, 20, 60, 10, 30, 50]),
  size: (s) => s.items.length,
  capacity: 15,
  operations: [
    pushOp,
    { id: 'pop', label: 'Pop smallest', takesValue: false, complexity: 'O(log n)', run: pop },
    { id: 'peek', label: 'Peek', takesValue: false, complexity: 'O(1)', run: peek },
  ],
};
