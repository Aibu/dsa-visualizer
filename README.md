# DSA Visualizer

The common data structures and algorithms, written as plain TypeScript and animated one step at a time in React.

## Why it is built this way

Every algorithm is a generator. Each time it compares, swaps or visits something, it yields a snapshot of its state. The React side replays those snapshots, and the tests read the value the generator returns at the end. The algorithm files have no React in them at all, so they read like what you would write in an interview or a textbook.

`src/algorithms/sorting/quickSort.ts` is a good place to start reading.

## What is in it so far

| Area | Algorithm | Time (average) | Space |
| --- | --- | --- | --- |
| Sorting | Quick sort | O(n log n) | O(log n) |
| Graph search | Breadth first search | O(V + E) | O(V) |

More are on the way: bubble, insertion, merge and heap sort, binary search, depth first search, Dijkstra, and the classic structures (stack, queue, linked list, binary search tree, heap, hash table).

## Running it

You need Node 18 or newer.

```bash
npm install
```

```bash
npm run dev
```

```bash
npm test
```

## Adding an algorithm

Write a generator in `src/algorithms/sorting` or `src/algorithms/graphs` that takes the input and yields steps of the matching type from `src/algorithms/types.ts`. Then add one entry to the `index.ts` in that folder. It shows up in the dropdown, and the existing test suite runs against it automatically, because the tests loop over the whole registry.

## Layout

```
src/
  algorithms/    plain TypeScript, no React
    types.ts     step shapes shared by the UI and the tests
    sorting/     generators plus their tests
    graphs/      generators plus their tests
  visualizers/   React components that replay the steps
```
