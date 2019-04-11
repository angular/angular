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
import {NG_PIPE_DEF} from '../fields';

import {angularCoreEnv} from './environment';

export function compilePipe(type: Type<any>, meta: Pipe): void {
  let ngPipeDef: any = null;
  Object.defineProperty(type, NG_PIPE_DEF, {
    get: () => {
      if (ngPipeDef === null) {
        const typeName = type.name;
        ngPipeDef =
            getCompilerFacade().compilePipe(angularCoreEnv, `ng:///${typeName}/ngPipeDef.js`, {
              type: type,
              typeArgumentCount: 0,
              name: typeName,
              deps: reflectDependencies(type),
              pipeName: meta.name,
              pure: meta.pure !== undefined ? meta.pure : true
            });
      }
      return ngPipeDef;
    },
    // Make the property configurable in dev mode to allow overriding in tests
    configurable: !!ngDevMode,
  });
}
