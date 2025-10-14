/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {getCompilerFacade} from '../../compiler/compiler_facade';
import {NG_FACTORY_DEF} from '../../render3/fields';
import {getClosureSafeProperty} from '../../util/property';
import {NG_PROV_DEF} from '../interface/defs';
import {angularCoreDiEnv} from './environment';
import {convertDependencies, reflectDependencies} from './util';
/**
 * Compile an Angular injectable according to its `Injectable` metadata, and patch the resulting
 * injectable def (`ɵprov`) onto the injectable type.
 */
export function compileInjectable(type, meta) {
  let ngInjectableDef = null;
  let ngFactoryDef = null;
  // if NG_PROV_DEF is already defined on this class then don't overwrite it
  if (!type.hasOwnProperty(NG_PROV_DEF)) {
    Object.defineProperty(type, NG_PROV_DEF, {
      get: () => {
        if (ngInjectableDef === null) {
          const compiler = getCompilerFacade({
            usage: 0 /* JitCompilerUsage.Decorator */,
            kind: 'injectable',
            type,
          });
          ngInjectableDef = compiler.compileInjectable(
            angularCoreDiEnv,
            `ng:///${type.name}/ɵprov.js`,
            getInjectableMetadata(type, meta),
          );
        }
        return ngInjectableDef;
      },
    });
  }
  // if NG_FACTORY_DEF is already defined on this class then don't overwrite it
  if (!type.hasOwnProperty(NG_FACTORY_DEF)) {
    Object.defineProperty(type, NG_FACTORY_DEF, {
      get: () => {
        if (ngFactoryDef === null) {
          const compiler = getCompilerFacade({
            usage: 0 /* JitCompilerUsage.Decorator */,
            kind: 'injectable',
            type,
          });
          ngFactoryDef = compiler.compileFactory(angularCoreDiEnv, `ng:///${type.name}/ɵfac.js`, {
            name: type.name,
            type,
            typeArgumentCount: 0, // In JIT mode types are not available nor used.
            deps: reflectDependencies(type),
            target: compiler.FactoryTarget.Injectable,
          });
        }
        return ngFactoryDef;
      },
      // Leave this configurable so that the factories from directives or pipes can take precedence.
      configurable: true,
    });
  }
}
const USE_VALUE = getClosureSafeProperty({
  provide: String,
  useValue: getClosureSafeProperty,
});
function isUseClassProvider(meta) {
  return meta.useClass !== undefined;
}
function isUseValueProvider(meta) {
  return USE_VALUE in meta;
}
function isUseFactoryProvider(meta) {
  return meta.useFactory !== undefined;
}
function isUseExistingProvider(meta) {
  return meta.useExisting !== undefined;
}
function getInjectableMetadata(type, srcMeta) {
  // Allow the compilation of a class with a `@Injectable()` decorator without parameters
  const meta = srcMeta || {providedIn: null};
  const compilerMeta = {
    name: type.name,
    type: type,
    typeArgumentCount: 0,
    providedIn: meta.providedIn,
  };
  if ((isUseClassProvider(meta) || isUseFactoryProvider(meta)) && meta.deps !== undefined) {
    compilerMeta.deps = convertDependencies(meta.deps);
  }
  // Check to see if the user explicitly provided a `useXxxx` property.
  if (isUseClassProvider(meta)) {
    compilerMeta.useClass = meta.useClass;
  } else if (isUseValueProvider(meta)) {
    compilerMeta.useValue = meta.useValue;
  } else if (isUseFactoryProvider(meta)) {
    compilerMeta.useFactory = meta.useFactory;
  } else if (isUseExistingProvider(meta)) {
    compilerMeta.useExisting = meta.useExisting;
  }
  return compilerMeta;
}
//# sourceMappingURL=injectable.js.map
