/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../output/output_ast';
import {createFactoryType, FactoryTarget, R3DependencyMetadata, R3FactoryMetadata} from '../r3_factory';
import {Identifiers as R3} from '../r3_identifiers';
import {R3CompiledExpression} from '../util';
import {DefinitionMap} from '../view/util';

import {R3DeclareDependencyMetadata, R3DeclareFactoryMetadata} from './api';

export function compileDeclareFactoryFunction(meta: R3FactoryMetadata): R3CompiledExpression {
  const definitionMap = new DefinitionMap<R3DeclareFactoryMetadata>();
  definitionMap.set('version', o.literal('0.0.0-PLACEHOLDER'));
  definitionMap.set('ngImport', o.importExpr(R3.core));
  definitionMap.set('type', meta.internalType);
  definitionMap.set('deps', compileDependencies(meta.deps));
  definitionMap.set('target', o.importExpr(R3.FactoryTarget).prop(FactoryTarget[meta.target]));

  return {
    expression: o.importExpr(R3.declareFactory).callFn([definitionMap.toLiteralMap()]),
    statements: [],
    type: createFactoryType(meta),
  };
}

function compileDependencies(deps: R3DependencyMetadata[]|'invalid'|null): o.LiteralExpr|
    o.LiteralArrayExpr {
  if (deps === 'invalid') {
    return o.literal('invalid');
  } else if (deps === null) {
    return o.literal(null);
  } else {
    return o.literalArr(deps.map(compileDependency));
  }
}

function compileDependency(dep: R3DependencyMetadata): o.LiteralMapExpr {
  const depMeta = new DefinitionMap<R3DeclareDependencyMetadata>();
  depMeta.set('token', dep.token);
  if (dep.attributeNameType !== null) {
    depMeta.set('attribute', o.literal(true));
  }
  if (dep.host) {
    depMeta.set('host', o.literal(true));
  }
  if (dep.optional) {
    depMeta.set('optional', o.literal(true));
  }
  if (dep.self) {
    depMeta.set('self', o.literal(true));
  }
  if (dep.skipSelf) {
    depMeta.set('skipSelf', o.literal(true));
  }
  return depMeta.toLiteralMap();
}
