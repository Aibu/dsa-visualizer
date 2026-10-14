import { describe, expect, it } from 'vitest';
import { parseSource } from '../algorithms/source';
import { bst, type TreeState } from './bst';
import { hashSet, type HashSetState } from './hashSet';
import { HashSet } from './hashSet.example';
import { heap, type HeapState } from './heap';
import { MinHeap } from './heap.example';
import { BinarySearchTree } from './bst.example';
import { structures } from '.';
import { linkedList, type ListState } from './linkedList';
import { LinkedList } from './linkedList.example';
import { queue, type QueueState } from './queue';
import { Queue } from './queue.example';
import { stack, type StackState } from './stack';
import { Stack } from './stack.example';
import { apply, type Operation, type StructureInfo } from './types';

const op = <S>(structure: StructureInfo<S>, id: string): Operation<S> =>
  structure.operations.find((o) => o.id === id)!;
const randomInt = (max: number) => Math.floor(Math.random() * max);

/** Scripts that, starting from empty, reach every // @step line at least once. */
const scripts: Record<string, [string, number][]> = {
  stack: [['pop', 0], ['peek', 0], ['push', 3], ['push', 8], ['peek', 0], ['pop', 0]],
  queue: [['dequeue', 0], ['enqueue', 1], ['enqueue', 2], ['enqueue', 3], ['dequeue', 0], ['dequeue', 0]],
  'linked-list': [
    ['remove', 1], ['append', 1], ['append', 2], ['append', 3], ['prepend', 0],
    ['find', 3], ['find', 9], ['remove', 0], ['remove', 3], ['remove', 9],
  ],
  bst: [
    ['insert', 50], ['insert', 30], ['insert', 70], ['insert', 40], ['insert', 60], ['insert', 50],
    ['contains', 40], ['contains', 65], ['in-order', 0],
  ],
  heap: [
    ['pop', 0], ['push', 5], ['pop', 0], ['push', 30], ['push', 20], ['push', 10], ['push', 40],
    ['peek', 0], ['pop', 0],
  ],
  'hash-set': [
    ['has', 3], ['delete', 3], ['add', 1], ['add', 5], ['add', 1], ['add', 2], ['add', 3],
    ['has', 5], ['delete', 5],
  ],
};

describe.each(structures)('$name', (structure) => {
  it('only highlights lines that exist in the example, and uses all of them', () => {
    const { markers } = parseSource(structure.source);
    const used = new Set<string>();
    let state = structure.empty;
    for (const [id, value] of scripts[structure.id]) {
      const { steps, state: next } = apply(op(structure, id), state, value);
      expect(steps.length).toBeGreaterThan(0);
      for (const step of steps) {
        expect(markers.has(step.line), `missing // @step ${step.line}`).toBe(true);
        used.add(step.line);
      }
      state = next;
    }
    expect([...used].sort()).toEqual([...markers.keys()].sort());
  });

  it('never changes the state it was given', () => {
    const before = JSON.stringify(structure.initial);
    for (const operation of structure.operations) apply(operation, structure.initial, 42);
    expect(JSON.stringify(structure.initial)).toBe(before);
  });
});

// The animated operations and the plain classes must agree on every result
// and every resulting state, over long runs of random operations.
describe('animated and plain versions agree', () => {
  it('stack', () => {
    const plain = new Stack<number>();
    let state: StackState = stack.empty;
    for (let n = 0; n < 300; n++) {
      const id = ['push', 'pop', 'peek'][randomInt(3)];
      const value = randomInt(100);
      const out = apply(op(stack, id), state, value);
      const expected = id === 'push' ? plain.push(value) : id === 'pop' ? plain.pop() : plain.peek();
      expect(out.result).toEqual(expected);
      expect(out.state.items).toEqual(plain.toArray());
      state = out.state;
    }
  });

  it('queue', () => {
    const plain = new Queue<number>();
    let state: QueueState = queue.empty;
    for (let n = 0; n < 300; n++) {
      const id = Math.random() < 0.55 ? 'enqueue' : 'dequeue';
      const value = randomInt(100);
      const out = apply(op(queue, id), state, value);
      const expected = id === 'enqueue' ? plain.enqueue(value) : plain.dequeue();
      expect(out.result).toEqual(expected);
      expect(out.state.items.slice(out.state.head)).toEqual(plain.toArray());
      state = out.state;
    }
  });

  it('linked list', () => {
    const plain = new LinkedList<number>();
    let state: ListState = linkedList.empty;
    for (let n = 0; n < 300; n++) {
      const id = ['prepend', 'append', 'find', 'remove'][randomInt(4)];
      const value = randomInt(12);
      const out = apply(op(linkedList, id), state, value);
      if (id === 'prepend') plain.prepend(value);
      if (id === 'append') plain.append(value);
      if (id === 'find') expect(out.result).toBe(plain.find(value) !== null);
      if (id === 'remove') expect(out.result).toBe(plain.remove(value));
      expect(out.state.values).toEqual(plain.toArray());
      state = out.state;
    }
  });

  it('binary search tree', () => {
    const plain = new BinarySearchTree();
    let state: TreeState = bst.empty;
    for (let n = 0; n < 300; n++) {
      const id = ['insert', 'contains', 'in-order'][randomInt(3)];
      const value = randomInt(60);
      const out = apply(op(bst, id), state, value);
      if (id === 'insert') plain.insert(value);
      if (id === 'contains') expect(out.result).toBe(plain.contains(value));
      if (id === 'in-order') expect(out.result).toEqual(plain.inOrder());
      expect(out.state.root).toEqual(plain.root);
      state = out.state;
    }
    // In order is sorted order, which is the whole point of a search tree.
    const values = plain.inOrder();
    expect(values).toEqual([...values].sort((a, b) => a - b));
  });

  it('min heap', () => {
    const plain = new MinHeap();
    let state: HeapState = heap.empty;
    for (let n = 0; n < 300; n++) {
      const id = Math.random() < 0.55 ? 'push' : ['pop', 'peek'][randomInt(2)];
      const value = randomInt(50);
      const out = apply(op(heap, id), state, value);
      const expected = id === 'push' ? plain.push(value) : id === 'pop' ? plain.pop() : plain.peek();
      expect(out.result).toEqual(expected);
      expect(out.state.items).toEqual(plain.toArray());
      state = out.state;
    }
    // Popping everything out gives sorted order, which is heap sort.
    const drained: number[] = [];
    for (let v = plain.pop(); v !== undefined; v = plain.pop()) drained.push(v);
    expect(drained).toEqual([...drained].sort((a, b) => a - b));
  });

  it('hash set', () => {
    const plain = new HashSet();
    let state: HashSetState = hashSet.empty;
    for (let n = 0; n < 300; n++) {
      const id = ['add', 'add', 'has', 'delete'][randomInt(4)];
      const value = randomInt(40);
      const out = apply(op(hashSet, id), state, value);
      if (id === 'add') plain.add(value);
      if (id === 'has') expect(out.result).toBe(plain.has(value));
      if (id === 'delete') expect(out.result).toBe(plain.delete(value));
      expect(out.state.buckets).toEqual(plain.toArray());
      state = out.state;
    }
  });
});
