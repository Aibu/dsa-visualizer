import type { GraphStep, Grid } from '../types';
import { neighbours, rebuildPath } from './grid';

/**
 * Breadth-first search explores the graph in rings: every cell at distance 1,
 * then every cell at distance 2, and so on. On an unweighted graph the first
 * time it reaches the goal is therefore along a shortest path.
 */
export function* bfs(grid: Grid): Generator<GraphStep, number[] | null> {
  const visited = new Set<number>([grid.start]);
  const previous = new Map<number, number>();
  // An array plus a head index is an O(1) queue; Array.shift() would be O(n).
  const queue: number[] = [grid.start];
  let head = 0;

  while (head < queue.length) {
    const current = queue[head++];
    yield { current, visited: [...visited], frontier: queue.slice(head), path: [] };

    if (current === grid.goal) {
      const path = rebuildPath(previous, grid.start, grid.goal);
      yield { current, visited: [...visited], frontier: queue.slice(head), path };
      return path;
    }

    for (const next of neighbours(grid, current)) {
      if (visited.has(next)) continue;
      visited.add(next);
      previous.set(next, current);
      queue.push(next);
    }
  }

  yield { current: null, visited: [...visited], frontier: [], path: [] };
  return null;
}
