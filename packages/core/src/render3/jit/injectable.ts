/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '../../di/injectable';
import {ClassSansProvider, ExistingSansProvider, FactorySansProvider, ValueProvider, ValueSansProvider} from '../../di/provider';
import {Type} from '../../type';
import {getClosureSafeProperty} from '../../util/property';
import {NG_INJECTABLE_DEF} from '../fields';

import {R3InjectableMetadataFacade, getCompilerFacade} from './compiler_facade';
import {angularCoreEnv} from './environment';
import {convertDependencies, reflectDependencies} from './util';



/**
 * Compile an Angular injectable according to its `Injectable` metadata, and patch the resulting
 * `ngInjectableDef` onto the injectable type.
 */
export function compileInjectable(type: Type<any>, srcMeta?: Injectable): void {
  // Allow the compilation of a class with a `@Injectable()` decorator without parameters
  const meta: Injectable = srcMeta || {providedIn: null};

  let def: any = null;
  Object.defineProperty(type, NG_INJECTABLE_DEF, {
    get: () => {
      if (def === null) {
        const meta: Injectable = srcMeta || {providedIn: null};
        const hasAProvider = isUseClassProvider(meta) || isUseFactoryProvider(meta) ||
            isUseValueProvider(meta) || isUseExistingProvider(meta);


        const compilerMeta: R3InjectableMetadataFacade = {
          name: type.name,
          type: type,
          providedIn: meta.providedIn,
          ctorDeps: reflectDependencies(type),
          userDeps: undefined
        };
        if ((isUseClassProvider(meta) || isUseFactoryProvider(meta)) && meta.deps !== undefined) {
          compilerMeta.userDeps = convertDependencies(meta.deps);
        }
        if (!hasAProvider) {
          // In the case the user specifies a type provider, treat it as {provide: X, useClass: X}.
          // The deps will have been reflected above, causing the factory to create the class by
          // calling
          // its constructor with injected deps.
          compilerMeta.useClass = type;
        } else if (isUseClassProvider(meta)) {
          // The user explicitly specified useClass, and may or may not have provided deps.
          compilerMeta.useClass = meta.useClass;
        } else if (isUseValueProvider(meta)) {
          // The user explicitly specified useValue.
          compilerMeta.useValue = meta.useValue;
        } else if (isUseFactoryProvider(meta)) {
          // The user explicitly specified useFactory.
          compilerMeta.useFactory = meta.useFactory;
        } else if (isUseExistingProvider(meta)) {
          // The user explicitly specified useExisting.
          compilerMeta.useExisting = meta.useExisting;
        } else {
          // Can't happen - either hasAProvider will be false, or one of the providers will be set.
          throw new Error(`Unreachable state.`);
        }
        def = getCompilerFacade().compileInjectable(
            angularCoreEnv, `ng://${type.name}/ngInjectableDef.js`, compilerMeta);
      }
      return def;
    },
  });
}

type UseClassProvider = Injectable & ClassSansProvider & {deps?: any[]};

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
