import type {ComponentCompilation, ViewCompilation} from '../compilation';

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';

/**
 * Moves variables defined in creation mode to only be initialized after their creation, splitting
 * declaration and initialization if necessary to allow forward references.
 */
export function phaseCreationVarColocation(cpl: ComponentCompilation): void {
  for (const view of cpl.views.values()) {
    processView(view);
  }
}

function processView(view: ViewCompilation): void {
  const shallowDeclarations = new Map<ir.XrefId, ir.VariableOp<ir.CreateOp>[]>();
  const seenVariableReads = new Set<ir.XrefId>;
  let shallow = true;
  for (const op of view.create) {
    if (shallow && op.kind === ir.OpKind.Variable &&
        op.variable.kind === ir.SemanticVariableKind.Identifier && op.variable.target !== null) {
      // This variable represents the identity of an entity within the current view (shallow) which
      // may or may not have been created yet.
      const target = op.variable.target;
      if (!shallowDeclarations.has(target)) {
        shallowDeclarations.set(target, []);
      }
      shallowDeclarations.get(target)!.push(op);
      continue;
    }

    // Scan expressions in this operation for both `NextContext` operations (which affect whether
    // seen reference declarations are shallow or not) or for `ReferenceExpr`s which may represent
    // forward references that later need to be accounted for.
    ir.visitExpressionsInOp(op, (exp, flags) => {
      if (flags & ir.VisitorContextFlag.InChildOperation) {
        return;
      }
      if (exp instanceof ir.NextContextExpr) {
        shallow = false;
      } else if (exp instanceof ir.ReadVariableExpr) {
        seenVariableReads.add(exp.xref);
      }
    });

    if (ir.hasConsumesSlotTrait(op) && shallowDeclarations.has(op.xref)) {
      // `op` is creating an entity for which at least one shallow declaration has previously been
      // established. If nothing has referenced those declarations, it can be moved to follow `op`.
      // Otherwise, we can split the variable into its declaration and assignment.
      for (const declOp of shallowDeclarations.get(op.xref)!) {
        // Within the variable initializer, convert the `ReferenceExpr` into a
        // `ShallowReferenceExpr`. This is necessary since we might be moving the initializer past a
        // `NextContext` call.
        declOp.initializer = ir.transformExpressionsInExpression(declOp.initializer, expr => {
          if (!(expr instanceof ir.ReferenceExpr)) {
            return expr;
          }

          const shallowExpr = new ir.ShallowReferenceExpr(expr.target, expr.offset);
          shallowExpr.slot = expr.slot;
          return shallowExpr;
        }, ir.VisitorContextFlag.None);

        if (!seenVariableReads.has(declOp.xref)) {
          // No references have been recorded to this variable, so move it to follow this
          // declaration.
          ir.OpList.remove<ir.CreateOp>(declOp);
          ir.OpList.insertAfter<ir.CreateOp>(declOp, op);
        } else {
          // A forward reference has been observed, so leave the existing declaration in place as an
          // initializer to `undefined`, and set the variable to its value after its declaration.
          const initializer = declOp.initializer;
          declOp.initializer = o.literal(undefined);
          const readVar = new ir.ReadVariableExpr(declOp.xref);
          // TODO: variable naming should run after this and take care of this for us.
          readVar.name = declOp.variable.name;
          const assignment =
              new o.BinaryOperatorExpr(o.BinaryOperator.Assign, readVar, initializer);
          ir.OpList.insertAfter<ir.CreateOp>(ir.createStatementOp(assignment.toStmt()), op);
        }
      }
      shallowDeclarations.delete(op.xref);
    }
  }
}
