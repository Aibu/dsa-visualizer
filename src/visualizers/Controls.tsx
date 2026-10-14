import type { AlgorithmInfo } from '../algorithms/types';
import type { usePlayer } from './usePlayer';

interface Props {
  player: ReturnType<typeof usePlayer<unknown>>;
  speed: number;
  onSpeed: (ms: number) => void;
}

// The slider is logarithmic: equal moves feel like equal changes in pace, and
// the slow end gets enough room to stop on "slow enough to read".
const SLOWEST_MS = 4000;
const FASTEST_MS = 10;
const RATIO = Math.log(FASTEST_MS / SLOWEST_MS);
const toSlider = (ms: number) => Math.round((100 * Math.log(ms / SLOWEST_MS)) / RATIO);
const toMs = (position: number) => Math.round(SLOWEST_MS * Math.exp((RATIO * position) / 100));
const describe = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`) + ' per step';

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
          min={0}
          max={100}
          value={toSlider(speed)}
          onChange={(e) => onSpeed(toMs(Number(e.target.value)))}
          aria-valuetext={describe(speed)}
        />
        <span className="speed-value">{describe(speed)}</span>
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
