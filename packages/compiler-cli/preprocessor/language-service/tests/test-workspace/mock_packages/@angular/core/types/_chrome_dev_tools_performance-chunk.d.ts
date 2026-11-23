/**
 * @license Angular v22.3.0-next.0+sha-95e8dec
 * (c) 2010-2026 Google LLC. https://angular.dev/
 * License: MIT
 */

import { SIGNAL } from './_formatter-chunk.js';
import * as _angular_core from '@angular/core';
import { EventContract } from './_event_dispatcher-chunk.js';

/** Symbol used distinguish `WritableSignal` from other non-writable signals and functions. */
declare const ɵWRITABLE_SIGNAL: unique symbol;
/**
 * A `Signal` with a value that can be mutated via a setter interface.
 *
 * @publicApi 17.0
 */
interface WritableSignal<T> extends Signal<T> {
    [ɵWRITABLE_SIGNAL]: T;
    /**
     * Directly set the signal to a new value, and notify any dependents.
     */
    set(value: T): void;
    /**
     * Update the value of the signal based on its current value, and
     * notify any dependents.
     */
    update(updateFn: (value: T) => T): void;
    /**
     * Returns a readonly version of this signal. Readonly signals can be accessed to read their value
     * but can't be changed using set or update methods. The readonly signals do _not_ have
     * any built-in mechanism that would prevent deep-mutation of their value.
     */
    asReadonly(): Signal<T>;
}
/**
 * Utility function used during template type checking to extract the value from a `WritableSignal`.
 * @codeGenApi
 */
declare function ɵunwrapWritableSignal<T>(value: T | {
    [ɵWRITABLE_SIGNAL]: T;
}): T;
/**
 * Options passed to the `signal` creation function.
 */
interface CreateSignalOptions<T> {
    /**
     * A comparison function which defines equality for signal values.
     */
    equal?: ValueEqualityFn<T>;
    /**
     * A debug name for the signal. Used in Angular DevTools to identify the signal.
     */
    debugName?: string;
}
/**
 * Create a `Signal` that can be set or updated directly.
 * @see [Angular Signals](guide/signals)
 */
declare function signal<T>(initialValue: T, options?: CreateSignalOptions<T>): WritableSignal<T>;

/**
 * A reactive value which notifies consumers of any changes.
 *
 * Signals are functions which returns their current value. To access the current value of a signal,
 * call it.
 *
 * Ordinary values can be turned into `Signal`s with the `signal` function.
 *
 * @see [What are signals?](guide/signals#what-are-signals)
 *
 * @publicApi 17.0
 */
type Signal<T> = (() => T) & {
    [SIGNAL]: unknown;
};
/**
 * Checks if the given `value` is a reactive `Signal`.
 *
 * @see [Type checking signals](guide/signals#type-checking-signals)
 *
 * @publicApi 17.0
 */
declare function isSignal(value: unknown): value is Signal<unknown>;
/**
 * A comparison function which can determine if two values are equal.
 *
 * @see [Signal equality functions](guide/signals#signal-equality-functions)
 *
 * @publicApi 17.0
 */
type ValueEqualityFn<T> = (a: T, b: T) => boolean;
/**
 * Checks if the given `value` is a writeable signal.
 *
 * @see [Type checking signals](guide/signals#type-checking-signals)
 *
 * @publicApi 21.1
 */
declare function isWritableSignal(value: unknown): value is WritableSignal<unknown>;

/**
 * Function that can be used to manually clean up a
 * programmatic {@link OutputRef#subscribe} subscription.
 *
 * Note: Angular will automatically clean up subscriptions
 * when the directive/component of the output is destroyed.
 *
 * @see [Subscribing to outputs programmatically](guide/components/outputs#subscribing-to-outputs-programmatically)
 *
 * @publicAPI
 */
interface OutputRefSubscription {
    unsubscribe(): void;
}
/**
 * A reference to an Angular output.
 *
 * @publicAPI
 * @see [Subscribing to outputs programmatically](guide/components/outputs#subscribing-to-outputs-programmatically)
 */
interface OutputRef<T> {
    /**
     * Registers a callback that is invoked whenever the output
     * emits a new value of type `T`.
     *
     * Angular will automatically clean up the subscription when
     * the directive/component of the output is destroyed.
     */
    subscribe(callback: (value: T) => void): OutputRefSubscription;
}

