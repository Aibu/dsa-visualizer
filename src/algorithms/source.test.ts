import { describe, expect, it } from 'vitest';
import { parseSource } from './source';

describe('parseSource', () => {
  it('strips markers and records every line that carries one', () => {
    const { lines, markers } = parseSource(
      ['let i = 0; // @step init', 'i++; // @step bump', 'i++; // @step bump', 'return i;', ''].join('\n'),
    );
    expect(lines).toEqual(['let i = 0;', 'i++;', 'i++;', 'return i;']);
    expect(markers.get('init')).toEqual([0]);
    expect(markers.get('bump')).toEqual([1, 2]);
  });

  it('leaves ordinary comments alone', () => {
    const { lines, markers } = parseSource('let head = 0; // front of the queue');
    expect(lines).toEqual(['let head = 0; // front of the queue']);
    expect(markers.size).toBe(0);
  });
});
