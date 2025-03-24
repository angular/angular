/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../output/output_ast';
import {
  compileComponentMetadataAsyncResolver,
  R3ClassMetadata,
} from '../r3_class_metadata_compiler';
import {Identifiers as R3} from '../r3_identifiers';
import {R3DeferPerComponentDependency} from '../view/api';
import {DefinitionMap} from '../view/util';

import {R3DeclareClassMetadata, R3DeclareClassMetadataAsync} from './api';

/**
 * Every time we make a breaking change to the declaration interface or partial-linker behavior, we
 * must update this constant to prevent old partial-linkers from incorrectly processing the
 * declaration.
 *
 * Do not include any prerelease in these versions as they are ignored.
 */
const MINIMUM_PARTIAL_LINKER_VERSION = '12.0.0';

/**
 * Minimum version at which deferred blocks are supported in the linker.
 */
const MINIMUM_PARTIAL_LINKER_DEFER_SUPPORT_VERSION = '18.0.0';

export function compileDeclareClassMetadata(metadata: R3ClassMetadata): o.Expression {
  const definitionMap = new DefinitionMap<R3DeclareClassMetadata>();
  definitionMap.set('minVersion', o.literal(MINIMUM_PARTIAL_LINKER_VERSION));
  definitionMap.set('version', o.literal('0.0.0-PLACEHOLDER'));
  definitionMap.set('ngImport', o.importExpr(R3.core));
  definitionMap.set('type', metadata.type);
  definitionMap.set('decorators', metadata.decorators);
  definitionMap.set('ctorParameters', metadata.ctorParameters);
  definitionMap.set('propDecorators', metadata.propDecorators);

  return o.importExpr(R3.declareClassMetadata).callFn([definitionMap.toLiteralMap()]);
}

export function compileComponentDeclareClassMetadata(
  metadata: R3ClassMetadata,
  dependencies: R3DeferPerComponentDependency[] | null,
): o.Expression {
  if (dependencies === null || dependencies.length === 0) {
    return compileDeclareClassMetadata(metadata);
  }

  const definitionMap = new DefinitionMap<R3DeclareClassMetadataAsync>();
  const callbackReturnDefinitionMap = new DefinitionMap<R3ClassMetadata>();
  callbackReturnDefinitionMap.set('decorators', metadata.decorators);
  callbackReturnDefinitionMap.set('ctorParameters', metadata.ctorParameters ?? o.literal(null));
  callbackReturnDefinitionMap.set('propDecorators', metadata.propDecorators ?? o.literal(null));

  definitionMap.set('minVersion', o.literal(MINIMUM_PARTIAL_LINKER_DEFER_SUPPORT_VERSION));
  definitionMap.set('version', o.literal('0.0.0-PLACEHOLDER'));
  definitionMap.set('ngImport', o.importExpr(R3.core));
  definitionMap.set('type', metadata.type);
  definitionMap.set('resolveDeferredDeps', compileComponentMetadataAsyncResolver(dependencies));
  definitionMap.set(
    'resolveMetadata',
    o.arrowFn(
      dependencies.map((dep) => new o.FnParam(dep.symbolName, o.DYNAMIC_TYPE)),
      callbackReturnDefinitionMap.toLiteralMap(),
    ),
  );

  return o.importExpr(R3.declareClassMetadataAsync).callFn([definitionMap.toLiteralMap()]);
}
