/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../output/output_ast';
import {Identifiers as R3} from '../r3_identifiers';
import {createInjectorType} from '../r3_injector_compiler';
import {DefinitionMap} from '../view/util';
/**
 * Every time we make a breaking change to the declaration interface or partial-linker behavior, we
 * must update this constant to prevent old partial-linkers from incorrectly processing the
 * declaration.
 *
 * Do not include any prerelease in these versions as they are ignored.
 */
const MINIMUM_PARTIAL_LINKER_VERSION = '12.0.0';
export function compileDeclareInjectorFromMetadata(meta) {
  const definitionMap = createInjectorDefinitionMap(meta);
  const expression = o.importExpr(R3.declareInjector).callFn([definitionMap.toLiteralMap()]);
  const type = createInjectorType(meta);
  return {expression, type, statements: []};
}
/**
 * Gathers the declaration fields for an Injector into a `DefinitionMap`.
 */
function createInjectorDefinitionMap(meta) {
  const definitionMap = new DefinitionMap();
  definitionMap.set('minVersion', o.literal(MINIMUM_PARTIAL_LINKER_VERSION));
  definitionMap.set('version', o.literal('0.0.0-PLACEHOLDER'));
  definitionMap.set('ngImport', o.importExpr(R3.core));
  definitionMap.set('type', meta.type.value);
  definitionMap.set('providers', meta.providers);
  if (meta.imports.length > 0) {
    definitionMap.set('imports', o.literalArr(meta.imports));
  }
  return definitionMap;
}
//# sourceMappingURL=injector.js.map
