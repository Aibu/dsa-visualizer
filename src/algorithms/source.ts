const MARKER = /\s*\/\/ @step ([\w-]+)\s*$/;

export interface ParsedSource {
  /** The source with `// @step` markers removed. */
  lines: string[];
  /** Marker name to the 0 based line numbers that carry it. */
  markers: Map<string, number[]>;
}

/** Strip `// @step name` markers from an example file and remember where they were. */
export function parseSource(source: string): ParsedSource {
  const markers = new Map<string, number[]>();
  const lines = source.trimEnd().split('\n').map((line, i) => {
    const match = line.match(MARKER);
    if (!match) return line;
    markers.set(match[1], [...(markers.get(match[1]) ?? []), i]);
    return line.replace(MARKER, '');
  });
  return { lines, markers };
}
