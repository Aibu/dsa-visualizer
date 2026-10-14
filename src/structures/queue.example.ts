// First in, first out. Removing from the front of an array would shift every
// other value down, so instead a head index marks where the queue starts.
export class Queue<T> {
  private items: T[] = [];
  private head = 0;

  enqueue(value: T): void {
    this.items.push(value); // @step enqueue
  }

  dequeue(): T | undefined {
    if (this.head === this.items.length) return undefined; // @step dequeue-empty
    const value = this.items[this.head]; // @step dequeue
    this.head++; // @step dequeue

    // Once dead slots fill half the array, copy the live values down.
    if (this.head * 2 >= this.items.length) {
      this.items = this.items.slice(this.head); // @step compact
      this.head = 0; // @step compact
    }
    return value;
  }

  toArray(): T[] {
    return this.items.slice(this.head);
  }
}
