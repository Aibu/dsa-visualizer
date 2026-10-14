export function quickSort(input: number[]): number[] {
  const a = [...input];
  sort(a, 0, a.length - 1);
  return a; // @step done
}

function sort(a: number[], lo: number, hi: number): void {
  if (lo >= hi) return; // @step base-case
  const p = partition(a, lo, hi);
  sort(a, lo, p - 1);
  sort(a, p + 1, hi);
}

// Lomuto partition: a[lo..i) holds values below the pivot.
function partition(a: number[], lo: number, hi: number): number {
  const pivot = a[hi]; // @step pick-pivot
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (a[j] < pivot) { // @step compare
      [a[i], a[j]] = [a[j], a[i]]; // @step swap
      i++; // @step swap
    }
  }
  [a[i], a[hi]] = [a[hi], a[i]]; // @step place-pivot
  return i; // @step place-pivot
}
