import { describe, expect, it } from 'vitest';
import { parseSource } from '../source';
import { runToEnd, type Grid } from '../types';
import { graphAlgorithms } from '.';

const at = (cols: number, row: number, col: number) => row * cols + col;

function openGrid(rows: number, cols: number): Grid {
  return { rows, cols, walls: new Set(), start: at(cols, 0, 0), goal: at(cols, rows - 1, cols - 1) };
}

function blockedGrid(): Grid {
  const grid = openGrid(3, 3);
  grid.walls.add(at(3, 1, 2));
  grid.walls.add(at(3, 2, 1));
  return grid;
}

describe.each(graphAlgorithms)('$name', ({ run, reference, source }) => {
  // Runs both the animated and the plain version, and insists they agree.
  const search = (grid: Grid) => {
    const animated = runToEnd(run(grid));
    expect(reference(grid)).toEqual(animated);
    return animated;
  };

  it('finds a shortest path on an open grid', () => {
    const grid = openGrid(5, 7);
    const path = search(grid)!;
    // Manhattan distance (4 + 6) plus the start cell.
    expect(path).toHaveLength(11);
    expect(path[0]).toBe(grid.start);
    expect(path.at(-1)).toBe(grid.goal);
  });

  it('routes around walls', () => {
    // A wall down column 2 with a single gap at the bottom row.
    const grid = openGrid(4, 5);
    for (let row = 0; row < 3; row++) grid.walls.add(at(5, row, 2));
    const path = search(grid)!;
    expect(path.some((cell) => grid.walls.has(cell))).toBe(false);
    expect(path).toContain(at(5, 3, 2));
  });

  it('only steps between adjacent cells', () => {
    const grid = openGrid(6, 6);
    const path = search(grid)!;
    for (let i = 1; i < path.length; i++) {
      const diff = Math.abs(path[i] - path[i - 1]);
      expect(diff === 1 || diff === grid.cols).toBe(true);
    }
  });

  it('returns null when the goal is walled off', () => {
    expect(search(blockedGrid())).toBeNull();
  });

  it('handles start === goal', () => {
    expect(search({ ...openGrid(3, 3), goal: 0 })).toEqual([0]);
  });

  it('only highlights lines that exist in the example, and uses all of them', () => {
    const { markers } = parseSource(source);
    const used = new Set<string>();
    for (const grid of [openGrid(5, 7), blockedGrid()]) {
      for (const step of run(grid)) {
        expect(markers.has(step.line), `missing // @step ${step.line}`).toBe(true);
        used.add(step.line);
      }
    }
    expect([...used].sort()).toEqual([...markers.keys()].sort());
  });
});
