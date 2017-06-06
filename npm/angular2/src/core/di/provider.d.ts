import { Type } from 'angular2/src/facade/lang';
/**
 * Describes how the {@link Injector} should instantiate a given token.
 *
 * See {@link provide}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/GNAyj6K6PfYg2NBzgwZ5?p%3Dpreview&p=preview))
 *
 * ```javascript
 * var injector = Injector.resolveAndCreate([
 *   new Provider("message", { useValue: 'Hello' })
 * ]);
 *
 * expect(injector.get("message")).toEqual('Hello');
 * ```
 * @ts2dart_const
 */
export declare class Provider {
    /**
     * Token used when retrieving this provider. Usually, it is a type {@link Type}.
     */
    token: any;
    /**
     * Binds a DI token to an implementation class.
     *
     * ### Example ([live demo](http://plnkr.co/edit/RSTG86qgmoxCyj9SWPwY?p=preview))
     *
     * Because `useExisting` and `useClass` are often confused, the example contains
     * both use cases for easy comparison.
     *
     * ```typescript
     * class Vehicle {}
     *
     * class Car extends Vehicle {}
     *
     * var injectorClass = Injector.resolveAndCreate([
     *   Car,
     *   {provide: Vehicle,  useClass: Car }
     * ]);
     * var injectorAlias = Injector.resolveAndCreate([
     *   Car,
     *   {provide: Vehicle,  useExisting: Car }
     * ]);
     *
     * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
     * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
     *
     * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
     * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
     * ```
     */
    useClass: Type;
    /**
     * Binds a DI token to a value.
     *
     * ### Example ([live demo](http://plnkr.co/edit/UFVsMVQIDe7l4waWziES?p=preview))
     *
     * ```javascript
     * var injector = Injector.resolveAndCreate([
     *   new Provider("message", { useValue: 'Hello' })
     * ]);
     *
     * expect(injector.get("message")).toEqual('Hello');
     * ```
     */
    useValue: any;
    /**
     * Binds a DI token to an existing token.
     *
     * {@link Injector} returns the same instance as if the provided token was used.
     * This is in contrast to `useClass` where a separate instance of `useClass` is returned.
     *
     * ### Example ([live demo](http://plnkr.co/edit/QsatsOJJ6P8T2fMe9gr8?p=preview))
     *
     * Because `useExisting` and `useClass` are often confused the example contains
     * both use cases for easy comparison.
     *
     * ```typescript
     * class Vehicle {}
     *
     * class Car extends Vehicle {}
     *
     * var injectorAlias = Injector.resolveAndCreate([
     *   Car,
     *   {provide: Vehicle,  useExisting: Car }
     * ]);
     * var injectorClass = Injector.resolveAndCreate([
     *   Car,
     *   {provide: Vehicle,  useClass: Car }
     * ]);
     *
     * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
     * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
     *
     * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
     * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
     * ```
     */
    useExisting: any;
    /**
     * Binds a DI token to a function which computes the value.
     *
     * ### Example ([live demo](http://plnkr.co/edit/Scoxy0pJNqKGAPZY1VVC?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   {provide: Number,  useFactory: () => { return 1+2; }},
     *   new Provider(String, { useFactory: (value) => { return "Value: " + value; },
     *                       deps: [Number] })
     * ]);
     *
     * expect(injector.get(Number)).toEqual(3);
     * expect(injector.get(String)).toEqual('Value: 3');
     * ```
     *
     * Used in conjunction with dependencies.
     */
    useFactory: Function;
    /**
     * Specifies a set of dependencies
     * (as `token`s) which should be injected into the factory function.
     *
     * ### Example ([live demo](http://plnkr.co/edit/Scoxy0pJNqKGAPZY1VVC?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   {provide: Number,  useFactory: () => { return 1+2; }},
     *   new Provider(String, { useFactory: (value) => { return "Value: " + value; },
     *                       deps: [Number] })
     * ]);
     *
     * expect(injector.get(Number)).toEqual(3);
     * expect(injector.get(String)).toEqual('Value: 3');
     * ```
     *
     * Used in conjunction with `useFactory`.
     */
    dependencies: Object[];
    constructor(token: any, {useClass, useValue, useExisting, useFactory, deps, multi}: {
        useClass?: Type;
        useValue?: any;
        useExisting?: any;
        useFactory?: Function;
        deps?: Object[];
        multi?: boolean;
    });
    /**
     * Creates multiple providers matching the same token (a multi-provider).
     *
     * Multi-providers are used for creating pluggable service, where the system comes
     * with some default providers, and the user can register additional providers.
     * The combination of the default providers and the additional providers will be
     * used to drive the behavior of the system.
     *
     * ### Example
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   new Provider("Strings", { useValue: "String1", multi: true}),
     *   new Provider("Strings", { useValue: "String2", multi: true})
     * ]);
     *
     * expect(injector.get("Strings")).toEqual(["String1", "String2"]);
     * ```
     *
     * Multi-providers and regular providers cannot be mixed. The following
     * will throw an exception:
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   new Provider("Strings", { useValue: "String1", multi: true }),
     *   new Provider("Strings", { useValue: "String2"})
     * ]);
     * ```
     */
    multi: boolean;
}
/**
 * See {@link Provider} instead.
 *
 * @deprecated
 * @ts2dart_const
 */
