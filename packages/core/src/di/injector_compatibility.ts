/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interfaces/type';

import {Inject, Optional, Self, SkipSelf} from './decorators/metadata';
import {getInjectImplementation} from './fallback/inject_impl';
import {injectRootLimpMode} from './fallback/limp_mode_injector';
import {Injector} from './injector';
import {InjectionToken} from './interfaces/injection_token';
import {InjectFlags} from './interfaces/injector';



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
  return (getInjectImplementation() || injectInjectorOnly)(token, flags);
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
