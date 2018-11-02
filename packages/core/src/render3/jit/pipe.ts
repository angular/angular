/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Pipe} from '../../metadata/directives';
import {Type} from '../../type';
import {NG_PIPE_DEF} from '../fields';
import {stringify} from '../util';

import {getCompilerFacade} from './compiler_facade';
import {angularCoreEnv} from './environment';
import {reflectDependencies} from './util';

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