export declare class Binding extends Provider {
    constructor(token: any, {toClass, toValue, toAlias, toFactory, deps, multi}: {
        toClass?: Type;
        toValue?: any;
        toAlias?: any;
        toFactory: Function;
        deps?: Object[];
        multi?: boolean;
    });
    /**
     * @deprecated
     */
    toClass: Type;
    /**
     * @deprecated
     */
    toAlias: any;
    /**
     * @deprecated
     */
    toFactory: Function;
    /**
     * @deprecated
     */
    toValue: any;
}
/**
 * Creates a {@link Provider}.
 *
 * To construct a {@link Provider}, bind a `token` to either a class, a value, a factory function,
 * or
 * to an existing `token`.
 * See {@link ProviderBuilder} for more details.
 *
 * The `token` is most commonly a class or {@link OpaqueToken-class.html}.
 *
 * @deprecated
 */
export declare function bind(token: any): ProviderBuilder;
/**
 * Helper class for the {@link bind} function.
 */
export declare class ProviderBuilder {
    token: any;
    constructor(token: any);
    /**
     * Binds a DI token to a class.
     *
     * ### Example ([live demo](http://plnkr.co/edit/ZpBCSYqv6e2ud5KXLdxQ?p=preview))
     *
     * Because `toAlias` and `toClass` are often confused, the example contains
     * both use cases for easy comparison.
     *
     * ```typescript
     * class Vehicle {}
     *
     * class Car extends Vehicle {}
     *
     * var injectorClass = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useClass: Car})
     * ]);
     * var injectorAlias = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useExisting: Car})
     * ]);
     *
     * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
     * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
     *
     * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
     * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
     * ```
     */
    toClass(type: Type): Provider;
    /**
     * Binds a DI token to a value.
     *
     * ### Example ([live demo](http://plnkr.co/edit/G024PFHmDL0cJFgfZK8O?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide('message', {useValue: 'Hello'})
     * ]);
     *
     * expect(injector.get('message')).toEqual('Hello');
     * ```
     */
    toValue(value: any): Provider;
    /**
     * Binds a DI token to an existing token.
     *
     * Angular will return the same instance as if the provided token was used. (This is
     * in contrast to `useClass` where a separate instance of `useClass` will be returned.)
     *
     * ### Example ([live demo](http://plnkr.co/edit/uBaoF2pN5cfc5AfZapNw?p=preview))
     *
     * Because `toAlias` and `toClass` are often confused, the example contains
     * both use cases for easy comparison.
     *
     * ```typescript
     * class Vehicle {}
     *
     * class Car extends Vehicle {}
     *
     * var injectorAlias = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useExisting: Car})
     * ]);
     * var injectorClass = Injector.resolveAndCreate([
     *   Car,
     *   provide(Vehicle, {useClass: Car})
     * ]);
     *
     * expect(injectorAlias.get(Vehicle)).toBe(injectorAlias.get(Car));
     * expect(injectorAlias.get(Vehicle) instanceof Car).toBe(true);
     *
     * expect(injectorClass.get(Vehicle)).not.toBe(injectorClass.get(Car));
     * expect(injectorClass.get(Vehicle) instanceof Car).toBe(true);
     * ```
     */
    toAlias(aliasToken: any): Provider;
    /**
     * Binds a DI token to a function which computes the value.
     *
     * ### Example ([live demo](http://plnkr.co/edit/OejNIfTT3zb1iBxaIYOb?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide(Number, {useFactory: () => { return 1+2; }}),
     *   provide(String, {useFactory: (v) => { return "Value: " + v; }, deps: [Number]})
     * ]);
     *
     * expect(injector.get(Number)).toEqual(3);
     * expect(injector.get(String)).toEqual('Value: 3');
     * ```
     */
    toFactory(factory: Function, dependencies?: any[]): Provider;
}
/**
 * Creates a {@link Provider}.
 *
 * See {@link Provider} for more details.
 *
 * <!-- TODO: improve the docs -->
 */
export declare function provide(token: any, {useClass, useValue, useExisting, useFactory, deps, multi}: {
    useClass?: Type;
    useValue?: any;
    useExisting?: any;
    useFactory?: Function;
    deps?: Object[];
    multi?: boolean;
}): Provider;
