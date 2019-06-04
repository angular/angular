/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../interface/type';
import {getClosureSafeProperty} from '../../util/property';
import {ClassProvider, ConstructorProvider, ExistingProvider, FactoryProvider, StaticClassProvider, ValueProvider} from './provider';



/**
 * Information about how a type or `InjectionToken` interfaces with the DI system.
 *
 * At a minimum, this includes a `factory` which defines how to create the given type `T`, possibly
 * requesting injection of other types if necessary.
 *
 * Optionally, a `providedIn` parameter specifies that the given type belongs to a particular
 * `InjectorDef`, `NgModule`, or a special scope (e.g. `'root'`). A value of `null` indicates
 * that the injectable does not belong to any scope.
 *
 * NOTE: This is a private type and should not be exported
 *
 * @publicApi
 */
export interface ɵɵInjectableDef<T> {
  /**
   * Specifies that the given type belongs to a particular injector:
   * - `InjectorType` such as `NgModule`,
   * - `'root'` the root injector
   * - `'any'` all injectors.
   * - `null`, does not belong to any injector. Must be explicitly listed in the injector
   *   `providers`.
   */
  providedIn: InjectorType<any>|'root'|'any'|null;

  /**
   * The token to which this definition belongs.
   *
   * Note that this may not be the same as the type that the `factory` will create.
   */
  token: unknown;

  /**
   * Factory method to execute to create an instance of the injectable.
   */
  factory: (t?: Type<any>) => T;

  /**
   * In a case of no explicit injector, a location where the instance of the injectable is stored.
   */
  value: T|undefined;
}

/**
 * Information about the providers to be included in an `Injector` as well as how the given type
 * which carries the information should be created by the DI system.
 *
 * An `InjectorDef` can import other types which have `InjectorDefs`, forming a deep nested
 * structure of providers with a defined priority (identically to how `NgModule`s also have
 * an import/dependency structure).
 *
 * NOTE: This is a private type and should not be exported
 *
 * @publicApi
 */
export interface ɵɵInjectorDef<T> {
  factory: () => T;

  // TODO(alxhub): Narrow down the type here once decorators properly change the return type of the
  // class they are decorating (to add the ngInjectableDef property for example).
  providers: (Type<any>|ValueProvider|ExistingProvider|FactoryProvider|ConstructorProvider|
              StaticClassProvider|ClassProvider|any[])[];

  imports: (InjectorType<any>|InjectorTypeWithProviders<any>)[];
}

/**
 * A `Type` which has an `InjectableDef` static field.
 *
 * `InjectableDefType`s contain their own Dependency Injection metadata and are usable in an
 * `InjectorDef`-based `StaticInjector.
 *
 * @publicApi
 */
export interface InjectableType<T> extends Type<T> {
  /**
   * Opaque type whose structure is highly version dependent. Do not rely on any properties.
   */
  ngInjectableDef: never;
}

/**
 * A type which has an `InjectorDef` static field.
 *
 * `InjectorDefTypes` can be used to configure a `StaticInjector`.
 *
 * @publicApi
 */
export interface InjectorType<T> extends Type<T> {
  /**
   * Opaque type whose structure is highly version dependent. Do not rely on any properties.
   */
  ngInjectorDef: never;
}

/**
 * Describes the `InjectorDef` equivalent of a `ModuleWithProviders`, an `InjectorDefType` with an
 * associated array of providers.
 *
 * Objects of this type can be listed in the imports section of an `InjectorDef`.
 *
 * NOTE: This is a private type and should not be exported
 */
export interface InjectorTypeWithProviders<T> {
  ngModule: InjectorType<T>;
  providers?: (Type<any>|ValueProvider|ExistingProvider|FactoryProvider|ConstructorProvider|
               StaticClassProvider|ClassProvider|any[])[];
}


/**
 * Construct an `InjectableDef` which defines how a token will be constructed by the DI system, and
 * in which injectors (if any) it will be available.
 *
 * This should be assigned to a static `ngInjectableDef` field on a type, which will then be an
 * `InjectableType`.
 *
 * Options:
 * * `providedIn` determines which injectors will include the injectable, by either associating it
 *   with an `@NgModule` or other `InjectorType`, or by specifying that this injectable should be
 *   provided in the `'root'` injector, which will be the application-level injector in most apps.
 * * `factory` gives the zero argument function which will create an instance of the injectable.
 *   The factory can call `inject` to access the `Injector` and request injection of dependencies.
 *
 * @codeGenApi
 */
