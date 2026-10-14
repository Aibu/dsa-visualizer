// Each value lives in the bucket its hash picks, so checking for a value
// means looking in one short bucket instead of the whole collection.
export class HashSet {
  private buckets: number[][] = [[], [], [], []];
  private size = 0;

  private bucketFor(value: number): number[] {
    return this.buckets[value % this.buckets.length]; // @step hash
  }

  add(value: number): void {
    const bucket = this.bucketFor(value);
    if (bucket.includes(value)) return; // @step add-duplicate
    bucket.push(value); // @step add
    this.size++;
    if (this.size > this.buckets.length * 0.75) this.resize(); // @step resize
  }

  has(value: number): boolean {
    return this.bucketFor(value).includes(value); // @step has
  }

  delete(value: number): boolean {
    const bucket = this.bucketFor(value);
    const i = bucket.indexOf(value);
    if (i === -1) return false; // @step delete-missing
    bucket.splice(i, 1); // @step delete
    this.size--;
    return true;
  }

  // Crowded buckets make lookups slow again, so double the number of
  // buckets and put every value back where its hash now points.
  private resize(): void {
    const old = this.buckets;
    this.buckets = Array.from({ length: old.length * 2 }, () => []); // @step resize
    for (const bucket of old) {
      for (const value of bucket) this.bucketFor(value).push(value); // @step rehash
    }
  }

  toArray(): number[][] {
    return this.buckets.map((bucket) => [...bucket]);
  }
}
