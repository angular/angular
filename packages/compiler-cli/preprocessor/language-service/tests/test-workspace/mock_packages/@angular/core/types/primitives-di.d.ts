/**
 * @license Angular v22.3.0-next.0+sha-95e8dec
 * (c) 2010-2026 Google LLC. https://angular.dev/
 * License: MIT
 */

/**
 * @description
 *
 * Represents a type that a Component or other object is instances of.
 *
 * An example of a `Type` is `MyCustomComponent` class, which in JavaScript is represented by
 * the `MyCustomComponent` constructor function.
 *
 * @publicApi
 */
declare const Type: FunctionConstructor;
interface Type<T> extends Function {
    new (...args: any[]): T;
}

/**
 * Information about how a type or `InjectionToken` interfaces with the DI
 * system. This describes:
 *
 * 1. *How* the type is provided
 *    The declaration must specify only one of the following:
 *    - A `value` which is a predefined instance of the type.
 *    - A `factory` which defines how to create the given type `T`, possibly
 *      requesting injection of other types if necessary.
 *    - Neither, in which case the type is expected to already be present in the
 *      injector hierarchy. This is used for internal use cases.
 *
 * 2. *Where* the type is stored (if it is stored)
 *    - The `providedIn` parameter specifies which injector the type belongs to.
 *    - The `token` is used as the key to store the type in the injector.
 */
interface ɵɵInjectableDeclaration<T> {
    /**
     * Specifies that the given type belongs to a particular `Injector`,
     * `NgModule`, or a special scope (e.g. `'root'`).
     *
     * `any` is deprecated and will be removed soon.
     *
     * A value of `null` indicates that the injectable does not belong to any
     * scope, and won't be stored in any injector. For declarations with a
     * factory, this will create a new instance of the type each time it is
     * requested.
     */
    providedIn: Type<any> | 'root' | 'platform' | 'any' | null;
    /**
     * The token to which this definition belongs.
     *
     * Note that this may not be the same as the type that the `factory` will create.
     */
    token: unknown;
    /**
     * Factory method to execute to create an instance of the injectable.
     */
    factory?: (t?: Type<any>) => any;
    /**
     * In a case of no explicit injector, a location where the instance of the injectable is stored.
     */
    value?: any;
}
/**
 * A `Type` which has a `ɵprov: ɵɵInjectableDeclaration` static field.
 *
 * `InjectableType`s contain their own Dependency Injection metadata and are usable in an
 * `InjectorDef`-based `StaticInjector`.
 *
 * @publicApi
 */
interface InjectionToken<T> {
    ɵprov: ɵɵInjectableDeclaration<T>;
}
declare function defineInjectable<T>(opts: {
    token: unknown;
    providedIn?: Type<any> | 'root' | 'platform' | 'any' | 'environment' | null;
    factory: () => T;
}): ɵɵInjectableDeclaration<T>;
type Constructor<T> = Function & {
    prototype: T;
};
declare function registerInjectable<T>(ctor: unknown, declaration: ɵɵInjectableDeclaration<T>): InjectionToken<T>;

/**
 * Value returned if the key-value pair couldn't be found in the context
 * hierarchy.
 */
declare const NOT_FOUND: unique symbol;
/**
 * Error thrown when the key-value pair couldn't be found in the context
 * hierarchy. Context can be attached below.
 */
declare class NotFoundError extends Error {
    readonly name: string;
    constructor(message: string);
}
/**
 * Type guard for checking if an unknown value is a NotFound.
 */
declare function isNotFound(e: unknown): e is NotFound;
/**
 * Type union of NotFound and NotFoundError.
 */
type NotFound = typeof NOT_FOUND | NotFoundError;

interface Injector {
    retrieve<T>(token: InjectionToken<T>, options?: unknown): T | NotFound;
}
declare function getCurrentInjector(): Injector | undefined | null;
declare function setCurrentInjector(injector: Injector | null | undefined): Injector | undefined | null;
declare function inject<T>(token: InjectionToken<T> | Constructor<T>): T;

export { NOT_FOUND, NotFoundError, defineInjectable, getCurrentInjector, inject, isNotFound, registerInjectable, setCurrentInjector };
export type { InjectionToken, Injector, NotFound, ɵɵInjectableDeclaration };
