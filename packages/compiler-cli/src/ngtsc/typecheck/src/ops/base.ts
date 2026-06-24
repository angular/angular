/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';

/**
 * A code generation operation that's involved in the construction of a Type Check Block.
 *
 * The generation of a TCB is non-linear. Bindings within a template may result in the need to
 * construct certain types earlier than they otherwise would be constructed. That is, if the
 * generation of a TCB for a template is broken down into specific operations (constructing a
 * directive, extracting a variable from a let- operation, etc), then it's possible for operations
 * earlier in the sequence to depend on operations which occur later in the sequence.
 *
 * `TcbOp` abstracts the different types of operations which are required to convert a template into
 * a TCB. This allows for two phases of processing for the template, where 1) a linear sequence of
 * `TcbOp`s is generated, and then 2) these operations are executed, not necessarily in linear
 * order.
 *
 * Each `TcbOp` may insert statements into the body of the TCB, and also optionally return a
 * `ts.Expression` which can be used to reference the operation's result.
 */
export abstract class TcbOp {
  /**
   * Set to true if this operation can be considered optional. Optional operations are only executed
   * when depended upon by other operations, otherwise they are disregarded. This allows for less
   * code to generate, parse and type-check, overall positively contributing to performance.
   */
  abstract readonly optional: boolean;

  abstract execute(): ts.Expression | null;

  /**
   * Replacement value or operation used while this `TcbOp` is executing (i.e. to resolve circular
   * references during its execution).
   *
   * This is usually a `null!` expression (which asks TS to infer an appropriate type), but another
   * `TcbOp` can be returned in cases where additional code generation is necessary to deal with
   * circular references.
   */
  circularFallback(): TcbOp | ts.Expression {
    // Value used to break a circular reference between `TcbOp`s.
    //
    // This value is returned whenever `TcbOp`s have a circular dependency. The
    // expression is a non-null assertion of the null value (in TypeScript, the
    // expression `null!`). This construction will infer the least narrow type
    // for whatever it's assigned to.
    return ts.factory.createNonNullExpression(ts.factory.createNull());
  }
}
