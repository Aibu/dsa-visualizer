import type { GraphStep, Grid } from '../types';
import { neighbours, rebuildPath } from './grid';

/**
 * Animated version of bfs.example.ts. Breadth first search explores the graph
 * in rings: every cell at distance 1, then every cell at distance 2, and so on.
 * On an unweighted graph the first time it reaches the goal is therefore along
 * a shortest path.
 */
export function* bfs(grid: Grid): Generator<GraphStep, number[] | null> {
  const visited = new Set<number>([grid.start]);
  const previous = new Map<number, number>();
  const distance = new Map<number, number>([[grid.start, 0]]);
  const queue: number[] = [grid.start];
  let head = 0;

  const at = (cell: number) => `(${Math.floor(cell / grid.cols)}, ${cell % grid.cols})`;
  const snap = (line: string, message: string, current: number | null, path: number[] = []): GraphStep => ({
    current,
    visited: [...visited],
    frontier: queue.slice(head),
    path,
    line,
    message,
  });

  while (head < queue.length) {
    const current = queue[head++];
    const d = distance.get(current)!;
    yield snap(
      'dequeue',
      `Take ${at(current)} from the front of the queue. It is ${d} ${d === 1 ? 'step' : 'steps'} from the start.`,
      current,
    );

    if (current === grid.goal) {
      const path = rebuildPath(previous, grid.start, grid.goal);
      yield snap(
        'found',
        `This is the goal. Following the previous links back gives a shortest path of ${path.length - 1} steps.`,
        current,
        path,
      );
      return path;
    }

    let added = 0;
    for (const next of neighbours(grid, current)) {
      if (visited.has(next)) continue;
      visited.add(next);
      previous.set(next, current);
      distance.set(next, d + 1);
      queue.push(next);
      added++;
    }
    yield snap(
      'enqueue',
      added === 0
        ? 'Every neighbour is a wall or already visited, so nothing joins the queue.'
        : `Add ${added} unvisited ${added === 1 ? 'neighbour' : 'neighbours'} to the back of the queue, ${d + 1} steps from the start.`,
      current,
    );
  }

  yield snap('no-path', 'The queue is empty and the goal was never reached, so there is no path.', null);
  return null;
}
