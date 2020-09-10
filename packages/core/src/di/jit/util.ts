/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerFacade, getCompilerFacade, R3DependencyMetadataFacade, R3ResolvedDependencyType} from '../../compiler/compiler_facade';
import {Type} from '../../interface/type';
import {ReflectionCapabilities} from '../../reflection/reflection_capabilities';
import {Host, Inject, Optional, Self, SkipSelf} from '../metadata';
import {Attribute} from '../metadata_attr';

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

function reflectDependency(compiler: CompilerFacade, dep: any|any[]): R3DependencyMetadataFacade {
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

  if (Array.isArray(dep) && dep.length > 0) {
    for (let j = 0; j < dep.length; j++) {
      const param = dep[j];
      if (param === undefined) {
        // param may be undefined if type of dep is not set by ngtsc
        continue;
      }

      const proto = Object.getPrototypeOf(param);

      if (param instanceof Optional || proto.ngMetadataName === 'Optional') {
        meta.optional = true;
      } else if (param instanceof SkipSelf || proto.ngMetadataName === 'SkipSelf') {
        meta.skipSelf = true;
      } else if (param instanceof Self || proto.ngMetadataName === 'Self') {
        meta.self = true;
      } else if (param instanceof Host || proto.ngMetadataName === 'Host') {
        meta.host = true;
      } else if (param instanceof Inject) {
        meta.token = param.token;
      } else if (param instanceof Attribute) {
        if (param.attributeName === undefined) {
          throw new Error(`Attribute name must be defined.`);
        }
        meta.token = param.attributeName;
        meta.resolved = compiler.R3ResolvedDependencyType.Attribute;
      } else if (param.__ChangeDetectorRef__ === true) {
        meta.token = param;
        meta.resolved = compiler.R3ResolvedDependencyType.ChangeDetectorRef;
      } else {
        setTokenAndResolvedType(param);
      }
    }
  } else if (dep === undefined || (Array.isArray(dep) && dep.length === 0)) {
    meta.token = undefined;
    meta.resolved = R3ResolvedDependencyType.Invalid;
  } else {
    setTokenAndResolvedType(dep);
  }
  return meta;
}
