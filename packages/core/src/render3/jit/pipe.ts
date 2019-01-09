/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getCompilerFacade} from '../compiler/compiler_facade';
import {reflectDependencies} from '../compiler/util';
import {Pipe} from '../decorators/decorators';
import {Type} from '../interfaces/type';
import {NG_PIPE_DEF} from '../render3/interfaces/fields';
import {stringify} from '../utils/stringify';

import {angularCoreEnv} from './environment';

export function compilePipe(type: Type<any>, meta: Pipe): void {
  let ngPipeDef: any = null;
  Object.defineProperty(type, NG_PIPE_DEF, {
    get: () => {
      if (ngPipeDef === null) {
        ngPipeDef = getCompilerFacade().compilePipe(
            angularCoreEnv, `ng://${stringify(type)}/ngPipeDef.js`, {
              type: type,
              name: type.name,
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
