import { useMemo, useState } from 'react';
import { sortingAlgorithms } from '../algorithms/sorting';
import { ComplexityCard, PlaybackControls } from './Controls';
import { usePlayer } from './usePlayer';

const SIZE = 32;
const randomArray = () => Array.from({ length: SIZE }, () => 5 + Math.floor(Math.random() * 95));

export function SortVisualizer() {
  const [algorithmId, setAlgorithmId] = useState(sortingAlgorithms[0].id);
  const [input, setInput] = useState(randomArray);
  const [speed, setSpeed] = useState(60);

  const algorithm = sortingAlgorithms.find((a) => a.id === algorithmId)!;
  const steps = useMemo(() => [...algorithm.run(input)], [algorithm, input]);
  const player = usePlayer(steps, speed);
  const { array, compare, swap, pivot, sorted } = player.step;
  const sortedSet = new Set(sorted);

  const barClass = (i: number) => {
    if (swap?.includes(i)) return 'bar swap';
    if (i === pivot) return 'bar pivot';
    if (compare?.includes(i)) return 'bar compare';
    if (sortedSet.has(i)) return 'bar sorted';
    return 'bar';
  };

  return (
    <section>
      <div className="toolbar">
        <select value={algorithmId} onChange={(e) => setAlgorithmId(e.target.value)}>
          {sortingAlgorithms.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <button onClick={() => setInput(randomArray())}>New array</button>
      </div>

      <div className="bars" role="img" aria-label={`Array: ${array.join(', ')}`}>
        {array.map((value, i) => (
          <div key={i} className={barClass(i)} style={{ height: `${value}%` }} />
        ))}
      </div>

      <ul className="legend">
        <li><span className="swatch compare" />Comparing</li>
        <li><span className="swatch swap" />Swapped</li>
        <li><span className="swatch pivot" />Pivot</li>
        <li><span className="swatch sorted" />In final place</li>
      </ul>

      <PlaybackControls player={player} speed={speed} onSpeed={setSpeed} />
      <ComplexityCard algorithm={algorithm} />
    </section>
  );
}
