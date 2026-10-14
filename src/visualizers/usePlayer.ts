import { useEffect, useState } from 'react';

/**
 * Playback controls over a precomputed list of steps. With `autoPlay`, new
 * steps start playing straight away instead of waiting on the Play button.
 */
export function usePlayer<T>(steps: T[], speedMs: number, autoPlay = false) {
  const [index, setIndex] = useState(0);
  const [wantsToPlay, setWantsToPlay] = useState(autoPlay);
  const [seen, setSeen] = useState(steps);

  // New steps (new input or new algorithm) means start over. This happens
  // during render rather than in an effect, so there is never a frame where
  // the old index points past the end of a shorter list.
  if (steps !== seen) {
    setSeen(steps);
    setIndex(0);
    setWantsToPlay(autoPlay);
  }

  const current = Math.min(index, steps.length - 1);
  const atEnd = current >= steps.length - 1;
  // Derived, not stored: the moment the last frame shows, playback is over.
  // Storing it let the button say Pause for a whole extra tick at the end.
  const playing = wantsToPlay && !atEnd;

  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => setIndex((i) => i + 1), speedMs);
    return () => clearTimeout(id);
  }, [playing, current, speedMs]);

  return {
    step: steps[current],
    index: current,
    total: steps.length,
    playing,
    atEnd,
    toggle: () => {
      if (atEnd) {
        setIndex(0);
        setWantsToPlay(true);
      } else {
        setWantsToPlay(!playing);
      }
    },
    // Stepping by hand pauses, otherwise stepping back from the end would
    // quietly start playing again.
    forward: () => {
      setWantsToPlay(false);
      setIndex(Math.min(current + 1, steps.length - 1));
    },
    back: () => {
      setWantsToPlay(false);
      setIndex(Math.max(current - 1, 0));
    },
    reset: () => {
      setWantsToPlay(false);
      setIndex(0);
    },
  };
}
