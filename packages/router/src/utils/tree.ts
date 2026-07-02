/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export class Tree<T> {
  /** @internal */
  _root: TreeNode<T>;

  constructor(root: TreeNode<T>) {
    this._root = root;
  }

  get root(): T {
    return this._root.value;
  }

  /**
   * @internal
   */
  parent(t: T): T | null {
    const p = this.pathFromRoot(t);
    return p.length > 1 ? p[p.length - 2] : null;
  }

  /**
   * @internal
   */
  children(t: T): T[] {
    const n = findNode(t, this._root);
    return n ? n.children.map((t) => t.value) : [];
  }

  /**
   * @internal
   */
  firstChild(t: T): T | null {
    const n = findNode(t, this._root);
    return n && n.children.length > 0 ? n.children[0].value : null;
  }

  /**
   * @internal
   */
  siblings(t: T): T[] {
    const p = findPath(t, this._root);
    if (p.length < 2) return [];

    const c = p[p.length - 2].children.map((c) => c.value);
    return c.filter((cc) => cc !== t);
  }

  /**
   * @internal
   */
  pathFromRoot(t: T): T[] {
    return findPath(t, this._root).map((s) => s.value);
  }
}

// DFS for the node matching the value
function findNode<T>(value: T, node: TreeNode<T>): TreeNode<T> | null {
  if (value === node.value) return node;

  for (const child of node.children) {
    const node = findNode(value, child);
    if (node) return node;
  }

  return null;
}

// Return the path to the node with the given value using DFS
function findPath<T>(value: T, node: TreeNode<T>): TreeNode<T>[] {
  if (value === node.value) return [node];

  for (const child of node.children) {
    const path = findPath(value, child);
    if (path.length) {
      path.unshift(node);
      return path;
    }
  }

  return [];
}

export class TreeNode<T> {
  constructor(
    public value: T,
    public children: TreeNode<T>[],
  ) {}

  toString(): string {
    return `TreeNode(${this.value})`;
  }
}

// Return the list of T indexed by outlet name
export function nodeChildrenAsMap<T extends {outlet: string}>(
  node: TreeNode<T> | null,
): {
  [outlet: string]: TreeNode<T>;
} {
  const map: {[outlet: string]: TreeNode<T>} = {};

  if (node) {
    node.children.forEach((child) => (map[child.value.outlet] = child));
  }

  return map;
}
