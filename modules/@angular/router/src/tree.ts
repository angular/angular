export class Tree<T> {
  /** @internal */
  _root: TreeNode<T>;

  constructor(root: TreeNode<T>) { this._root = root; }

  get root(): T { return this._root.value; }

  parent(t: T): T | null {
    const p = this.pathFromRoot(t);
    return p.length > 1 ? p[p.length - 2] : null;
  }

  children(t: T): T[] {
    const n = _findNode(t, this._root);
    return n ? n.children.map(t => t.value) : [];
  }

  firstChild(t: T): T | null {
    const n = _findNode(t, this._root);
    return n && n.children.length > 0 ? n.children[0].value : null;
  }

  pathFromRoot(t: T): T[] { return _findPath(t, this._root, []).map(s => s.value); }

  contains(tree: Tree<T>): boolean { return _contains(this._root, tree._root); }
}

export function rootNode<T>(tree: Tree<T>): TreeNode<T> {
  return tree._root;
}

function _findNode<T>(expected: T, c: TreeNode<T>): TreeNode<T> | null {
  if (expected === c.value) return c;
  for (let cc of c.children) {
    const r = _findNode(expected, cc);
    if (r) return r;
  }
  return null;
}

function _findPath<T>(expected: T, c: TreeNode<T>, collected: TreeNode<T>[]): TreeNode<T>[] {
  collected.push(c);
  if (expected === c.value) return collected;

  for (let cc of c.children) {
    const cloned = collected.slice(0);
    const r = _findPath(expected, cc, cloned);
    if (r) return r;
  }

  return [];
}

function _contains<T>(tree: TreeNode<T>, subtree: TreeNode<T>): boolean {
  if (tree.value !== subtree.value) return false;

  for (let subtreeNode of subtree.children) {
    const s = tree.children.filter(child => child.value === subtreeNode.value);
    if (s.length === 0) return false;
    if (!_contains(s[0], subtreeNode)) return false;
  }

  return true;
}

export class TreeNode<T> {
  constructor(public value: T, public children: TreeNode<T>[]) {}
}