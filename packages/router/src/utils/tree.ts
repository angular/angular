/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export class Tree<T> {
  /** @internal */
  _root: TreeNode<T>;

  constructor(root: TreeNode<T>) { this._root = root; }

  get root(): T { return this._root.value; }

  /**
   * @internal
   */
  parent(t: T): T|null {
    const p = this.pathFromRoot(t);
    return p.length > 1 ? p[p.length - 2] : null;
  }

  /**
   * @internal
   */
  children(t: T): T[] {
    const n = findNode(t, this._root);
    return n ? n.children.map(t => t.value) : [];
  }

  /**
   * @internal
   */
  firstChild(t: T): T|null {
    const n = findNode(t, this._root);
    return n && n.children.length > 0 ? n.children[0].value : null;
  }

  /**
   * @internal
   */
  siblings(t: T): T[] {
    const p = getNodePath(t, this._root);
    if (p.length < 2) return [];

    const c = p[p.length - 2].children.map(c => c.value);
    return c.filter(cc => cc !== t);
  }

  /**
   * @internal
   */
  pathFromRoot(t: T): T[] { return pathFromRoot(this._root, t); }
}

export function cloneTree<T>(t: TreeNode<T>, cloneValue: (t:T) => T): TreeNode<T> {
  return {
    value: cloneValue(t.value),
    children: t.children.map(c => cloneTree(c, cloneValue))
  };
}

export function pathFromRoot<T>(root: TreeNode<T>, node: T): T[] {
  return getNodePath(node, root).map(s => s.value);
}

// DFS for the node matching the value
function findNode<T>(value: T, node: TreeNode<T>): TreeNode<T>|null {
  if (value === node.value) return node;

  for (const child of node.children) {
    const node = findNode(value, child);
    if (node) return node;
  }

  return null;
}

// Return the path to the node with the given value using DFS
function getNodePath<T>(value: T, node: TreeNode<T>): TreeNode<T>[] {
  if (value === node.value) return [node];

  for (const child of node.children) {
    const path = getNodePath(value, child);
    if (path.length) {
      path.unshift(node);
      return path;
    }
  }

  return [];
}

/**
 * {
 *   value: 'root',
 *   children: [
 *     {
 *      value: 'child',
 *      children: []
 *     }
 *   ]
 * }
 */
export function getPath<T>(value: T, node: TreeNode<T>): number[] {
  const path = getPathRecurse(value, node);
  if (!path) throw new Error('boom3');
  return path;

  function getPathRecurse<T>(value: T, node: TreeNode<T>): number[]|null {
    if (value === node.value) return [];

    for (let i = 0 ; i < node.children.length ; i++) {
      const path = getPathRecurse(value, node.children[i]);
      if (path) {
        return [i, ...path];
      }
    }

    return null;
  }
}

export function getNodeFromPath<T>(path: number[], node: TreeNode<T>): TreeNode<T> {
  const newPath = path.slice(1);
  if (!path.length) {
    return node;
  } else {
    return getNodeFromPath(newPath, node.children[path[0]]);
  }
}

export interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

// Return the list of T indexed by outlet name
export function nodeChildrenAsMap<T extends{outlet: string}>(node: TreeNode<T>| null) {
  const map: {[outlet: string]: TreeNode<T>} = {};

  if (node) {
    node.children.forEach(child => map[child.value.outlet] = child);
  }

  return map;
}
