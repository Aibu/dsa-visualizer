import source from './linkedList.example.ts?raw';
import { build, plural, type Mark, type OpRun, type Operation, type StructureInfo } from './types';

export interface ListState {
  values: number[];
}

interface Node {
  value: number;
  next: Node | null;
}

// The operations below work on real nodes and pointers, exactly like the
// example class. The state handed to the UI is just the values in order.
const toNodes = (values: number[]) =>
  values.reduceRight<Node | null>((next, value) => ({ value, next }), null);

function toValues(head: Node | null): number[] {
  const values: number[] = [];
  for (let node = head; node !== null; node = node.next) values.push(node.value);
  return values;
}

const frame = (head: Node | null, line: string, message: string, marks: Mark[] = []) => ({
  state: { values: toValues(head) },
  line,
  message,
  marks,
});

function* prepend({ values }: ListState, value: number): OpRun<ListState> {
  const head: Node = { value, next: toNodes(values) };
  yield frame(
    head,
    'prepend',
    `Make a node for ${value} that points at the old head, then call it the head. No walking needed, so this is O(1).`,
    [{ at: 0, tone: 'add' }],
  );
  return { state: { values: toValues(head) } };
}

function* append({ values }: ListState, value: number): OpRun<ListState> {
  let head = toNodes(values);
  const node: Node = { value, next: null };
  if (head === null) {
    head = node;
    yield frame(head, 'append-empty', `The list is empty, so ${value} becomes the head.`, [{ at: 0, tone: 'add' }]);
    return { state: { values: toValues(head) } };
  }

  let current = head;
  let i = 0;
  yield frame(
    head,
    'append-start',
    `Start at the head, ${current.value}. This list keeps no pointer to its last node, so it has to walk there.`,
    [{ at: 0, tone: 'look' }],
  );
  while (current.next !== null) {
    current = current.next;
    i++;
    yield frame(head, 'append-walk', `Follow the next pointer to ${current.value}.`, [{ at: i, tone: 'look' }]);
  }
  current.next = node;
  yield frame(
    head,
    'append',
    `${current.value} has no next node, so it is the last one. Point it at the new node for ${value}. Getting here took ${plural(i, 'step')}, which is why append is O(n).`,
    [{ at: i, tone: 'look' }, { at: i + 1, tone: 'add' }],
  );
  return { state: { values: toValues(head) } };
}

function* find({ values }: ListState, value: number): OpRun<ListState> {
  const head = toNodes(values);
  let current = head;
  let i = 0;
  while (current !== null) {
    if (current.value === value) {
      yield frame(head, 'find-check', `${current.value} is ${value}. Found it after checking ${plural(i + 1, 'node')}.`, [
        { at: i, tone: 'add' },
      ]);
      return { state: { values }, result: true };
    }
    yield frame(head, 'find-check', `${current.value} is not ${value}.`, [{ at: i, tone: 'look' }]);
    current = current.next;
    i++;
    yield frame(
      head,
      'find-walk',
      current ? `Follow the next pointer to ${current.value}.` : 'The next pointer is null. There is nowhere left to go.',
      current ? [{ at: i, tone: 'look' }] : [],
    );
  }
  yield frame(head, 'find-missing', `Every node was checked and none holds ${value}, so find returns null.`);
  return { state: { values }, result: false };
}

function* remove({ values }: ListState, value: number): OpRun<ListState> {
  let head = toNodes(values);
  if (head === null) {
    yield frame(head, 'remove-empty', 'The list is empty, so there is nothing to remove.');
    return { state: { values }, result: false };
  }

  if (head.value === value) {
    yield frame(head, 'remove-head', `The head holds ${value}, so the node after it becomes the new head.`, [
      { at: 0, tone: 'remove' },
    ]);
    head = head.next;
    yield frame(head, 'remove-head', `Nothing points at the old head any more, so it is gone. Remove returns true.`);
    return { state: { values: toValues(head) }, result: true };
  }

  let current = head;
  let i = 0;
  while (current.next !== null) {
    if (current.next.value === value) {
      const after = current.next.next?.value ?? 'null';
      yield frame(
        head,
        'remove-unlink',
        `The node after ${current.value} holds ${value}. Point ${current.value} past it, straight at ${after}.`,
        [{ at: i, tone: 'look' }, { at: i + 1, tone: 'remove' }],
      );
      current.next = current.next.next;
      yield frame(head, 'remove-unlink', `${value} is unlinked and nothing reaches it now. Remove returns true.`, [
        { at: i, tone: 'look' },
      ]);
      return { state: { values: toValues(head) }, result: true };
    }
    const nextValue = current.next.value;
    current = current.next;
    i++;
    yield frame(head, 'remove-walk', `The next node holds ${nextValue}, not ${value}. Step forward to it.`, [
      { at: i, tone: 'look' },
    ]);
  }
  yield frame(head, 'remove-missing', `${current.value} is the last node and ${value} never showed up. Remove returns false.`);
  return { state: { values }, result: false };
}

const appendOp: Operation<ListState> = {
  id: 'append', label: 'Append', takesValue: true, grows: true, complexity: 'O(n)', run: append,
};

export const linkedList: StructureInfo<ListState> = {
  id: 'linked-list',
  name: 'Linked list',
  description: 'A chain of nodes where each one points at the next. Cheap to change at the front, slow to search.',
  source,
  empty: { values: [] },
  initial: build({ values: [] }, appendOp, [7, 2, 9, 4]),
  size: (s) => s.values.length,
  capacity: 8,
  operations: [
    { id: 'prepend', label: 'Prepend', takesValue: true, grows: true, complexity: 'O(1)', run: prepend },
    appendOp,
    { id: 'find', label: 'Find', takesValue: true, complexity: 'O(n)', run: find },
    { id: 'remove', label: 'Remove', takesValue: true, complexity: 'O(n)', run: remove },
  ],
};
