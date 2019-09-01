/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {R3PipeMetadataFacade, getCompilerFacade} from '../../compiler/compiler_facade';
import {reflectDependencies} from '../../di/jit/util';
import {Type} from '../../interface/type';
import {Pipe} from '../../metadata/directives';
import {NG_FACTORY_DEF, NG_PIPE_DEF} from '../fields';

import {angularCoreEnv} from './environment';

export function compilePipe(type: Type<any>, meta: Pipe): void {
  let ngPipeDef: any = null;
  let ngFactoryDef: any = null;

  // if NG_FACTORY_DEF is already defined on this class then don't overwrite it
  if (!type.hasOwnProperty(NG_FACTORY_DEF)) {
    Object.defineProperty(type, NG_FACTORY_DEF, {
      get: () => {
        if (ngFactoryDef === null) {
          const metadata = getPipeMetadata(type, meta);
          ngFactoryDef = getCompilerFacade().compileFactory(
              angularCoreEnv, `ng:///${metadata.name}/ngFactoryDef.js`, metadata, true);
        }
        return ngFactoryDef;
      },
      // Make the property configurable in dev mode to allow overriding in tests
      configurable: !!ngDevMode,
    });
  }

  Object.defineProperty(type, NG_PIPE_DEF, {
    get: () => {
      if (ngPipeDef === null) {
        const metadata = getPipeMetadata(type, meta);
        ngPipeDef = getCompilerFacade().compilePipe(
            angularCoreEnv, `ng:///${metadata.name}/ngPipeDef.js`, metadata);
      }
      return ngPipeDef;
    },
    // Make the property configurable in dev mode to allow overriding in tests
    configurable: !!ngDevMode,
  });
}

function getPipeMetadata(type: Type<any>, meta: Pipe): R3PipeMetadataFacade {
  return {
    type: type,
    typeArgumentCount: 0,
    name: type.name,
    deps: reflectDependencies(type),
    pipeName: meta.name,
    pure: meta.pure !== undefined ? meta.pure : true,
    injectFn: 'directiveInject'
  };
}
