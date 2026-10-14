import type { Grid } from '../types';
import { neighbours, rebuildPath } from './grid';

export function bfs(grid: Grid): number[] | null {
  const visited = new Set([grid.start]);
  const previous = new Map<number, number>();
  const queue = [grid.start];
  let head = 0; // front of the queue, so dequeuing is O(1)

  while (head < queue.length) {
    const current = queue[head++]; // @step dequeue
    if (current === grid.goal) {
      return rebuildPath(previous, grid.start, grid.goal); // @step found
    }
    for (const next of neighbours(grid, current)) { // @step enqueue
      if (visited.has(next)) continue;
      visited.add(next); // @step enqueue
      previous.set(next, current); // @step enqueue
      queue.push(next); // @step enqueue
    }
  }
  return null; // @step no-path
}
