import { describe, expect, it } from 'vitest';
import { runToEnd, type Grid } from '../types';
import { graphAlgorithms } from '.';

const at = (cols: number, row: number, col: number) => row * cols + col;

function openGrid(rows: number, cols: number): Grid {
  return { rows, cols, walls: new Set(), start: at(cols, 0, 0), goal: at(cols, rows - 1, cols - 1) };
}

describe.each(graphAlgorithms)('$name', ({ run }) => {
  it('finds a shortest path on an open grid', () => {
    const grid = openGrid(5, 7);
    const path = runToEnd(run(grid))!;
    // Manhattan distance (4 + 6) plus the start cell.
    expect(path).toHaveLength(11);
    expect(path[0]).toBe(grid.start);
    expect(path.at(-1)).toBe(grid.goal);
  });

  it('routes around walls', () => {
    // A wall down column 2 with a single gap at the bottom row.
    const grid = openGrid(4, 5);
    for (let row = 0; row < 3; row++) grid.walls.add(at(5, row, 2));
    const path = runToEnd(run(grid))!;
    expect(path.some((cell) => grid.walls.has(cell))).toBe(false);
    expect(path).toContain(at(5, 3, 2));
  });

  it('only steps between adjacent cells', () => {
    const grid = openGrid(6, 6);
    const path = runToEnd(run(grid))!;
    for (let i = 1; i < path.length; i++) {
      const diff = Math.abs(path[i] - path[i - 1]);
      expect(diff === 1 || diff === grid.cols).toBe(true);
    }
  });

  it('returns null when the goal is walled off', () => {
    const grid = openGrid(3, 3);
    grid.walls.add(at(3, 1, 2));
    grid.walls.add(at(3, 2, 1));
    expect(runToEnd(run(grid))).toBeNull();
  });

  it('handles start === goal', () => {
    const grid = { ...openGrid(3, 3), goal: 0 };
    expect(runToEnd(run(grid))).toEqual([0]);
  });
});
