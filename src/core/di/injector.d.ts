import { ResolvedProvider, Provider, Dependency } from './provider';
import { Type } from 'angular2/src/facade/lang';
export declare const UNDEFINED: Object;
/**
 * Visibility of a {@link Provider}.
 */
export declare enum Visibility {
    /**
     * A `Public` {@link Provider} is only visible to regular (as opposed to host) child injectors.
     */
    Public = 0,
    /**
     * A `Private` {@link Provider} is only visible to host (as opposed to regular) child injectors.
     */
    Private = 1,
    /**
     * A `PublicAndPrivate` {@link Provider} is visible to both host and regular child injectors.
     */
    PublicAndPrivate = 2,
}
export interface ProtoInjectorStrategy {
    getProviderAtIndex(index: number): ResolvedProvider;
    createInjectorStrategy(inj: Injector): InjectorStrategy;
}
export declare class ProtoInjectorInlineStrategy implements ProtoInjectorStrategy {
    provider0: ResolvedProvider;
    provider1: ResolvedProvider;
    provider2: ResolvedProvider;
    provider3: ResolvedProvider;
    provider4: ResolvedProvider;
    provider5: ResolvedProvider;
    provider6: ResolvedProvider;
    provider7: ResolvedProvider;
    provider8: ResolvedProvider;
    provider9: ResolvedProvider;
    keyId0: number;
    keyId1: number;
    keyId2: number;
    keyId3: number;
    keyId4: number;
    keyId5: number;
    keyId6: number;
    keyId7: number;
    keyId8: number;
    keyId9: number;
    visibility0: Visibility;
    visibility1: Visibility;
    visibility2: Visibility;
    visibility3: Visibility;
    visibility4: Visibility;
    visibility5: Visibility;
    visibility6: Visibility;
    visibility7: Visibility;
    visibility8: Visibility;
    visibility9: Visibility;
    constructor(protoEI: ProtoInjector, bwv: ProviderWithVisibility[]);
    getProviderAtIndex(index: number): ResolvedProvider;
    createInjectorStrategy(injector: Injector): InjectorStrategy;
}
export declare class ProtoInjectorDynamicStrategy implements ProtoInjectorStrategy {
    providers: ResolvedProvider[];
    keyIds: number[];
    visibilities: Visibility[];
    constructor(protoInj: ProtoInjector, bwv: ProviderWithVisibility[]);
    getProviderAtIndex(index: number): ResolvedProvider;
    createInjectorStrategy(ei: Injector): InjectorStrategy;
}
export declare class ProtoInjector {
    static fromResolvedProviders(providers: ResolvedProvider[]): ProtoInjector;
    numberOfProviders: number;
    constructor(bwv: ProviderWithVisibility[]);
    getProviderAtIndex(index: number): ResolvedProvider;
}
export interface InjectorStrategy {
    getObjByKeyId(keyId: number, visibility: Visibility): any;
    getObjAtIndex(index: number): any;
    getMaxNumberOfObjects(): number;
    resetConstructionCounter(): void;
    instantiateProvider(provider: ResolvedProvider, visibility: Visibility): any;
}
export declare class InjectorInlineStrategy implements InjectorStrategy {
    injector: Injector;
    protoStrategy: ProtoInjectorInlineStrategy;
    obj0: any;
    obj1: any;
    obj2: any;
    obj3: any;
    obj4: any;
    obj5: any;
    obj6: any;
    obj7: any;
    obj8: any;
    obj9: any;
    constructor(injector: Injector, protoStrategy: ProtoInjectorInlineStrategy);
    resetConstructionCounter(): void;
    instantiateProvider(provider: ResolvedProvider, visibility: Visibility): any;
    getObjByKeyId(keyId: number, visibility: Visibility): any;
    getObjAtIndex(index: number): any;
    getMaxNumberOfObjects(): number;
}
export declare class InjectorDynamicStrategy implements InjectorStrategy {
    protoStrategy: ProtoInjectorDynamicStrategy;
    injector: Injector;
    objs: any[];
    constructor(protoStrategy: ProtoInjectorDynamicStrategy, injector: Injector);
    resetConstructionCounter(): void;
    instantiateProvider(provider: ResolvedProvider, visibility: Visibility): any;
    getObjByKeyId(keyId: number, visibility: Visibility): any;
    getObjAtIndex(index: number): any;
    getMaxNumberOfObjects(): number;
}
export declare class ProviderWithVisibility {
    provider: ResolvedProvider;
    visibility: Visibility;
    constructor(provider: ResolvedProvider, visibility: Visibility);
    getKeyId(): number;
}
/**
 * Used to provide dependencies that cannot be easily expressed as providers.
 */
