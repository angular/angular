/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {getClosureSafeProperty} from '../util/property';
import {stringify} from '../util/stringify';

import {resolveForwardRef} from './forward_ref';
import {InjectionToken} from './injection_token';
import {Injector} from './injector';
import {getInjectableDef, ɵɵInjectableDef} from './interface/defs';
import {InjectFlags} from './interface/injector';
import {ValueProvider} from './interface/provider';
import {Inject, Optional, Self, SkipSelf} from './metadata';



/**
 * An InjectionToken that gets the current `Injector` for `createInjector()`-style injectors.
 *
 * Requesting this token instead of `Injector` allows `StaticInjector` to be tree-shaken from a
 * project.
 *
 * @publicApi
 */
export const INJECTOR = new InjectionToken<Injector>(
    'INJECTOR',
    -1 as any  // `-1` is used by Ivy DI system as special value to recognize it as `Injector`.
    );

const _THROW_IF_NOT_FOUND = new Object();
export const THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;

export const NG_TEMP_TOKEN_PATH = 'ngTempTokenPath';
const NG_TOKEN_PATH = 'ngTokenPath';
const NEW_LINE = /\n/gm;
const NO_NEW_LINE = 'ɵ';
export const SOURCE = '__source';

export const USE_VALUE =
    getClosureSafeProperty<ValueProvider>({provide: String, useValue: getClosureSafeProperty});

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
let _injectImplementation:
    (<T>(token: Type<T>| InjectionToken<T>, flags?: InjectFlags) => T | null)|undefined;

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
 * Generated instruction: Injects a token from the currently active injector.
 *
 * Must be used in the context of a factory function such as one defined for an
 * `InjectionToken`. Throws an error if not called from such a context.
 *
 * (Additional documentation moved to `inject`, as it is the public API, and an alias for this instruction)
 *
 * @see inject
 * @codeGenApi
 */
export function ɵɵinject<T>(token: Type<T>| InjectionToken<T>): T;
export function ɵɵinject<T>(token: Type<T>| InjectionToken<T>, flags?: InjectFlags): T|null;
export function ɵɵinject<T>(token: Type<T>| InjectionToken<T>, flags = InjectFlags.Default): T|
    null {
  return (_injectImplementation || injectInjectorOnly)(token, flags);
}

/**
 * Injects a token from the currently active injector.
 *
 * Must be used in the context of a factory function such as one defined for an
 * `InjectionToken`. Throws an error if not called from such a context.
 *
 * Within such a factory function, using this function to request injection of a dependency
 * is faster and more type-safe than providing an additional array of dependencies
 * (as has been common with `useFactory` providers).
 *
 * @param token The injection token for the dependency to be injected.
 * @param flags Optional flags that control how injection is executed.
 * The flags correspond to injection strategies that can be specified with
 * parameter decorators `@Host`, `@Self`, `@SkipSef`, and `@Optional`.
 * @returns True if injection is successful, null otherwise.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example core/di/ts/injector_spec.ts region='ShakableInjectionToken'}
 *
 * @publicApi
 */
export const inject = ɵɵinject;

/**
 * Injects `root` tokens in limp mode.
 *
 * If no injector exists, we can still inject tree-shakable providers which have `providedIn` set to
 * `"root"`. This is known as the limp mode injection. In such case the value is stored in the
 * `InjectableDef`.
 */
export function injectRootLimpMode<T>(
    token: Type<T>| InjectionToken<T>, notFoundValue: T | undefined, flags: InjectFlags): T|null {
  const injectableDef: ɵɵInjectableDef<T>|null = getInjectableDef(token);
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
    const arg = resolveForwardRef(types[i]);
    if (Array.isArray(arg)) {
      if (arg.length === 0) {
        throw new Error('Arguments array must have arguments.');
      }
      let type: Type<any>|undefined = undefined;
      let flags: InjectFlags = InjectFlags.Default;

      for (let j = 0; j < arg.length; j++) {
        const meta = arg[j];
        if (meta instanceof Optional || meta.ngMetadataName === 'Optional' || meta === Optional) {
          flags |= InjectFlags.Optional;
        } else if (
            meta instanceof SkipSelf || meta.ngMetadataName === 'SkipSelf' || meta === SkipSelf) {
          flags |= InjectFlags.SkipSelf;
        } else if (meta instanceof Self || meta.ngMetadataName === 'Self' || meta === Self) {
          flags |= InjectFlags.Self;
        } else if (meta instanceof Inject || meta === Inject) {
          type = meta.token;
        } else {
          type = meta;
        }
      }

      args.push(ɵɵinject(type !, flags));
    } else {
      args.push(ɵɵinject(arg));
    }
  }
  return args;
}


export class NullInjector implements Injector {
  get(token: any, notFoundValue: any = THROW_IF_NOT_FOUND): any {
    if (notFoundValue === THROW_IF_NOT_FOUND) {
      // Intentionally left behind: With dev tools open the debugger will stop here. There is no
      // reason why correctly written application should cause this exception.
      // TODO(misko): uncomment the next line once `ngDevMode` works with closure.
      // if(ngDevMode) debugger;
      const error = new Error(`NullInjectorError: No provider for ${stringify(token)}!`);
      error.name = 'NullInjectorError';
      throw error;
    }
    return notFoundValue;
  }
}


export function catchInjectorError(
    e: any, token: any, injectorErrorName: string, source: string | null): never {
  const tokenPath: any[] = e[NG_TEMP_TOKEN_PATH];
  if (token[SOURCE]) {
    tokenPath.unshift(token[SOURCE]);
  }
  e.message = formatError('\n' + e.message, tokenPath, injectorErrorName, source);
  e[NG_TOKEN_PATH] = tokenPath;
  e[NG_TEMP_TOKEN_PATH] = null;
  throw e;
}

export function formatError(
    text: string, obj: any, injectorErrorName: string, source: string | null = null): string {
  text = text && text.charAt(0) === '\n' && text.charAt(1) == NO_NEW_LINE ? text.substr(2) : text;
  let context = stringify(obj);
  if (obj instanceof Array) {
    context = obj.map(stringify).join(' -> ');
  } else if (typeof obj === 'object') {
    let parts = <string[]>[];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let value = obj[key];
        parts.push(
            key + ':' + (typeof value === 'string' ? JSON.stringify(value) : stringify(value)));
      }
    }
    context = `{${parts.join(', ')}}`;
  }
  return `${injectorErrorName}${source ? '(' + source + ')' : ''}[${context}]: ${text.replace(NEW_LINE, '\n  ')}`;
}