export function ɵɵdefineInjectable<T>(opts: {
  token: unknown,
  providedIn?: Type<any>| 'root' | 'any' | null,
  factory: () => T,
}): never {
  return ({
    token: opts.token, providedIn: opts.providedIn as any || null, factory: opts.factory,
        value: undefined,
  } as ɵɵInjectableDef<T>) as never;
}

/**
 * @deprecated in v8, delete after v10. This API should be used only be generated code, and that
 * code should now use ɵɵdefineInjectable instead.
 * @publicApi
 */
export const defineInjectable = ɵɵdefineInjectable;

/**
 * Construct an `InjectorDef` which configures an injector.
 *
 * This should be assigned to a static `ngInjectorDef` field on a type, which will then be an
 * `InjectorType`.
 *
 * Options:
 *
 * * `factory`: an `InjectorType` is an instantiable type, so a zero argument `factory` function to
 *   create the type must be provided. If that factory function needs to inject arguments, it can
 *   use the `inject` function.
 * * `providers`: an optional array of providers to add to the injector. Each provider must
 *   either have a factory or point to a type which has an `ngInjectableDef` static property (the
 *   type must be an `InjectableType`).
 * * `imports`: an optional array of imports of other `InjectorType`s or `InjectorTypeWithModule`s
 *   whose providers will also be added to the injector. Locally provided types will override
 *   providers from imports.
 *
 * @publicApi
 */
export function ɵɵdefineInjector(options: {factory: () => any, providers?: any[], imports?: any[]}):
    never {
  return ({
    factory: options.factory, providers: options.providers || [], imports: options.imports || [],
  } as ɵɵInjectorDef<any>) as never;
}

/**
 * Read the `ngInjectableDef` for `type` in a way which is immune to accidentally reading inherited
 * value.
 *
 * @param type A type which may have its own (non-inherited) `ngInjectableDef`.
 */
export function getInjectableDef<T>(type: any): ɵɵInjectableDef<T>|null {
  const def = type[NG_INJECTABLE_DEF] as ɵɵInjectableDef<T>;
  // The definition read above may come from a base class. `hasOwnProperty` is not sufficient to
  // distinguish this case, as in older browsers (e.g. IE10) static property inheritance is
  // implemented by copying the properties.
  //
  // Instead, the ngInjectableDef's token is compared to the type, and if they don't match then the
  // property was not defined directly on the type itself, and was likely inherited. The definition
  // is only returned if the type matches the def.token.
  return def && def.token === type ? def : null;
}

/**
 * Read the `ngInjectableDef` for `type` or read the `ngInjectableDef` from one of its ancestors.
 *
 * @param type A type which may have `ngInjectableDef`, via inheritance.
 *
 * @deprecated Will be removed in v10, where an error will occur in the scenario if we find the
 * `ngInjectableDef` on an ancestor only.
 */
export function getInheritedInjectableDef<T>(type: any): ɵɵInjectableDef<T>|null {
  if (type && type[NG_INJECTABLE_DEF]) {
    // TODO(FW-1307): Re-add ngDevMode when closure can handle it
    // ngDevMode &&
    console.warn(
        `DEPRECATED: DI is instantiating a token "${type.name}" that inherits its @Injectable decorator but does not provide one itself.\n` +
        `This will become an error in v10. Please add @Injectable() to the "${type.name}" class.`);
    return type[NG_INJECTABLE_DEF];
  } else {
    return null;
  }
}

/**
 * Read the `ngInjectorDef` type in a way which is immune to accidentally reading inherited value.
 *
 * @param type type which may have `ngInjectorDef`
 */
export function getInjectorDef<T>(type: any): ɵɵInjectorDef<T>|null {
  return type && type.hasOwnProperty(NG_INJECTOR_DEF) ? (type as any)[NG_INJECTOR_DEF] : null;
}

export const NG_INJECTABLE_DEF = getClosureSafeProperty({ngInjectableDef: getClosureSafeProperty});
export const NG_INJECTOR_DEF = getClosureSafeProperty({ngInjectorDef: getClosureSafeProperty});
