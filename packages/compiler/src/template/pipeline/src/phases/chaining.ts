/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import {Identifiers as R3} from '../../../../render3/r3_identifiers';
import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

const CHAIN_COMPATIBILITY = new Map<o.ExternalReference, o.ExternalReference>([
  [R3.attribute, R3.attribute],
  [R3.classProp, R3.classProp],
  [R3.element, R3.element],
  [R3.elementContainer, R3.elementContainer],
  [R3.elementContainerEnd, R3.elementContainerEnd],
  [R3.elementContainerStart, R3.elementContainerStart],
  [R3.elementEnd, R3.elementEnd],
  [R3.elementStart, R3.elementStart],
  [R3.domProperty, R3.domProperty],
  [R3.i18nExp, R3.i18nExp],
  [R3.listener, R3.listener],
  [R3.listener, R3.listener],
  [R3.property, R3.property],
  [R3.styleProp, R3.styleProp],
  [R3.syntheticHostListener, R3.syntheticHostListener],
  [R3.syntheticHostProperty, R3.syntheticHostProperty],
  [R3.templateCreate, R3.templateCreate],
  [R3.twoWayProperty, R3.twoWayProperty],
  [R3.twoWayListener, R3.twoWayListener],
  [R3.declareLet, R3.declareLet],
  [R3.conditionalCreate, R3.conditionalBranchCreate],
  [R3.conditionalBranchCreate, R3.conditionalBranchCreate],
  [R3.domElement, R3.domElement],
  [R3.domElementStart, R3.domElementStart],
  [R3.domElementEnd, R3.domElementEnd],
  [R3.domElementContainer, R3.domElementContainer],
  [R3.domElementContainerStart, R3.domElementContainerStart],
  [R3.domElementContainerEnd, R3.domElementContainerEnd],
  [R3.domListener, R3.domListener],
  [R3.domTemplate, R3.domTemplate],
  [R3.animationEnter, R3.animationEnter],
  [R3.animationLeave, R3.animationLeave],
  [R3.animationEnterListener, R3.animationEnterListener],
  [R3.animationLeaveListener, R3.animationLeaveListener],
]);

/**
 * Chaining results in repeated call expressions, causing a deep AST of receiver expressions. To prevent running out of
 * stack depth the maximum number of chained instructions is limited to this threshold, which has been selected
 * arbitrarily.
 */
const MAX_CHAIN_LENGTH = 256;

/**
 * Post-process a reified view compilation and convert sequential calls to chainable instructions
 * into chain calls.
 *
 * For example, two `elementStart` operations in sequence:
 *
 * ```ts
 * elementStart(0, 'div');
 * elementStart(1, 'span');
 * ```
 *
 * Can be called as a chain instead:
 *
 * ```ts
 * elementStart(0, 'div')(1, 'span');
 * ```
 */
export function chain(job: CompilationJob): void {
  for (const unit of job.units) {
    chainOperationsInList(unit.create);
    chainOperationsInList(unit.update);
  }
}

function chainOperationsInList(opList: ir.OpList<ir.CreateOp | ir.UpdateOp>): void {
  let chain: Chain | null = null;
  for (const op of opList) {
    if (op.kind !== ir.OpKind.Statement || !(op.statement instanceof o.ExpressionStatement)) {
      // This type of statement isn't chainable.
      chain = null;
      continue;
    }
    if (
      !(op.statement.expr instanceof o.InvokeFunctionExpr) ||
      !(op.statement.expr.fn instanceof o.ExternalExpr)
    ) {
      // This is a statement, but not an instruction-type call, so not chainable.
      chain = null;
      continue;
    }

    const instruction = op.statement.expr.fn.value;
    if (!CHAIN_COMPATIBILITY.has(instruction)) {
      // This instruction isn't chainable.
      chain = null;
      continue;
    }

    // This instruction can be chained. It can either be added on to the previous chain (if
    // compatible) or it can be the start of a new chain.
    if (
      chain !== null &&
      CHAIN_COMPATIBILITY.get(chain.instruction) === instruction &&
      chain.length < MAX_CHAIN_LENGTH
    ) {
      // This instruction can be added onto the previous chain.
      const expression = chain.expression.callFn(
        op.statement.expr.args,
        op.statement.expr.sourceSpan,
        op.statement.expr.pure,
      );
      chain.expression = expression;
      chain.op.statement = expression.toStmt();
      chain.length++;
      ir.OpList.remove(op as ir.Op<ir.CreateOp | ir.UpdateOp>);
    } else {
      // Leave this instruction alone for now, but consider it the start of a new chain.
      chain = {
        op,
        instruction,
        expression: op.statement.expr,
        length: 1,
      };
    }
  }
}

/**
 * Structure representing an in-progress chain.
 */
interface Chain {
  /**
   * The statement which holds the entire chain.
   */
  op: ir.StatementOp<ir.CreateOp | ir.UpdateOp>;

  /**
   * The expression representing the whole current chained call.
   *
   * This should be the same as `op.statement.expression`, but is extracted here for convenience
   * since the `op` type doesn't capture the fact that `op.statement` is an `o.ExpressionStatement`.
   */
  expression: o.Expression;

  /**
   * The instruction that is being chained.
   */
  instruction: o.ExternalReference;

  /**
   * The number of instructions that have been collected into this chain.
   */
  length: number;
}
