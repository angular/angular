/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {NodePath, types as t} from '@babel/core';

import {DeclarationScope} from '../../../linker';

export type ConstantScopePath =
  | NodePath<t.FunctionDeclaration>
  | NodePath<t.FunctionExpression>
  | NodePath<t.Program>;

/**
 * This class represents the lexical scope of a partial declaration in Babel source code.
 *
 * Its only responsibility is to compute a reference object for the scope of shared constant
 * statements that will be generated during partial linking.
 */
export class BabelDeclarationScope implements DeclarationScope<ConstantScopePath, t.Expression> {
  /**
   * Construct a new `BabelDeclarationScope`.
   *
   * @param declarationScope the Babel scope containing the declaration call expression.
   */
  constructor(private declarationScope: NodePath['scope']) {}

  /**
   * Compute the Babel `NodePath` that can be used to reference the lexical scope where any
   * shared constant statements would be inserted.
   *
   * There will only be a shared constant scope if the expression is in an ECMAScript module, or a
   * UMD module. Otherwise `null` is returned to indicate that constant statements must be emitted
   * locally to the generated linked definition, to avoid polluting the global scope.
   *
   * @param expression the expression that points to the Angular core framework import.
   */
  getConstantScopeRef(expression: t.Expression): ConstantScopePath | null {
    // If the expression is of the form `a.b.c` then we want to get the far LHS (e.g. `a`).
    let bindingExpression = expression;
    while (t.isMemberExpression(bindingExpression)) {
      bindingExpression = bindingExpression.object;
    }

    if (!t.isIdentifier(bindingExpression)) {
      return null;
    }

    // The binding of the expression is where this identifier was declared.
    // This could be a variable declaration, an import namespace or a function parameter.
    const binding = this.declarationScope.getBinding(bindingExpression.name);
    if (binding === undefined) {
      return null;
    }

    // We only support shared constant statements if the binding was in a UMD module (i.e. declared
    // within a function) or an ECMASCript module (i.e. declared at the top level of a
    // `t.Program` that is marked as a module).
    const path = binding.scope.path;
    if (
      !path.isFunctionDeclaration() &&
      !path.isFunctionExpression() &&
      !(path.isProgram() && path.node.sourceType === 'module')
    ) {
      return null;
    }

    return path;
  }
}
