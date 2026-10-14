interface ListNode<T> {
  value: T;
  next: ListNode<T> | null;
}

// Each node knows only the node after it. Adding at the front is instant;
// reaching anything else means walking there one node at a time.
export class LinkedList<T> {
  head: ListNode<T> | null = null;

  prepend(value: T): void {
    this.head = { value, next: this.head }; // @step prepend
  }

  append(value: T): void {
    const node: ListNode<T> = { value, next: null };
    if (this.head === null) {
      this.head = node; // @step append-empty
      return;
    }
    let current = this.head; // @step append-start
    while (current.next !== null) {
      current = current.next; // @step append-walk
    }
    current.next = node; // @step append
  }

  find(value: T): ListNode<T> | null {
    let current = this.head;
    while (current !== null) {
      if (current.value === value) return current; // @step find-check
      current = current.next; // @step find-walk
    }
    return null; // @step find-missing
  }

  remove(value: T): boolean {
    if (this.head === null) return false; // @step remove-empty
    if (this.head.value === value) {
      this.head = this.head.next; // @step remove-head
      return true;
    }
    let current = this.head;
    while (current.next !== null) {
      if (current.next.value === value) {
        current.next = current.next.next; // @step remove-unlink
        return true;
      }
      current = current.next; // @step remove-walk
    }
    return false; // @step remove-missing
  }

  toArray(): T[] {
    const values: T[] = [];
    for (let node = this.head; node !== null; node = node.next) values.push(node.value);
    return values;
  }
}
