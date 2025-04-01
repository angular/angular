/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';

import type {ComponentCompilationJob, ViewCompilationUnit} from '../compilation';

/**
 * Generate a preamble sequence for each view creation block and listener function which declares
 * any variables that be referenced in other operations in the block.
 *
 * Variables generated include:
 *   * a saved view context to be used to restore the current view in event listeners.
 *   * the context of the restored view within event listener handlers.
 *   * context variables from the current view as well as all parent views (including the root
 *     context if needed).
 *   * local references from elements within the current view and any lexical parents.
 *
 * Variables are generated here unconditionally, and may optimized away in future operations if it
 * turns out their values (and any side effects) are unused.
 */
export function generateVariables(job: ComponentCompilationJob): void {
  recursivelyProcessView(job.root, /* there is no parent scope for the root view */ null);
}

/**
 * Process the given `ViewCompilation` and generate preambles for it and any listeners that it
 * declares.
 *
 * @param `parentScope` a scope extracted from the parent view which captures any variables which
 *     should be inherited by this view. `null` if the current view is the root view.
 */
function recursivelyProcessView(view: ViewCompilationUnit, parentScope: Scope | null): void {
  // Extract a `Scope` from this view.
  const scope = getScopeForView(view, parentScope);

  for (const op of view.create) {
    switch (op.kind) {
      case ir.OpKind.ConditionalCreate:
      case ir.OpKind.ConditionalBranchCreate:
      case ir.OpKind.Template:
        // Descend into child embedded views.
        recursivelyProcessView(view.job.views.get(op.xref)!, scope);
        break;
      case ir.OpKind.Projection:
        if (op.fallbackView !== null) {
          recursivelyProcessView(view.job.views.get(op.fallbackView)!, scope);
        }
        break;
      case ir.OpKind.RepeaterCreate:
        // Descend into child embedded views.
        recursivelyProcessView(view.job.views.get(op.xref)!, scope);
        if (op.emptyView) {
          recursivelyProcessView(view.job.views.get(op.emptyView)!, scope);
        }
        if (op.trackByOps !== null) {
          op.trackByOps.prepend(generateVariablesInScopeForView(view, scope, false));
        }
        break;
      case ir.OpKind.Listener:
      case ir.OpKind.TwoWayListener:
        // Prepend variables to listener handler functions.
        op.handlerOps.prepend(generateVariablesInScopeForView(view, scope, true));
        break;
    }
  }

  view.update.prepend(generateVariablesInScopeForView(view, scope, false));
}

/**
 * Lexical scope of a view, including a reference to its parent view's scope, if any.
 */
interface Scope {
  /**
   * `XrefId` of the view to which this scope corresponds.
   */
  view: ir.XrefId;

  viewContextVariable: ir.SemanticVariable;

  contextVariables: Map<string, ir.SemanticVariable>;

  aliases: Set<ir.AliasVariable>;

  /**
   * Local references collected from elements within the view.
   */
  references: Reference[];

  /**
   * `@let` declarations collected from the view.
   */
  letDeclarations: LetDeclaration[];

  /**
   * `Scope` of the parent view, if any.
   */
  parent: Scope | null;
}

/**
 * Information needed about a local reference collected from an element within a view.
 */
interface Reference {
  /**
   * Name given to the local reference variable within the template.
   *
   * This is not the name which will be used for the variable declaration in the generated
   * template code.
   */
  name: string;

  /**
   * `XrefId` of the element-like node which this reference targets.
   *
   * The reference may be either to the element (or template) itself, or to a directive on it.
   */
  targetId: ir.XrefId;

  targetSlot: ir.SlotHandle;

  /**
   * A generated offset of this reference among all the references on a specific element.
   */
  offset: number;

  variable: ir.SemanticVariable;
}

/**
 * Information about `@let` declaration collected from a view.
 */
interface LetDeclaration {
  /** `XrefId` of the `@let` declaration that the reference is pointing to. */
  targetId: ir.XrefId;

  /** Slot in which the declaration is stored. */
  targetSlot: ir.SlotHandle;

  /** Variable referring to the declaration. */
  variable: ir.IdentifierVariable;
}

/**
 * Process a view and generate a `Scope` representing the variables available for reference within
 * that view.
 */
