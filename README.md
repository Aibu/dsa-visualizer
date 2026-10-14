# DSA Visualizer

The common data structures and algorithms, written as plain TypeScript and animated one step at a time in React.

## Why it is built this way

Every algorithm is a generator. Each time it compares, swaps or visits something, it yields a snapshot of its state. The React side replays those snapshots, and the tests read the value the generator returns at the end. The algorithm files have no React in them at all, so they read like what you would write in an interview or a textbook.

Next to the animation sits the same algorithm written plainly, the way you would write it without any animation in mind. The line that matches the current step is highlighted, and a sentence above it says what just happened and why.

Each algorithm therefore lives in two files. `quickSort.example.ts` is the plain version you read. `quickSort.ts` is the generator that drives the animation. Lines in the plain version carry a `// @step name` comment, and every step the generator yields names one of them. The comments are stripped before the code is shown.

The two versions cannot quietly drift apart. The tests run both against the same inputs and require the same answers, and they fail if a step points at a line that does not exist, or if a marked line is never reached.

`src/algorithms/sorting/quickSort.example.ts` is a good place to start reading.

## What is in it so far

| Area | Algorithm | Time (average) | Space |
| --- | --- | --- | --- |
| Sorting | Quick sort | O(n log n) | O(log n) |
| Graph search | Breadth first search | O(V + E) | O(V) |

| Structure | Operations you can run |
| --- | --- |
| Stack | push, pop, peek |
| Queue | enqueue, dequeue, including the compaction that keeps dequeue O(1) on average |
| Linked list | prepend, append, find, remove |
| Binary search tree | insert, search, walk in order |
| Min heap | push, pop smallest, peek, drawn both as a tree and as the array it really is |
| Hash set | add, has, delete, including the resize that rehashes everything |

On the structures tab you pick an operation and a value, and watch it run against whatever is already there, so you can build up a tree yourself and see why sorted input turns it into a list.

More algorithms are on the way: bubble, insertion, merge and heap sort, binary search, depth first search and Dijkstra.

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

Write the plain version first, as `name.example.ts`, and mark the interesting lines with `// @step name`. Then write the generator in `name.ts` that yields a step for each marked line, with a short message. Both go in `src/algorithms/sorting` or `src/algorithms/graphs`. Finally add one entry to the `index.ts` in that folder. A structure works the same way, in `src/structures`, with one generator per operation. It shows up in the dropdown, and the existing test suite runs against it automatically, because the tests loop over the whole registry.

## Layout

```
src/
  algorithms/    plain TypeScript, no React
    types.ts     step shapes shared by the UI and the tests
    source.ts    reads the // @step markers out of an example file
    sorting/     plain examples, generators and tests
    graphs/      plain examples, generators and tests
  structures/    plain classes, animated operations and tests
  visualizers/   React components that replay the steps
```
