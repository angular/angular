/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare class Tree<T> {
    /** @internal */
    _root: TreeNode<T>;
    constructor(root: TreeNode<T>);
    get root(): T;
    /**
     * @internal
     */
    parent(t: T): T | null;
    /**
     * @internal
     */
    children(t: T): T[];
    /**
     * @internal
     */
    firstChild(t: T): T | null;
    /**
     * @internal
     */
    siblings(t: T): T[];
    /**
     * @internal
     */
    pathFromRoot(t: T): T[];
}
export declare class TreeNode<T> {
    value: T;
    children: TreeNode<T>[];
    constructor(value: T, children: TreeNode<T>[]);
    toString(): string;
}
export declare function nodeChildrenAsMap<T extends {
    outlet: string;
}>(node: TreeNode<T> | null): {
    [outlet: string]: TreeNode<T>;
};
