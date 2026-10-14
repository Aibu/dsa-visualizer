import { useState, type ComponentType } from 'react';
import { structures } from '../../structures';
import { apply, type StructureStep } from '../../structures/types';
import { CodePanel } from '../CodePanel';
import { PlaybackControls } from '../Controls';
import { usePlayer } from '../usePlayer';
import { ListView, QueueView, StackView, TreeView, type ViewProps } from './views';

// Each view is typed for its own state; the lookup by id cannot know which.
const views: Record<string, ComponentType<ViewProps<any>>> = {
  stack: StackView,
  queue: QueueView,
  'linked-list': ListView,
  bst: TreeView,
};

const randomValue = () => 1 + Math.floor(Math.random() * 99);

const idle = (state: unknown): StructureStep<unknown> => ({
  state,
  marks: [],
  line: '',
  message: 'Pick an operation above to watch it run, one line at a time.',
});

export function StructureVisualizer() {
  const [structureId, setStructureId] = useState(structures[0].id);
  // Each structure keeps its own state, so switching tabs does not lose your work.
  const [states, setStates] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(structures.map((s) => [s.id, s.initial])),
  );
  const [steps, setSteps] = useState(() => [idle(structures[0].initial)]);
  const [value, setValue] = useState(randomValue);
  const [speed, setSpeed] = useState(1500);
  const player = usePlayer(steps, speed, true);

  const structure = structures.find((s) => s.id === structureId)!;
  const state = states[structureId];
  const full = structure.size(state) >= structure.capacity;
  const View = views[structureId];

  const choose = (id: string) => {
    setStructureId(id);
    setSteps([idle(states[id])]);
  };

  const run = (opId: string) => {
    const op = structure.operations.find((o) => o.id === opId)!;
    const out = apply(op, state, value);
    setStates({ ...states, [structureId]: out.state });
    setSteps(out.steps);
    if (op.grows) setValue(randomValue());
  };

  const reset = () => {
    setStates({ ...states, [structureId]: structure.initial });
    setSteps([idle(structure.initial)]);
  };

  return (
    <section>
      <div className="workspace">
        <div className="visual">
          <div className="toolbar">
            <select value={structureId} onChange={(e) => choose(e.target.value)}>
              {structures.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <label className="value-input">
              Value
              <input
                type="number"
                min={0}
                max={99}
                value={value}
                onChange={(e) => setValue(Math.max(0, Math.min(99, Number(e.target.value))))}
              />
            </label>
            <button onClick={reset}>Reset</button>
          </div>

          <div className="toolbar">
            {structure.operations.map((op) => (
              <button
                key={op.id}
                className="op"
                onClick={() => run(op.id)}
                disabled={op.grows && full}
                title={op.grows && full ? 'Full for this demo, so the drawing stays readable' : undefined}
              >
                {op.label}
                {op.takesValue && <span className="op-arg">({value})</span>}
              </button>
            ))}
          </div>

          <div className="structure-stage">
            <View state={player.step.state} marks={player.step.marks} />
          </div>

          <ul className="legend">
            <li><span className="swatch compare" />Looking at</li>
            <li><span className="swatch sorted" />Added or found</li>
            <li><span className="swatch swap" />Removed</li>
            {structureId === 'bst' && <li><span className="swatch path" />Visited</li>}
          </ul>

          <PlaybackControls player={player} speed={speed} onSpeed={setSpeed} />
        </div>

        <CodePanel
          source={structure.source}
          line={player.step.line}
          message={player.step.message}
          title={`${structure.name} in TypeScript`}
        />
      </div>

      <aside className="card">
        <p>{structure.description}</p>
        <dl className="complexity">
          {structure.operations.map((op) => (
            <div key={op.id}>
              <dt>{op.label}</dt>
              <dd>{op.complexity}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </section>
  );
}
