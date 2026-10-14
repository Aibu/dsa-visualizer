import type { Grid } from '../types';

export function neighbours(grid: Grid, cell: number): number[] {
  const row = Math.floor(cell / grid.cols);
  const col = cell % grid.cols;
  const result: number[] = [];
  if (row > 0) result.push(cell - grid.cols);
  if (col < grid.cols - 1) result.push(cell + 1);
  if (row < grid.rows - 1) result.push(cell + grid.cols);
  if (col > 0) result.push(cell - 1);
  return result.filter((n) => !grid.walls.has(n));
}

/** Walk the `previous` links back from goal to start. */
export function rebuildPath(previous: Map<number, number>, start: number, goal: number): number[] {
  const path = [goal];
  let cell = goal;
  while (cell !== start) {
    cell = previous.get(cell)!;
    path.push(cell);
  }
  return path.reverse();
}
