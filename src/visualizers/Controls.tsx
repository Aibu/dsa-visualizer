import type { AlgorithmInfo } from '../algorithms/types';
import type { usePlayer } from './usePlayer';

interface Props {
  player: ReturnType<typeof usePlayer<unknown>>;
  speed: number;
  onSpeed: (ms: number) => void;
}

export function PlaybackControls({ player, speed, onSpeed }: Props) {
  return (
    <div className="controls">
      <button onClick={player.back} disabled={player.index === 0} aria-label="Step back">
        ◀
      </button>
      <button className="primary" onClick={player.toggle}>
        {player.playing ? 'Pause' : player.atEnd ? 'Replay' : 'Play'}
      </button>
      <button onClick={player.forward} disabled={player.atEnd} aria-label="Step forward">
        ▶
      </button>
      <label className="speed">
        Speed
        <input
          type="range"
          min={5}
          max={400}
          value={405 - speed}
          onChange={(e) => onSpeed(405 - Number(e.target.value))}
        />
      </label>
      <span className="counter">
        Step {player.index + 1} / {player.total}
      </span>
    </div>
  );
}

export function ComplexityCard({ algorithm }: { algorithm: AlgorithmInfo<unknown> }) {
  const { best, average, worst, space } = algorithm.complexity;
  return (
    <aside className="card">
      <p>{algorithm.description}</p>
      <dl className="complexity">
        <div><dt>Best</dt><dd>{best}</dd></div>
        <div><dt>Average</dt><dd>{average}</dd></div>
        <div><dt>Worst</dt><dd>{worst}</dd></div>
        <div><dt>Space</dt><dd>{space}</dd></div>
      </dl>
    </aside>
  );
}