export interface DependencyProvider {
    getDependency(injector: Injector, provider: ResolvedProvider, dependency: Dependency): any;
}
/**
 * A dependency injection container used for instantiating objects and resolving dependencies.
 *
 * An `Injector` is a replacement for a `new` operator, which can automatically resolve the
 * constructor dependencies.
 *
 * In typical use, application code asks for the dependencies in the constructor and they are
 * resolved by the `Injector`.
 *
 * ### Example ([live demo](http://plnkr.co/edit/jzjec0?p=preview))
 *
 * The following example creates an `Injector` configured to create `Engine` and `Car`.
 *
 * ```typescript
 * @Injectable()
 * class Engine {
 * }
 *
 * @Injectable()
 * class Car {
 *   constructor(public engine:Engine) {}
 * }
 *
 * var injector = Injector.resolveAndCreate([Car, Engine]);
 * var car = injector.get(Car);
 * expect(car instanceof Car).toBe(true);
 * expect(car.engine instanceof Engine).toBe(true);
 * ```
 *
 * Notice, we don't use the `new` operator because we explicitly want to have the `Injector`
 * resolve all of the object's dependencies automatically.
 */
export declare class Injector {
    private _isHostBoundary;
    private _depProvider;
    private _debugContext;
    /**
     * Turns an array of provider definitions into an array of resolved providers.
     *
     * A resolution is a process of flattening multiple nested arrays and converting individual
     * providers into an array of {@link ResolvedProvider}s.
     *
     * ### Example ([live demo](http://plnkr.co/edit/AiXTHi?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var providers = Injector.resolve([Car, [[Engine]]]);
     *
     * expect(providers.length).toEqual(2);
     *
     * expect(providers[0] instanceof ResolvedProvider).toBe(true);
     * expect(providers[0].key.displayName).toBe("Car");
     * expect(providers[0].dependencies.length).toEqual(1);
     * expect(providers[0].factory).toBeDefined();
     *
     * expect(providers[1].key.displayName).toBe("Engine");
     * });
     * ```
     *
     * See {@link Injector#fromResolvedProviders} for more info.
     */
    static resolve(providers: Array<Type | Provider | any[]>): ResolvedProvider[];
    /**
     * Resolves an array of providers and creates an injector from those providers.
     *
     * The passed-in providers can be an array of `Type`, {@link Provider},
     * or a recursive array of more providers.
     *
     * ### Example ([live demo](http://plnkr.co/edit/ePOccA?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var injector = Injector.resolveAndCreate([Car, Engine]);
     * expect(injector.get(Car) instanceof Car).toBe(true);
     * ```
     *
     * This function is slower than the corresponding `fromResolvedProviders`
     * because it needs to resolve the passed-in providers first.
     * See {@link Injector#resolve} and {@link Injector#fromResolvedProviders}.
     */
    static resolveAndCreate(providers: Array<Type | Provider | any[]>): Injector;
    /**
     * Creates an injector from previously resolved providers.
     *
     * This API is the recommended way to construct injectors in performance-sensitive parts.
     *
     * ### Example ([live demo](http://plnkr.co/edit/KrSMci?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var providers = Injector.resolve([Car, Engine]);
     * var injector = Injector.fromResolvedProviders(providers);
     * expect(injector.get(Car) instanceof Car).toBe(true);
     * ```
     */
    static fromResolvedProviders(providers: ResolvedProvider[]): Injector;
    /**
     * @deprecated
     */
    static fromResolvedBindings(providers: ResolvedProvider[]): Injector;
    /**
     * Private
     */
    constructor(_proto: any, _parent?: Injector, _isHostBoundary?: boolean, _depProvider?: any, _debugContext?: Function);
    /**
     * Retrieves an instance from the injector based on the provided token.
     * Throws {@link NoProviderError} if not found.
     *
     * ### Example ([live demo](http://plnkr.co/edit/HeXSHg?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide("validToken", {useValue: "Value"})
     * ]);
     * expect(injector.get("validToken")).toEqual("Value");
     * expect(() => injector.get("invalidToken")).toThrowError();
     * ```
     *
     * `Injector` returns itself when given `Injector` as a token.
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([]);
     * expect(injector.get(Injector)).toBe(injector);
     * ```
     */
    get(token: any): any;
    /**
     * Retrieves an instance from the injector based on the provided token.
     * Returns null if not found.
     *
     * ### Example ([live demo](http://plnkr.co/edit/tpEbEy?p=preview))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   provide("validToken", {useValue: "Value"})
     * ]);
     * expect(injector.getOptional("validToken")).toEqual("Value");
     * expect(injector.getOptional("invalidToken")).toBe(null);
     * ```
     *
     * `Injector` returns itself when given `Injector` as a token.
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([]);
     * expect(injector.getOptional(Injector)).toBe(injector);
     * ```
     */
    getOptional(token: any): any;
    /**
     * Parent of this injector.
     *
     * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
     * -->
     *
     * ### Example ([live demo](http://plnkr.co/edit/eosMGo?p=preview))
     *
     * ```typescript
     * var parent = Injector.resolveAndCreate([]);
     * var child = parent.resolveAndCreateChild([]);
     * expect(child.parent).toBe(parent);
     * ```
     */
    parent: Injector;
    /**
     * Resolves an array of providers and creates a child injector from those providers.
     *
     * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
     * -->
     *
     * The passed-in providers can be an array of `Type`, {@link Provider},
     * or a recursive array of more providers.
     *
     * ### Example ([live demo](http://plnkr.co/edit/opB3T4?p=preview))
     *
     * ```typescript
     * class ParentProvider {}
     * class ChildProvider {}
     *
     * var parent = Injector.resolveAndCreate([ParentProvider]);
     * var child = parent.resolveAndCreateChild([ChildProvider]);
     *
     * expect(child.get(ParentProvider) instanceof ParentProvider).toBe(true);
     * expect(child.get(ChildProvider) instanceof ChildProvider).toBe(true);
     * expect(child.get(ParentProvider)).toBe(parent.get(ParentProvider));
     * ```
     *
     * This function is slower than the corresponding `createChildFromResolved`
     * because it needs to resolve the passed-in providers first.
     * See {@link Injector#resolve} and {@link Injector#createChildFromResolved}.
     */
    resolveAndCreateChild(providers: Array<Type | Provider | any[]>): Injector;
    /**
     * Creates a child injector from previously resolved providers.
     *
     * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
     * -->
     *
     * This API is the recommended way to construct injectors in performance-sensitive parts.
     *
     * ### Example ([live demo](http://plnkr.co/edit/VhyfjN?p=preview))
     *
     * ```typescript
     * class ParentProvider {}
     * class ChildProvider {}
     *
     * var parentProviders = Injector.resolve([ParentProvider]);
     * var childProviders = Injector.resolve([ChildProvider]);
     *
     * var parent = Injector.fromResolvedProviders(parentProviders);
     * var child = parent.createChildFromResolved(childProviders);
     *
     * expect(child.get(ParentProvider) instanceof ParentProvider).toBe(true);
     * expect(child.get(ChildProvider) instanceof ChildProvider).toBe(true);
     * expect(child.get(ParentProvider)).toBe(parent.get(ParentProvider));
     * ```
     */
    createChildFromResolved(providers: ResolvedProvider[]): Injector;
    /**
     * Resolves a provider and instantiates an object in the context of the injector.
     *
     * The created object does not get cached by the injector.
     *
     * ### Example ([live demo](http://plnkr.co/edit/yvVXoB?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var injector = Injector.resolveAndCreate([Engine]);
     *
     * var car = injector.resolveAndInstantiate(Car);
     * expect(car.engine).toBe(injector.get(Engine));
     * expect(car).not.toBe(injector.resolveAndInstantiate(Car));
     * ```
     */
    resolveAndInstantiate(provider: Type | Provider): any;
    /**
     * Instantiates an object using a resolved provider in the context of the injector.
     *
     * The created object does not get cached by the injector.
     *
     * ### Example ([live demo](http://plnkr.co/edit/ptCImQ?p=preview))
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var injector = Injector.resolveAndCreate([Engine]);
     * var carProvider = Injector.resolve([Car])[0];
     * var car = injector.instantiateResolved(carProvider);
     * expect(car.engine).toBe(injector.get(Engine));
     * expect(car).not.toBe(injector.instantiateResolved(carProvider));
     * ```
     */
    instantiateResolved(provider: ResolvedProvider): any;
    private _instantiateProvider(provider, visibility);
    private _instantiate(provider, resolvedFactory, visibility);
    private _getByDependency(provider, dep, providerVisibility);
    private _getByKey(key, lowerBoundVisibility, upperBoundVisibility, optional, providerVisibility);
    displayName: string;
    toString(): string;
}