function getScopeForView(view: ViewCompilationUnit, parent: Scope | null): Scope {
  const scope: Scope = {
    view: view.xref,
    viewContextVariable: {
      kind: ir.SemanticVariableKind.Context,
      name: null,
      view: view.xref,
    },
    contextVariables: new Map<string, ir.SemanticVariable>(),
    aliases: view.aliases,
    references: [],
    letDeclarations: [],
    parent,
  };

  for (const identifier of view.contextVariables.keys()) {
    scope.contextVariables.set(identifier, {
      kind: ir.SemanticVariableKind.Identifier,
      name: null,
      identifier,
      local: false,
    });
  }

  for (const op of view.create) {
    switch (op.kind) {
      case ir.OpKind.ElementStart:
      case ir.OpKind.ConditionalCreate:
      case ir.OpKind.ConditionalBranchCreate:
      case ir.OpKind.Template:
        if (!Array.isArray(op.localRefs)) {
          throw new Error(`AssertionError: expected localRefs to be an array`);
        }

        // Record available local references from this element.
        for (let offset = 0; offset < op.localRefs.length; offset++) {
          scope.references.push({
            name: op.localRefs[offset].name,
            targetId: op.xref,
            targetSlot: op.handle,
            offset,
            variable: {
              kind: ir.SemanticVariableKind.Identifier,
              name: null,
              identifier: op.localRefs[offset].name,
              local: false,
            },
          });
        }
        break;

      case ir.OpKind.DeclareLet:
        scope.letDeclarations.push({
          targetId: op.xref,
          targetSlot: op.handle,
          variable: {
            kind: ir.SemanticVariableKind.Identifier,
            name: null,
            identifier: op.declaredName,
            local: false,
          },
        });
        break;
    }
  }

  return scope;
}

/**
 * Generate declarations for all variables that are in scope for a given view.
 *
 * This is a recursive process, as views inherit variables available from their parent view, which
 * itself may have inherited variables, etc.
 */
function generateVariablesInScopeForView(
  view: ViewCompilationUnit,
  scope: Scope,
  isListener: boolean,
): ir.VariableOp<ir.UpdateOp>[] {
  const newOps: ir.VariableOp<ir.UpdateOp>[] = [];

  if (scope.view !== view.xref) {
    // Before generating variables for a parent view, we need to switch to the context of the parent
    // view with a `nextContext` expression. This context switching operation itself declares a
    // variable, because the context of the view may be referenced directly.
    newOps.push(
      ir.createVariableOp(
        view.job.allocateXrefId(),
        scope.viewContextVariable,
        new ir.NextContextExpr(),
        ir.VariableFlags.None,
      ),
    );
  }

  // Add variables for all context variables available in this scope's view.
  const scopeView = view.job.views.get(scope.view)!;
  for (const [name, value] of scopeView.contextVariables) {
    const context = new ir.ContextExpr(scope.view);
    // We either read the context, or, if the variable is CTX_REF, use the context directly.
    const variable = value === ir.CTX_REF ? context : new o.ReadPropExpr(context, value);
    // Add the variable declaration.
    newOps.push(
      ir.createVariableOp(
        view.job.allocateXrefId(),
        scope.contextVariables.get(name)!,
        variable,
        ir.VariableFlags.None,
      ),
    );
  }

  for (const alias of scopeView.aliases) {
    newOps.push(
      ir.createVariableOp(
        view.job.allocateXrefId(),
        alias,
        alias.expression.clone(),
        ir.VariableFlags.AlwaysInline,
      ),
    );
  }

  // Add variables for all local references declared for elements in this scope.
  for (const ref of scope.references) {
    newOps.push(
      ir.createVariableOp(
        view.job.allocateXrefId(),
        ref.variable,
        new ir.ReferenceExpr(ref.targetId, ref.targetSlot, ref.offset),
        ir.VariableFlags.None,
      ),
    );
  }

  if (scope.view !== view.xref || isListener) {
    for (const decl of scope.letDeclarations) {
      newOps.push(
        ir.createVariableOp<ir.UpdateOp>(
          view.job.allocateXrefId(),
          decl.variable,
          new ir.ContextLetReferenceExpr(decl.targetId, decl.targetSlot),
          ir.VariableFlags.None,
        ),
      );
    }
  }

  if (scope.parent !== null) {
    // Recursively add variables from the parent scope.
    newOps.push(...generateVariablesInScopeForView(view, scope.parent, false));
  }
  return newOps;
}
