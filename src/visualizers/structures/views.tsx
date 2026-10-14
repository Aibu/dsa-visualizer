import type { TreeNode, TreeState } from '../../structures/bst';
import type { HashSetState } from '../../structures/hashSet';
import type { HeapState } from '../../structures/heap';
import type { ListState } from '../../structures/linkedList';
import type { QueueState } from '../../structures/queue';
import type { StackState } from '../../structures/stack';
import type { Mark, Tone } from '../../structures/types';

export interface ViewProps<S> {
  state: S;
  marks: Mark[];
}

const toneOf = (marks: Mark[]) => {
  const map = new Map<number, Tone>();
  for (const mark of marks) map.set(mark.at, mark.tone);
  return (at: number) => map.get(at) ?? '';
};

const Empty = ({ label }: { label: string }) => <div className="empty-structure">{label}</div>;

export function StackView({ state, marks }: ViewProps<StackState>) {
  const tone = toneOf(marks);
  const { items } = state;
  if (items.length === 0) return <Empty label="Empty stack" />;
  return (
    <div className="stack-view">
      {items.map((value, i) => (
        <div key={i} className={`box ${tone(i)}`}>
          {value}
          {i === items.length - 1 && <span className="tag side">top</span>}
        </div>
      ))}
    </div>
  );
}

export function QueueView({ state, marks }: ViewProps<QueueState>) {
  const tone = toneOf(marks);
  const { items, head } = state;
  if (items.length === 0) return <Empty label="Empty queue" />;
  return (
    <div className="queue-view">
      {items.map((value, i) => (
        <div key={i} className="slot">
          <span className="tag">
            {[i === head && 'front', i === items.length - 1 && i >= head && 'back'].filter(Boolean).join(' / ')}
          </span>
          <div className={`box ${i < head ? 'dead' : ''} ${tone(i)}`}>{value}</div>
          <span className="index">{i}</span>
        </div>
      ))}
    </div>
  );
}

export function ListView({ state, marks }: ViewProps<ListState>) {
  const tone = toneOf(marks);
  const { values } = state;
  return (
    <div className="list-view">
      <span className="tag">head</span>
      <span className="arrow">→</span>
      {values.map((value, i) => (
        <div key={i} className="list-link">
          <div className={`node ${tone(i)}`}>
            <span className="node-value">{value}</span>
            <span className="node-next" aria-hidden>•</span>
          </div>
          <span className="arrow">→</span>
        </div>
      ))}
      <span className="null">null</span>
    </div>
  );
}

const SPACING_X = 48;
const SPACING_Y = 64;
const RADIUS = 18;

/** x comes from in order position, y from depth, so the drawing never overlaps. */
function layoutTree(root: TreeNode | null) {
  const nodes: { value: number; x: number; y: number }[] = [];
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  let column = 0;
  const place = (node: TreeNode | null, depth: number): { x: number; y: number } | null => {
    if (!node) return null;
    const left = place(node.left, depth + 1);
    const here = { x: column++ * SPACING_X + SPACING_X / 2, y: depth * SPACING_Y + RADIUS + 6 };
    const right = place(node.right, depth + 1);
    for (const child of [left, right]) if (child) edges.push({ x1: here.x, y1: here.y, x2: child.x, y2: child.y });
    nodes.push({ value: node.value, ...here });
    return here;
  };
  place(root, 0);
  const width = Math.max(column, 1) * SPACING_X;
  const height = Math.max(...nodes.map((n) => n.y), 0) + RADIUS + 6;
  return { nodes, edges, width, height };
}

export function TreeView({ state, marks }: ViewProps<TreeState>) {
  const tone = toneOf(marks);
  if (!state.root) return <Empty label="Empty tree" />;
  const { nodes, edges, width, height } = layoutTree(state.root);
  return (
    <svg className="tree-view" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: width * 1.4 }}>
      {edges.map((e, i) => (
        <line key={i} {...e} className="tree-edge" />
      ))}
      {nodes.map((n) => (
        <g key={n.value} className={`tree-node ${tone(n.value)}`}>
          <circle cx={n.x} cy={n.y} r={RADIUS} />
          <text x={n.x} y={n.y} dy="0.35em" textAnchor="middle">{n.value}</text>
        </g>
      ))}
    </svg>
  );
}

/** The heap is one array, so draw it twice: as the tree it encodes and as the array itself. */
export function HeapView({ state, marks }: ViewProps<HeapState>) {
  const tone = toneOf(marks);
  const { items } = state;
  if (items.length === 0) return <Empty label="Empty heap" />;

  const levels = Math.floor(Math.log2(items.length)) + 1;
  const width = 2 ** (levels - 1) * SPACING_X;
  const pos = (i: number) => {
    const level = Math.floor(Math.log2(i + 1));
    const slot = i + 1 - 2 ** level;
    return { x: ((slot + 0.5) * width) / 2 ** level, y: level * SPACING_Y + RADIUS + 6 };
  };
  const height = (levels - 1) * SPACING_Y + 2 * RADIUS + 12;

  return (
    <div className="heap-view">
      <svg className="tree-view" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: width * 1.4 }}>
        {items.map((_, i) => {
          if (i === 0) return null;
          const a = pos(Math.floor((i - 1) / 2));
          const b = pos(i);
          return <line key={`e${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="tree-edge" />;
        })}
        {items.map((value, i) => {
          const p = pos(i);
          return (
            <g key={i} className={`tree-node ${tone(i)}`}>
              <circle cx={p.x} cy={p.y} r={RADIUS} />
              <text x={p.x} y={p.y} dy="0.35em" textAnchor="middle">{value}</text>
            </g>
          );
        })}
      </svg>
      <div className="queue-view heap-array" aria-label="The same heap as an array">
        {items.map((value, i) => (
          <div key={i} className="slot">
            <div className={`box ${tone(i)}`}>{value}</div>
            <span className="index">{i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HashSetView({ state, marks }: ViewProps<HashSetState>) {
  const bucketTone = new Map<number, Tone>();
  const entryTone = new Map<string, Tone>();
  for (const m of marks) {
    if (m.entry === undefined) bucketTone.set(m.at, m.tone);
    else entryTone.set(`${m.at}:${m.entry}`, m.tone);
  }
  return (
    <div className="hash-view">
      {state.buckets.map((bucket, b) => (
        <div key={b} className={`bucket ${bucketTone.get(b) ?? ''}`}>
          <span className="bucket-index">{b}</span>
          {bucket.length === 0 ? (
            <span className="null">empty</span>
          ) : (
            bucket.map((value, i) => (
              <div key={i} className="list-link">
                {i > 0 && <span className="arrow">→</span>}
                <div className={`box ${entryTone.get(`${b}:${i}`) ?? ''}`}>{value}</div>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}
