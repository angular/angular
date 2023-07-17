/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../output/output_ast';
import {Identifiers as R3} from '../r3_identifiers';
import {createPipeType, R3PipeMetadata} from '../r3_pipe_compiler';
import {R3CompiledExpression} from '../util';
import {DefinitionMap} from '../view/util';

import {R3DeclarePipeMetadata} from './api';

/**
 * Every time we make a breaking change to the declaration interface or partial-linker behavior, we
 * must update this constant to prevent old partial-linkers from incorrectly processing the
 * declaration.
 *
 * Do not include any prerelease in these versions as they are ignored.
 */
const MINIMUM_PARTIAL_LINKER_VERSION = '14.0.0';

/**
 * Compile a Pipe declaration defined by the `R3PipeMetadata`.
 */
export function compileDeclarePipeFromMetadata(meta: R3PipeMetadata): R3CompiledExpression {
  const definitionMap = createPipeDefinitionMap(meta);

  const expression = o.importExpr(R3.declarePipe).callFn([definitionMap.toLiteralMap()]);
  const type = createPipeType(meta);

  return {expression, type, statements: []};
}

/**
 * Gathers the declaration fields for a Pipe into a `DefinitionMap`.
 */
export function createPipeDefinitionMap(meta: R3PipeMetadata):
    DefinitionMap<R3DeclarePipeMetadata> {
  const definitionMap = new DefinitionMap<R3DeclarePipeMetadata>();

  definitionMap.set('minVersion', o.literal(MINIMUM_PARTIAL_LINKER_VERSION));
  definitionMap.set('version', o.literal('0.0.0-PLACEHOLDER'));
  definitionMap.set('ngImport', o.importExpr(R3.core));

  // e.g. `type: MyPipe`
  definitionMap.set('type', meta.type.value);

  if (meta.isStandalone) {
    definitionMap.set('isStandalone', o.literal(meta.isStandalone));
  }

  // e.g. `name: "myPipe"`
  definitionMap.set('name', o.literal(meta.pipeName));

  if (meta.pure === false) {
    // e.g. `pure: false`
    definitionMap.set('pure', o.literal(meta.pure));
  }

  return definitionMap;
}
