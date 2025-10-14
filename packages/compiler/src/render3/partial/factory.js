/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {FactoryTarget} from '../../compiler_facade_interface';
import * as o from '../../output/output_ast';
import {createFactoryType} from '../r3_factory';
import {Identifiers as R3} from '../r3_identifiers';
import {DefinitionMap} from '../view/util';
import {compileDependencies} from './util';
/**
 * Every time we make a breaking change to the declaration interface or partial-linker behavior, we
 * must update this constant to prevent old partial-linkers from incorrectly processing the
 * declaration.
 *
 * Do not include any prerelease in these versions as they are ignored.
 */
const MINIMUM_PARTIAL_LINKER_VERSION = '12.0.0';
export function compileDeclareFactoryFunction(meta) {
  const definitionMap = new DefinitionMap();
  definitionMap.set('minVersion', o.literal(MINIMUM_PARTIAL_LINKER_VERSION));
  definitionMap.set('version', o.literal('0.0.0-PLACEHOLDER'));
  definitionMap.set('ngImport', o.importExpr(R3.core));
  definitionMap.set('type', meta.type.value);
  definitionMap.set('deps', compileDependencies(meta.deps));
  definitionMap.set('target', o.importExpr(R3.FactoryTarget).prop(FactoryTarget[meta.target]));
  return {
    expression: o.importExpr(R3.declareFactory).callFn([definitionMap.toLiteralMap()]),
    statements: [],
    type: createFactoryType(meta),
  };
}
//# sourceMappingURL=factory.js.map
