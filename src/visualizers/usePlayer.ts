import { useEffect, useState } from 'react';

/**
 * Playback controls over a precomputed list of steps. With `autoPlay`, new
 * steps start playing straight away instead of waiting on the Play button.
 */
export function usePlayer<T>(steps: T[], speedMs: number, autoPlay = false) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(autoPlay && steps.length > 1);
  const [seen, setSeen] = useState(steps);

  // New steps (new input or new algorithm) means start over. This happens
  // during render rather than in an effect, so there is never a frame where
  // the old index points past the end of a shorter list.
  if (steps !== seen) {
    setSeen(steps);
    setIndex(0);
    setPlaying(autoPlay && steps.length > 1);
  }
  const current = Math.min(index, steps.length - 1);

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

  const atEnd = current >= steps.length - 1;

  return {
    step: steps[current],
    index: current,
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
