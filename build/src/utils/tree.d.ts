export declare class Tree<T> {
    _root: TreeNode<T>;
    constructor(root: TreeNode<T>);
    readonly root: T;
    parent(t: T): T | null;
    children(t: T): T[];
    firstChild(t: T): T | null;
    siblings(t: T): T[];
    pathFromRoot(t: T): T[];
    contains(tree: Tree<T>): boolean;
}
export declare function rootNode<T>(tree: Tree<T>): TreeNode<T>;
export declare class TreeNode<T> {
    value: T;
    children: TreeNode<T>[];
    constructor(value: T, children: TreeNode<T>[]);
}
