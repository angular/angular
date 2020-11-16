/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool} from '@angular/compiler';
import * as o from '@angular/compiler/src/output/output_ast';
import {AstObject} from '../../ast/ast_value';

/**
 * An interface for classes that can link partial declarations into full definitions.
 */
export interface PartialLinker<TExpression> {
  /**
   * Link the partial declaration `metaObj` information to generate a full definition expression.
   */
  linkPartialDeclaration(
      sourceUrl: string, code: string, constantPool: ConstantPool,
      metaObj: AstObject<TExpression>): o.Expression;
}
