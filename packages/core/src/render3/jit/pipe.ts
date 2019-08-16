/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getCompilerFacade} from '../../compiler/compiler_facade';
import {reflectDependencies} from '../../di/jit/util';
import {Type} from '../../interface/type';
import {Pipe} from '../../metadata/directives';
import {NG_FACTORY_FN, NG_PIPE_DEF} from '../fields';

import {angularCoreEnv} from './environment';

export function compilePipe(type: Type<any>, meta: Pipe): void {
  let ngPipeDef: any = null;
  let ngFactoryFn: any = null;

  Object.defineProperty(type, NG_FACTORY_FN, {
    get: () => {
      if (ngFactoryFn === null) {
        [ngPipeDef, ngFactoryFn] = getPipeCompilerOutput(type, meta);
      }
      return ngFactoryFn;
    },
    // Make the property configurable in dev mode to allow overriding in tests
    configurable: !!ngDevMode,
  });

  Object.defineProperty(type, NG_PIPE_DEF, {
    get: () => {
      if (ngPipeDef === null) {
        [ngPipeDef, ngFactoryFn] = getPipeCompilerOutput(type, meta);
      }
      return ngPipeDef;
    },
    // Make the property configurable in dev mode to allow overriding in tests
    configurable: !!ngDevMode,
  });
}

function getPipeCompilerOutput(type: Type<any>, meta: Pipe) {
  const typeName = type.name;

  return getCompilerFacade().compilePipe(angularCoreEnv, `ng:///${typeName}/ngPipeDef.js`, {
    type: type,
    typeArgumentCount: 0,
    name: typeName,
    deps: reflectDependencies(type),
    pipeName: meta.name,
    pure: meta.pure !== undefined ? meta.pure : true
  });
}
