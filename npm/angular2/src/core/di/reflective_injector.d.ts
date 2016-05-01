import { Provider } from './provider';
import { ResolvedReflectiveProvider } from './reflective_provider';
import { Type } from 'angular2/src/facade/lang';
import { Injector } from './injector';
export interface ReflectiveProtoInjectorStrategy {
    getProviderAtIndex(index: number): ResolvedReflectiveProvider;
    createInjectorStrategy(inj: ReflectiveInjector_): ReflectiveInjectorStrategy;
}
export declare class ReflectiveProtoInjectorInlineStrategy implements ReflectiveProtoInjectorStrategy {
    provider0: ResolvedReflectiveProvider;
    provider1: ResolvedReflectiveProvider;
    provider2: ResolvedReflectiveProvider;
    provider3: ResolvedReflectiveProvider;
    provider4: ResolvedReflectiveProvider;
    provider5: ResolvedReflectiveProvider;
    provider6: ResolvedReflectiveProvider;
    provider7: ResolvedReflectiveProvider;
    provider8: ResolvedReflectiveProvider;
    provider9: ResolvedReflectiveProvider;
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
    constructor(protoEI: ReflectiveProtoInjector, providers: ResolvedReflectiveProvider[]);
    getProviderAtIndex(index: number): ResolvedReflectiveProvider;
    createInjectorStrategy(injector: ReflectiveInjector_): ReflectiveInjectorStrategy;
}
export declare class ReflectiveProtoInjectorDynamicStrategy implements ReflectiveProtoInjectorStrategy {
    providers: ResolvedReflectiveProvider[];
    keyIds: number[];
    constructor(protoInj: ReflectiveProtoInjector, providers: ResolvedReflectiveProvider[]);
    getProviderAtIndex(index: number): ResolvedReflectiveProvider;
    createInjectorStrategy(ei: ReflectiveInjector_): ReflectiveInjectorStrategy;
}
export declare class ReflectiveProtoInjector {
    static fromResolvedProviders(providers: ResolvedReflectiveProvider[]): ReflectiveProtoInjector;
    numberOfProviders: number;
    constructor(providers: ResolvedReflectiveProvider[]);
    getProviderAtIndex(index: number): ResolvedReflectiveProvider;
}
export interface ReflectiveInjectorStrategy {
    getObjByKeyId(keyId: number): any;
    getObjAtIndex(index: number): any;
    getMaxNumberOfObjects(): number;
    resetConstructionCounter(): void;
    instantiateProvider(provider: ResolvedReflectiveProvider): any;
}
export declare class ReflectiveInjectorInlineStrategy implements ReflectiveInjectorStrategy {
    injector: ReflectiveInjector_;
    protoStrategy: ReflectiveProtoInjectorInlineStrategy;
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
    constructor(injector: ReflectiveInjector_, protoStrategy: ReflectiveProtoInjectorInlineStrategy);
    resetConstructionCounter(): void;
    instantiateProvider(provider: ResolvedReflectiveProvider): any;
    getObjByKeyId(keyId: number): any;
    getObjAtIndex(index: number): any;
    getMaxNumberOfObjects(): number;
}
export declare class ReflectiveInjectorDynamicStrategy implements ReflectiveInjectorStrategy {
    protoStrategy: ReflectiveProtoInjectorDynamicStrategy;
    injector: ReflectiveInjector_;
    objs: any[];
    constructor(protoStrategy: ReflectiveProtoInjectorDynamicStrategy, injector: ReflectiveInjector_);
    resetConstructionCounter(): void;
    instantiateProvider(provider: ResolvedReflectiveProvider): any;
    getObjByKeyId(keyId: number): any;
    getObjAtIndex(index: number): any;
    getMaxNumberOfObjects(): number;
}
/**
 * A ReflectiveDependency injection container used for instantiating objects and resolving
 * dependencies.
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
 * var injector = ReflectiveInjector.resolveAndCreate([Car, Engine]);
 * var car = injector.get(Car);
 * expect(car instanceof Car).toBe(true);
 * expect(car.engine instanceof Engine).toBe(true);
 * ```
 *
 * Notice, we don't use the `new` operator because we explicitly want to have the `Injector`
 * resolve all of the object's dependencies automatically.
 */
