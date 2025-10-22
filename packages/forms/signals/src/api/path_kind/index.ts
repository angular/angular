import * as PathKindInternal from './types';

/**
 * The kind of `FieldPath` (`Root`, `Child` of another `FieldPath`, or `Item` in a `FieldPath` array)
 *
 * @experimental 21.0.0
 */
export type PathKind = PathKindInternal.Root | PathKindInternal.Child | PathKindInternal.Item;
export {PathKindInternal as PathKind};
