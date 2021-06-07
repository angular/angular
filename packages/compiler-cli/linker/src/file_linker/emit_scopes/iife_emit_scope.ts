/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '@angular/compiler/src/output/output_ast';

import {AstFactory} from '../../../../src/ngtsc/translator';
import {Translator} from '../translator';

import {EmitScope} from './emit_scope';

/**
 * This class is a specialization of the `EmitScope` class that is designed for the situation where
 * there is no clear shared scope for constant statements. In this case they are bundled with the
 * translated definition inside an IIFE.
 */
export class IifeEmitScope<TStatement, TExpression> extends EmitScope<TStatement, TExpression> {
  constructor(
      ngImport: TExpression, translator: Translator<TStatement, TExpression>,
      private readonly factory: AstFactory<TStatement, TExpression>) {
    super(ngImport, translator);
  }

  /**
   * Translate the given Output AST definition expression into a generic `TExpression`.
   *
   * Wraps the output from `EmitScope.translateDefinition()` and `EmitScope.getConstantStatements()`
   * in an IIFE.
   */
  override translateDefinition(definition: o.Expression): TExpression {
    const constantStatements = super.getConstantStatements();

    const returnStatement =
        this.factory.createReturnStatement(super.translateDefinition(definition));
    const body = this.factory.createBlock([...constantStatements, returnStatement]);
    const fn = this.factory.createFunctionExpression(/* name */ null, /* args */[], body);
    return this.factory.createCallExpression(fn, /* args */[], /* pure */ false);
  }

  /**
   * It is not valid to call this method, since there will be no shared constant statements - they
   * are already emitted in the IIFE alongside the translated definition.
   */
  override getConstantStatements(): TStatement[] {
    throw new Error('BUG - IifeEmitScope should not expose any constant statements');
  }
}