export declare abstract class ReflectiveInjector implements Injector {
    /**
     * Turns an array of provider definitions into an array of resolved providers.
     *
     * A resolution is a process of flattening multiple nested arrays and converting individual
     * providers into an array of {@link ResolvedReflectiveProvider}s.
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
     * var providers = ReflectiveInjector.resolve([Car, [[Engine]]]);
     *
     * expect(providers.length).toEqual(2);
     *
     * expect(providers[0] instanceof ResolvedReflectiveProvider).toBe(true);
     * expect(providers[0].key.displayName).toBe("Car");
     * expect(providers[0].dependencies.length).toEqual(1);
     * expect(providers[0].factory).toBeDefined();
     *
     * expect(providers[1].key.displayName).toBe("Engine");
     * });
     * ```
     *
     * See {@link ReflectiveInjector#fromResolvedProviders} for more info.
     */
    static resolve(providers: Array<Type | Provider | {
        [k: string]: any;
    } | any[]>): ResolvedReflectiveProvider[];
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
     * var injector = ReflectiveInjector.resolveAndCreate([Car, Engine]);
     * expect(injector.get(Car) instanceof Car).toBe(true);
     * ```
     *
     * This function is slower than the corresponding `fromResolvedProviders`
     * because it needs to resolve the passed-in providers first.
     * See {@link Injector#resolve} and {@link Injector#fromResolvedProviders}.
     */
    static resolveAndCreate(providers: Array<Type | Provider | {
        [k: string]: any;
    } | any[]>, parent?: Injector): ReflectiveInjector;
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
     * var providers = ReflectiveInjector.resolve([Car, Engine]);
     * var injector = ReflectiveInjector.fromResolvedProviders(providers);
     * expect(injector.get(Car) instanceof Car).toBe(true);
     * ```
     */
    static fromResolvedProviders(providers: ResolvedReflectiveProvider[], parent?: Injector): ReflectiveInjector;
    /**
     * @deprecated
     */
    static fromResolvedBindings(providers: ResolvedReflectiveProvider[]): ReflectiveInjector;
    /**
     * Parent of this injector.
     *
     * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
     * -->
     *
     * ### Example ([live demo](http://plnkr.co/edit/eosMGo?p=preview))
     *
     * ```typescript
     * var parent = ReflectiveInjector.resolveAndCreate([]);
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
     * var parent = ReflectiveInjector.resolveAndCreate([ParentProvider]);
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
    resolveAndCreateChild(providers: Array<Type | Provider | {
        [k: string]: any;
    } | any[]>): ReflectiveInjector;
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
     * var parentProviders = ReflectiveInjector.resolve([ParentProvider]);
     * var childProviders = ReflectiveInjector.resolve([ChildProvider]);
     *
     * var parent = ReflectiveInjector.fromResolvedProviders(parentProviders);
     * var child = parent.createChildFromResolved(childProviders);
     *
     * expect(child.get(ParentProvider) instanceof ParentProvider).toBe(true);
     * expect(child.get(ChildProvider) instanceof ChildProvider).toBe(true);
     * expect(child.get(ParentProvider)).toBe(parent.get(ParentProvider));
     * ```
     */
    createChildFromResolved(providers: ResolvedReflectiveProvider[]): ReflectiveInjector;
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
     * var injector = ReflectiveInjector.resolveAndCreate([Engine]);
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
     * var injector = ReflectiveInjector.resolveAndCreate([Engine]);
     * var carProvider = ReflectiveInjector.resolve([Car])[0];
     * var car = injector.instantiateResolved(carProvider);
     * expect(car.engine).toBe(injector.get(Engine));
     * expect(car).not.toBe(injector.instantiateResolved(carProvider));
     * ```
     */
    instantiateResolved(provider: ResolvedReflectiveProvider): any;
    abstract get(token: any, notFoundValue?: any): any;
}
export declare class ReflectiveInjector_ implements ReflectiveInjector {
    private _debugContext;
    private _strategy;
    /**
     * Private
     */
    constructor(_proto: any, _parent?: Injector, _debugContext?: Function);
    get(token: any, notFoundValue?: any): any;
    getAt(index: number): any;
    parent: Injector;
    resolveAndCreateChild(providers: Array<Type | Provider | any[]>): ReflectiveInjector;
    createChildFromResolved(providers: ResolvedReflectiveProvider[]): ReflectiveInjector;
    resolveAndInstantiate(provider: Type | Provider): any;
    instantiateResolved(provider: ResolvedReflectiveProvider): any;
    private _instantiateProvider(provider);
    private _instantiate(provider, ResolvedReflectiveFactory);
    private _getByReflectiveDependency(provider, dep);
    private _getByKey(key, lowerBoundVisibility, upperBoundVisibility, notFoundValue);
    displayName: string;
    toString(): string;
}
