/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {ERROR_ORIGINAL_ERROR, wrappedError} from '../util/errors';
import {stringify} from '../util/stringify';

import {ReflectiveInjector} from './reflective_injector';
import {ReflectiveKey} from './reflective_key';

function findFirstClosedCycle(keys: any[]): any[] {
  const res: any[] = [];
  for (let i = 0; i < keys.length; ++i) {
    if (res.indexOf(keys[i]) > -1) {
      res.push(keys[i]);
      return res;
    }
    res.push(keys[i]);
  }
  return res;
}

function constructResolvingPath(keys: any[]): string {
  if (keys.length > 1) {
    const reversed = findFirstClosedCycle(keys.slice().reverse());
    const tokenStrs = reversed.map(k => stringify(k.token));
    return ' (' + tokenStrs.join(' -> ') + ')';
  }

  return '';
}

export interface InjectionError extends Error {
  keys: ReflectiveKey[];
  injectors: ReflectiveInjector[];
  constructResolvingMessage: (keys: ReflectiveKey[]) => string;
  addKey(injector: ReflectiveInjector, key: ReflectiveKey): void;
}

function injectionError(
    injector: ReflectiveInjector, key: ReflectiveKey,
    constructResolvingMessage: (keys: ReflectiveKey[]) => string,
    originalError?: Error): InjectionError {
  const keys = [key];
  const errMsg = constructResolvingMessage(keys);
  const error =
      (originalError ? wrappedError(errMsg, originalError) : Error(errMsg)) as InjectionError;
  error.addKey = addKey;
  error.keys = keys;
  error.injectors = [injector];
  error.constructResolvingMessage = constructResolvingMessage;
  (error as any)[ERROR_ORIGINAL_ERROR] = originalError;
  return error;
}

function addKey(this: InjectionError, injector: ReflectiveInjector, key: ReflectiveKey): void {
  this.injectors.push(injector);
  this.keys.push(key);
  // Note: This updated message won't be reflected in the `.stack` property
  this.message = this.constructResolvingMessage(this.keys);
}

/**
 * Thrown when trying to retrieve a dependency by key from {@link Injector}, but the
 * {@link Injector} does not have a {@link Provider} for the given key.
 *
 * @usageNotes
 * ### Example
 *
 * ```typescript
 * class A {
 *   constructor(b:B) {}
 * }
 *
 * expect(() => Injector.resolveAndCreate([A])).toThrowError();
 * ```
 */
export function noProviderError(injector: ReflectiveInjector, key: ReflectiveKey): InjectionError {
  return injectionError(injector, key, function(keys: ReflectiveKey[]) {
    const first = stringify(keys[0].token);
    return `No provider for ${first}!${constructResolvingPath(keys)}`;
  });
}

/**
 * Thrown when dependencies form a cycle.
 *
 * @usageNotes
 * ### Example
 *
 * ```typescript
 * var injector = Injector.resolveAndCreate([
 *   {provide: "one", useFactory: (two) => "two", deps: [[new Inject("two")]]},
 *   {provide: "two", useFactory: (one) => "one", deps: [[new Inject("one")]]}
 * ]);
 *
 * expect(() => injector.get("one")).toThrowError();
 * ```
 *
 * Retrieving `A` or `B` throws a `CyclicDependencyError` as the graph above cannot be constructed.
 */
export function cyclicDependencyError(
    injector: ReflectiveInjector, key: ReflectiveKey): InjectionError {
  return injectionError(injector, key, function(keys: ReflectiveKey[]) {
    return `Cannot instantiate cyclic dependency!${constructResolvingPath(keys)}`;
  });
}

/**
 * Thrown when a constructing type returns with an Error.
 *
 * The `InstantiationError` class contains the original error plus the dependency graph which caused
 * this object to be instantiated.
 *
 * @usageNotes
 * ### Example
 *
 * ```typescript
 * class A {
 *   constructor() {
 *     throw new Error('message');
 *   }
 * }
 *
 * var injector = Injector.resolveAndCreate([A]);

 * try {
 *   injector.get(A);
 * } catch (e) {
 *   expect(e instanceof InstantiationError).toBe(true);
 *   expect(e.originalException.message).toEqual("message");
 *   expect(e.originalStack).toBeDefined();
 * }
 * ```
 */
export function instantiationError(
    injector: ReflectiveInjector, originalException: any, originalStack: any,
    key: ReflectiveKey): InjectionError {
  return injectionError(injector, key, function(keys: ReflectiveKey[]) {
    const first = stringify(keys[0].token);
    return `${originalException.message}: Error during instantiation of ${first}!${
        constructResolvingPath(keys)}.`;
  }, originalException);
}

/**
 * Thrown when an object other then {@link Provider} (or `Type`) is passed to {@link Injector}
 * creation.
 *
 * @usageNotes
 * ### Example
 *
 * ```typescript
 * expect(() => Injector.resolveAndCreate(["not a type"])).toThrowError();
 * ```
 */
export function invalidProviderError(provider: any) {
  return Error(
      `Invalid provider - only instances of Provider and Type are allowed, got: ${provider}`);
}

/**
 * Thrown when the class has no annotation information.
 *
 * Lack of annotation information prevents the {@link Injector} from determining which dependencies
 * need to be injected into the constructor.
 *
 * @usageNotes
 * ### Example
 *
 * ```typescript
 * class A {
 *   constructor(b) {}
 * }
 *
 * expect(() => Injector.resolveAndCreate([A])).toThrowError();
 * ```
 *
 * This error is also thrown when the class not marked with {@link Injectable} has parameter types.
 *
 * ```typescript
 * class B {}
 *
 * class A {
 *   constructor(b:B) {} // no information about the parameter types of A is available at runtime.
 * }
 *
 * expect(() => Injector.resolveAndCreate([A,B])).toThrowError();
 * ```
 *
 */
export function noAnnotationError(typeOrFunc: Type<any>|Function, params: any[][]): Error {
  const signature: string[] = [];
  for (let i = 0, ii = params.length; i < ii; i++) {
    const parameter = params[i];
    if (!parameter || parameter.length == 0) {
      signature.push('?');
    } else {
      signature.push(parameter.map(stringify).join(' '));
    }
  }
  return Error(
      'Cannot resolve all parameters for \'' + stringify(typeOrFunc) + '\'(' +
      signature.join(', ') + '). ' +
      'Make sure that all the parameters are decorated with Inject or have valid type annotations and that \'' +
      stringify(typeOrFunc) + '\' is decorated with Injectable.');
}

/**
 * Thrown when getting an object by index.
 *
 * @usageNotes
 * ### Example
 *
 * ```typescript
 * class A {}
 *
 * var injector = Injector.resolveAndCreate([A]);
 *
 * expect(() => injector.getAt(100)).toThrowError();
 * ```
 *
 */
export function outOfBoundsError(index: number) {
  return Error(`Index ${index} is out-of-bounds.`);
}

// TODO: add a working example after alpha38 is released
/**
 * Thrown when a multi provider and a regular provider are bound to the same token.
 *
 * @usageNotes
 * ### Example
 *
 * ```typescript
 * expect(() => Injector.resolveAndCreate([
 *   { provide: "Strings", useValue: "string1", multi: true},
 *   { provide: "Strings", useValue: "string2", multi: false}
 * ])).toThrowError();
 * ```
 */
export function mixingMultiProvidersWithRegularProvidersError(
    provider1: any, provider2: any): Error {
  return Error(`Cannot mix multi providers and regular providers, got: ${provider1} ${provider2}`);
}
