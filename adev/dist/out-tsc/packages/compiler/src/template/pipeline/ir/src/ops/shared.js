/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {OpKind} from '../enums';
/**
 * Create a `StatementOp`.
 */
export function createStatementOp(statement) {
  return {
    kind: OpKind.Statement,
    statement,
    ...NEW_OP,
  };
}
/**
 * Create a `VariableOp`.
 */
export function createVariableOp(xref, variable, initializer, flags) {
  return {
    kind: OpKind.Variable,
    xref,
    variable,
    initializer,
    flags,
    ...NEW_OP,
  };
}
/**
 * Static structure shared by all operations.
 *
 * Used as a convenience via the spread operator (`...NEW_OP`) when creating new operations, and
 * ensures the fields are always in the same order.
 */
export const NEW_OP = {
  debugListId: null,
  prev: null,
  next: null,
};
//# sourceMappingURL=shared.js.map