/**
 * @description
 *
 * Represents an abstract class `T`, if applied to a concrete class it would stop being
 * instantiable.
 *
 * @publicApi
 */
interface AbstractType<T> extends Function {
    prototype: T;
}
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
 * Returns a writable type version of type.
 *
 * USAGE:
 * Given:
 * ```ts
 * interface Person {readonly name: string}
 * ```
 *
 * We would like to get a read/write version of `Person`.
 * ```ts
 * const WritablePerson = Writable<Person>;
 * ```
 *
 * The result is that you can do:
 *
 * ```ts
 * const readonlyPerson: Person = {name: 'Marry'};
 * readonlyPerson.name = 'John'; // TypeError
 * (readonlyPerson as WritablePerson).name = 'John'; // OK
 *
 * // Error: Correctly detects that `Person` did not have `age` property.
 * (readonlyPerson as WritablePerson).age = 30;
 * ```
 */
type Writable<T> = {
    -readonly [K in keyof T]: T[K];
};

/**
 * Creates a token that can be used in a DI Provider.
 *
 * Use an `InjectionToken` whenever the type you are injecting is not reified (does not have a
 * runtime representation) such as when injecting an interface, callable type, array or
 * parameterized type.
 *
 * `InjectionToken` is parameterized on `T` which is the type of object which will be returned by
 * the `Injector`. This provides an additional level of type safety.
 *
 * <div class="docs-alert docs-alert-helpful">
 *
 * **Important Note**: Ensure that you use the same instance of the `InjectionToken` in both the
 * provider and the injection call. Creating a new instance of `InjectionToken` in different places,
 * even with the same description, will be treated as different tokens by Angular's DI system,
 * leading to a `NullInjectorError`.
 *
 * </div>
 *
 * {@example injection-token/src/main.ts region='InjectionToken'}
 *
 * When creating an `InjectionToken`, you can optionally specify a factory function which returns
 * (possibly by creating) a default value of the parameterized type `T`. This sets up the
 * `InjectionToken` using this factory as a provider as if it was defined explicitly in the
 * application's root injector. If the factory function, which takes zero arguments, needs to inject
 * dependencies, it can do so using the [`inject`](api/core/inject) function.
 * As you can see in the Tree-shakable InjectionToken example below.
 *
 * Additionally, if a `factory` is specified you can also specify the `providedIn` option, which
 * overrides the above behavior and marks the token as belonging to a particular `@NgModule` (note:
 * this option is now deprecated). As mentioned above, `'root'` is the default value for
 * `providedIn`.
 *
 * The `providedIn: NgModule` and `providedIn: 'any'` options are deprecated.
 *
 * @usageNotes
 * ### Basic Examples
 *
 * ### Plain InjectionToken
 *
 * {@example core/di/ts/injector_spec.ts region='InjectionToken'}
 *
 * ### Tree-shakable InjectionToken
 *
 * {@example core/di/ts/injector_spec.ts region='ShakableInjectionToken'}
 *
 *
 * @see [What is an InjectionToken?](guide/di/defining-dependency-providers#what-is-an-injectiontoken)
 *
 * @publicApi
 */
declare class InjectionToken<T> {
    protected _desc: string;
    readonly ɵprov: unknown;
    /**
     * @deprecated The `providedIn: NgModule` or `providedIn:'any'` options are deprecated. Please use the other signature.
     */
    constructor(_desc: string, options: {
        providedIn: Type<any> | 'any';
        factory: () => T;
    });
    /**
     * @param _desc   Description for the token,
     *                used only for debugging purposes,
     *                it should but does not need to be unique
     * @param options Options for the token's usage, as described above
     */
    constructor(_desc: string, options?: {
        providedIn?: Type<any> | 'root' | 'platform' | 'any' | null;
        factory: () => T;
    });
    toString(): string;
}

/**
 * Configures the `Injector` to return a value for a token.
 * Base for `ValueProvider` decorator.
 *
 * @publicApi
 */
interface ValueSansProvider {
    /**
     * The value to inject.
     */
    useValue: any;
}
/**
 * Configures the `Injector` to return a value for a token.
 * @see [Dependency Injection Guide](guide/di)
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example core/di/ts/provider_spec.ts region='ValueProvider'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
interface ValueProvider extends ValueSansProvider {
    /**
     * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
     */
    provide: any;
    /**
     * When true, injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     */
    multi?: boolean;
}
/**
 * Configures the `Injector` to return an instance of `useClass` for a token.
 * Base for `StaticClassProvider` decorator.
 *
 * @publicApi
 */
