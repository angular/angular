/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {R3ServiceMetadata} from '../../service_compiler';
import {createInjectableType} from '../../injectable_compiler_2';
import * as o from '../../output/output_ast';
import {Identifiers as R3} from '../r3_identifiers';
import {R3CompiledExpression} from '../util';
import {DefinitionMap} from '../view/util';
import {R3DeclareServiceMetadata} from './api';

/**
 * Every time we make a breaking change to the declaration interface or partial-linker behavior, we
 * must update this constant to prevent old partial-linkers from incorrectly processing the
 * declaration.
 *
 * Do not include any prerelease in these versions as they are ignored.
 */
const MINIMUM_PARTIAL_LINKER_VERSION = '22.0.0';

/**
 * Compile a Service declaration defined by the `R3ServiceMetadata`.
 */
export function compileDeclareServiceFromMetadata(meta: R3ServiceMetadata): R3CompiledExpression {
  const definitionMap = createServiceDefinitionMap(meta);

  const expression = o.importExpr(R3.declareService).callFn([definitionMap.toLiteralMap()]);
  const type = createInjectableType(meta.type.type, meta.typeArgumentCount);

  return {expression, type, statements: []};
}

/**
 * Gathers the declaration fields for a Service into a `DefinitionMap`.
 */
export function createServiceDefinitionMap(
  meta: R3ServiceMetadata,
): DefinitionMap<R3DeclareServiceMetadata> {
  const definitionMap = new DefinitionMap<R3DeclareServiceMetadata>();

  definitionMap.set('minVersion', o.literal(MINIMUM_PARTIAL_LINKER_VERSION));
  definitionMap.set('version', o.literal('0.0.0-PLACEHOLDER'));
  definitionMap.set('ngImport', o.importExpr(R3.core));
  definitionMap.set('type', meta.type.value);

  if (meta.autoProvided === false) {
    definitionMap.set('autoProvided', o.literal(false));
  }

  if (meta.factory !== undefined) {
    definitionMap.set('factory', meta.factory);
  }

  return definitionMap;
}
