import type { TreeNode } from './bst.example';
import source from './bst.example.ts?raw';
import { build, plural, type Mark, type OpRun, type Operation, type StructureInfo } from './types';

export type { TreeNode };

export interface TreeState {
  root: TreeNode | null;
}

const clone = (node: TreeNode | null): TreeNode | null =>
  node && { value: node.value, left: clone(node.left), right: clone(node.right) };

// Snapshots are deep copies, so later steps cannot change what earlier frames show.
const frame = (root: TreeNode | null, line: string, message: string, marks: Mark[] = []) => ({
  state: { root: clone(root) },
  line,
  message,
  marks,
});

function* insert(state: TreeState, value: number): OpRun<TreeState> {
  const root = clone(state.root);
  const node: TreeNode = { value, left: null, right: null };
  if (root === null) {
    yield frame(node, 'insert-root', `The tree is empty, so ${value} becomes the root.`, [{ at: value, tone: 'add' }]);
    return { state: { root: node } };
  }

  let current = root;
  let depth = 0;
  while (true) {
    const look: Mark = { at: current.value, tone: 'look' };
    if (value === current.value) {
      yield frame(root, 'insert-duplicate', `${value} is already in the tree. Each value is stored once, so nothing changes.`, [look]);
      return { state: { root } };
    }
    if (value < current.value) {
      if (current.left === null) {
        current.left = node;
        yield frame(
          root,
          'insert-left',
          `${value} < ${current.value} and there is no left child, so ${value} goes here, ${plural(depth + 1, 'level')} below the root.`,
          [look, { at: value, tone: 'add' }],
        );
        return { state: { root } };
      }
      yield frame(root, 'insert-go-left', `${value} < ${current.value}, so it belongs somewhere on the left. Go left.`, [look]);
      current = current.left;
    } else {
      if (current.right === null) {
        current.right = node;
        yield frame(
          root,
          'insert-right',
          `${value} > ${current.value} and there is no right child, so ${value} goes here, ${plural(depth + 1, 'level')} below the root.`,
          [look, { at: value, tone: 'add' }],
        );
        return { state: { root } };
      }
      yield frame(root, 'insert-go-right', `${value} > ${current.value}, so it belongs somewhere on the right. Go right.`, [look]);
      current = current.right;
    }
    depth++;
  }
}

function* contains({ root }: TreeState, value: number): OpRun<TreeState> {
  let current = root;
  let checked = 0;
  while (current !== null) {
    checked++;
    if (value === current.value) {
      yield frame(root, 'search-found', `Found ${value} after looking at ${plural(checked, 'node')}. Contains returns true.`, [
        { at: value, tone: 'add' },
      ]);
      return { state: { root }, result: true };
    }
    const left = value < current.value;
    yield frame(
      root,
      'search-go',
      `${value} ${left ? '<' : '>'} ${current.value}, so if it is here at all it is on the ${left ? 'left' : 'right'}. The other side is never looked at.`,
      [{ at: current.value, tone: 'look' }],
    );
    current = left ? current.left : current.right;
  }
  yield frame(
    root,
    'search-missing',
    `There is no child in that direction, so ${value} is not in the tree. It took ${plural(checked, 'comparison')}, one per level.`,
  );
  return { state: { root }, result: false };
}

function* inOrder({ root }: TreeState): OpRun<TreeState> {
  const values: number[] = [];

  function* visit(node: TreeNode | null): Generator<ReturnType<typeof frame>, void> {
    if (node === null) return;
    yield* visit(node.left);
    values.push(node.value);
    const marks: Mark[] = values.map((v) => ({ at: v, tone: 'done' }));
    marks.push({ at: node.value, tone: 'look' });
    yield frame(
      root,
      'inorder-visit',
      `Everything left of ${node.value} is done, so visit ${node.value}, then its right side. So far: ${values.join(', ')}.`,
      marks,
    );
    yield* visit(node.right);
  }

  yield* visit(root);
  yield frame(
    root,
    'inorder-done',
    values.length === 0
      ? 'The tree is empty, so there is nothing to visit.'
      : `Left, node, right at every level gives the values in sorted order: ${values.join(', ')}.`,
    values.map((v) => ({ at: v, tone: 'done' })),
  );
  return { state: { root }, result: values };
}

const insertOp: Operation<TreeState> = {
  id: 'insert', label: 'Insert', takesValue: true, grows: true, complexity: 'O(log n) average, O(n) worst', run: insert,
};

export const bst: StructureInfo<TreeState> = {
  id: 'bst',
  name: 'Binary search tree',
  description:
    'Smaller values to the left, larger to the right. Fast while the tree stays bushy, as slow as a list if values arrive already sorted.',
  source,
  empty: { root: null },
  initial: build({ root: null }, insertOp, [50, 30, 70, 20, 40, 60, 80]),
  size: (s) => {
    const count = (n: TreeNode | null): number => (n ? 1 + count(n.left) + count(n.right) : 0);
    return count(s.root);
  },
  capacity: 15,
  operations: [
    insertOp,
    { id: 'contains', label: 'Search', takesValue: true, complexity: 'O(log n) average, O(n) worst', run: contains },
    { id: 'in-order', label: 'Walk in order', method: 'inOrder', takesValue: false, complexity: 'O(n)', run: inOrder },
  ],
};
