/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../output/output_ast';
import {Identifiers as R3} from '../r3_identifiers';
import {createInjectorType, R3InjectorMetadata} from '../r3_injector_compiler';
import {R3CompiledExpression} from '../util';
import {DefinitionMap} from '../view/util';
import {R3DeclareInjectorMetadata} from './api';


export function compileDeclareInjectorFromMetadata(meta: R3InjectorMetadata): R3CompiledExpression {
  const definitionMap = createInjectorDefinitionMap(meta);

  const expression = o.importExpr(R3.declareInjector).callFn([definitionMap.toLiteralMap()]);
  const type = createInjectorType(meta);

  return {expression, type, statements: []};
}

function createInjectorDefinitionMap(meta: R3InjectorMetadata):
    DefinitionMap<R3DeclareInjectorMetadata> {
  const definitionMap = new DefinitionMap<R3DeclareInjectorMetadata>();

  definitionMap.set('version', o.literal('0.0.0-PLACEHOLDER'));
  definitionMap.set('ngImport', o.importExpr(R3.core));

  definitionMap.set('type', meta.internalType);
  definitionMap.set('providers', meta.providers);
  if (meta.imports.length > 0) {
    definitionMap.set('imports', o.literalArr(meta.imports));
  }

  return definitionMap;
}
