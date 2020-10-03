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

import {PartialLinker} from './partial_linker';

/**
 * A `PartialLinker` that is designed to process `$ngDeclareComponent()` call expressions.
 */
export class PartialComponentLinkerVersion1<TStatement, TExpression> implements
    PartialLinker<TStatement, TExpression> {
  linkPartialDeclaration(
      sourceUrl: string, code: string, constantPool: ConstantPool,
      metaObj: AstObject<TExpression>): o.Expression {
    throw new Error('Not implemented.');
  }
}