interface StaticClassSansProvider {
    /**
     * An optional class to instantiate for the `token`. By default, the `provide`
     * class is instantiated.
     */
    useClass: Type<any>;
    /**
     * A list of `token`s to be resolved by the injector. The list of values is then
     * used as arguments to the `useClass` constructor.
     */
    deps: any[];
}
/**
 * Configures the `Injector` to return an instance of `useClass` for a token.
 * @see [Dependency Injection Guide](guide/di)
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='StaticClassProvider'}
 *
 * Note that following two providers are not equal:
 *
 * {@example core/di/ts/provider_spec.ts region='StaticClassProviderDifference'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
interface StaticClassProvider extends StaticClassSansProvider {
    /**
     * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
     */
    provide: any;
    /**
     * When true, injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     */
    multi?: boolean;
}
/**
 * Configures the `Injector` to return an instance of a token.
 *
 * @see [Dependency Injection Guide](guide/di)
 *
 * @usageNotes
 *
 * ```ts
 * @Injectable(SomeModule, {deps: []})
 * class MyService {}
 * ```
 *
 * @publicApi
 */
interface ConstructorSansProvider {
    /**
     * A list of `token`s to be resolved by the injector.
     */
    deps?: any[];
}
/**
 * Configures the `Injector` to return an instance of a token.
 *
 * @see [Dependency Injection Guide](guide/di)
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='ConstructorProvider'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
interface ConstructorProvider extends ConstructorSansProvider {
    /**
     * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
     */
    provide: Type<any>;
    /**
     * When true, injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     */
    multi?: boolean;
}
/**
 * Configures the `Injector` to return a value of another `useExisting` token.
 *
 * @see {@link ExistingProvider}
 * @see [Dependency Injection Guide](guide/di)
 *
 * @publicApi
 */
interface ExistingSansProvider {
    /**
     * Existing `token` to return. (Equivalent to `injector.get(useExisting)`)
     */
    useExisting: any;
}
/**
 * Configures the `Injector` to return a value of another `useExisting` token.
 *
 * @see [Dependency Injection Guide](guide/di)
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='ExistingProvider'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
interface ExistingProvider extends ExistingSansProvider {
    /**
     * An injection token. Typically an instance of `Type` or `InjectionToken`, but can be `any`.
     */
    provide: any;
    /**
     * When true, injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     */
    multi?: boolean;
}
/**
 * Configures the `Injector` to return a value by invoking a `useFactory` function.
 *
 * @see {@link FactoryProvider}
 * @see [Dependency Injection Guide](guide/di)
 *
 * @publicApi
 */
interface FactorySansProvider {
    /**
     * A function to invoke to create a value for this `token`. The function is invoked with
     * resolved values of `token`s in the `deps` field.
     */
    useFactory: Function;
    /**
     * A list of `token`s to be resolved by the injector. The list of values is then
     * used as arguments to the `useFactory` function.
     */
    deps?: any[];
}
/**
 * Configures the `Injector` to return a value by invoking a `useFactory` function.
 * @see [Dependency Injection Guide](guide/di)
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='FactoryProvider'}
 *
 * Dependencies can also be marked as optional:
 *
 * {@example core/di/ts/provider_spec.ts region='FactoryProviderOptionalDeps'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
interface FactoryProvider extends FactorySansProvider {
    /**
     * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
     */
    provide: any;
    /**
     * When true, injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     */
    multi?: boolean;
}
/**
 * Describes how an `Injector` should be configured as static (that is, without reflection).
 * A static provider provides tokens to an injector for various types of dependencies.
 *
 * @see {@link Injector.create()}
 * @see [Dependency Injection Guide](guide/di/defining-dependency-providers).
 *
 * @publicApi
 */
type StaticProvider = ValueProvider | ExistingProvider | StaticClassProvider | ConstructorProvider | FactoryProvider | any[];
/**
 * Configures the `Injector` to return an instance of `Type` when `Type` is used as the token.
 *
 * Create an instance by invoking the `new` operator and supplying additional arguments.
 * This form is a short form of `TypeProvider`;
 *
 * For more details, see the ["Dependency Injection Guide"](guide/di).
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='TypeProvider'}
 *
 * @publicApi
 */
