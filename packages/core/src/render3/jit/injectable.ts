/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, LiteralExpr, R3DependencyMetadata, R3InjectableMetadata, WrappedNodeExpr, compileInjectable as compileR3Injectable, jitExpression} from '@angular/compiler';

import {Injectable} from '../../di/injectable';
import {ClassSansProvider, ExistingSansProvider, FactorySansProvider, StaticClassSansProvider, ValueProvider, ValueSansProvider} from '../../di/provider';
import {Type} from '../../type';
import {getClosureSafeProperty} from '../../util/property';

import {angularCoreEnv} from './environment';
import {NG_INJECTABLE_DEF} from './fields';
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
        // Check whether the injectable metadata includes a provider specification.
        const hasAProvider = isUseClassProvider(meta) || isUseFactoryProvider(meta) ||
            isUseValueProvider(meta) || isUseExistingProvider(meta);

        const ctorDeps = reflectDependencies(type);

        let userDeps: R3DependencyMetadata[]|undefined = undefined;
        if ((isUseClassProvider(meta) || isUseFactoryProvider(meta)) && meta.deps !== undefined) {
          userDeps = convertDependencies(meta.deps);
        }

        // Decide which flavor of factory to generate, based on the provider specified.
        // Only one of the use* fields should be set.
        let useClass: Expression|undefined = undefined;
        let useFactory: Expression|undefined = undefined;
        let useValue: Expression|undefined = undefined;
        let useExisting: Expression|undefined = undefined;

        if (!hasAProvider) {
          // In the case the user specifies a type provider, treat it as {provide: X, useClass: X}.
          // The deps will have been reflected above, causing the factory to create the class by
          // calling
          // its constructor with injected deps.
          useClass = new WrappedNodeExpr(type);
        } else if (isUseClassProvider(meta)) {
          // The user explicitly specified useClass, and may or may not have provided deps.
          useClass = new WrappedNodeExpr(meta.useClass);
        } else if (isUseValueProvider(meta)) {
          // The user explicitly specified useValue.
          useValue = new WrappedNodeExpr(meta.useValue);
        } else if (isUseFactoryProvider(meta)) {
          // The user explicitly specified useFactory.
          useFactory = new WrappedNodeExpr(meta.useFactory);
        } else if (isUseExistingProvider(meta)) {
          // The user explicitly specified useExisting.
          useExisting = new WrappedNodeExpr(meta.useExisting);
        } else {
          // Can't happen - either hasAProvider will be false, or one of the providers will be set.
          throw new Error(`Unreachable state.`);
        }

        const {expression, statements} = compileR3Injectable({
          name: type.name,
          type: new WrappedNodeExpr(type),
          providedIn: computeProvidedIn(meta.providedIn),
          useClass,
          useFactory,
          useValue,
          useExisting,
          ctorDeps,
          userDeps,
        });

        def = jitExpression(
            expression, angularCoreEnv, `ng://${type.name}/ngInjectableDef.js`, statements);
      }
      return def;
    },
  });
}

function computeProvidedIn(providedIn: Type<any>| string | null | undefined): Expression {
  if (providedIn == null || typeof providedIn === 'string') {
    return new LiteralExpr(providedIn);
  } else {
    return new WrappedNodeExpr(providedIn);
  }
}

type UseClassProvider = Injectable & ClassSansProvider & {deps?: any[]};

function isUseClassProvider(meta: Injectable): meta is UseClassProvider {
  return (meta as UseClassProvider).useClass !== undefined;
}

const GET_PROPERTY_NAME = {} as any;
const USE_VALUE = getClosureSafeProperty<ValueProvider>(
    {provide: String, useValue: GET_PROPERTY_NAME}, GET_PROPERTY_NAME);

function isUseValueProvider(meta: Injectable): meta is Injectable&ValueSansProvider {
  return USE_VALUE in meta;
}

function isUseFactoryProvider(meta: Injectable): meta is Injectable&FactorySansProvider {
  return (meta as FactorySansProvider).useFactory !== undefined;
}

function isUseExistingProvider(meta: Injectable): meta is Injectable&ExistingSansProvider {
  return (meta as ExistingSansProvider).useExisting !== undefined;
}
