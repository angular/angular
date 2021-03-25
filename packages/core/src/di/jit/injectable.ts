/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getCompilerFacade, R3InjectableMetadataFacade} from '../../compiler/compiler_facade';
import {Type} from '../../interface/type';
import {NG_FACTORY_DEF} from '../../render3/fields';
import {getClosureSafeProperty} from '../../util/property';
import {resolveForwardRef} from '../forward_ref';
import {Injectable} from '../injectable';
import {NG_PROV_DEF} from '../interface/defs';
import {ClassSansProvider, ExistingSansProvider, FactorySansProvider, ValueProvider, ValueSansProvider} from '../interface/provider';

import {angularCoreDiEnv} from './environment';
import {convertDependencies, reflectDependencies} from './util';



/**
 * Compile an Angular injectable according to its `Injectable` metadata, and patch the resulting
 * injectable def (`ɵprov`) onto the injectable type.
 */
export function compileInjectable(type: Type<any>, srcMeta?: Injectable): void {
  let ngInjectableDef: any = null;
  let ngFactoryDef: any = null;

  // if NG_PROV_DEF is already defined on this class then don't overwrite it
  if (!type.hasOwnProperty(NG_PROV_DEF)) {
    Object.defineProperty(type, NG_PROV_DEF, {
      get: () => {
        if (ngInjectableDef === null) {
          ngInjectableDef = getCompilerFacade().compileInjectable(
              angularCoreDiEnv, `ng:///${type.name}/ɵprov.js`,
              getInjectableMetadata(type, srcMeta));
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
          const metadata = getInjectableMetadata(type, srcMeta);
          const compiler = getCompilerFacade();
          ngFactoryDef = compiler.compileFactory(angularCoreDiEnv, `ng:///${type.name}/ɵfac.js`, {
            name: metadata.name,
            type: metadata.type,
            typeArgumentCount: metadata.typeArgumentCount,
            deps: reflectDependencies(type),
            target: compiler.FactoryTarget.Injectable
          });
        }
        return ngFactoryDef;
      },
      // Leave this configurable so that the factories from directives or pipes can take precedence.
      configurable: true
    });
  }
}

type UseClassProvider = Injectable&ClassSansProvider&{deps?: any[]};

const USE_VALUE =
    getClosureSafeProperty<ValueProvider>({provide: String, useValue: getClosureSafeProperty});

function isUseClassProvider(meta: Injectable): meta is UseClassProvider {
  return (meta as UseClassProvider).useClass !== undefined;
}

function isUseValueProvider(meta: Injectable): meta is Injectable&ValueSansProvider {
  return USE_VALUE in meta;
}

function isUseFactoryProvider(meta: Injectable): meta is Injectable&FactorySansProvider {
  return (meta as FactorySansProvider).useFactory !== undefined;
}

function isUseExistingProvider(meta: Injectable): meta is Injectable&ExistingSansProvider {
  return (meta as ExistingSansProvider).useExisting !== undefined;
}

function getInjectableMetadata(type: Type<any>, srcMeta?: Injectable): R3InjectableMetadataFacade {
  // Allow the compilation of a class with a `@Injectable()` decorator without parameters
  const meta: Injectable = srcMeta || {providedIn: null};
  const compilerMeta: R3InjectableMetadataFacade = {
    name: type.name,
    type: type,
    typeArgumentCount: 0,
    providedIn: meta.providedIn,
    userDeps: undefined,
  };
  if ((isUseClassProvider(meta) || isUseFactoryProvider(meta)) && meta.deps !== undefined) {
    compilerMeta.userDeps = convertDependencies(meta.deps);
  }
  if (isUseClassProvider(meta)) {
    // The user explicitly specified useClass, and may or may not have provided deps.
    compilerMeta.useClass = resolveForwardRef(meta.useClass);
  } else if (isUseValueProvider(meta)) {
    // The user explicitly specified useValue.
    compilerMeta.useValue = resolveForwardRef(meta.useValue);
  } else if (isUseFactoryProvider(meta)) {
    // The user explicitly specified useFactory.
    compilerMeta.useFactory = meta.useFactory;
  } else if (isUseExistingProvider(meta)) {
    // The user explicitly specified useExisting.
    compilerMeta.useExisting = resolveForwardRef(meta.useExisting);
  }
  return compilerMeta;
}