interface TypeProvider extends Type<any> {
}
/**
 * Configures the `Injector` to return a value by invoking a `useClass` function.
 * Base for `ClassProvider` decorator.
 *
 * @see [Dependency Injection Guide](guide/di)
 *
 * @publicApi
 */
interface ClassSansProvider {
    /**
     * Class to instantiate for the `token`.
     */
    useClass: Type<any>;
}
/**
 * Configures the `Injector` to return an instance of `useClass` for a token.
 * @see [Dependency Injection Guide](guide/di)
 *
 * @usageNotes
 *
 * {@example core/di/ts/provider_spec.ts region='ClassProvider'}
 *
 * Note that following two providers are not equal:
 *
 * {@example core/di/ts/provider_spec.ts region='ClassProviderDifference'}
 *
 * ### Multi-value example
 *
 * {@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
 *
 * @publicApi
 */
interface ClassProvider extends ClassSansProvider {
    /**
     * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
     */
    provide: any;
    /**
     * When true, injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     */
    multi?: boolean;
}
/**
 * Describes how the `Injector` should be configured.
 * @see [Dependency Injection Guide](guide/di)
 *
 * @see {@link StaticProvider}
 *
 * @publicApi
 */
type Provider = TypeProvider | ValueProvider | ClassProvider | ConstructorProvider | ExistingProvider | FactoryProvider | any[];
/**
 * Encapsulated `Provider`s that are only accepted during creation of an `EnvironmentInjector` (e.g.
 * in an `NgModule`).
 *
 * Using this wrapper type prevents providers which are only designed to work in
 * application/environment injectors from being accidentally included in
 * `@Component.providers` and ending up in a component injector.
 *
 * This wrapper type prevents access to the `Provider`s inside.
 *
 * @see {@link makeEnvironmentProviders}
 * @see {@link importProvidersFrom}
 *
 * @publicApi
 */
type EnvironmentProviders = {
    ɵbrand: 'EnvironmentProviders';
};
interface InternalEnvironmentProviders extends EnvironmentProviders {
    ɵproviders: (Provider | EnvironmentProviders)[];
    /**
     * If present, indicates that the `EnvironmentProviders` were derived from NgModule providers.
     *
     * This is used to produce clearer error messages.
     */
    ɵfromNgModule?: true;
}
declare function isEnvironmentProviders(value: Provider | EnvironmentProviders | InternalEnvironmentProviders): value is InternalEnvironmentProviders;
/**
 * Describes a function that is used to process provider lists (such as provider
 * overrides).
 */
type ProcessProvidersFunction = (providers: Provider[]) => Provider[];
/**
 * A wrapper around an NgModule that associates it with providers
 * Usage without a generic type is deprecated.
 *
 * @publicApi
 */
interface ModuleWithProviders<T> {
    ngModule: Type<T>;
    providers?: Array<Provider | EnvironmentProviders>;
}

/**
 * This enum is an exact copy of the `InjectFlags` enum above, but the difference is that this is a
 * const enum, so actual enum values would be inlined in generated code. The `InjectFlags` enum can
 * be turned into a const enum when ViewEngine is removed (see TODO at the `InjectFlags` enum
 * above). The benefit of inlining is that we can use these flags at the top level without affecting
 * tree-shaking (see "no-toplevel-property-access" tslint rule for more info).
 * Keep this enum in sync with `InjectFlags` enum above.
 */
declare const enum InternalInjectFlags {
    /** Check self and check parent injector if needed */
    Default = 0,
    /**
     * Specifies that an injector should retrieve a dependency from any injector until reaching the
     * host element of the current component. (Only used with Element Injector)
     */
    Host = 1,
    /** Don't ascend to ancestors of the node requesting injection. */
    Self = 2,
    /** Skip the node that is requesting injection. */
    SkipSelf = 4,
    /** Inject `defaultValue` instead if token not found. */
    Optional = 8,
    /**
     * This token is being injected into a pipe.
     *
     * This flag is intentionally not in the public facing `InjectFlags` because it is only added by
     * the compiler and is not a developer applicable flag.
     */
    ForPipe = 16
}
/**
 * Type of the options argument to [`inject`](api/core/inject).
 *
 * @publicApi
 */
