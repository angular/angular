/**
 * Symbol used to retain generic type information when it would otherwise be lost.
 */
declare const ɵɵTYPE: unique symbol;

/**
 * The `PathKind` for a `FieldPath` that is at the root of its field tree.
 */
export interface Root {
  /**
   * The `ɵɵTYPE` is constructed to allow the `extends` clause on `Child` and `Item` to narrow the
   * type. Another way to think about this is, if we have a function that expects this kind of
   * path, the `ɵɵTYPE` lists the kinds of path we are allowed to pass to it.
   */
  [ɵɵTYPE]: 'root' | 'child' | 'item';
}

/**
 * The `PathKind` for a `FieldPath` that is a child of another `FieldPath`.
 */
export interface Child extends Root {
  [ɵɵTYPE]: 'child' | 'item';
}

/**
 * The `PathKind` for a `FieldPath` that is an item in a `FieldPath` array.
 */
export interface Item extends Child {
  [ɵɵTYPE]: 'item';
}
