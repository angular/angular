import { ListWrapper } from 'angular2/src/facade/collection';
import { resolveProviders } from './provider';
import { AbstractProviderError, NoProviderError, CyclicDependencyError, InstantiationError, OutOfBoundsError } from './exceptions';
import { isPresent, CONST_EXPR } from 'angular2/src/facade/lang';
import { Key } from './key';
import { SelfMetadata, HostMetadata, SkipSelfMetadata } from './metadata';
// Threshold for the dynamic version
const _MAX_CONSTRUCTION_COUNTER = 10;
export const UNDEFINED = CONST_EXPR(new Object());
/**
 * Visibility of a {@link Provider}.
 */
export var Visibility;
(function (Visibility) {
    /**
     * A `Public` {@link Provider} is only visible to regular (as opposed to host) child injectors.
     */
    Visibility[Visibility["Public"] = 0] = "Public";
    /**
     * A `Private` {@link Provider} is only visible to host (as opposed to regular) child injectors.
     */
    Visibility[Visibility["Private"] = 1] = "Private";
    /**
     * A `PublicAndPrivate` {@link Provider} is visible to both host and regular child injectors.
     */
    Visibility[Visibility["PublicAndPrivate"] = 2] = "PublicAndPrivate";
})(Visibility || (Visibility = {}));
function canSee(src, dst) {
    return (src === dst) ||
        (dst === Visibility.PublicAndPrivate || src === Visibility.PublicAndPrivate);
}
export class ProtoInjectorInlineStrategy {
    constructor(protoEI, bwv) {
        this.provider0 = null;
        this.provider1 = null;
        this.provider2 = null;
        this.provider3 = null;
        this.provider4 = null;
        this.provider5 = null;
        this.provider6 = null;
        this.provider7 = null;
        this.provider8 = null;
        this.provider9 = null;
        this.keyId0 = null;
        this.keyId1 = null;
        this.keyId2 = null;
        this.keyId3 = null;
        this.keyId4 = null;
        this.keyId5 = null;
        this.keyId6 = null;
        this.keyId7 = null;
        this.keyId8 = null;
        this.keyId9 = null;
        this.visibility0 = null;
        this.visibility1 = null;
        this.visibility2 = null;
        this.visibility3 = null;
        this.visibility4 = null;
        this.visibility5 = null;
        this.visibility6 = null;
        this.visibility7 = null;
        this.visibility8 = null;
        this.visibility9 = null;
        var length = bwv.length;
        if (length > 0) {
            this.provider0 = bwv[0].provider;
            this.keyId0 = bwv[0].getKeyId();
            this.visibility0 = bwv[0].visibility;
        }
        if (length > 1) {
            this.provider1 = bwv[1].provider;
            this.keyId1 = bwv[1].getKeyId();
            this.visibility1 = bwv[1].visibility;
        }
        if (length > 2) {
            this.provider2 = bwv[2].provider;
            this.keyId2 = bwv[2].getKeyId();
            this.visibility2 = bwv[2].visibility;
        }
        if (length > 3) {
            this.provider3 = bwv[3].provider;
            this.keyId3 = bwv[3].getKeyId();
            this.visibility3 = bwv[3].visibility;
        }
        if (length > 4) {
            this.provider4 = bwv[4].provider;
            this.keyId4 = bwv[4].getKeyId();
            this.visibility4 = bwv[4].visibility;
        }
        if (length > 5) {
            this.provider5 = bwv[5].provider;
            this.keyId5 = bwv[5].getKeyId();
            this.visibility5 = bwv[5].visibility;
        }
        if (length > 6) {
            this.provider6 = bwv[6].provider;
            this.keyId6 = bwv[6].getKeyId();
            this.visibility6 = bwv[6].visibility;
        }
        if (length > 7) {
            this.provider7 = bwv[7].provider;
            this.keyId7 = bwv[7].getKeyId();
            this.visibility7 = bwv[7].visibility;
        }
        if (length > 8) {
            this.provider8 = bwv[8].provider;
            this.keyId8 = bwv[8].getKeyId();
            this.visibility8 = bwv[8].visibility;
        }
        if (length > 9) {
            this.provider9 = bwv[9].provider;
            this.keyId9 = bwv[9].getKeyId();
            this.visibility9 = bwv[9].visibility;
        }
    }
    getProviderAtIndex(index) {
        if (index == 0)
            return this.provider0;
        if (index == 1)
            return this.provider1;
        if (index == 2)
            return this.provider2;
        if (index == 3)
            return this.provider3;
        if (index == 4)
            return this.provider4;
        if (index == 5)
            return this.provider5;
        if (index == 6)
            return this.provider6;
        if (index == 7)
            return this.provider7;
        if (index == 8)
            return this.provider8;
        if (index == 9)
            return this.provider9;
        throw new OutOfBoundsError(index);
    }
    createInjectorStrategy(injector) {
        return new InjectorInlineStrategy(injector, this);
    }
}
export class ProtoInjectorDynamicStrategy {
    constructor(protoInj, bwv) {
        var len = bwv.length;
        this.providers = ListWrapper.createFixedSize(len);
        this.keyIds = ListWrapper.createFixedSize(len);
        this.visibilities = ListWrapper.createFixedSize(len);
        for (var i = 0; i < len; i++) {
            this.providers[i] = bwv[i].provider;
            this.keyIds[i] = bwv[i].getKeyId();
            this.visibilities[i] = bwv[i].visibility;
        }
    }
    getProviderAtIndex(index) {
        if (index < 0 || index >= this.providers.length) {
            throw new OutOfBoundsError(index);
        }
        return this.providers[index];
    }
    createInjectorStrategy(ei) {
        return new InjectorDynamicStrategy(this, ei);
    }
}
export class ProtoInjector {
    constructor(bwv) {
        this.numberOfProviders = bwv.length;
        this._strategy = bwv.length > _MAX_CONSTRUCTION_COUNTER ?
            new ProtoInjectorDynamicStrategy(this, bwv) :
            new ProtoInjectorInlineStrategy(this, bwv);
    }
    getProviderAtIndex(index) { return this._strategy.getProviderAtIndex(index); }
}
export class InjectorInlineStrategy {
    constructor(injector, protoStrategy) {
        this.injector = injector;
        this.protoStrategy = protoStrategy;
        this.obj0 = UNDEFINED;
        this.obj1 = UNDEFINED;
        this.obj2 = UNDEFINED;
        this.obj3 = UNDEFINED;
        this.obj4 = UNDEFINED;
        this.obj5 = UNDEFINED;
        this.obj6 = UNDEFINED;
        this.obj7 = UNDEFINED;
        this.obj8 = UNDEFINED;
        this.obj9 = UNDEFINED;
    }
    resetConstructionCounter() { this.injector._constructionCounter = 0; }
    instantiateProvider(provider, visibility) {
        return this.injector._new(provider, visibility);
    }
    attach(parent, isHost) {
        var inj = this.injector;
        inj._parent = parent;
        inj._isHost = isHost;
    }
    getObjByKeyId(keyId, visibility) {
        var p = this.protoStrategy;
        var inj = this.injector;
        if (p.keyId0 === keyId && canSee(p.visibility0, visibility)) {
            if (this.obj0 === UNDEFINED) {
                this.obj0 = inj._new(p.provider0, p.visibility0);
            }
            return this.obj0;
        }
        if (p.keyId1 === keyId && canSee(p.visibility1, visibility)) {
            if (this.obj1 === UNDEFINED) {
                this.obj1 = inj._new(p.provider1, p.visibility1);
            }
            return this.obj1;
        }
        if (p.keyId2 === keyId && canSee(p.visibility2, visibility)) {
            if (this.obj2 === UNDEFINED) {
                this.obj2 = inj._new(p.provider2, p.visibility2);
            }
            return this.obj2;
        }
        if (p.keyId3 === keyId && canSee(p.visibility3, visibility)) {
            if (this.obj3 === UNDEFINED) {
                this.obj3 = inj._new(p.provider3, p.visibility3);
            }
            return this.obj3;
        }
        if (p.keyId4 === keyId && canSee(p.visibility4, visibility)) {
            if (this.obj4 === UNDEFINED) {
                this.obj4 = inj._new(p.provider4, p.visibility4);
            }
            return this.obj4;
        }
        if (p.keyId5 === keyId && canSee(p.visibility5, visibility)) {
            if (this.obj5 === UNDEFINED) {
                this.obj5 = inj._new(p.provider5, p.visibility5);
            }
            return this.obj5;
        }
        if (p.keyId6 === keyId && canSee(p.visibility6, visibility)) {
            if (this.obj6 === UNDEFINED) {
                this.obj6 = inj._new(p.provider6, p.visibility6);
            }
            return this.obj6;
        }
        if (p.keyId7 === keyId && canSee(p.visibility7, visibility)) {
            if (this.obj7 === UNDEFINED) {
                this.obj7 = inj._new(p.provider7, p.visibility7);
            }
            return this.obj7;
        }
        if (p.keyId8 === keyId && canSee(p.visibility8, visibility)) {
            if (this.obj8 === UNDEFINED) {
                this.obj8 = inj._new(p.provider8, p.visibility8);
            }
            return this.obj8;
        }
        if (p.keyId9 === keyId && canSee(p.visibility9, visibility)) {
            if (this.obj9 === UNDEFINED) {
                this.obj9 = inj._new(p.provider9, p.visibility9);
            }
            return this.obj9;
        }
        return UNDEFINED;
    }
    getObjAtIndex(index) {
        if (index == 0)
            return this.obj0;
        if (index == 1)
            return this.obj1;
        if (index == 2)
            return this.obj2;
        if (index == 3)
            return this.obj3;
        if (index == 4)
            return this.obj4;
        if (index == 5)
            return this.obj5;
        if (index == 6)
            return this.obj6;
        if (index == 7)
            return this.obj7;
        if (index == 8)
            return this.obj8;
        if (index == 9)
            return this.obj9;
        throw new OutOfBoundsError(index);
    }
    getMaxNumberOfObjects() { return _MAX_CONSTRUCTION_COUNTER; }
}
export class InjectorDynamicStrategy {
    constructor(protoStrategy, injector) {
        this.protoStrategy = protoStrategy;
        this.injector = injector;
        this.objs = ListWrapper.createFixedSize(protoStrategy.providers.length);
        ListWrapper.fill(this.objs, UNDEFINED);
    }
    resetConstructionCounter() { this.injector._constructionCounter = 0; }
    instantiateProvider(provider, visibility) {
        return this.injector._new(provider, visibility);
    }
    attach(parent, isHost) {
        var inj = this.injector;
        inj._parent = parent;
        inj._isHost = isHost;
    }
    getObjByKeyId(keyId, visibility) {
        var p = this.protoStrategy;
        for (var i = 0; i < p.keyIds.length; i++) {
            if (p.keyIds[i] === keyId && canSee(p.visibilities[i], visibility)) {
                if (this.objs[i] === UNDEFINED) {
                    this.objs[i] = this.injector._new(p.providers[i], p.visibilities[i]);
                }
                return this.objs[i];
            }
        }
        return UNDEFINED;
    }
    getObjAtIndex(index) {
        if (index < 0 || index >= this.objs.length) {
            throw new OutOfBoundsError(index);
        }
        return this.objs[index];
    }
    getMaxNumberOfObjects() { return this.objs.length; }
}
export class ProviderWithVisibility {
    constructor(provider, visibility) {
        this.provider = provider;
        this.visibility = visibility;
    }
    ;
    getKeyId() { return this.provider.key.id; }
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
export class Injector {
    /**
     * Private
     */
    constructor(_proto /* ProtoInjector */, _parent = null, _depProvider = null, _debugContext = null) {
        this._depProvider = _depProvider;
        this._debugContext = _debugContext;
        /** @internal */
        this._isHost = false;
        /** @internal */
        this._constructionCounter = 0;
        this._proto = _proto;
        this._parent = _parent;
        this._strategy = _proto._strategy.createInjectorStrategy(this);
    }
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
    static resolve(providers) {
        return resolveProviders(providers);
    }
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
    static resolveAndCreate(providers) {
        var resolvedProviders = Injector.resolve(providers);
        return Injector.fromResolvedProviders(resolvedProviders);
    }
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
    static fromResolvedProviders(providers) {
        var bd = providers.map(b => new ProviderWithVisibility(b, Visibility.Public));
        var proto = new ProtoInjector(bd);
        return new Injector(proto, null, null);
    }
    /**
     * @deprecated
     */
    static fromResolvedBindings(providers) {
        return Injector.fromResolvedProviders(providers);
    }
    /**
     * @internal
     */
    debugContext() { return this._debugContext(); }
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
    get(token) {
        return this._getByKey(Key.get(token), null, null, false, Visibility.PublicAndPrivate);
    }
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
    getOptional(token) {
        return this._getByKey(Key.get(token), null, null, true, Visibility.PublicAndPrivate);
    }
    /**
     * @internal
     */
    getAt(index) { return this._strategy.getObjAtIndex(index); }
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
    get parent() { return this._parent; }
    /**
     * @internal
     * Internal. Do not use.
     * We return `any` not to export the InjectorStrategy type.
     */
    get internalStrategy() { return this._strategy; }
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
    resolveAndCreateChild(providers) {
        var resolvedProviders = Injector.resolve(providers);
        return this.createChildFromResolved(resolvedProviders);
    }
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
    createChildFromResolved(providers) {
        var bd = providers.map(b => new ProviderWithVisibility(b, Visibility.Public));
        var proto = new ProtoInjector(bd);
        var inj = new Injector(proto, null, null);
        inj._parent = this;
        return inj;
    }
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
    resolveAndInstantiate(provider) {
        return this.instantiateResolved(Injector.resolve([provider])[0]);
    }
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
    instantiateResolved(provider) {
        return this._instantiateProvider(provider, Visibility.PublicAndPrivate);
    }
    /** @internal */
    _new(provider, visibility) {
        if (this._constructionCounter++ > this._strategy.getMaxNumberOfObjects()) {
            throw new CyclicDependencyError(this, provider.key);
        }
        return this._instantiateProvider(provider, visibility);
    }
    _instantiateProvider(provider, visibility) {
        if (provider.multiProvider) {
            var res = ListWrapper.createFixedSize(provider.resolvedFactories.length);
            for (var i = 0; i < provider.resolvedFactories.length; ++i) {
                res[i] = this._instantiate(provider, provider.resolvedFactories[i], visibility);
            }
            return res;
        }
        else {
            return this._instantiate(provider, provider.resolvedFactories[0], visibility);
        }
    }
    _instantiate(provider, resolvedFactory, visibility) {
        var factory = resolvedFactory.factory;
        var deps = resolvedFactory.dependencies;
        var length = deps.length;
        var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19;
        try {
            d0 = length > 0 ? this._getByDependency(provider, deps[0], visibility) : null;
            d1 = length > 1 ? this._getByDependency(provider, deps[1], visibility) : null;
            d2 = length > 2 ? this._getByDependency(provider, deps[2], visibility) : null;
            d3 = length > 3 ? this._getByDependency(provider, deps[3], visibility) : null;
            d4 = length > 4 ? this._getByDependency(provider, deps[4], visibility) : null;
            d5 = length > 5 ? this._getByDependency(provider, deps[5], visibility) : null;
            d6 = length > 6 ? this._getByDependency(provider, deps[6], visibility) : null;
            d7 = length > 7 ? this._getByDependency(provider, deps[7], visibility) : null;
            d8 = length > 8 ? this._getByDependency(provider, deps[8], visibility) : null;
            d9 = length > 9 ? this._getByDependency(provider, deps[9], visibility) : null;
            d10 = length > 10 ? this._getByDependency(provider, deps[10], visibility) : null;
            d11 = length > 11 ? this._getByDependency(provider, deps[11], visibility) : null;
            d12 = length > 12 ? this._getByDependency(provider, deps[12], visibility) : null;
            d13 = length > 13 ? this._getByDependency(provider, deps[13], visibility) : null;
            d14 = length > 14 ? this._getByDependency(provider, deps[14], visibility) : null;
            d15 = length > 15 ? this._getByDependency(provider, deps[15], visibility) : null;
            d16 = length > 16 ? this._getByDependency(provider, deps[16], visibility) : null;
            d17 = length > 17 ? this._getByDependency(provider, deps[17], visibility) : null;
            d18 = length > 18 ? this._getByDependency(provider, deps[18], visibility) : null;
            d19 = length > 19 ? this._getByDependency(provider, deps[19], visibility) : null;
        }
        catch (e) {
            if (e instanceof AbstractProviderError || e instanceof InstantiationError) {
                e.addKey(this, provider.key);
            }
            throw e;
        }
        var obj;
        try {
            switch (length) {
                case 0:
                    obj = factory();
                    break;
                case 1:
                    obj = factory(d0);
                    break;
                case 2:
                    obj = factory(d0, d1);
                    break;
                case 3:
                    obj = factory(d0, d1, d2);
                    break;
                case 4:
                    obj = factory(d0, d1, d2, d3);
                    break;
                case 5:
                    obj = factory(d0, d1, d2, d3, d4);
                    break;
                case 6:
                    obj = factory(d0, d1, d2, d3, d4, d5);
                    break;
                case 7:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6);
                    break;
                case 8:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7);
                    break;
                case 9:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8);
                    break;
                case 10:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9);
                    break;
                case 11:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10);
                    break;
                case 12:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11);
                    break;
                case 13:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12);
                    break;
                case 14:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13);
                    break;
                case 15:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14);
                    break;
                case 16:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15);
                    break;
                case 17:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16);
                    break;
                case 18:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17);
                    break;
                case 19:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18);
                    break;
                case 20:
                    obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19);
                    break;
            }
        }
        catch (e) {
            throw new InstantiationError(this, e, e.stack, provider.key);
        }
        return obj;
    }
    _getByDependency(provider, dep, providerVisibility) {
        var special = isPresent(this._depProvider) ?
            this._depProvider.getDependency(this, provider, dep) :
            UNDEFINED;
        if (special !== UNDEFINED) {
            return special;
        }
        else {
            return this._getByKey(dep.key, dep.lowerBoundVisibility, dep.upperBoundVisibility, dep.optional, providerVisibility);
        }
    }
    _getByKey(key, lowerBoundVisibility, upperBoundVisibility, optional, providerVisibility) {
        if (key === INJECTOR_KEY) {
            return this;
        }
        if (upperBoundVisibility instanceof SelfMetadata) {
            return this._getByKeySelf(key, optional, providerVisibility);
        }
        else if (upperBoundVisibility instanceof HostMetadata) {
            return this._getByKeyHost(key, optional, providerVisibility, lowerBoundVisibility);
        }
        else {
            return this._getByKeyDefault(key, optional, providerVisibility, lowerBoundVisibility);
        }
    }
    /** @internal */
    _throwOrNull(key, optional) {
        if (optional) {
            return null;
        }
        else {
            throw new NoProviderError(this, key);
        }
    }
    /** @internal */
    _getByKeySelf(key, optional, providerVisibility) {
        var obj = this._strategy.getObjByKeyId(key.id, providerVisibility);
        return (obj !== UNDEFINED) ? obj : this._throwOrNull(key, optional);
    }
    /** @internal */
    _getByKeyHost(key, optional, providerVisibility, lowerBoundVisibility) {
        var inj = this;
        if (lowerBoundVisibility instanceof SkipSelfMetadata) {
            if (inj._isHost) {
                return this._getPrivateDependency(key, optional, inj);
            }
            else {
                inj = inj._parent;
            }
        }
        while (inj != null) {
            var obj = inj._strategy.getObjByKeyId(key.id, providerVisibility);
            if (obj !== UNDEFINED)
                return obj;
            if (isPresent(inj._parent) && inj._isHost) {
                return this._getPrivateDependency(key, optional, inj);
            }
            else {
                inj = inj._parent;
            }
        }
        return this._throwOrNull(key, optional);
    }
    /** @internal */
    _getPrivateDependency(key, optional, inj) {
        var obj = inj._parent._strategy.getObjByKeyId(key.id, Visibility.Private);
        return (obj !== UNDEFINED) ? obj : this._throwOrNull(key, optional);
    }
    /** @internal */
    _getByKeyDefault(key, optional, providerVisibility, lowerBoundVisibility) {
        var inj = this;
        if (lowerBoundVisibility instanceof SkipSelfMetadata) {
            providerVisibility = inj._isHost ? Visibility.PublicAndPrivate : Visibility.Public;
            inj = inj._parent;
        }
        while (inj != null) {
            var obj = inj._strategy.getObjByKeyId(key.id, providerVisibility);
            if (obj !== UNDEFINED)
                return obj;
            providerVisibility = inj._isHost ? Visibility.PublicAndPrivate : Visibility.Public;
            inj = inj._parent;
        }
        return this._throwOrNull(key, optional);
    }
    get displayName() {
        return `Injector(providers: [${_mapProviders(this, b => ` "${b.key.displayName}" `).join(", ")}])`;
    }
    toString() { return this.displayName; }
}
var INJECTOR_KEY = Key.get(Injector);
function _mapProviders(injector, fn) {
    var res = [];
    for (var i = 0; i < injector._proto.numberOfProviders; ++i) {
        res.push(fn(injector._proto.getProviderAtIndex(i)));
    }
    return res;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9kaS9pbmplY3Rvci50cyJdLCJuYW1lcyI6WyJWaXNpYmlsaXR5IiwiY2FuU2VlIiwiUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5IiwiUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5LmdldFByb3ZpZGVyQXRJbmRleCIsIlByb3RvSW5qZWN0b3JJbmxpbmVTdHJhdGVneS5jcmVhdGVJbmplY3RvclN0cmF0ZWd5IiwiUHJvdG9JbmplY3RvckR5bmFtaWNTdHJhdGVneSIsIlByb3RvSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJQcm90b0luamVjdG9yRHluYW1pY1N0cmF0ZWd5LmdldFByb3ZpZGVyQXRJbmRleCIsIlByb3RvSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuY3JlYXRlSW5qZWN0b3JTdHJhdGVneSIsIlByb3RvSW5qZWN0b3IiLCJQcm90b0luamVjdG9yLmNvbnN0cnVjdG9yIiwiUHJvdG9JbmplY3Rvci5nZXRQcm92aWRlckF0SW5kZXgiLCJJbmplY3RvcklubGluZVN0cmF0ZWd5IiwiSW5qZWN0b3JJbmxpbmVTdHJhdGVneS5jb25zdHJ1Y3RvciIsIkluamVjdG9ySW5saW5lU3RyYXRlZ3kucmVzZXRDb25zdHJ1Y3Rpb25Db3VudGVyIiwiSW5qZWN0b3JJbmxpbmVTdHJhdGVneS5pbnN0YW50aWF0ZVByb3ZpZGVyIiwiSW5qZWN0b3JJbmxpbmVTdHJhdGVneS5hdHRhY2giLCJJbmplY3RvcklubGluZVN0cmF0ZWd5LmdldE9iakJ5S2V5SWQiLCJJbmplY3RvcklubGluZVN0cmF0ZWd5LmdldE9iakF0SW5kZXgiLCJJbmplY3RvcklubGluZVN0cmF0ZWd5LmdldE1heE51bWJlck9mT2JqZWN0cyIsIkluamVjdG9yRHluYW1pY1N0cmF0ZWd5IiwiSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJJbmplY3RvckR5bmFtaWNTdHJhdGVneS5yZXNldENvbnN0cnVjdGlvbkNvdW50ZXIiLCJJbmplY3RvckR5bmFtaWNTdHJhdGVneS5pbnN0YW50aWF0ZVByb3ZpZGVyIiwiSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuYXR0YWNoIiwiSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuZ2V0T2JqQnlLZXlJZCIsIkluamVjdG9yRHluYW1pY1N0cmF0ZWd5LmdldE9iakF0SW5kZXgiLCJJbmplY3RvckR5bmFtaWNTdHJhdGVneS5nZXRNYXhOdW1iZXJPZk9iamVjdHMiLCJQcm92aWRlcldpdGhWaXNpYmlsaXR5IiwiUHJvdmlkZXJXaXRoVmlzaWJpbGl0eS5jb25zdHJ1Y3RvciIsIlByb3ZpZGVyV2l0aFZpc2liaWxpdHkuZ2V0S2V5SWQiLCJJbmplY3RvciIsIkluamVjdG9yLmNvbnN0cnVjdG9yIiwiSW5qZWN0b3IucmVzb2x2ZSIsIkluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUiLCJJbmplY3Rvci5mcm9tUmVzb2x2ZWRQcm92aWRlcnMiLCJJbmplY3Rvci5mcm9tUmVzb2x2ZWRCaW5kaW5ncyIsIkluamVjdG9yLmRlYnVnQ29udGV4dCIsIkluamVjdG9yLmdldCIsIkluamVjdG9yLmdldE9wdGlvbmFsIiwiSW5qZWN0b3IuZ2V0QXQiLCJJbmplY3Rvci5wYXJlbnQiLCJJbmplY3Rvci5pbnRlcm5hbFN0cmF0ZWd5IiwiSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZUNoaWxkIiwiSW5qZWN0b3IuY3JlYXRlQ2hpbGRGcm9tUmVzb2x2ZWQiLCJJbmplY3Rvci5yZXNvbHZlQW5kSW5zdGFudGlhdGUiLCJJbmplY3Rvci5pbnN0YW50aWF0ZVJlc29sdmVkIiwiSW5qZWN0b3IuX25ldyIsIkluamVjdG9yLl9pbnN0YW50aWF0ZVByb3ZpZGVyIiwiSW5qZWN0b3IuX2luc3RhbnRpYXRlIiwiSW5qZWN0b3IuX2dldEJ5RGVwZW5kZW5jeSIsIkluamVjdG9yLl9nZXRCeUtleSIsIkluamVjdG9yLl90aHJvd09yTnVsbCIsIkluamVjdG9yLl9nZXRCeUtleVNlbGYiLCJJbmplY3Rvci5fZ2V0QnlLZXlIb3N0IiwiSW5qZWN0b3IuX2dldFByaXZhdGVEZXBlbmRlbmN5IiwiSW5qZWN0b3IuX2dldEJ5S2V5RGVmYXVsdCIsIkluamVjdG9yLmRpc3BsYXlOYW1lIiwiSW5qZWN0b3IudG9TdHJpbmciLCJfbWFwUHJvdmlkZXJzIl0sIm1hcHBpbmdzIjoiT0FBTyxFQUFrQixXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDcEUsRUFPTCxnQkFBZ0IsRUFDakIsTUFBTSxZQUFZO09BQ1osRUFDTCxxQkFBcUIsRUFDckIsZUFBZSxFQUNmLHFCQUFxQixFQUNyQixrQkFBa0IsRUFFbEIsZ0JBQWdCLEVBQ2pCLE1BQU0sY0FBYztPQUNkLEVBQXdCLFNBQVMsRUFBVyxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FDdkYsRUFBQyxHQUFHLEVBQUMsTUFBTSxPQUFPO09BQ2xCLEVBQUMsWUFBWSxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLFlBQVk7QUFFdkUsb0NBQW9DO0FBQ3BDLE1BQU0seUJBQXlCLEdBQUcsRUFBRSxDQUFDO0FBRXJDLGFBQWEsU0FBUyxHQUFXLFVBQVUsQ0FBQyxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFFMUQ7O0dBRUc7QUFDSCxXQUFZLFVBYVg7QUFiRCxXQUFZLFVBQVU7SUFDcEJBOztPQUVHQTtJQUNIQSwrQ0FBTUEsQ0FBQUE7SUFDTkE7O09BRUdBO0lBQ0hBLGlEQUFPQSxDQUFBQTtJQUNQQTs7T0FFR0E7SUFDSEEsbUVBQWdCQSxDQUFBQTtBQUNsQkEsQ0FBQ0EsRUFiVyxVQUFVLEtBQVYsVUFBVSxRQWFyQjtBQUVELGdCQUFnQixHQUFlLEVBQUUsR0FBZTtJQUM5Q0MsTUFBTUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsS0FBS0EsR0FBR0EsQ0FBQ0E7UUFDYkEsQ0FBQ0EsR0FBR0EsS0FBS0EsVUFBVUEsQ0FBQ0EsZ0JBQWdCQSxJQUFJQSxHQUFHQSxLQUFLQSxVQUFVQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBO0FBQ3RGQSxDQUFDQTtBQVFEO0lBa0NFQyxZQUFZQSxPQUFzQkEsRUFBRUEsR0FBNkJBO1FBakNqRUMsY0FBU0EsR0FBcUJBLElBQUlBLENBQUNBO1FBQ25DQSxjQUFTQSxHQUFxQkEsSUFBSUEsQ0FBQ0E7UUFDbkNBLGNBQVNBLEdBQXFCQSxJQUFJQSxDQUFDQTtRQUNuQ0EsY0FBU0EsR0FBcUJBLElBQUlBLENBQUNBO1FBQ25DQSxjQUFTQSxHQUFxQkEsSUFBSUEsQ0FBQ0E7UUFDbkNBLGNBQVNBLEdBQXFCQSxJQUFJQSxDQUFDQTtRQUNuQ0EsY0FBU0EsR0FBcUJBLElBQUlBLENBQUNBO1FBQ25DQSxjQUFTQSxHQUFxQkEsSUFBSUEsQ0FBQ0E7UUFDbkNBLGNBQVNBLEdBQXFCQSxJQUFJQSxDQUFDQTtRQUNuQ0EsY0FBU0EsR0FBcUJBLElBQUlBLENBQUNBO1FBRW5DQSxXQUFNQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUN0QkEsV0FBTUEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLFdBQU1BLEdBQVdBLElBQUlBLENBQUNBO1FBQ3RCQSxXQUFNQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUN0QkEsV0FBTUEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLFdBQU1BLEdBQVdBLElBQUlBLENBQUNBO1FBQ3RCQSxXQUFNQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUN0QkEsV0FBTUEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLFdBQU1BLEdBQVdBLElBQUlBLENBQUNBO1FBQ3RCQSxXQUFNQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUV0QkEsZ0JBQVdBLEdBQWVBLElBQUlBLENBQUNBO1FBQy9CQSxnQkFBV0EsR0FBZUEsSUFBSUEsQ0FBQ0E7UUFDL0JBLGdCQUFXQSxHQUFlQSxJQUFJQSxDQUFDQTtRQUMvQkEsZ0JBQVdBLEdBQWVBLElBQUlBLENBQUNBO1FBQy9CQSxnQkFBV0EsR0FBZUEsSUFBSUEsQ0FBQ0E7UUFDL0JBLGdCQUFXQSxHQUFlQSxJQUFJQSxDQUFDQTtRQUMvQkEsZ0JBQVdBLEdBQWVBLElBQUlBLENBQUNBO1FBQy9CQSxnQkFBV0EsR0FBZUEsSUFBSUEsQ0FBQ0E7UUFDL0JBLGdCQUFXQSxHQUFlQSxJQUFJQSxDQUFDQTtRQUMvQkEsZ0JBQVdBLEdBQWVBLElBQUlBLENBQUNBO1FBRzdCQSxJQUFJQSxNQUFNQSxHQUFHQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUV4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREQsa0JBQWtCQSxDQUFDQSxLQUFhQTtRQUM5QkUsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7UUFDdENBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBO1FBQ3RDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7UUFDdENBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBO1FBQ3RDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7UUFDdENBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBO1FBQ3RDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7UUFDdENBLE1BQU1BLElBQUlBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDcENBLENBQUNBO0lBRURGLHNCQUFzQkEsQ0FBQ0EsUUFBa0JBO1FBQ3ZDRyxNQUFNQSxDQUFDQSxJQUFJQSxzQkFBc0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO0lBQ3BEQSxDQUFDQTtBQUNISCxDQUFDQTtBQUVEO0lBS0VJLFlBQVlBLFFBQXVCQSxFQUFFQSxHQUE2QkE7UUFDaEVDLElBQUlBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBO1FBRXJCQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxXQUFXQSxDQUFDQSxlQUFlQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNsREEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsV0FBV0Es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QSxJQUFJQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQTtZQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNuQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsS0FBS0EsS0FBS0EsSUFBSUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxLQUFLQSxJQUFJQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQTtZQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNuQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsS0FBS0EsS0FBS0EsSUFBSUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxLQUFLQSxJQUFJQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUJBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQTtZQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNuQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsS0FBS0EsS0FBS0EsSUFBSUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ25CQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQTtJQUNuQkEsQ0FBQ0E7SUFFREwsYUFBYUEsQ0FBQ0EsS0FBYUE7UUFDekJNLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNqQ0EsRUFB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LGVBQWVBLENBQUNBLE9BQU9BLENBQUNBO1FBQ3RDQSxJQUFJQSxJQUFJQSxHQUFHQSxlQUFlQSxDQUFDQSxZQUFZQSxDQUFDQTtRQUN4Q0EsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFFekJBLElBQUlBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBO1FBQzdGQSxJQUFJQSxDQUFDQTtZQUNIQSxFQUFFQSxHQUFHQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQzlFQSxFQUFFQSxHQUFHQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQzlFQSxFQUFFQSxHQUFHQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQzlFQSxFQUFFQSxHQUFHQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQzlFQSxFQUFFQSxHQUFHQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQzlFQSxFQUFFQSxHQUFHQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQzlFQSxFQUFFQSxHQUFHQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQzlFQSxFQUFFQSxHQUFHQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQzlFQSxFQUFFQSxHQUFHQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQzlFQSxFQUFFQSxHQUFHQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQzlFQSxHQUFHQSxHQUFHQSxNQUFNQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQ2pGQSxHQUFHQSxHQUFHQSxNQUFNQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQ2pGQSxHQUFHQSxHQUFHQSxNQUFNQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQ2pGQSxHQUFHQSxHQUFHQSxNQUFNQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQ2pGQSxHQUFHQSxHQUFHQSxNQUFNQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQ2pGQSxHQUFHQSxHQUFHQSxNQUFNQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQ2pGQSxHQUFHQSxHQUFHQSxNQUFNQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQ2pGQSxHQUFHQSxHQUFHQSxNQUFNQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQ2pGQSxHQUFHQSxHQUFHQSxNQUFNQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQ2pGQSxHQUFHQSxHQUFHQSxNQUFNQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1FBQ25GQSxDQUFFQTtRQUFBQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNYQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxZQUFZQSxxQkFBcUJBLElBQUlBLENBQUNBLFlBQVlBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxFQUFFQSxRQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUMvQkEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDVkEsQ0FBQ0E7UUFFREEsSUFBSUEsR0FBR0EsQ0FBQ0E7UUFDUkEsSUFBSUEsQ0FBQ0E7WUFDSEEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2ZBLEtBQUtBLENBQUNBO29CQUNKQSxHQUFHQSxHQUFHQSxPQUFPQSxFQUFFQSxDQUFDQTtvQkFDaEJBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxDQUFDQTtvQkFDSkEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQ2xCQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsQ0FBQ0E7b0JBQ0pBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO29CQUN0QkEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLENBQUNBO29CQUNKQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDMUJBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxDQUFDQTtvQkFDSkEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQzlCQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsQ0FBQ0E7b0JBQ0pBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO29CQUNsQ0EsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLENBQUNBO29CQUNKQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDdENBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxDQUFDQTtvQkFDSkEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQzFDQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsQ0FBQ0E7b0JBQ0pBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO29CQUM5Q0EsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLENBQUNBO29CQUNKQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDbERBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxFQUFFQTtvQkFDTEEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQ3REQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsRUFBRUE7b0JBQ0xBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO29CQUMzREEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLEVBQUVBO29CQUNMQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtvQkFDaEVBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxFQUFFQTtvQkFDTEEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3JFQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsRUFBRUE7b0JBQ0xBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO29CQUMxRUEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLEVBQUVBO29CQUNMQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtvQkFDL0VBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxFQUFFQTtvQkFDTEEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3BGQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsRUFBRUE7b0JBQ0xBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO29CQUN6RkEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLEVBQUVBO29CQUNMQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUN6RUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQ25CQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsRUFBRUE7b0JBQ0xBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVB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cnQge01hcCwgTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1xuICBSZXNvbHZlZFByb3ZpZGVyLFxuICBQcm92aWRlcixcbiAgRGVwZW5kZW5jeSxcbiAgUHJvdmlkZXJCdWlsZGVyLFxuICBSZXNvbHZlZEZhY3RvcnksXG4gIHByb3ZpZGUsXG4gIHJlc29sdmVQcm92aWRlcnNcbn0gZnJvbSAnLi9wcm92aWRlcic7XG5pbXBvcnQge1xuICBBYnN0cmFjdFByb3ZpZGVyRXJyb3IsXG4gIE5vUHJvdmlkZXJFcnJvcixcbiAgQ3ljbGljRGVwZW5kZW5jeUVycm9yLFxuICBJbnN0YW50aWF0aW9uRXJyb3IsXG4gIEludmFsaWRQcm92aWRlckVycm9yLFxuICBPdXRPZkJvdW5kc0Vycm9yXG59IGZyb20gJy4vZXhjZXB0aW9ucyc7XG5pbXBvcnQge0Z1bmN0aW9uV3JhcHBlciwgVHlwZSwgaXNQcmVzZW50LCBpc0JsYW5rLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtLZXl9IGZyb20gJy4va2V5JztcbmltcG9ydCB7U2VsZk1ldGFkYXRhLCBIb3N0TWV0YWRhdGEsIFNraXBTZWxmTWV0YWRhdGF9IGZyb20gJy4vbWV0YWRhdGEnO1xuXG4vLyBUaHJlc2hvbGQgZm9yIHRoZSBkeW5hbWljIHZlcnNpb25cbmNvbnN0IF9NQVhfQ09OU1RSVUNUSU9OX0NPVU5URVIgPSAxMDtcblxuZXhwb3J0IGNvbnN0IFVOREVGSU5FRDogT2JqZWN0ID0gQ09OU1RfRVhQUihuZXcgT2JqZWN0KCkpO1xuXG4vKipcbiAqIFZpc2liaWxpdHkgb2YgYSB7QGxpbmsgUHJvdmlkZXJ9LlxuICovXG5leHBvcnQgZW51bSBWaXNpYmlsaXR5IHtcbiAgLyoqXG4gICAqIEEgYFB1YmxpY2Age0BsaW5rIFByb3ZpZGVyfSBpcyBvbmx5IHZpc2libGUgdG8gcmVndWxhciAoYXMgb3Bwb3NlZCB0byBob3N0KSBjaGlsZCBpbmplY3RvcnMuXG4gICAqL1xuICBQdWJsaWMsXG4gIC8qKlxuICAgKiBBIGBQcml2YXRlYCB7QGxpbmsgUHJvdmlkZXJ9IGlzIG9ubHkgdmlzaWJsZSB0byBob3N0IChhcyBvcHBvc2VkIHRvIHJlZ3VsYXIpIGNoaWxkIGluamVjdG9ycy5cbiAgICovXG4gIFByaXZhdGUsXG4gIC8qKlxuICAgKiBBIGBQdWJsaWNBbmRQcml2YXRlYCB7QGxpbmsgUHJvdmlkZXJ9IGlzIHZpc2libGUgdG8gYm90aCBob3N0IGFuZCByZWd1bGFyIGNoaWxkIGluamVjdG9ycy5cbiAgICovXG4gIFB1YmxpY0FuZFByaXZhdGVcbn1cblxuZnVuY3Rpb24gY2FuU2VlKHNyYzogVmlzaWJpbGl0eSwgZHN0OiBWaXNpYmlsaXR5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoc3JjID09PSBkc3QpIHx8XG4gICAgICAgICAoZHN0ID09PSBWaXNpYmlsaXR5LlB1YmxpY0FuZFByaXZhdGUgfHwgc3JjID09PSBWaXNpYmlsaXR5LlB1YmxpY0FuZFByaXZhdGUpO1xufVxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvdG9JbmplY3RvclN0cmF0ZWd5IHtcbiAgZ2V0UHJvdmlkZXJBdEluZGV4KGluZGV4OiBudW1iZXIpOiBSZXNvbHZlZFByb3ZpZGVyO1xuICBjcmVhdGVJbmplY3RvclN0cmF0ZWd5KGluajogSW5qZWN0b3IpOiBJbmplY3RvclN0cmF0ZWd5O1xufVxuXG5leHBvcnQgY2xhc3MgUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5IGltcGxlbWVudHMgUHJvdG9JbmplY3RvclN0cmF0ZWd5IHtcbiAgcHJvdmlkZXIwOiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXIxOiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXIyOiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXIzOiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI0OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI1OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI2OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI3OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI4OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI5OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcblxuICBrZXlJZDA6IG51bWJlciA9IG51bGw7XG4gIGtleUlkMTogbnVtYmVyID0gbnVsbDtcbiAga2V5SWQyOiBudW1iZXIgPSBudWxsO1xuICBrZXlJZDM6IG51bWJlciA9IG51bGw7XG4gIGtleUlkNDogbnVtYmVyID0gbnVsbDtcbiAga2V5SWQ1OiBudW1iZXIgPSBudWxsO1xuICBrZXlJZDY6IG51bWJlciA9IG51bGw7XG4gIGtleUlkNzogbnVtYmVyID0gbnVsbDtcbiAga2V5SWQ4OiBudW1iZXIgPSBudWxsO1xuICBrZXlJZDk6IG51bWJlciA9IG51bGw7XG5cbiAgdmlzaWJpbGl0eTA6IFZpc2liaWxpdHkgPSBudWxsO1xuICB2aXNpYmlsaXR5MTogVmlzaWJpbGl0eSA9IG51bGw7XG4gIHZpc2liaWxpdHkyOiBWaXNpYmlsaXR5ID0gbnVsbDtcbiAgdmlzaWJpbGl0eTM6IFZpc2liaWxpdHkgPSBudWxsO1xuICB2aXNpYmlsaXR5NDogVmlzaWJpbGl0eSA9IG51bGw7XG4gIHZpc2liaWxpdHk1OiBWaXNpYmlsaXR5ID0gbnVsbDtcbiAgdmlzaWJpbGl0eTY6IFZpc2liaWxpdHkgPSBudWxsO1xuICB2aXNpYmlsaXR5NzogVmlzaWJpbGl0eSA9IG51bGw7XG4gIHZpc2liaWxpdHk4OiBWaXNpYmlsaXR5ID0gbnVsbDtcbiAgdmlzaWJpbGl0eTk6IFZpc2liaWxpdHkgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RvRUk6IFByb3RvSW5qZWN0b3IsIGJ3djogUHJvdmlkZXJXaXRoVmlzaWJpbGl0eVtdKSB7XG4gICAgdmFyIGxlbmd0aCA9IGJ3di5sZW5ndGg7XG5cbiAgICBpZiAobGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5wcm92aWRlcjAgPSBid3ZbMF0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkMCA9IGJ3dlswXS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5MCA9IGJ3dlswXS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gMSkge1xuICAgICAgdGhpcy5wcm92aWRlcjEgPSBid3ZbMV0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkMSA9IGJ3dlsxXS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5MSA9IGJ3dlsxXS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gMikge1xuICAgICAgdGhpcy5wcm92aWRlcjIgPSBid3ZbMl0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkMiA9IGJ3dlsyXS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5MiA9IGJ3dlsyXS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gMykge1xuICAgICAgdGhpcy5wcm92aWRlcjMgPSBid3ZbM10ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkMyA9IGJ3dlszXS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5MyA9IGJ3dlszXS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gNCkge1xuICAgICAgdGhpcy5wcm92aWRlcjQgPSBid3ZbNF0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkNCA9IGJ3dls0XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5NCA9IGJ3dls0XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gNSkge1xuICAgICAgdGhpcy5wcm92aWRlcjUgPSBid3ZbNV0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkNSA9IGJ3dls1XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5NSA9IGJ3dls1XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gNikge1xuICAgICAgdGhpcy5wcm92aWRlcjYgPSBid3ZbNl0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkNiA9IGJ3dls2XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5NiA9IGJ3dls2XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gNykge1xuICAgICAgdGhpcy5wcm92aWRlcjcgPSBid3ZbN10ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkNyA9IGJ3dls3XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5NyA9IGJ3dls3XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gOCkge1xuICAgICAgdGhpcy5wcm92aWRlcjggPSBid3ZbOF0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkOCA9IGJ3dls4XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5OCA9IGJ3dls4XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gOSkge1xuICAgICAgdGhpcy5wcm92aWRlcjkgPSBid3ZbOV0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkOSA9IGJ3dls5XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5OSA9IGJ3dls5XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgfVxuXG4gIGdldFByb3ZpZGVyQXRJbmRleChpbmRleDogbnVtYmVyKTogYW55IHtcbiAgICBpZiAoaW5kZXggPT0gMCkgcmV0dXJuIHRoaXMucHJvdmlkZXIwO1xuICAgIGlmIChpbmRleCA9PSAxKSByZXR1cm4gdGhpcy5wcm92aWRlcjE7XG4gICAgaWYgKGluZGV4ID09IDIpIHJldHVybiB0aGlzLnByb3ZpZGVyMjtcbiAgICBpZiAoaW5kZXggPT0gMykgcmV0dXJuIHRoaXMucHJvdmlkZXIzO1xuICAgIGlmIChpbmRleCA9PSA0KSByZXR1cm4gdGhpcy5wcm92aWRlcjQ7XG4gICAgaWYgKGluZGV4ID09IDUpIHJldHVybiB0aGlzLnByb3ZpZGVyNTtcbiAgICBpZiAoaW5kZXggPT0gNikgcmV0dXJuIHRoaXMucHJvdmlkZXI2O1xuICAgIGlmIChpbmRleCA9PSA3KSByZXR1cm4gdGhpcy5wcm92aWRlcjc7XG4gICAgaWYgKGluZGV4ID09IDgpIHJldHVybiB0aGlzLnByb3ZpZGVyODtcbiAgICBpZiAoaW5kZXggPT0gOSkgcmV0dXJuIHRoaXMucHJvdmlkZXI5O1xuICAgIHRocm93IG5ldyBPdXRPZkJvdW5kc0Vycm9yKGluZGV4KTtcbiAgfVxuXG4gIGNyZWF0ZUluamVjdG9yU3RyYXRlZ3koaW5qZWN0b3I6IEluamVjdG9yKTogSW5qZWN0b3JTdHJhdGVneSB7XG4gICAgcmV0dXJuIG5ldyBJbmplY3RvcklubGluZVN0cmF0ZWd5KGluamVjdG9yLCB0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJvdG9JbmplY3RvckR5bmFtaWNTdHJhdGVneSBpbXBsZW1lbnRzIFByb3RvSW5qZWN0b3JTdHJhdGVneSB7XG4gIHByb3ZpZGVyczogUmVzb2x2ZWRQcm92aWRlcltdO1xuICBrZXlJZHM6IG51bWJlcltdO1xuICB2aXNpYmlsaXRpZXM6IFZpc2liaWxpdHlbXTtcblxuICBjb25zdHJ1Y3Rvcihwcm90b0luajogUHJvdG9JbmplY3RvciwgYnd2OiBQcm92aWRlcldpdGhWaXNpYmlsaXR5W10pIHtcbiAgICB2YXIgbGVuID0gYnd2Lmxlbmd0aDtcblxuICAgIHRoaXMucHJvdmlkZXJzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGxlbik7XG4gICAgdGhpcy5rZXlJZHMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUobGVuKTtcbiAgICB0aGlzLnZpc2liaWxpdGllcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShsZW4pO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgdGhpcy5wcm92aWRlcnNbaV0gPSBid3ZbaV0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkc1tpXSA9IGJ3dltpXS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXRpZXNbaV0gPSBid3ZbaV0udmlzaWJpbGl0eTtcbiAgICB9XG4gIH1cblxuICBnZXRQcm92aWRlckF0SW5kZXgoaW5kZXg6IG51bWJlcik6IGFueSB7XG4gICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLnByb3ZpZGVycy5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBPdXRPZkJvdW5kc0Vycm9yKGluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHJvdmlkZXJzW2luZGV4XTtcbiAgfVxuXG4gIGNyZWF0ZUluamVjdG9yU3RyYXRlZ3koZWk6IEluamVjdG9yKTogSW5qZWN0b3JTdHJhdGVneSB7XG4gICAgcmV0dXJuIG5ldyBJbmplY3RvckR5bmFtaWNTdHJhdGVneSh0aGlzLCBlaSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFByb3RvSW5qZWN0b3Ige1xuICAvKiogQGludGVybmFsICovXG4gIF9zdHJhdGVneTogUHJvdG9JbmplY3RvclN0cmF0ZWd5O1xuICBudW1iZXJPZlByb3ZpZGVyczogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGJ3djogUHJvdmlkZXJXaXRoVmlzaWJpbGl0eVtdKSB7XG4gICAgdGhpcy5udW1iZXJPZlByb3ZpZGVycyA9IGJ3di5sZW5ndGg7XG4gICAgdGhpcy5fc3RyYXRlZ3kgPSBid3YubGVuZ3RoID4gX01BWF9DT05TVFJVQ1RJT05fQ09VTlRFUiA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFByb3RvSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kodGhpcywgYnd2KSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFByb3RvSW5qZWN0b3JJbmxpbmVTdHJhdGVneSh0aGlzLCBid3YpO1xuICB9XG5cbiAgZ2V0UHJvdmlkZXJBdEluZGV4KGluZGV4OiBudW1iZXIpOiBhbnkgeyByZXR1cm4gdGhpcy5fc3RyYXRlZ3kuZ2V0UHJvdmlkZXJBdEluZGV4KGluZGV4KTsgfVxufVxuXG5cblxuZXhwb3J0IGludGVyZmFjZSBJbmplY3RvclN0cmF0ZWd5IHtcbiAgZ2V0T2JqQnlLZXlJZChrZXlJZDogbnVtYmVyLCB2aXNpYmlsaXR5OiBWaXNpYmlsaXR5KTogYW55O1xuICBnZXRPYmpBdEluZGV4KGluZGV4OiBudW1iZXIpOiBhbnk7XG4gIGdldE1heE51bWJlck9mT2JqZWN0cygpOiBudW1iZXI7XG5cbiAgYXR0YWNoKHBhcmVudDogSW5qZWN0b3IsIGlzSG9zdDogYm9vbGVhbik6IHZvaWQ7XG4gIHJlc2V0Q29uc3RydWN0aW9uQ291bnRlcigpOiB2b2lkO1xuICBpbnN0YW50aWF0ZVByb3ZpZGVyKHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCB2aXNpYmlsaXR5OiBWaXNpYmlsaXR5KTogYW55O1xufVxuXG5leHBvcnQgY2xhc3MgSW5qZWN0b3JJbmxpbmVTdHJhdGVneSBpbXBsZW1lbnRzIEluamVjdG9yU3RyYXRlZ3kge1xuICBvYmowOiBhbnkgPSBVTkRFRklORUQ7XG4gIG9iajE6IGFueSA9IFVOREVGSU5FRDtcbiAgb2JqMjogYW55ID0gVU5ERUZJTkVEO1xuICBvYmozOiBhbnkgPSBVTkRFRklORUQ7XG4gIG9iajQ6IGFueSA9IFVOREVGSU5FRDtcbiAgb2JqNTogYW55ID0gVU5ERUZJTkVEO1xuICBvYmo2OiBhbnkgPSBVTkRFRklORUQ7XG4gIG9iajc6IGFueSA9IFVOREVGSU5FRDtcbiAgb2JqODogYW55ID0gVU5ERUZJTkVEO1xuICBvYmo5OiBhbnkgPSBVTkRFRklORUQ7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGluamVjdG9yOiBJbmplY3RvciwgcHVibGljIHByb3RvU3RyYXRlZ3k6IFByb3RvSW5qZWN0b3JJbmxpbmVTdHJhdGVneSkge31cblxuICByZXNldENvbnN0cnVjdGlvbkNvdW50ZXIoKTogdm9pZCB7IHRoaXMuaW5qZWN0b3IuX2NvbnN0cnVjdGlvbkNvdW50ZXIgPSAwOyB9XG5cbiAgaW5zdGFudGlhdGVQcm92aWRlcihwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlciwgdmlzaWJpbGl0eTogVmlzaWJpbGl0eSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuaW5qZWN0b3IuX25ldyhwcm92aWRlciwgdmlzaWJpbGl0eSk7XG4gIH1cblxuICBhdHRhY2gocGFyZW50OiBJbmplY3RvciwgaXNIb3N0OiBib29sZWFuKTogdm9pZCB7XG4gICAgdmFyIGluaiA9IHRoaXMuaW5qZWN0b3I7XG4gICAgaW5qLl9wYXJlbnQgPSBwYXJlbnQ7XG4gICAgaW5qLl9pc0hvc3QgPSBpc0hvc3Q7XG4gIH1cblxuICBnZXRPYmpCeUtleUlkKGtleUlkOiBudW1iZXIsIHZpc2liaWxpdHk6IFZpc2liaWxpdHkpOiBhbnkge1xuICAgIHZhciBwID0gdGhpcy5wcm90b1N0cmF0ZWd5O1xuICAgIHZhciBpbmogPSB0aGlzLmluamVjdG9yO1xuXG4gICAgaWYgKHAua2V5SWQwID09PSBrZXlJZCAmJiBjYW5TZWUocC52aXNpYmlsaXR5MCwgdmlzaWJpbGl0eSkpIHtcbiAgICAgIGlmICh0aGlzLm9iajAgPT09IFVOREVGSU5FRCkge1xuICAgICAgICB0aGlzLm9iajAgPSBpbmouX25ldyhwLnByb3ZpZGVyMCwgcC52aXNpYmlsaXR5MCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vYmowO1xuICAgIH1cbiAgICBpZiAocC5rZXlJZDEgPT09IGtleUlkICYmIGNhblNlZShwLnZpc2liaWxpdHkxLCB2aXNpYmlsaXR5KSkge1xuICAgICAgaWYgKHRoaXMub2JqMSA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgIHRoaXMub2JqMSA9IGluai5fbmV3KHAucHJvdmlkZXIxLCBwLnZpc2liaWxpdHkxKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm9iajE7XG4gICAgfVxuICAgIGlmIChwLmtleUlkMiA9PT0ga2V5SWQgJiYgY2FuU2VlKHAudmlzaWJpbGl0eTIsIHZpc2liaWxpdHkpKSB7XG4gICAgICBpZiAodGhpcy5vYmoyID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgdGhpcy5vYmoyID0gaW5qLl9uZXcocC5wcm92aWRlcjIsIHAudmlzaWJpbGl0eTIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub2JqMjtcbiAgICB9XG4gICAgaWYgKHAua2V5SWQzID09PSBrZXlJZCAmJiBjYW5TZWUocC52aXNpYmlsaXR5MywgdmlzaWJpbGl0eSkpIHtcbiAgICAgIGlmICh0aGlzLm9iajMgPT09IFVOREVGSU5FRCkge1xuICAgICAgICB0aGlzLm9iajMgPSBpbmouX25ldyhwLnByb3ZpZGVyMywgcC52aXNpYmlsaXR5Myk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vYmozO1xuICAgIH1cbiAgICBpZiAocC5rZXlJZDQgPT09IGtleUlkICYmIGNhblNlZShwLnZpc2liaWxpdHk0LCB2aXNpYmlsaXR5KSkge1xuICAgICAgaWYgKHRoaXMub2JqNCA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgIHRoaXMub2JqNCA9IGluai5fbmV3KHAucHJvdmlkZXI0LCBwLnZpc2liaWxpdHk0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm9iajQ7XG4gICAgfVxuICAgIGlmIChwLmtleUlkNSA9PT0ga2V5SWQgJiYgY2FuU2VlKHAudmlzaWJpbGl0eTUsIHZpc2liaWxpdHkpKSB7XG4gICAgICBpZiAodGhpcy5vYmo1ID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgdGhpcy5vYmo1ID0gaW5qLl9uZXcocC5wcm92aWRlcjUsIHAudmlzaWJpbGl0eTUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub2JqNTtcbiAgICB9XG4gICAgaWYgKHAua2V5SWQ2ID09PSBrZXlJZCAmJiBjYW5TZWUocC52aXNpYmlsaXR5NiwgdmlzaWJpbGl0eSkpIHtcbiAgICAgIGlmICh0aGlzLm9iajYgPT09IFVOREVGSU5FRCkge1xuICAgICAgICB0aGlzLm9iajYgPSBpbmouX25ldyhwLnByb3ZpZGVyNiwgcC52aXNpYmlsaXR5Nik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vYmo2O1xuICAgIH1cbiAgICBpZiAocC5rZXlJZDcgPT09IGtleUlkICYmIGNhblNlZShwLnZpc2liaWxpdHk3LCB2aXNpYmlsaXR5KSkge1xuICAgICAgaWYgKHRoaXMub2JqNyA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgIHRoaXMub2JqNyA9IGluai5fbmV3KHAucHJvdmlkZXI3LCBwLnZpc2liaWxpdHk3KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm9iajc7XG4gICAgfVxuICAgIGlmIChwLmtleUlkOCA9PT0ga2V5SWQgJiYgY2FuU2VlKHAudmlzaWJpbGl0eTgsIHZpc2liaWxpdHkpKSB7XG4gICAgICBpZiAodGhpcy5vYmo4ID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgdGhpcy5vYmo4ID0gaW5qLl9uZXcocC5wcm92aWRlcjgsIHAudmlzaWJpbGl0eTgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub2JqODtcbiAgICB9XG4gICAgaWYgKHAua2V5SWQ5ID09PSBrZXlJZCAmJiBjYW5TZWUocC52aXNpYmlsaXR5OSwgdmlzaWJpbGl0eSkpIHtcbiAgICAgIGlmICh0aGlzLm9iajkgPT09IFVOREVGSU5FRCkge1xuICAgICAgICB0aGlzLm9iajkgPSBpbmouX25ldyhwLnByb3ZpZGVyOSwgcC52aXNpYmlsaXR5OSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vYmo5O1xuICAgIH1cblxuICAgIHJldHVybiBVTkRFRklORUQ7XG4gIH1cblxuICBnZXRPYmpBdEluZGV4KGluZGV4OiBudW1iZXIpOiBhbnkge1xuICAgIGlmIChpbmRleCA9PSAwKSByZXR1cm4gdGhpcy5vYmowO1xuICAgIGlmIChpbmRleCA9PSAxKSByZXR1cm4gdGhpcy5vYmoxO1xuICAgIGlmIChpbmRleCA9PSAyKSByZXR1cm4gdGhpcy5vYmoyO1xuICAgIGlmIChpbmRleCA9PSAzKSByZXR1cm4gdGhpcy5vYmozO1xuICAgIGlmIChpbmRleCA9PSA0KSByZXR1cm4gdGhpcy5vYmo0O1xuICAgIGlmIChpbmRleCA9PSA1KSByZXR1cm4gdGhpcy5vYmo1O1xuICAgIGlmIChpbmRleCA9PSA2KSByZXR1cm4gdGhpcy5vYmo2O1xuICAgIGlmIChpbmRleCA9PSA3KSByZXR1cm4gdGhpcy5vYmo3O1xuICAgIGlmIChpbmRleCA9PSA4KSByZXR1cm4gdGhpcy5vYmo4O1xuICAgIGlmIChpbmRleCA9PSA5KSByZXR1cm4gdGhpcy5vYmo5O1xuICAgIHRocm93IG5ldyBPdXRPZkJvdW5kc0Vycm9yKGluZGV4KTtcbiAgfVxuXG4gIGdldE1heE51bWJlck9mT2JqZWN0cygpOiBudW1iZXIgeyByZXR1cm4gX01BWF9DT05TVFJVQ1RJT05fQ09VTlRFUjsgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBJbmplY3RvckR5bmFtaWNTdHJhdGVneSBpbXBsZW1lbnRzIEluamVjdG9yU3RyYXRlZ3kge1xuICBvYmpzOiBhbnlbXTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJvdG9TdHJhdGVneTogUHJvdG9JbmplY3RvckR5bmFtaWNTdHJhdGVneSwgcHVibGljIGluamVjdG9yOiBJbmplY3Rvcikge1xuICAgIHRoaXMub2JqcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShwcm90b1N0cmF0ZWd5LnByb3ZpZGVycy5sZW5ndGgpO1xuICAgIExpc3RXcmFwcGVyLmZpbGwodGhpcy5vYmpzLCBVTkRFRklORUQpO1xuICB9XG5cbiAgcmVzZXRDb25zdHJ1Y3Rpb25Db3VudGVyKCk6IHZvaWQgeyB0aGlzLmluamVjdG9yLl9jb25zdHJ1Y3Rpb25Db3VudGVyID0gMDsgfVxuXG4gIGluc3RhbnRpYXRlUHJvdmlkZXIocHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIsIHZpc2liaWxpdHk6IFZpc2liaWxpdHkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmluamVjdG9yLl9uZXcocHJvdmlkZXIsIHZpc2liaWxpdHkpO1xuICB9XG5cbiAgYXR0YWNoKHBhcmVudDogSW5qZWN0b3IsIGlzSG9zdDogYm9vbGVhbik6IHZvaWQge1xuICAgIHZhciBpbmogPSB0aGlzLmluamVjdG9yO1xuICAgIGluai5fcGFyZW50ID0gcGFyZW50O1xuICAgIGluai5faXNIb3N0ID0gaXNIb3N0O1xuICB9XG5cbiAgZ2V0T2JqQnlLZXlJZChrZXlJZDogbnVtYmVyLCB2aXNpYmlsaXR5OiBWaXNpYmlsaXR5KTogYW55IHtcbiAgICB2YXIgcCA9IHRoaXMucHJvdG9TdHJhdGVneTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcC5rZXlJZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChwLmtleUlkc1tpXSA9PT0ga2V5SWQgJiYgY2FuU2VlKHAudmlzaWJpbGl0aWVzW2ldLCB2aXNpYmlsaXR5KSkge1xuICAgICAgICBpZiAodGhpcy5vYmpzW2ldID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgICB0aGlzLm9ianNbaV0gPSB0aGlzLmluamVjdG9yLl9uZXcocC5wcm92aWRlcnNbaV0sIHAudmlzaWJpbGl0aWVzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLm9ianNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFVOREVGSU5FRDtcbiAgfVxuXG4gIGdldE9iakF0SW5kZXgoaW5kZXg6IG51bWJlcik6IGFueSB7XG4gICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLm9ianMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgT3V0T2ZCb3VuZHNFcnJvcihpbmRleCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMub2Jqc1tpbmRleF07XG4gIH1cblxuICBnZXRNYXhOdW1iZXJPZk9iamVjdHMoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMub2Jqcy5sZW5ndGg7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFByb3ZpZGVyV2l0aFZpc2liaWxpdHkge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIsIHB1YmxpYyB2aXNpYmlsaXR5OiBWaXNpYmlsaXR5KXt9O1xuXG4gIGdldEtleUlkKCk6IG51bWJlciB7IHJldHVybiB0aGlzLnByb3ZpZGVyLmtleS5pZDsgfVxufVxuXG4vKipcbiAqIFVzZWQgdG8gcHJvdmlkZSBkZXBlbmRlbmNpZXMgdGhhdCBjYW5ub3QgYmUgZWFzaWx5IGV4cHJlc3NlZCBhcyBwcm92aWRlcnMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVwZW5kZW5jeVByb3ZpZGVyIHtcbiAgZ2V0RGVwZW5kZW5jeShpbmplY3RvcjogSW5qZWN0b3IsIHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCBkZXBlbmRlbmN5OiBEZXBlbmRlbmN5KTogYW55O1xufVxuXG4vKipcbiAqIEEgZGVwZW5kZW5jeSBpbmplY3Rpb24gY29udGFpbmVyIHVzZWQgZm9yIGluc3RhbnRpYXRpbmcgb2JqZWN0cyBhbmQgcmVzb2x2aW5nIGRlcGVuZGVuY2llcy5cbiAqXG4gKiBBbiBgSW5qZWN0b3JgIGlzIGEgcmVwbGFjZW1lbnQgZm9yIGEgYG5ld2Agb3BlcmF0b3IsIHdoaWNoIGNhbiBhdXRvbWF0aWNhbGx5IHJlc29sdmUgdGhlXG4gKiBjb25zdHJ1Y3RvciBkZXBlbmRlbmNpZXMuXG4gKlxuICogSW4gdHlwaWNhbCB1c2UsIGFwcGxpY2F0aW9uIGNvZGUgYXNrcyBmb3IgdGhlIGRlcGVuZGVuY2llcyBpbiB0aGUgY29uc3RydWN0b3IgYW5kIHRoZXkgYXJlXG4gKiByZXNvbHZlZCBieSB0aGUgYEluamVjdG9yYC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvanpqZWMwP3A9cHJldmlldykpXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYW4gYEluamVjdG9yYCBjb25maWd1cmVkIHRvIGNyZWF0ZSBgRW5naW5lYCBhbmQgYENhcmAuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgRW5naW5lIHtcbiAqIH1cbiAqXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBDYXIge1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgZW5naW5lOkVuZ2luZSkge31cbiAqIH1cbiAqXG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtDYXIsIEVuZ2luZV0pO1xuICogdmFyIGNhciA9IGluamVjdG9yLmdldChDYXIpO1xuICogZXhwZWN0KGNhciBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAqIGV4cGVjdChjYXIuZW5naW5lIGluc3RhbmNlb2YgRW5naW5lKS50b0JlKHRydWUpO1xuICogYGBgXG4gKlxuICogTm90aWNlLCB3ZSBkb24ndCB1c2UgdGhlIGBuZXdgIG9wZXJhdG9yIGJlY2F1c2Ugd2UgZXhwbGljaXRseSB3YW50IHRvIGhhdmUgdGhlIGBJbmplY3RvcmBcbiAqIHJlc29sdmUgYWxsIG9mIHRoZSBvYmplY3QncyBkZXBlbmRlbmNpZXMgYXV0b21hdGljYWxseS5cbiAqL1xuZXhwb3J0IGNsYXNzIEluamVjdG9yIHtcbiAgLyoqXG4gICAqIFR1cm5zIGFuIGFycmF5IG9mIHByb3ZpZGVyIGRlZmluaXRpb25zIGludG8gYW4gYXJyYXkgb2YgcmVzb2x2ZWQgcHJvdmlkZXJzLlxuICAgKlxuICAgKiBBIHJlc29sdXRpb24gaXMgYSBwcm9jZXNzIG9mIGZsYXR0ZW5pbmcgbXVsdGlwbGUgbmVzdGVkIGFycmF5cyBhbmQgY29udmVydGluZyBpbmRpdmlkdWFsXG4gICAqIHByb3ZpZGVycyBpbnRvIGFuIGFycmF5IG9mIHtAbGluayBSZXNvbHZlZFByb3ZpZGVyfXMuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9BaVhUSGk/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIEVuZ2luZSB7XG4gICAqIH1cbiAgICpcbiAgICogQEluamVjdGFibGUoKVxuICAgKiBjbGFzcyBDYXIge1xuICAgKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbmdpbmU6RW5naW5lKSB7fVxuICAgKiB9XG4gICAqXG4gICAqIHZhciBwcm92aWRlcnMgPSBJbmplY3Rvci5yZXNvbHZlKFtDYXIsIFtbRW5naW5lXV1dKTtcbiAgICpcbiAgICogZXhwZWN0KHByb3ZpZGVycy5sZW5ndGgpLnRvRXF1YWwoMik7XG4gICAqXG4gICAqIGV4cGVjdChwcm92aWRlcnNbMF0gaW5zdGFuY2VvZiBSZXNvbHZlZFByb3ZpZGVyKS50b0JlKHRydWUpO1xuICAgKiBleHBlY3QocHJvdmlkZXJzWzBdLmtleS5kaXNwbGF5TmFtZSkudG9CZShcIkNhclwiKTtcbiAgICogZXhwZWN0KHByb3ZpZGVyc1swXS5kZXBlbmRlbmNpZXMubGVuZ3RoKS50b0VxdWFsKDEpO1xuICAgKiBleHBlY3QocHJvdmlkZXJzWzBdLmZhY3RvcnkpLnRvQmVEZWZpbmVkKCk7XG4gICAqXG4gICAqIGV4cGVjdChwcm92aWRlcnNbMV0ua2V5LmRpc3BsYXlOYW1lKS50b0JlKFwiRW5naW5lXCIpO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqXG4gICAqIFNlZSB7QGxpbmsgSW5qZWN0b3IjZnJvbVJlc29sdmVkUHJvdmlkZXJzfSBmb3IgbW9yZSBpbmZvLlxuICAgKi9cbiAgc3RhdGljIHJlc29sdmUocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBSZXNvbHZlZFByb3ZpZGVyW10ge1xuICAgIHJldHVybiByZXNvbHZlUHJvdmlkZXJzKHByb3ZpZGVycyk7XG4gIH1cblxuICAvKipcbiAgICogUmVzb2x2ZXMgYW4gYXJyYXkgb2YgcHJvdmlkZXJzIGFuZCBjcmVhdGVzIGFuIGluamVjdG9yIGZyb20gdGhvc2UgcHJvdmlkZXJzLlxuICAgKlxuICAgKiBUaGUgcGFzc2VkLWluIHByb3ZpZGVycyBjYW4gYmUgYW4gYXJyYXkgb2YgYFR5cGVgLCB7QGxpbmsgUHJvdmlkZXJ9LFxuICAgKiBvciBhIHJlY3Vyc2l2ZSBhcnJheSBvZiBtb3JlIHByb3ZpZGVycy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2VQT2NjQT9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgRW5naW5lIHtcbiAgICogfVxuICAgKlxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIENhciB7XG4gICAqICAgY29uc3RydWN0b3IocHVibGljIGVuZ2luZTpFbmdpbmUpIHt9XG4gICAqIH1cbiAgICpcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbQ2FyLCBFbmdpbmVdKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChDYXIpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKiBgYGBcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBpcyBzbG93ZXIgdGhhbiB0aGUgY29ycmVzcG9uZGluZyBgZnJvbVJlc29sdmVkUHJvdmlkZXJzYFxuICAgKiBiZWNhdXNlIGl0IG5lZWRzIHRvIHJlc29sdmUgdGhlIHBhc3NlZC1pbiBwcm92aWRlcnMgZmlyc3QuXG4gICAqIFNlZSB7QGxpbmsgSW5qZWN0b3IjcmVzb2x2ZX0gYW5kIHtAbGluayBJbmplY3RvciNmcm9tUmVzb2x2ZWRQcm92aWRlcnN9LlxuICAgKi9cbiAgc3RhdGljIHJlc29sdmVBbmRDcmVhdGUocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBJbmplY3RvciB7XG4gICAgdmFyIHJlc29sdmVkUHJvdmlkZXJzID0gSW5qZWN0b3IucmVzb2x2ZShwcm92aWRlcnMpO1xuICAgIHJldHVybiBJbmplY3Rvci5mcm9tUmVzb2x2ZWRQcm92aWRlcnMocmVzb2x2ZWRQcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5qZWN0b3IgZnJvbSBwcmV2aW91c2x5IHJlc29sdmVkIHByb3ZpZGVycy5cbiAgICpcbiAgICogVGhpcyBBUEkgaXMgdGhlIHJlY29tbWVuZGVkIHdheSB0byBjb25zdHJ1Y3QgaW5qZWN0b3JzIGluIHBlcmZvcm1hbmNlLXNlbnNpdGl2ZSBwYXJ0cy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0tyU01jaT9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgRW5naW5lIHtcbiAgICogfVxuICAgKlxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIENhciB7XG4gICAqICAgY29uc3RydWN0b3IocHVibGljIGVuZ2luZTpFbmdpbmUpIHt9XG4gICAqIH1cbiAgICpcbiAgICogdmFyIHByb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUoW0NhciwgRW5naW5lXSk7XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLmZyb21SZXNvbHZlZFByb3ZpZGVycyhwcm92aWRlcnMpO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KENhcikgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgc3RhdGljIGZyb21SZXNvbHZlZFByb3ZpZGVycyhwcm92aWRlcnM6IFJlc29sdmVkUHJvdmlkZXJbXSk6IEluamVjdG9yIHtcbiAgICB2YXIgYmQgPSBwcm92aWRlcnMubWFwKGIgPT4gbmV3IFByb3ZpZGVyV2l0aFZpc2liaWxpdHkoYiwgVmlzaWJpbGl0eS5QdWJsaWMpKTtcbiAgICB2YXIgcHJvdG8gPSBuZXcgUHJvdG9JbmplY3RvcihiZCk7XG4gICAgcmV0dXJuIG5ldyBJbmplY3Rvcihwcm90bywgbnVsbCwgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIHN0YXRpYyBmcm9tUmVzb2x2ZWRCaW5kaW5ncyhwcm92aWRlcnM6IFJlc29sdmVkUHJvdmlkZXJbXSk6IEluamVjdG9yIHtcbiAgICByZXR1cm4gSW5qZWN0b3IuZnJvbVJlc29sdmVkUHJvdmlkZXJzKHByb3ZpZGVycyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zdHJhdGVneTogSW5qZWN0b3JTdHJhdGVneTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfaXNIb3N0OiBib29sZWFuID0gZmFsc2U7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbnN0cnVjdGlvbkNvdW50ZXI6IG51bWJlciA9IDA7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF9wcm90bzogYW55IC8qIFByb3RvSW5qZWN0b3IgKi87XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF9wYXJlbnQ6IEluamVjdG9yO1xuICAvKipcbiAgICogUHJpdmF0ZVxuICAgKi9cbiAgY29uc3RydWN0b3IoX3Byb3RvOiBhbnkgLyogUHJvdG9JbmplY3RvciAqLywgX3BhcmVudDogSW5qZWN0b3IgPSBudWxsLFxuICAgICAgICAgICAgICBwcml2YXRlIF9kZXBQcm92aWRlcjogYW55IC8qIERlcGVuZGVuY3lQcm92aWRlciAqLyA9IG51bGwsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2RlYnVnQ29udGV4dDogRnVuY3Rpb24gPSBudWxsKSB7XG4gICAgdGhpcy5fcHJvdG8gPSBfcHJvdG87XG4gICAgdGhpcy5fcGFyZW50ID0gX3BhcmVudDtcbiAgICB0aGlzLl9zdHJhdGVneSA9IF9wcm90by5fc3RyYXRlZ3kuY3JlYXRlSW5qZWN0b3JTdHJhdGVneSh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGRlYnVnQ29udGV4dCgpOiBhbnkgeyByZXR1cm4gdGhpcy5fZGVidWdDb250ZXh0KCk7IH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIGFuIGluc3RhbmNlIGZyb20gdGhlIGluamVjdG9yIGJhc2VkIG9uIHRoZSBwcm92aWRlZCB0b2tlbi5cbiAgICogVGhyb3dzIHtAbGluayBOb1Byb3ZpZGVyRXJyb3J9IGlmIG5vdCBmb3VuZC5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0hlWFNIZz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIHByb3ZpZGUoXCJ2YWxpZFRva2VuXCIsIHt1c2VWYWx1ZTogXCJWYWx1ZVwifSlcbiAgICogXSk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoXCJ2YWxpZFRva2VuXCIpKS50b0VxdWFsKFwiVmFsdWVcIik7XG4gICAqIGV4cGVjdCgoKSA9PiBpbmplY3Rvci5nZXQoXCJpbnZhbGlkVG9rZW5cIikpLnRvVGhyb3dFcnJvcigpO1xuICAgKiBgYGBcbiAgICpcbiAgICogYEluamVjdG9yYCByZXR1cm5zIGl0c2VsZiB3aGVuIGdpdmVuIGBJbmplY3RvcmAgYXMgYSB0b2tlbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtdKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChJbmplY3RvcikpLnRvQmUoaW5qZWN0b3IpO1xuICAgKiBgYGBcbiAgICovXG4gIGdldCh0b2tlbjogYW55KTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0QnlLZXkoS2V5LmdldCh0b2tlbiksIG51bGwsIG51bGwsIGZhbHNlLCBWaXNpYmlsaXR5LlB1YmxpY0FuZFByaXZhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhbiBpbnN0YW5jZSBmcm9tIHRoZSBpbmplY3RvciBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgdG9rZW4uXG4gICAqIFJldHVybnMgbnVsbCBpZiBub3QgZm91bmQuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC90cEViRXk/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBwcm92aWRlKFwidmFsaWRUb2tlblwiLCB7dXNlVmFsdWU6IFwiVmFsdWVcIn0pXG4gICAqIF0pO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0T3B0aW9uYWwoXCJ2YWxpZFRva2VuXCIpKS50b0VxdWFsKFwiVmFsdWVcIik7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXRPcHRpb25hbChcImludmFsaWRUb2tlblwiKSkudG9CZShudWxsKTtcbiAgICogYGBgXG4gICAqXG4gICAqIGBJbmplY3RvcmAgcmV0dXJucyBpdHNlbGYgd2hlbiBnaXZlbiBgSW5qZWN0b3JgIGFzIGEgdG9rZW4uXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXSk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXRPcHRpb25hbChJbmplY3RvcikpLnRvQmUoaW5qZWN0b3IpO1xuICAgKiBgYGBcbiAgICovXG4gIGdldE9wdGlvbmFsKHRva2VuOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9nZXRCeUtleShLZXkuZ2V0KHRva2VuKSwgbnVsbCwgbnVsbCwgdHJ1ZSwgVmlzaWJpbGl0eS5QdWJsaWNBbmRQcml2YXRlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGdldEF0KGluZGV4OiBudW1iZXIpOiBhbnkgeyByZXR1cm4gdGhpcy5fc3RyYXRlZ3kuZ2V0T2JqQXRJbmRleChpbmRleCk7IH1cblxuICAvKipcbiAgICogUGFyZW50IG9mIHRoaXMgaW5qZWN0b3IuXG4gICAqXG4gICAqIDwhLS0gVE9ETzogQWRkIGEgbGluayB0byB0aGUgc2VjdGlvbiBvZiB0aGUgdXNlciBndWlkZSB0YWxraW5nIGFib3V0IGhpZXJhcmNoaWNhbCBpbmplY3Rpb24uXG4gICAqIC0tPlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvZW9zTUdvP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIHBhcmVudCA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW10pO1xuICAgKiB2YXIgY2hpbGQgPSBwYXJlbnQucmVzb2x2ZUFuZENyZWF0ZUNoaWxkKFtdKTtcbiAgICogZXhwZWN0KGNoaWxkLnBhcmVudCkudG9CZShwYXJlbnQpO1xuICAgKiBgYGBcbiAgICovXG4gIGdldCBwYXJlbnQoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5fcGFyZW50OyB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKiBJbnRlcm5hbC4gRG8gbm90IHVzZS5cbiAgICogV2UgcmV0dXJuIGBhbnlgIG5vdCB0byBleHBvcnQgdGhlIEluamVjdG9yU3RyYXRlZ3kgdHlwZS5cbiAgICovXG4gIGdldCBpbnRlcm5hbFN0cmF0ZWd5KCk6IGFueSB7IHJldHVybiB0aGlzLl9zdHJhdGVneTsgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlcyBhbiBhcnJheSBvZiBwcm92aWRlcnMgYW5kIGNyZWF0ZXMgYSBjaGlsZCBpbmplY3RvciBmcm9tIHRob3NlIHByb3ZpZGVycy5cbiAgICpcbiAgICogPCEtLSBUT0RPOiBBZGQgYSBsaW5rIHRvIHRoZSBzZWN0aW9uIG9mIHRoZSB1c2VyIGd1aWRlIHRhbGtpbmcgYWJvdXQgaGllcmFyY2hpY2FsIGluamVjdGlvbi5cbiAgICogLS0+XG4gICAqXG4gICAqIFRoZSBwYXNzZWQtaW4gcHJvdmlkZXJzIGNhbiBiZSBhbiBhcnJheSBvZiBgVHlwZWAsIHtAbGluayBQcm92aWRlcn0sXG4gICAqIG9yIGEgcmVjdXJzaXZlIGFycmF5IG9mIG1vcmUgcHJvdmlkZXJzLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvb3BCM1Q0P3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgUGFyZW50UHJvdmlkZXIge31cbiAgICogY2xhc3MgQ2hpbGRQcm92aWRlciB7fVxuICAgKlxuICAgKiB2YXIgcGFyZW50ID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbUGFyZW50UHJvdmlkZXJdKTtcbiAgICogdmFyIGNoaWxkID0gcGFyZW50LnJlc29sdmVBbmRDcmVhdGVDaGlsZChbQ2hpbGRQcm92aWRlcl0pO1xuICAgKlxuICAgKiBleHBlY3QoY2hpbGQuZ2V0KFBhcmVudFByb3ZpZGVyKSBpbnN0YW5jZW9mIFBhcmVudFByb3ZpZGVyKS50b0JlKHRydWUpO1xuICAgKiBleHBlY3QoY2hpbGQuZ2V0KENoaWxkUHJvdmlkZXIpIGluc3RhbmNlb2YgQ2hpbGRQcm92aWRlcikudG9CZSh0cnVlKTtcbiAgICogZXhwZWN0KGNoaWxkLmdldChQYXJlbnRQcm92aWRlcikpLnRvQmUocGFyZW50LmdldChQYXJlbnRQcm92aWRlcikpO1xuICAgKiBgYGBcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBpcyBzbG93ZXIgdGhhbiB0aGUgY29ycmVzcG9uZGluZyBgY3JlYXRlQ2hpbGRGcm9tUmVzb2x2ZWRgXG4gICAqIGJlY2F1c2UgaXQgbmVlZHMgdG8gcmVzb2x2ZSB0aGUgcGFzc2VkLWluIHByb3ZpZGVycyBmaXJzdC5cbiAgICogU2VlIHtAbGluayBJbmplY3RvciNyZXNvbHZlfSBhbmQge0BsaW5rIEluamVjdG9yI2NyZWF0ZUNoaWxkRnJvbVJlc29sdmVkfS5cbiAgICovXG4gIHJlc29sdmVBbmRDcmVhdGVDaGlsZChwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IEluamVjdG9yIHtcbiAgICB2YXIgcmVzb2x2ZWRQcm92aWRlcnMgPSBJbmplY3Rvci5yZXNvbHZlKHByb3ZpZGVycyk7XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlQ2hpbGRGcm9tUmVzb2x2ZWQocmVzb2x2ZWRQcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjaGlsZCBpbmplY3RvciBmcm9tIHByZXZpb3VzbHkgcmVzb2x2ZWQgcHJvdmlkZXJzLlxuICAgKlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpbmsgdG8gdGhlIHNlY3Rpb24gb2YgdGhlIHVzZXIgZ3VpZGUgdGFsa2luZyBhYm91dCBoaWVyYXJjaGljYWwgaW5qZWN0aW9uLlxuICAgKiAtLT5cbiAgICpcbiAgICogVGhpcyBBUEkgaXMgdGhlIHJlY29tbWVuZGVkIHdheSB0byBjb25zdHJ1Y3QgaW5qZWN0b3JzIGluIHBlcmZvcm1hbmNlLXNlbnNpdGl2ZSBwYXJ0cy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1ZoeWZqTj9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFBhcmVudFByb3ZpZGVyIHt9XG4gICAqIGNsYXNzIENoaWxkUHJvdmlkZXIge31cbiAgICpcbiAgICogdmFyIHBhcmVudFByb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUoW1BhcmVudFByb3ZpZGVyXSk7XG4gICAqIHZhciBjaGlsZFByb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUoW0NoaWxkUHJvdmlkZXJdKTtcbiAgICpcbiAgICogdmFyIHBhcmVudCA9IEluamVjdG9yLmZyb21SZXNvbHZlZFByb3ZpZGVycyhwYXJlbnRQcm92aWRlcnMpO1xuICAgKiB2YXIgY2hpbGQgPSBwYXJlbnQuY3JlYXRlQ2hpbGRGcm9tUmVzb2x2ZWQoY2hpbGRQcm92aWRlcnMpO1xuICAgKlxuICAgKiBleHBlY3QoY2hpbGQuZ2V0KFBhcmVudFByb3ZpZGVyKSBpbnN0YW5jZW9mIFBhcmVudFByb3ZpZGVyKS50b0JlKHRydWUpO1xuICAgKiBleHBlY3QoY2hpbGQuZ2V0KENoaWxkUHJvdmlkZXIpIGluc3RhbmNlb2YgQ2hpbGRQcm92aWRlcikudG9CZSh0cnVlKTtcbiAgICogZXhwZWN0KGNoaWxkLmdldChQYXJlbnRQcm92aWRlcikpLnRvQmUocGFyZW50LmdldChQYXJlbnRQcm92aWRlcikpO1xuICAgKiBgYGBcbiAgICovXG4gIGNyZWF0ZUNoaWxkRnJvbVJlc29sdmVkKHByb3ZpZGVyczogUmVzb2x2ZWRQcm92aWRlcltdKTogSW5qZWN0b3Ige1xuICAgIHZhciBiZCA9IHByb3ZpZGVycy5tYXAoYiA9PiBuZXcgUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShiLCBWaXNpYmlsaXR5LlB1YmxpYykpO1xuICAgIHZhciBwcm90byA9IG5ldyBQcm90b0luamVjdG9yKGJkKTtcbiAgICB2YXIgaW5qID0gbmV3IEluamVjdG9yKHByb3RvLCBudWxsLCBudWxsKTtcbiAgICBpbmouX3BhcmVudCA9IHRoaXM7XG4gICAgcmV0dXJuIGluajtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlcyBhIHByb3ZpZGVyIGFuZCBpbnN0YW50aWF0ZXMgYW4gb2JqZWN0IGluIHRoZSBjb250ZXh0IG9mIHRoZSBpbmplY3Rvci5cbiAgICpcbiAgICogVGhlIGNyZWF0ZWQgb2JqZWN0IGRvZXMgbm90IGdldCBjYWNoZWQgYnkgdGhlIGluamVjdG9yLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQveXZWWG9CP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogQEluamVjdGFibGUoKVxuICAgKiBjbGFzcyBFbmdpbmUge1xuICAgKiB9XG4gICAqXG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgQ2FyIHtcbiAgICogICBjb25zdHJ1Y3RvcihwdWJsaWMgZW5naW5lOkVuZ2luZSkge31cbiAgICogfVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtFbmdpbmVdKTtcbiAgICpcbiAgICogdmFyIGNhciA9IGluamVjdG9yLnJlc29sdmVBbmRJbnN0YW50aWF0ZShDYXIpO1xuICAgKiBleHBlY3QoY2FyLmVuZ2luZSkudG9CZShpbmplY3Rvci5nZXQoRW5naW5lKSk7XG4gICAqIGV4cGVjdChjYXIpLm5vdC50b0JlKGluamVjdG9yLnJlc29sdmVBbmRJbnN0YW50aWF0ZShDYXIpKTtcbiAgICogYGBgXG4gICAqL1xuICByZXNvbHZlQW5kSW5zdGFudGlhdGUocHJvdmlkZXI6IFR5cGUgfCBQcm92aWRlcik6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zdGFudGlhdGVSZXNvbHZlZChJbmplY3Rvci5yZXNvbHZlKFtwcm92aWRlcl0pWzBdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnN0YW50aWF0ZXMgYW4gb2JqZWN0IHVzaW5nIGEgcmVzb2x2ZWQgcHJvdmlkZXIgaW4gdGhlIGNvbnRleHQgb2YgdGhlIGluamVjdG9yLlxuICAgKlxuICAgKiBUaGUgY3JlYXRlZCBvYmplY3QgZG9lcyBub3QgZ2V0IGNhY2hlZCBieSB0aGUgaW5qZWN0b3IuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9wdENJbVE/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIEVuZ2luZSB7XG4gICAqIH1cbiAgICpcbiAgICogQEluamVjdGFibGUoKVxuICAgKiBjbGFzcyBDYXIge1xuICAgKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbmdpbmU6RW5naW5lKSB7fVxuICAgKiB9XG4gICAqXG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0VuZ2luZV0pO1xuICAgKiB2YXIgY2FyUHJvdmlkZXIgPSBJbmplY3Rvci5yZXNvbHZlKFtDYXJdKVswXTtcbiAgICogdmFyIGNhciA9IGluamVjdG9yLmluc3RhbnRpYXRlUmVzb2x2ZWQoY2FyUHJvdmlkZXIpO1xuICAgKiBleHBlY3QoY2FyLmVuZ2luZSkudG9CZShpbmplY3Rvci5nZXQoRW5naW5lKSk7XG4gICAqIGV4cGVjdChjYXIpLm5vdC50b0JlKGluamVjdG9yLmluc3RhbnRpYXRlUmVzb2x2ZWQoY2FyUHJvdmlkZXIpKTtcbiAgICogYGBgXG4gICAqL1xuICBpbnN0YW50aWF0ZVJlc29sdmVkKHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5faW5zdGFudGlhdGVQcm92aWRlcihwcm92aWRlciwgVmlzaWJpbGl0eS5QdWJsaWNBbmRQcml2YXRlKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25ldyhwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlciwgdmlzaWJpbGl0eTogVmlzaWJpbGl0eSk6IGFueSB7XG4gICAgaWYgKHRoaXMuX2NvbnN0cnVjdGlvbkNvdW50ZXIrKyA+IHRoaXMuX3N0cmF0ZWd5LmdldE1heE51bWJlck9mT2JqZWN0cygpKSB7XG4gICAgICB0aHJvdyBuZXcgQ3ljbGljRGVwZW5kZW5jeUVycm9yKHRoaXMsIHByb3ZpZGVyLmtleSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9pbnN0YW50aWF0ZVByb3ZpZGVyKHByb3ZpZGVyLCB2aXNpYmlsaXR5KTtcbiAgfVxuXG4gIHByaXZhdGUgX2luc3RhbnRpYXRlUHJvdmlkZXIocHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIsIHZpc2liaWxpdHk6IFZpc2liaWxpdHkpOiBhbnkge1xuICAgIGlmIChwcm92aWRlci5tdWx0aVByb3ZpZGVyKSB7XG4gICAgICB2YXIgcmVzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKHByb3ZpZGVyLnJlc29sdmVkRmFjdG9yaWVzLmxlbmd0aCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3ZpZGVyLnJlc29sdmVkRmFjdG9yaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHJlc1tpXSA9IHRoaXMuX2luc3RhbnRpYXRlKHByb3ZpZGVyLCBwcm92aWRlci5yZXNvbHZlZEZhY3Rvcmllc1tpXSwgdmlzaWJpbGl0eSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5faW5zdGFudGlhdGUocHJvdmlkZXIsIHByb3ZpZGVyLnJlc29sdmVkRmFjdG9yaWVzWzBdLCB2aXNpYmlsaXR5KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9pbnN0YW50aWF0ZShwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlciwgcmVzb2x2ZWRGYWN0b3J5OiBSZXNvbHZlZEZhY3RvcnksXG4gICAgICAgICAgICAgICAgICAgICAgIHZpc2liaWxpdHk6IFZpc2liaWxpdHkpOiBhbnkge1xuICAgIHZhciBmYWN0b3J5ID0gcmVzb2x2ZWRGYWN0b3J5LmZhY3Rvcnk7XG4gICAgdmFyIGRlcHMgPSByZXNvbHZlZEZhY3RvcnkuZGVwZW5kZW5jaWVzO1xuICAgIHZhciBsZW5ndGggPSBkZXBzLmxlbmd0aDtcblxuICAgIHZhciBkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwLCBkMTEsIGQxMiwgZDEzLCBkMTQsIGQxNSwgZDE2LCBkMTcsIGQxOCwgZDE5O1xuICAgIHRyeSB7XG4gICAgICBkMCA9IGxlbmd0aCA+IDAgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMF0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQxID0gbGVuZ3RoID4gMSA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1sxXSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDIgPSBsZW5ndGggPiAyID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzJdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMyA9IGxlbmd0aCA+IDMgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbM10sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQ0ID0gbGVuZ3RoID4gNCA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1s0XSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDUgPSBsZW5ndGggPiA1ID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzVdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkNiA9IGxlbmd0aCA+IDYgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbNl0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQ3ID0gbGVuZ3RoID4gNyA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1s3XSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDggPSBsZW5ndGggPiA4ID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzhdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkOSA9IGxlbmd0aCA+IDkgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbOV0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQxMCA9IGxlbmd0aCA+IDEwID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzEwXSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDExID0gbGVuZ3RoID4gMTEgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMTFdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMTIgPSBsZW5ndGggPiAxMiA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1sxMl0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQxMyA9IGxlbmd0aCA+IDEzID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzEzXSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDE0ID0gbGVuZ3RoID4gMTQgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMTRdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMTUgPSBsZW5ndGggPiAxNSA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1sxNV0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQxNiA9IGxlbmd0aCA+IDE2ID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzE2XSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDE3ID0gbGVuZ3RoID4gMTcgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMTddLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMTggPSBsZW5ndGggPiAxOCA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1sxOF0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQxOSA9IGxlbmd0aCA+IDE5ID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzE5XSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgQWJzdHJhY3RQcm92aWRlckVycm9yIHx8IGUgaW5zdGFuY2VvZiBJbnN0YW50aWF0aW9uRXJyb3IpIHtcbiAgICAgICAgZS5hZGRLZXkodGhpcywgcHJvdmlkZXIua2V5KTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgdmFyIG9iajtcbiAgICB0cnkge1xuICAgICAgc3dpdGNoIChsZW5ndGgpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3OlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgsIGQ5KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgsIGQ5LCBkMTApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDksIGQxMCwgZDExKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgsIGQ5LCBkMTAsIGQxMSwgZDEyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgsIGQ5LCBkMTAsIGQxMSwgZDEyLCBkMTMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDksIGQxMCwgZDExLCBkMTIsIGQxMywgZDE0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgsIGQ5LCBkMTAsIGQxMSwgZDEyLCBkMTMsIGQxNCwgZDE1KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNzpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgsIGQ5LCBkMTAsIGQxMSwgZDEyLCBkMTMsIGQxNCwgZDE1LCBkMTYpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE4OlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDksIGQxMCwgZDExLCBkMTIsIGQxMywgZDE0LCBkMTUsIGQxNixcbiAgICAgICAgICAgICAgICAgICAgICAgIGQxNyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTk6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwLCBkMTEsIGQxMiwgZDEzLCBkMTQsIGQxNSwgZDE2LFxuICAgICAgICAgICAgICAgICAgICAgICAgZDE3LCBkMTgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDIwOlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDksIGQxMCwgZDExLCBkMTIsIGQxMywgZDE0LCBkMTUsIGQxNixcbiAgICAgICAgICAgICAgICAgICAgICAgIGQxNywgZDE4LCBkMTkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBJbnN0YW50aWF0aW9uRXJyb3IodGhpcywgZSwgZS5zdGFjaywgcHJvdmlkZXIua2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHByaXZhdGUgX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlciwgZGVwOiBEZXBlbmRlbmN5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJWaXNpYmlsaXR5OiBWaXNpYmlsaXR5KTogYW55IHtcbiAgICB2YXIgc3BlY2lhbCA9IGlzUHJlc2VudCh0aGlzLl9kZXBQcm92aWRlcikgP1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RlcFByb3ZpZGVyLmdldERlcGVuZGVuY3kodGhpcywgcHJvdmlkZXIsIGRlcCkgOlxuICAgICAgICAgICAgICAgICAgICAgIFVOREVGSU5FRDtcbiAgICBpZiAoc3BlY2lhbCAhPT0gVU5ERUZJTkVEKSB7XG4gICAgICByZXR1cm4gc3BlY2lhbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldEJ5S2V5KGRlcC5rZXksIGRlcC5sb3dlckJvdW5kVmlzaWJpbGl0eSwgZGVwLnVwcGVyQm91bmRWaXNpYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcC5vcHRpb25hbCwgcHJvdmlkZXJWaXNpYmlsaXR5KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9nZXRCeUtleShrZXk6IEtleSwgbG93ZXJCb3VuZFZpc2liaWxpdHk6IE9iamVjdCwgdXBwZXJCb3VuZFZpc2liaWxpdHk6IE9iamVjdCxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uYWw6IGJvb2xlYW4sIHByb3ZpZGVyVmlzaWJpbGl0eTogVmlzaWJpbGl0eSk6IGFueSB7XG4gICAgaWYgKGtleSA9PT0gSU5KRUNUT1JfS0VZKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAodXBwZXJCb3VuZFZpc2liaWxpdHkgaW5zdGFuY2VvZiBTZWxmTWV0YWRhdGEpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRCeUtleVNlbGYoa2V5LCBvcHRpb25hbCwgcHJvdmlkZXJWaXNpYmlsaXR5KTtcblxuICAgIH0gZWxzZSBpZiAodXBwZXJCb3VuZFZpc2liaWxpdHkgaW5zdGFuY2VvZiBIb3N0TWV0YWRhdGEpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRCeUtleUhvc3Qoa2V5LCBvcHRpb25hbCwgcHJvdmlkZXJWaXNpYmlsaXR5LCBsb3dlckJvdW5kVmlzaWJpbGl0eSk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldEJ5S2V5RGVmYXVsdChrZXksIG9wdGlvbmFsLCBwcm92aWRlclZpc2liaWxpdHksIGxvd2VyQm91bmRWaXNpYmlsaXR5KTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF90aHJvd09yTnVsbChrZXk6IEtleSwgb3B0aW9uYWw6IGJvb2xlYW4pOiBhbnkge1xuICAgIGlmIChvcHRpb25hbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBOb1Byb3ZpZGVyRXJyb3IodGhpcywga2V5KTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZXRCeUtleVNlbGYoa2V5OiBLZXksIG9wdGlvbmFsOiBib29sZWFuLCBwcm92aWRlclZpc2liaWxpdHk6IFZpc2liaWxpdHkpOiBhbnkge1xuICAgIHZhciBvYmogPSB0aGlzLl9zdHJhdGVneS5nZXRPYmpCeUtleUlkKGtleS5pZCwgcHJvdmlkZXJWaXNpYmlsaXR5KTtcbiAgICByZXR1cm4gKG9iaiAhPT0gVU5ERUZJTkVEKSA/IG9iaiA6IHRoaXMuX3Rocm93T3JOdWxsKGtleSwgb3B0aW9uYWwpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2V0QnlLZXlIb3N0KGtleTogS2V5LCBvcHRpb25hbDogYm9vbGVhbiwgcHJvdmlkZXJWaXNpYmlsaXR5OiBWaXNpYmlsaXR5LFxuICAgICAgICAgICAgICAgIGxvd2VyQm91bmRWaXNpYmlsaXR5OiBPYmplY3QpOiBhbnkge1xuICAgIHZhciBpbmogPSB0aGlzO1xuXG4gICAgaWYgKGxvd2VyQm91bmRWaXNpYmlsaXR5IGluc3RhbmNlb2YgU2tpcFNlbGZNZXRhZGF0YSkge1xuICAgICAgaWYgKGluai5faXNIb3N0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRQcml2YXRlRGVwZW5kZW5jeShrZXksIG9wdGlvbmFsLCBpbmopO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5qID0gaW5qLl9wYXJlbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgd2hpbGUgKGluaiAhPSBudWxsKSB7XG4gICAgICB2YXIgb2JqID0gaW5qLl9zdHJhdGVneS5nZXRPYmpCeUtleUlkKGtleS5pZCwgcHJvdmlkZXJWaXNpYmlsaXR5KTtcbiAgICAgIGlmIChvYmogIT09IFVOREVGSU5FRCkgcmV0dXJuIG9iajtcblxuICAgICAgaWYgKGlzUHJlc2VudChpbmouX3BhcmVudCkgJiYgaW5qLl9pc0hvc3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldFByaXZhdGVEZXBlbmRlbmN5KGtleSwgb3B0aW9uYWwsIGluaik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmogPSBpbmouX3BhcmVudDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fdGhyb3dPck51bGwoa2V5LCBvcHRpb25hbCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZXRQcml2YXRlRGVwZW5kZW5jeShrZXk6IEtleSwgb3B0aW9uYWw6IGJvb2xlYW4sIGluajogSW5qZWN0b3IpOiBhbnkge1xuICAgIHZhciBvYmogPSBpbmouX3BhcmVudC5fc3RyYXRlZ3kuZ2V0T2JqQnlLZXlJZChrZXkuaWQsIFZpc2liaWxpdHkuUHJpdmF0ZSk7XG4gICAgcmV0dXJuIChvYmogIT09IFVOREVGSU5FRCkgPyBvYmogOiB0aGlzLl90aHJvd09yTnVsbChrZXksIG9wdGlvbmFsKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dldEJ5S2V5RGVmYXVsdChrZXk6IEtleSwgb3B0aW9uYWw6IGJvb2xlYW4sIHByb3ZpZGVyVmlzaWJpbGl0eTogVmlzaWJpbGl0eSxcbiAgICAgICAgICAgICAgICAgICBsb3dlckJvdW5kVmlzaWJpbGl0eTogT2JqZWN0KTogYW55IHtcbiAgICB2YXIgaW5qID0gdGhpcztcblxuICAgIGlmIChsb3dlckJvdW5kVmlzaWJpbGl0eSBpbnN0YW5jZW9mIFNraXBTZWxmTWV0YWRhdGEpIHtcbiAgICAgIHByb3ZpZGVyVmlzaWJpbGl0eSA9IGluai5faXNIb3N0ID8gVmlzaWJpbGl0eS5QdWJsaWNBbmRQcml2YXRlIDogVmlzaWJpbGl0eS5QdWJsaWM7XG4gICAgICBpbmogPSBpbmouX3BhcmVudDtcbiAgICB9XG5cbiAgICB3aGlsZSAoaW5qICE9IG51bGwpIHtcbiAgICAgIHZhciBvYmogPSBpbmouX3N0cmF0ZWd5LmdldE9iakJ5S2V5SWQoa2V5LmlkLCBwcm92aWRlclZpc2liaWxpdHkpO1xuICAgICAgaWYgKG9iaiAhPT0gVU5ERUZJTkVEKSByZXR1cm4gb2JqO1xuXG4gICAgICBwcm92aWRlclZpc2liaWxpdHkgPSBpbmouX2lzSG9zdCA/IFZpc2liaWxpdHkuUHVibGljQW5kUHJpdmF0ZSA6IFZpc2liaWxpdHkuUHVibGljO1xuICAgICAgaW5qID0gaW5qLl9wYXJlbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3Rocm93T3JOdWxsKGtleSwgb3B0aW9uYWwpO1xuICB9XG5cbiAgZ2V0IGRpc3BsYXlOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBJbmplY3Rvcihwcm92aWRlcnM6IFske19tYXBQcm92aWRlcnModGhpcywgYiA9PiBgIFwiJHtiLmtleS5kaXNwbGF5TmFtZX1cIiBgKS5qb2luKFwiLCBcIil9XSlgO1xuICB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZGlzcGxheU5hbWU7IH1cbn1cblxudmFyIElOSkVDVE9SX0tFWSA9IEtleS5nZXQoSW5qZWN0b3IpO1xuXG5cbmZ1bmN0aW9uIF9tYXBQcm92aWRlcnMoaW5qZWN0b3I6IEluamVjdG9yLCBmbjogRnVuY3Rpb24pOiBhbnlbXSB7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmplY3Rvci5fcHJvdG8ubnVtYmVyT2ZQcm92aWRlcnM7ICsraSkge1xuICAgIHJlcy5wdXNoKGZuKGluamVjdG9yLl9wcm90by5nZXRQcm92aWRlckF0SW5kZXgoaSkpKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuIl19