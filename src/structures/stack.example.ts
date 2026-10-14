// Last in, first out. An array does all the work, because pushing and
// popping at the end of an array never moves anything else.
export class Stack<T> {
  private items: T[] = [];

  push(value: T): void {
    this.items.push(value); // @step push
  }

  pop(): T | undefined {
    if (this.items.length === 0) return undefined; // @step pop-empty
    return this.items.pop(); // @step pop
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1]; // @step peek
  }

  toArray(): T[] {
    return [...this.items];
  }
}