interface InjectOptions {
    /**
     * Use optional injection, and return `null` if the requested token is not found.
     */
    optional?: boolean;
    /**
     * Start injection at the parent of the current injector.
     */
    skipSelf?: boolean;
    /**
     * Only query the current injector for the token, and don't fall back to the parent injector if
     * it's not found.
     */
    self?: boolean;
    /**
     * Stop injection at the host component's injector. Only relevant when injecting from an element
     * injector, and a no-op for environment injectors.
     */
    host?: boolean;
}

/**
 * @description
 *
 * Token that can be used to retrieve an instance from an injector or through a query.
 *
 * @publicApi
 */
type ProviderToken<T> = Type<T> | AbstractType<T> | InjectionToken<T>;

/**
 * Concrete injectors implement this interface. Injectors are configured
 * with [providers](guide/di/defining-dependency-providers) that associate
 * dependencies of various types with [injection tokens](guide/di/defining-dependency-providers).
 *
 * @see [DI Providers](guide/di/defining-dependency-providers).
 * @see {@link StaticProvider}
 *
 * @usageNotes
 *
 *  The following example creates a service injector instance.
 *
 * {@example core/di/ts/provider_spec.ts region='ConstructorProvider'}
 *
 * ### Usage example
 *
 * {@example core/di/ts/injector_spec.ts region='Injector'}
 *
 * `Injector` returns itself when given `Injector` as a token:
 *
 * {@example core/di/ts/injector_spec.ts region='injectInjector'}
 *
 * @see [Types of injector hierarchies](guide/di/hierarchical-dependency-injection#types-of-injector-hierarchies)
 *
 * @publicApi
 */
declare abstract class Injector {
    static THROW_IF_NOT_FOUND: {};
    static NULL: Injector;
    /**
     * Retrieves an instance from the injector based on the provided token.
     * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
     * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
     */
    abstract get<T>(token: ProviderToken<T>, notFoundValue: undefined, options: InjectOptions & {
        optional?: false;
    }): T;
    /**
     * Retrieves an instance from the injector based on the provided token.
     * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
     * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
     */
    abstract get<T>(token: ProviderToken<T>, notFoundValue: null | undefined, options: InjectOptions): T | null;
    /**
     * Retrieves an instance from the injector based on the provided token.
     * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
     * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
     */
    abstract get<T>(token: ProviderToken<T>, notFoundValue?: T, options?: InjectOptions): T;
    /**
     * @deprecated from v4.0.0 use ProviderToken<T>
     * @suppress {duplicate}
     */
    abstract get<T>(token: string | ProviderToken<T>, notFoundValue?: any): any;
    /**
     * @deprecated from v5 use the new signature Injector.create(options)
     */
    static create(providers: StaticProvider[], parent?: Injector): Injector;
    /**
     * Creates a new injector instance that provides one or more dependencies,
     * according to a given type or types of `StaticProvider`.
     *
     * @param options An object with the following properties:
     * * `providers`: An array of providers of the [StaticProvider type](api/core/StaticProvider).
     * * `parent`: (optional) A parent injector.
     * * `name`: (optional) A developer-defined identifying name for the new injector.
     *
     * @returns The new injector instance.
     *
     */
    static create(options: {
        providers: Array<Provider | StaticProvider>;
        parent?: Injector;
        name?: string;
    }): DestroyableInjector;
    /** @nocollapse */
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<Injector>;
}
/**
 * An Injector that the owner can destroy and trigger the DestroyRef.destroy hooks.
 *
 * @publicApi
 */
interface DestroyableInjector extends Injector {
    destroy(): void;
}

/**
 * `DestroyRef` lets you set callbacks to run for any cleanup or destruction behavior.
 * The scope of this destruction depends on where `DestroyRef` is injected. If `DestroyRef`
 * is injected in a component or directive, the callbacks run when that component or
 * directive is destroyed. Otherwise the callbacks run when a corresponding injector is destroyed.
 *
 * @see [Lifecycle DestroyRef](guide/components/lifecycle#destroyref)
 *
 * @publicApi
 */
declare abstract class DestroyRef {
    /**
     * Registers a destroy callback in a given lifecycle scope.  Returns a cleanup function that can
     * be invoked to unregister the callback.
     *
     * @usageNotes
     * ### Example
     * ```ts
     * const destroyRef = inject(DestroyRef);
     *
     * // register a destroy callback
     * const unregisterFn = destroyRef.onDestroy(() => doSomethingOnDestroy());
     *
     * // stop the destroy callback from executing if needed
     * unregisterFn();
     * ```
     *
     * @see [Lifecycle DestroyRef](guide/components/lifecycle#destroyref)
     *
     */
    abstract onDestroy(callback: () => void): () => void;
    /**
     * Indicates whether the instance has already been destroyed.
     *
     * @see [Detecting instance destruction](guide/components/lifecycle#detecting-instance-destruction)
     *
     */
    abstract get destroyed(): boolean;
}

