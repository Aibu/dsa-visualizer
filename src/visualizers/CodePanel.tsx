import { useEffect, useMemo, useRef } from 'react';
import { parseSource } from '../algorithms/source';

const KEYWORDS = new Set([
  'const', 'let', 'function', 'return', 'if', 'else', 'for', 'while', 'of', 'continue',
  'break', 'new', 'export', 'import', 'from', 'type', 'null', 'void', 'number', 'true', 'false',
]);
const TOKEN = /(\/\/.*$)|('[^']*')|(\b\d+\b)|(\b[A-Za-z_]\w*\b)/g;

/** Just enough syntax colouring to make the code scannable. */
function highlight(line: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of line.matchAll(TOKEN)) {
    const [text, comment, string, num, word] = match;
    const start = match.index!;
    if (start > last) parts.push(line.slice(last, start));
    const cls = comment ? 'tok-comment' : string ? 'tok-string' : num ? 'tok-number'
      : word && KEYWORDS.has(word) ? 'tok-keyword' : null;
    parts.push(cls ? <span key={start} className={cls}>{text}</span> : text);
    last = start + text.length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

interface Props {
  source: string;
  /** The `// @step` marker of the current step. */
  line: string;
  message: string;
  title: string;
}

export function CodePanel({ source, line, message, title }: Props) {
  const { lines, markers } = useMemo(() => parseSource(source), [source]);
  const active = new Set(markers.get(line) ?? []);
  const first = markers.get(line)?.[0];
  const preRef = useRef<HTMLPreElement>(null);

  // Keep the running line in view when the example is taller than the panel.
  // Scrolls only the panel, never the page.
  useEffect(() => {
    const pre = preRef.current;
    const el = first === undefined ? null : pre?.children[first];
    if (!pre || !(el instanceof HTMLElement)) return;
    const top = el.offsetTop; // relative to the pre, which is positioned
    if (top < pre.scrollTop || top + el.offsetHeight > pre.scrollTop + pre.clientHeight) {
      pre.scrollTo({ top: top - pre.clientHeight / 3, behavior: 'smooth' });
    }
  }, [first]);

  return (
    <div className="code-panel">
      <p className="step-message" aria-live="polite">{message}</p>
      <div className="code">
        <div className="code-title">{title}</div>
        <pre ref={preRef}>
          {lines.map((text, i) => (
            <div key={i} className={active.has(i) ? 'code-line active' : 'code-line'}>
              <span className="line-number">{i + 1}</span>
              <code>{highlight(text)}</code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
