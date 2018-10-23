/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../type';
import {stringify} from '../util';

import {InjectableDef, getInjectableDef} from './defs';
import {InjectionToken} from './injection_token';
import {Injector} from './injector';
import {Inject, Optional, Self, SkipSelf} from './metadata';

/**
 * Injection flags for DI.
 *
 * @publicApi
 */
export const enum InjectFlags {
  Default = 0b0000,

  /**
   * Specifies that an injector should retrieve a dependency from any injector until reaching the
   * host element of the current component. (Only used with Element Injector)
   */
  Host = 0b0001,
  /** Don't descend into ancestors of the node requesting injection. */
  Self = 0b0010,
  /** Skip the node that is requesting injection. */
  SkipSelf = 0b0100,
  /** Inject `defaultValue` instead if token not found. */
  Optional = 0b1000,
}



/**
 * Current injector value used by `inject`.
 * - `undefined`: it is an error to call `inject`
 * - `null`: `inject` can be called but there is no injector (limp-mode).
 * - Injector instance: Use the injector for resolution.
 */
let _currentInjector: Injector|undefined|null = undefined;

export function setCurrentInjector(injector: Injector | null | undefined): Injector|undefined|null {
  const former = _currentInjector;
  _currentInjector = injector;
  return former;
}

/**
 * Current implementation of inject.
 *
 * By default, it is `injectInjectorOnly`, which makes it `Injector`-only aware. It can be changed
 * to `directiveInject`, which brings in the `NodeInjector` system of ivy. It is designed this
 * way for two reasons:
 *  1. `Injector` should not depend on ivy logic.
 *  2. To maintain tree shake-ability we don't want to bring in unnecessary code.
 */
let _injectImplementation: (<T>(token: Type<T>| InjectionToken<T>, flags: InjectFlags) => T | null)|
    undefined;

/**
 * Sets the current inject implementation.
 */
export function setInjectImplementation(
    impl: (<T>(token: Type<T>| InjectionToken<T>, flags?: InjectFlags) => T | null) | undefined):
    (<T>(token: Type<T>| InjectionToken<T>, flags?: InjectFlags) => T | null)|undefined {
  const previous = _injectImplementation;
  _injectImplementation = impl;
  return previous;
}

export function injectInjectorOnly<T>(token: Type<T>| InjectionToken<T>): T;
export function injectInjectorOnly<T>(token: Type<T>| InjectionToken<T>, flags?: InjectFlags): T|
    null;
export function injectInjectorOnly<T>(
    token: Type<T>| InjectionToken<T>, flags = InjectFlags.Default): T|null {
  if (_currentInjector === undefined) {
    throw new Error(`inject() must be called from an injection context`);
  } else if (_currentInjector === null) {
    return injectRootLimpMode(token, undefined, flags);
  } else {
    return _currentInjector.get(token, flags & InjectFlags.Optional ? null : undefined, flags);
  }
}

/**
 * Injects a token from the currently active injector.
 *
 * This function must be used in the context of a factory function such as one defined for an
 * `InjectionToken`, and will throw an error if not called from such a context.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/di/ts/injector_spec.ts region='ShakeableInjectionToken'}
 *
 * Within such a factory function `inject` is utilized to request injection of a dependency, instead
 * of providing an additional array of dependencies as was common to do with `useFactory` providers.
 * `inject` is faster and more type-safe.
 *
 * @publicApi
 */
export function inject<T>(token: Type<T>| InjectionToken<T>): T;
export function inject<T>(token: Type<T>| InjectionToken<T>, flags?: InjectFlags): T|null;
export function inject<T>(token: Type<T>| InjectionToken<T>, flags = InjectFlags.Default): T|null {
  return (_injectImplementation || injectInjectorOnly)(token, flags);
}

/**
 * Injects `root` tokens in limp mode.
 *
 * If no injector exists, we can still inject tree-shakable providers which have `providedIn` set to
 * `"root"`. This is known as the limp mode injection. In such case the value is stored in the
 * `InjectableDef`.
 */
export function injectRootLimpMode<T>(
    token: Type<T>| InjectionToken<T>, notFoundValue: T | undefined, flags: InjectFlags): T|null {
  const injectableDef: InjectableDef<T>|null = getInjectableDef(token);
  if (injectableDef && injectableDef.providedIn == 'root') {
    return injectableDef.value === undefined ? injectableDef.value = injectableDef.factory() :
                                               injectableDef.value;
  }
  if (flags & InjectFlags.Optional) return null;
  if (notFoundValue !== undefined) return notFoundValue;
  throw new Error(`Injector: NOT_FOUND [${stringify(token)}]`);
}

export function injectArgs(types: (Type<any>| InjectionToken<any>| any[])[]): any[] {
  const args: any[] = [];
  for (let i = 0; i < types.length; i++) {
    const arg = types[i];
    if (Array.isArray(arg)) {
      if (arg.length === 0) {
        throw new Error('Arguments array must have arguments.');
      }
      let type: Type<any>|undefined = undefined;
      let flags: InjectFlags = InjectFlags.Default;

      for (let j = 0; j < arg.length; j++) {
        const meta = arg[j];
        if (meta instanceof Optional || meta.ngMetadataName === 'Optional') {
          flags |= InjectFlags.Optional;
        } else if (meta instanceof SkipSelf || meta.ngMetadataName === 'SkipSelf') {
          flags |= InjectFlags.SkipSelf;
        } else if (meta instanceof Self || meta.ngMetadataName === 'Self') {
          flags |= InjectFlags.Self;
        } else if (meta instanceof Inject) {
          type = meta.token;
        } else {
          type = meta;
        }
      }

      args.push(inject(type !, flags));
    } else {
      args.push(inject(arg));
    }
  }
  return args;
}
