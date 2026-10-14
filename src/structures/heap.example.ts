// A complete binary tree stored in a plain array. The children of index i
// live at 2i + 1 and 2i + 2, and no parent is larger than its children, so
// the smallest value is always at index 0.
export class MinHeap {
  private items: number[] = [];

  push(value: number): void {
    this.items.push(value); // @step push
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.items[parent] <= this.items[i]) break; // @step up-check
      [this.items[parent], this.items[i]] = [this.items[i], this.items[parent]]; // @step up-swap
      i = parent; // @step up-swap
    }
  }

  pop(): number | undefined {
    if (this.items.length === 0) return undefined; // @step pop-empty
    const top = this.items[0]; // @step pop
    const last = this.items.pop()!; // @step pop-last
    if (this.items.length > 0) {
      this.items[0] = last; // @step pop-last
      let i = 0;
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;
        if (left < this.items.length && this.items[left] < this.items[smallest]) smallest = left; // @step down-check
        if (right < this.items.length && this.items[right] < this.items[smallest]) smallest = right; // @step down-check
        if (smallest === i) break; // @step down-done
        [this.items[i], this.items[smallest]] = [this.items[smallest], this.items[i]]; // @step down-swap
        i = smallest; // @step down-swap
      }
    }
    return top; // @step pop-return
  }

  peek(): number | undefined {
    return this.items[0]; // @step peek
  }

  toArray(): number[] {
    return [...this.items];
  }
}
