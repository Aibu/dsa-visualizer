import { useMemo, useState } from 'react';
import { graphAlgorithms } from '../algorithms/graphs';
import type { Grid } from '../algorithms/types';
import { CodePanel } from './CodePanel';
import { ComplexityCard, PlaybackControls } from './Controls';
import { usePlayer } from './usePlayer';

const ROWS = 15;
const COLS = 25;
const START = 7 * COLS + 3;
const GOAL = 7 * COLS + 21;

function randomWalls(): Set<number> {
  const walls = new Set<number>();
  for (let cell = 0; cell < ROWS * COLS; cell++) {
    if (cell !== START && cell !== GOAL && Math.random() < 0.25) walls.add(cell);
  }
  return walls;
}

export function GridVisualizer() {
  const [algorithmId, setAlgorithmId] = useState(graphAlgorithms[0].id);
  const [walls, setWalls] = useState(randomWalls);
  const [speed, setSpeed] = useState(30);

  const algorithm = graphAlgorithms.find((a) => a.id === algorithmId)!;
  const steps = useMemo(() => {
    const grid: Grid = { rows: ROWS, cols: COLS, walls, start: START, goal: GOAL };
    return [...algorithm.run(grid)];
  }, [algorithm, walls]);
  const player = usePlayer(steps, speed);
  const { current, visited, frontier, path } = player.step;

  const visitedSet = new Set(visited);
  const frontierSet = new Set(frontier);
  const pathSet = new Set(path);
  const noPath = player.atEnd && current === null;

  const toggleWall = (cell: number) => {
    if (cell === START || cell === GOAL) return;
    setWalls((prev) => {
      const next = new Set(prev);
      if (next.has(cell)) next.delete(cell);
      else next.add(cell);
      return next;
    });
  };

  const cellClass = (cell: number) => {
    if (cell === START) return 'cell start';
    if (cell === GOAL) return 'cell goal';
    if (walls.has(cell)) return 'cell wall';
    if (pathSet.has(cell)) return 'cell path';
    if (cell === current) return 'cell current';
    if (frontierSet.has(cell)) return 'cell frontier';
    if (visitedSet.has(cell)) return 'cell visited';
    return 'cell';
  };

  return (
    <section>
      <div className="workspace">
        <div className="visual">
          <div className="toolbar">
            <select value={algorithmId} onChange={(e) => setAlgorithmId(e.target.value)}>
              {graphAlgorithms.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <button onClick={() => setWalls(randomWalls())}>New maze</button>
            <button onClick={() => setWalls(new Set())}>Clear walls</button>
          </div>

          <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {Array.from({ length: ROWS * COLS }, (_, cell) => (
              <button
                key={cell}
                className={cellClass(cell)}
                onClick={() => toggleWall(cell)}
                aria-label={`Cell (${Math.floor(cell / COLS)}, ${cell % COLS})`}
              />
            ))}
          </div>
          <p className="hint">
            {noPath ? 'No path: the goal is walled off.' : 'Click a cell to add or remove a wall.'}
          </p>

          <ul className="legend">
            <li><span className="swatch start" />Start</li>
            <li><span className="swatch goal" />Goal</li>
            <li><span className="swatch frontier" />In queue</li>
            <li><span className="swatch visited" />Visited</li>
            <li><span className="swatch path" />Shortest path</li>
          </ul>

          <PlaybackControls player={player} speed={speed} onSpeed={setSpeed} />
        </div>

        <CodePanel
          source={algorithm.source}
          line={player.step.line}
          message={player.step.message}
          title={`${algorithm.name} in TypeScript`}
        />
      </div>
      <ComplexityCard algorithm={algorithm} />
    </section>
  );
}
