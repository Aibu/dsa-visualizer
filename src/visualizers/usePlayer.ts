import { useEffect, useState } from 'react';

/** Playback controls over a precomputed list of steps. */
export function usePlayer<T>(steps: T[], speedMs: number) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  // New steps (new input or new algorithm) means start over.
  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [steps]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setIndex((i) => {
        if (i >= steps.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, speedMs);
    return () => clearInterval(id);
  }, [playing, speedMs, steps.length]);

  const atEnd = index >= steps.length - 1;

  return {
    step: steps[index],
    index,
    total: steps.length,
    playing,
    atEnd,
    toggle: () => {
      if (atEnd) setIndex(0);
      setPlaying((p) => !p);
    },
    forward: () => setIndex((i) => Math.min(i + 1, steps.length - 1)),
    back: () => setIndex((i) => Math.max(i - 1, 0)),
    reset: () => {
      setPlaying(false);
      setIndex(0);
    },
  };
}
