/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../output/output_ast';
import {Identifiers as R3} from './r3_identifiers';
import {DefinitionMap} from './view/util';
export function compileInjector(meta) {
  const definitionMap = new DefinitionMap();
  if (meta.providers !== null) {
    definitionMap.set('providers', meta.providers);
  }
  if (meta.imports.length > 0) {
    definitionMap.set('imports', o.literalArr(meta.imports));
  }
  const expression = o
    .importExpr(R3.defineInjector)
    .callFn([definitionMap.toLiteralMap()], undefined, true);
  const type = createInjectorType(meta);
  return {expression, type, statements: []};
}
export function createInjectorType(meta) {
  return new o.ExpressionType(
    o.importExpr(R3.InjectorDeclaration, [new o.ExpressionType(meta.type.type)]),
  );
}
//# sourceMappingURL=r3_injector_compiler.js.map
