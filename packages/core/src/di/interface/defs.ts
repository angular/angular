/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
 * `Injector`, `NgModule`, or a special scope (e.g. `'root'`). A value of `null` indicates
 * that the injectable does not belong to any scope.
 *
 * @codeGenApi
 * @publicApi The ViewEngine compiler emits code with this type for injectables. This code is
 *   deployed to npm, and should be treated as public api.

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
  providedIn: InjectorType<any>|'root'|'platform'|'any'|null;

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
 * @codeGenApi
 */
export interface ɵɵInjectorDef<T> {
  // TODO(alxhub): Narrow down the type here once decorators properly change the return type of the
  // class they are decorating (to add the ɵprov property for example).
  providers: (Type<any>|ValueProvider|ExistingProvider|FactoryProvider|ConstructorProvider|
              StaticClassProvider|ClassProvider|any[])[];

  imports: (InjectorType<any>|InjectorTypeWithProviders<any>)[];
}

/**
 * A `Type` which has an `InjectableDef` static field.
 *
 * `InjectableType`s contain their own Dependency Injection metadata and are usable in an
 * `InjectorDef`-based `StaticInjector.
 *
 * @publicApi
 */
export interface InjectableType<T> extends Type<T> {
  /**
   * Opaque type whose structure is highly version dependent. Do not rely on any properties.
   */
  ɵprov: unknown;
}

/**
 * A type which has an `InjectorDef` static field.
 *
 * `InjectorTypes` can be used to configure a `StaticInjector`.
 *
 * This is an opaque type whose structure is highly version dependent. Do not rely on any
 * properties.
 *
 * @publicApi
 */
export interface InjectorType<T> extends Type<T> {
  ɵfac?: unknown;
  ɵinj: unknown;
}

/**
 * Describes the `InjectorDef` equivalent of a `ModuleWithProviders`, an `InjectorType` with an
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
 * This should be assigned to a static `ɵprov` field on a type, which will then be an
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
 * @publicApi This instruction has been emitted by ViewEngine for some time and is deployed to npm.
 */
export function ɵɵdefineInjectable<T>(opts: {
  token: unknown,
  providedIn?: Type<any>|'root'|'platform'|'any'|null, factory: () => T,
}): unknown {
  return {
    token: opts.token,
    providedIn: opts.providedIn as any || null,
    factory: opts.factory,
    value: undefined,
  } as ɵɵInjectableDef<T>;
}

/**
 * @deprecated in v8, delete after v10. This API should be used only by generated code, and that
 * code should now use ɵɵdefineInjectable instead.
 * @publicApi
 */
export const defineInjectable = ɵɵdefineInjectable;

/**
 * Construct an `InjectorDef` which configures an injector.
 *
 * This should be assigned to a static injector def (`ɵinj`) field on a type, which will then be an
 * `InjectorType`.
 *
 * Options:
 *
 * * `providers`: an optional array of providers to add to the injector. Each provider must
 *   either have a factory or point to a type which has a `ɵprov` static property (the
 *   type must be an `InjectableType`).
 * * `imports`: an optional array of imports of other `InjectorType`s or `InjectorTypeWithModule`s
 *   whose providers will also be added to the injector. Locally provided types will override
 *   providers from imports.
 *
 * @codeGenApi
 */
export function ɵɵdefineInjector(options: {providers?: any[], imports?: any[]}): unknown {
  return {providers: options.providers || [], imports: options.imports || []};
}

/**
 * Read the injectable def (`ɵprov`) for `type` in a way which is immune to accidentally reading
 * inherited value.
 *
 * @param type A type which may have its own (non-inherited) `ɵprov`.
 */
export function getInjectableDef<T>(type: any): ɵɵInjectableDef<T>|null {
  return getOwnDefinition(type, NG_PROV_DEF) || getOwnDefinition(type, NG_INJECTABLE_DEF);
}

/**
 * Return definition only if it is defined directly on `type` and is not inherited from a base
 * class of `type`.
 */
function getOwnDefinition<T>(type: any, field: string): ɵɵInjectableDef<T>|null {
  return type.hasOwnProperty(field) ? type[field] : null;
}

/**
 * Read the injectable def (`ɵprov`) for `type` or read the `ɵprov` from one of its ancestors.
 *
 * @param type A type which may have `ɵprov`, via inheritance.
 *
 * @deprecated Will be removed in a future version of Angular, where an error will occur in the
 *     scenario if we find the `ɵprov` on an ancestor only.
 */
export function getInheritedInjectableDef<T>(type: any): ɵɵInjectableDef<T>|null {
  const def = type && (type[NG_PROV_DEF] || type[NG_INJECTABLE_DEF]);

  if (def) {
    const typeName = getTypeName(type);
    // TODO(FW-1307): Re-add ngDevMode when closure can handle it
    // ngDevMode &&
    console.warn(
        `DEPRECATED: DI is instantiating a token "${
            typeName}" that inherits its @Injectable decorator but does not provide one itself.\n` +
        `This will become an error in a future version of Angular. Please add @Injectable() to the "${
            typeName}" class.`);
    return def;
  } else {
    return null;
  }
}

/** Gets the name of a type, accounting for some cross-browser differences. */
function getTypeName(type: any): string {
  // `Function.prototype.name` behaves differently between IE and other browsers. In most browsers
  // it'll always return the name of the function itself, no matter how many other functions it
  // inherits from. On IE the function doesn't have its own `name` property, but it takes it from
  // the lowest level in the prototype chain. E.g. if we have `class Foo extends Parent` most
  // browsers will evaluate `Foo.name` to `Foo` while IE will return `Parent`. We work around
  // the issue by converting the function to a string and parsing its name out that way via a regex.
  if (type.hasOwnProperty('name')) {
    return type.name;
  }

  const match = ('' + type).match(/^function\s*([^\s(]+)/);
  return match === null ? '' : match[1];
}

/**
 * Read the injector def type in a way which is immune to accidentally reading inherited value.
 *
 * @param type type which may have an injector def (`ɵinj`)
 */
export function getInjectorDef<T>(type: any): ɵɵInjectorDef<T>|null {
  return type && (type.hasOwnProperty(NG_INJ_DEF) || type.hasOwnProperty(NG_INJECTOR_DEF)) ?
      (type as any)[NG_INJ_DEF] :
      null;
}

export const NG_PROV_DEF = getClosureSafeProperty({ɵprov: getClosureSafeProperty});
export const NG_INJ_DEF = getClosureSafeProperty({ɵinj: getClosureSafeProperty});

// We need to keep these around so we can read off old defs if new defs are unavailable
export const NG_INJECTABLE_DEF = getClosureSafeProperty({ngInjectableDef: getClosureSafeProperty});
export const NG_INJECTOR_DEF = getClosureSafeProperty({ngInjectorDef: getClosureSafeProperty});
