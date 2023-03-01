/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../output/output_ast';
import {Identifiers as R3} from './r3_identifiers';
import {R3CompiledExpression, R3Reference} from './util';
import {DefinitionMap} from './view/util';

export interface R3InjectorMetadata {
  name: string;
  type: R3Reference;
  internalType: o.Expression;
  providers: o.Expression|null;
  imports: o.Expression[];
}

export function compileInjector(meta: R3InjectorMetadata): R3CompiledExpression {
  const definitionMap = new DefinitionMap<{providers: o.Expression; imports: o.Expression;}>();

  if (meta.providers !== null) {
    definitionMap.set('providers', meta.providers);
  }

  if (meta.imports.length > 0) {
    definitionMap.set('imports', o.literalArr(meta.imports));
  }

  const expression =
      o.importExpr(R3.defineInjector).callFn([definitionMap.toLiteralMap()], undefined, true);
  const type = createInjectorType(meta);
  return {expression, type, statements: []};
}

export function createInjectorType(meta: R3InjectorMetadata): o.Type {
  return new o.ExpressionType(
      o.importExpr(R3.InjectorDeclaration, [new o.ExpressionType(meta.type.type)]));
}
