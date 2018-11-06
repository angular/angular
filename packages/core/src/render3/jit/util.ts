/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Host, Inject, Optional, Self, SkipSelf} from '../../di/metadata';
import {Attribute} from '../../metadata/di';
import {ReflectionCapabilities} from '../../reflection/reflection_capabilities';
import {Type} from '../../type';

import {CompilerFacade, R3DependencyMetadataFacade, getCompilerFacade} from './compiler_facade';

let _reflect: ReflectionCapabilities|null = null;

export function getReflect(): ReflectionCapabilities {
  return (_reflect = _reflect || new ReflectionCapabilities());
}

export function reflectDependencies(type: Type<any>): R3DependencyMetadataFacade[] {
  return convertDependencies(getReflect().parameters(type));
}

export function convertDependencies(deps: any[]): R3DependencyMetadataFacade[] {
  const compiler = getCompilerFacade();
  return deps.map(dep => reflectDependency(compiler, dep));
}

function reflectDependency(compiler: CompilerFacade, dep: any | any[]): R3DependencyMetadataFacade {
  const meta: R3DependencyMetadataFacade = {
    token: null,
    host: false,
    optional: false,
    resolved: compiler.R3ResolvedDependencyType.Token,
    self: false,
    skipSelf: false,
  };

  function setTokenAndResolvedType(token: any): void {
    meta.resolved = compiler.R3ResolvedDependencyType.Token;
    meta.token = token;
  }

  if (Array.isArray(dep)) {
    if (dep.length === 0) {
      throw new Error('Dependency array must have arguments.');
    }
    for (let j = 0; j < dep.length; j++) {
      const param = dep[j];
      if (param === undefined) {
        // param may be undefined if type of dep is not set by ngtsc
        continue;
      } else if (param instanceof Optional || param.__proto__.ngMetadataName === 'Optional') {
        meta.optional = true;
      } else if (param instanceof SkipSelf || param.__proto__.ngMetadataName === 'SkipSelf') {
        meta.skipSelf = true;
      } else if (param instanceof Self || param.__proto__.ngMetadataName === 'Self') {
        meta.self = true;
      } else if (param instanceof Host || param.__proto__.ngMetadataName === 'Host') {
        meta.host = true;
      } else if (param instanceof Inject) {
        meta.token = param.token;
      } else if (param instanceof Attribute) {
        if (param.attributeName === undefined) {
          throw new Error(`Attribute name must be defined.`);
        }
        meta.token = param.attributeName;
        meta.resolved = compiler.R3ResolvedDependencyType.Attribute;
      } else {
        setTokenAndResolvedType(param);
      }
    }
  } else {
    setTokenAndResolvedType(dep);
  }
  return meta;
}
