/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  getCompilerFacade,
  JitCompilerUsage,
  R3ServiceMetadataFacade,
} from '../../compiler/compiler_facade';
import {Type} from '../../interface/type';
import {NG_FACTORY_DEF} from '../../render3/fields';
import type {Service} from '../service';
import {NG_PROV_DEF} from '../interface/defs';
import {angularCoreDiEnv} from './environment';
import {reflectDependencies} from './util';

/**
 * Compile an Angular service according to its `Service` metadata, and patch the resulting
 * defition (`ɵprov`) onto the type.
 */
export function compileService(type: Type<any>, meta?: Service): void {
  let def: any = null;
  let factoryDef: any = null;

  // if NG_PROV_DEF is already defined on this class then don't overwrite it
  if (!type.hasOwnProperty(NG_PROV_DEF)) {
    Object.defineProperty(type, NG_PROV_DEF, {
      get: () => {
        if (def === null) {
          const compiler = getCompilerFacade({
            usage: JitCompilerUsage.Decorator,
            kind: 'service',
            type,
          });
          def = compiler.compileService(
            angularCoreDiEnv,
            `ng:///${type.name}/ɵprov.js`,
            getServiceMetadata(type, meta),
          );
        }
        return def;
      },
    });
  }

  if (!type.hasOwnProperty(NG_FACTORY_DEF)) {
    Object.defineProperty(type, NG_FACTORY_DEF, {
      get: () => {
        if (factoryDef === null) {
          const compiler = getCompilerFacade({
            usage: JitCompilerUsage.Decorator,
            kind: 'service',
            type,
          });
          factoryDef = compiler.compileFactory(angularCoreDiEnv, `ng:///${type.name}/ɵfac.js`, {
            name: type.name,
            type,
            typeArgumentCount: 0,
            deps: reflectDependencies(type),
            target: compiler.FactoryTarget.Service,
          });
        }
        return factoryDef;
      },
      configurable: true,
    });
  }
}

function getServiceMetadata(type: Type<any>, srcMeta?: Service): R3ServiceMetadataFacade {
  const compilerMeta: R3ServiceMetadataFacade = {
    name: type.name,
    type: type,
    typeArgumentCount: 0,
    autoProvided: srcMeta?.autoProvided,
    factory: srcMeta?.factory,
  };

  return compilerMeta;
}
