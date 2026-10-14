export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

// Smaller values live to the left of a node and larger ones to the right,
// so every comparison rules out a whole subtree.
export class BinarySearchTree {
  root: TreeNode | null = null;

  insert(value: number): void {
    const node: TreeNode = { value, left: null, right: null };
    if (this.root === null) {
      this.root = node; // @step insert-root
      return;
    }
    let current = this.root;
    while (true) {
      if (value === current.value) return; // @step insert-duplicate
      if (value < current.value) {
        if (current.left === null) {
          current.left = node; // @step insert-left
          return;
        }
        current = current.left; // @step insert-go-left
      } else {
        if (current.right === null) {
          current.right = node; // @step insert-right
          return;
        }
        current = current.right; // @step insert-go-right
      }
    }
  }

  contains(value: number): boolean {
    let current = this.root;
    while (current !== null) {
      if (value === current.value) return true; // @step search-found
      current = value < current.value ? current.left : current.right; // @step search-go
    }
    return false; // @step search-missing
  }

  inOrder(): number[] {
    const values: number[] = [];
    const visit = (node: TreeNode | null): void => {
      if (node === null) return;
      visit(node.left);
      values.push(node.value); // @step inorder-visit
      visit(node.right);
    };
    visit(this.root);
    return values; // @step inorder-done
  }
}