declare global {
    /**
     * Indicates whether HMR is enabled for the application.
     *
     * `ngHmrMode` is a global flag set by Angular's CLI.
     *
     * @remarks
     * - **Internal Angular Flag**: This is an *internal* Angular flag (not a public API), avoid relying on it in application code.
     * - **Avoid Direct Use**: This variable is intended for runtime configuration; it should not be accessed directly in application code.
     */
    var ngHmrMode: boolean | undefined;
}

declare global {
    const ngJitMode: boolean;
}

declare global {
    /**
     * Indicates whether the application is operating in server-rendering mode.
     *
     * `ngServerMode` is a global flag set by Angular's server-side rendering mechanisms,
     * typically configured by `provideServerRendering` and `platformServer` during runtime.
     *
     * @remarks
     * - **Internal Angular Flag**: This is an *internal* Angular flag (not a public API), avoid relying on it in application code.
     * - **Avoid Direct Use**: This variable is intended for runtime configuration; it should not be accessed directly in application code.
     */
    var ngServerMode: boolean | undefined;
}

declare global {
    interface Element {
        __jsaction_fns: Map<string, Function[]> | undefined;
    }
}
interface EventContractDetails {
    instance?: EventContract;
}
declare const JSACTION_EVENT_CONTRACT: InjectionToken<EventContractDetails>;
/** Shorthand for an event listener callback function to reduce duplication. */
type EventCallback = (event?: any) => any;

declare global {
    const ngI18nClosureMode: boolean;
}

type TimeStampName = string;
type DevToolsColor = 'primary' | 'primary-light' | 'primary-dark' | 'secondary' | 'secondary-light' | 'secondary-dark' | 'tertiary' | 'tertiary-light' | 'tertiary-dark' | 'error';
declare global {
    interface Console {
        timeStamp(label: string, start: TimeStampName, end?: TimeStampName, trackName?: string, trackGroup?: string, color?: DevToolsColor, detail?: object): void;
    }
}
/**
 * Returns the deep link ID assigned to a component or directive instance by the
 * profiler. This ID is used to construct `angular-devtools://` deep-link URLs in
 * Chrome Performance traces, which allow navigating from a trace entry directly
 * to the corresponding component in the Angular DevTools extension.
 *
 * The ID is `undefined` until `getDeepLinkProperties` is called for the instance
 * (which happens when profiling is active and the DevTools extension is connected).
 * Use `assignComponentInstanceDeepLinkId` to force-assign an ID if needed.
 */
declare function getComponentInstanceDeepLinkId(instance: {}): number | undefined;
/**
 * Start listening to the Angular's internal performance-related events and route those to the Chrome DevTools performance panel.
 * This enables Angular-specific data visualization when recording a performance profile directly in the Chrome DevTools.
 *
 * NOTE: Integration is enabled in the development mode only, this operation is noop in the production mode.
 *
 * @publicApi v21.0
 *
 * @returns a function that can be invoked to stop sending profiling data.
 * @see [Profiling with the Chrome DevTools](best-practices/profiling-with-chrome-devtools#recording-a-profile)
 */
declare function enableProfiling(): () => void;

export { DestroyRef, InjectionToken, Injector, InternalInjectFlags, JSACTION_EVENT_CONTRACT, Type, enableProfiling, getComponentInstanceDeepLinkId, isEnvironmentProviders, isSignal, isWritableSignal, signal, ɵunwrapWritableSignal };
export type { AbstractType, ClassProvider, ClassSansProvider, ConstructorProvider, ConstructorSansProvider, CreateSignalOptions, DestroyableInjector, EnvironmentProviders, EventCallback, ExistingProvider, ExistingSansProvider, FactoryProvider, FactorySansProvider, InjectOptions, InternalEnvironmentProviders, ModuleWithProviders, OutputRef, OutputRefSubscription, ProcessProvidersFunction, Provider, ProviderToken, Signal, StaticClassProvider, StaticClassSansProvider, StaticProvider, TypeProvider, ValueEqualityFn, ValueProvider, ValueSansProvider, Writable, WritableSignal };
