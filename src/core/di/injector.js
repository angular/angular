'use strict';var collection_1 = require('angular2/src/facade/collection');
var provider_1 = require('./provider');
var exceptions_1 = require('./exceptions');
var lang_1 = require('angular2/src/facade/lang');
var key_1 = require('./key');
var metadata_1 = require('./metadata');
// Threshold for the dynamic version
var _MAX_CONSTRUCTION_COUNTER = 10;
exports.UNDEFINED = lang_1.CONST_EXPR(new Object());
/**
 * Visibility of a {@link Provider}.
 */
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
})(exports.Visibility || (exports.Visibility = {}));
var Visibility = exports.Visibility;
function canSee(src, dst) {
    return (src === dst) ||
        (dst === Visibility.PublicAndPrivate || src === Visibility.PublicAndPrivate);
}
var ProtoInjectorInlineStrategy = (function () {
    function ProtoInjectorInlineStrategy(protoEI, bwv) {
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
    ProtoInjectorInlineStrategy.prototype.getProviderAtIndex = function (index) {
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
        throw new exceptions_1.OutOfBoundsError(index);
    };
    ProtoInjectorInlineStrategy.prototype.createInjectorStrategy = function (injector) {
        return new InjectorInlineStrategy(injector, this);
    };
    return ProtoInjectorInlineStrategy;
})();
exports.ProtoInjectorInlineStrategy = ProtoInjectorInlineStrategy;
var ProtoInjectorDynamicStrategy = (function () {
    function ProtoInjectorDynamicStrategy(protoInj, bwv) {
        var len = bwv.length;
        this.providers = collection_1.ListWrapper.createFixedSize(len);
        this.keyIds = collection_1.ListWrapper.createFixedSize(len);
        this.visibilities = collection_1.ListWrapper.createFixedSize(len);
        for (var i = 0; i < len; i++) {
            this.providers[i] = bwv[i].provider;
            this.keyIds[i] = bwv[i].getKeyId();
            this.visibilities[i] = bwv[i].visibility;
        }
    }
    ProtoInjectorDynamicStrategy.prototype.getProviderAtIndex = function (index) {
        if (index < 0 || index >= this.providers.length) {
            throw new exceptions_1.OutOfBoundsError(index);
        }
        return this.providers[index];
    };
    ProtoInjectorDynamicStrategy.prototype.createInjectorStrategy = function (ei) {
        return new InjectorDynamicStrategy(this, ei);
    };
    return ProtoInjectorDynamicStrategy;
})();
exports.ProtoInjectorDynamicStrategy = ProtoInjectorDynamicStrategy;
var ProtoInjector = (function () {
    function ProtoInjector(bwv) {
        this.numberOfProviders = bwv.length;
        this._strategy = bwv.length > _MAX_CONSTRUCTION_COUNTER ?
            new ProtoInjectorDynamicStrategy(this, bwv) :
            new ProtoInjectorInlineStrategy(this, bwv);
    }
    ProtoInjector.fromResolvedProviders = function (providers) {
        var bd = providers.map(function (b) { return new ProviderWithVisibility(b, Visibility.Public); });
        return new ProtoInjector(bd);
    };
    ProtoInjector.prototype.getProviderAtIndex = function (index) {
        return this._strategy.getProviderAtIndex(index);
    };
    return ProtoInjector;
})();
exports.ProtoInjector = ProtoInjector;
var InjectorInlineStrategy = (function () {
    function InjectorInlineStrategy(injector, protoStrategy) {
        this.injector = injector;
        this.protoStrategy = protoStrategy;
        this.obj0 = exports.UNDEFINED;
        this.obj1 = exports.UNDEFINED;
        this.obj2 = exports.UNDEFINED;
        this.obj3 = exports.UNDEFINED;
        this.obj4 = exports.UNDEFINED;
        this.obj5 = exports.UNDEFINED;
        this.obj6 = exports.UNDEFINED;
        this.obj7 = exports.UNDEFINED;
        this.obj8 = exports.UNDEFINED;
        this.obj9 = exports.UNDEFINED;
    }
    InjectorInlineStrategy.prototype.resetConstructionCounter = function () { this.injector._constructionCounter = 0; };
    InjectorInlineStrategy.prototype.instantiateProvider = function (provider, visibility) {
        return this.injector._new(provider, visibility);
    };
    InjectorInlineStrategy.prototype.getObjByKeyId = function (keyId, visibility) {
        var p = this.protoStrategy;
        var inj = this.injector;
        if (p.keyId0 === keyId && canSee(p.visibility0, visibility)) {
            if (this.obj0 === exports.UNDEFINED) {
                this.obj0 = inj._new(p.provider0, p.visibility0);
            }
            return this.obj0;
        }
        if (p.keyId1 === keyId && canSee(p.visibility1, visibility)) {
            if (this.obj1 === exports.UNDEFINED) {
                this.obj1 = inj._new(p.provider1, p.visibility1);
            }
            return this.obj1;
        }
        if (p.keyId2 === keyId && canSee(p.visibility2, visibility)) {
            if (this.obj2 === exports.UNDEFINED) {
                this.obj2 = inj._new(p.provider2, p.visibility2);
            }
            return this.obj2;
        }
        if (p.keyId3 === keyId && canSee(p.visibility3, visibility)) {
            if (this.obj3 === exports.UNDEFINED) {
                this.obj3 = inj._new(p.provider3, p.visibility3);
            }
            return this.obj3;
        }
        if (p.keyId4 === keyId && canSee(p.visibility4, visibility)) {
            if (this.obj4 === exports.UNDEFINED) {
                this.obj4 = inj._new(p.provider4, p.visibility4);
            }
            return this.obj4;
        }
        if (p.keyId5 === keyId && canSee(p.visibility5, visibility)) {
            if (this.obj5 === exports.UNDEFINED) {
                this.obj5 = inj._new(p.provider5, p.visibility5);
            }
            return this.obj5;
        }
        if (p.keyId6 === keyId && canSee(p.visibility6, visibility)) {
            if (this.obj6 === exports.UNDEFINED) {
                this.obj6 = inj._new(p.provider6, p.visibility6);
            }
            return this.obj6;
        }
        if (p.keyId7 === keyId && canSee(p.visibility7, visibility)) {
            if (this.obj7 === exports.UNDEFINED) {
                this.obj7 = inj._new(p.provider7, p.visibility7);
            }
            return this.obj7;
        }
        if (p.keyId8 === keyId && canSee(p.visibility8, visibility)) {
            if (this.obj8 === exports.UNDEFINED) {
                this.obj8 = inj._new(p.provider8, p.visibility8);
            }
            return this.obj8;
        }
        if (p.keyId9 === keyId && canSee(p.visibility9, visibility)) {
            if (this.obj9 === exports.UNDEFINED) {
                this.obj9 = inj._new(p.provider9, p.visibility9);
            }
            return this.obj9;
        }
        return exports.UNDEFINED;
    };
    InjectorInlineStrategy.prototype.getObjAtIndex = function (index) {
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
        throw new exceptions_1.OutOfBoundsError(index);
    };
    InjectorInlineStrategy.prototype.getMaxNumberOfObjects = function () { return _MAX_CONSTRUCTION_COUNTER; };
    return InjectorInlineStrategy;
})();
exports.InjectorInlineStrategy = InjectorInlineStrategy;
var InjectorDynamicStrategy = (function () {
    function InjectorDynamicStrategy(protoStrategy, injector) {
        this.protoStrategy = protoStrategy;
        this.injector = injector;
        this.objs = collection_1.ListWrapper.createFixedSize(protoStrategy.providers.length);
        collection_1.ListWrapper.fill(this.objs, exports.UNDEFINED);
    }
    InjectorDynamicStrategy.prototype.resetConstructionCounter = function () { this.injector._constructionCounter = 0; };
    InjectorDynamicStrategy.prototype.instantiateProvider = function (provider, visibility) {
        return this.injector._new(provider, visibility);
    };
    InjectorDynamicStrategy.prototype.getObjByKeyId = function (keyId, visibility) {
        var p = this.protoStrategy;
        for (var i = 0; i < p.keyIds.length; i++) {
            if (p.keyIds[i] === keyId && canSee(p.visibilities[i], visibility)) {
                if (this.objs[i] === exports.UNDEFINED) {
                    this.objs[i] = this.injector._new(p.providers[i], p.visibilities[i]);
                }
                return this.objs[i];
            }
        }
        return exports.UNDEFINED;
    };
    InjectorDynamicStrategy.prototype.getObjAtIndex = function (index) {
        if (index < 0 || index >= this.objs.length) {
            throw new exceptions_1.OutOfBoundsError(index);
        }
        return this.objs[index];
    };
    InjectorDynamicStrategy.prototype.getMaxNumberOfObjects = function () { return this.objs.length; };
    return InjectorDynamicStrategy;
})();
exports.InjectorDynamicStrategy = InjectorDynamicStrategy;
var ProviderWithVisibility = (function () {
    function ProviderWithVisibility(provider, visibility) {
        this.provider = provider;
        this.visibility = visibility;
    }
    ;
    ProviderWithVisibility.prototype.getKeyId = function () { return this.provider.key.id; };
    return ProviderWithVisibility;
})();
exports.ProviderWithVisibility = ProviderWithVisibility;
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
var Injector = (function () {
    /**
     * Private
     */
    function Injector(_proto /* ProtoInjector */, _parent, _isHostBoundary, _depProvider, _debugContext) {
        if (_parent === void 0) { _parent = null; }
        if (_isHostBoundary === void 0) { _isHostBoundary = false; }
        if (_depProvider === void 0) { _depProvider = null; }
        if (_debugContext === void 0) { _debugContext = null; }
        this._isHostBoundary = _isHostBoundary;
        this._depProvider = _depProvider;
        this._debugContext = _debugContext;
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
    Injector.resolve = function (providers) {
        return provider_1.resolveProviders(providers);
    };
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
    Injector.resolveAndCreate = function (providers) {
        var resolvedProviders = Injector.resolve(providers);
        return Injector.fromResolvedProviders(resolvedProviders);
    };
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
    Injector.fromResolvedProviders = function (providers) {
        return new Injector(ProtoInjector.fromResolvedProviders(providers));
    };
    /**
     * @deprecated
     */
    Injector.fromResolvedBindings = function (providers) {
        return Injector.fromResolvedProviders(providers);
    };
    Object.defineProperty(Injector.prototype, "hostBoundary", {
        /**
         * Whether this injector is a boundary to a host.
         * @internal
         */
        get: function () { return this._isHostBoundary; },
        enumerable: true,
        configurable: true
    });
    /**
     * @internal
     */
    Injector.prototype.debugContext = function () { return this._debugContext(); };
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
    Injector.prototype.get = function (token) {
        return this._getByKey(key_1.Key.get(token), null, null, false, Visibility.PublicAndPrivate);
    };
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
    Injector.prototype.getOptional = function (token) {
        return this._getByKey(key_1.Key.get(token), null, null, true, Visibility.PublicAndPrivate);
    };
    /**
     * @internal
     */
    Injector.prototype.getAt = function (index) { return this._strategy.getObjAtIndex(index); };
    Object.defineProperty(Injector.prototype, "parent", {
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
        get: function () { return this._parent; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Injector.prototype, "internalStrategy", {
        /**
         * @internal
         * Internal. Do not use.
         * We return `any` not to export the InjectorStrategy type.
         */
        get: function () { return this._strategy; },
        enumerable: true,
        configurable: true
    });
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
    Injector.prototype.resolveAndCreateChild = function (providers) {
        var resolvedProviders = Injector.resolve(providers);
        return this.createChildFromResolved(resolvedProviders);
    };
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
    Injector.prototype.createChildFromResolved = function (providers) {
        var bd = providers.map(function (b) { return new ProviderWithVisibility(b, Visibility.Public); });
        var proto = new ProtoInjector(bd);
        var inj = new Injector(proto);
        inj._parent = this;
        return inj;
    };
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
    Injector.prototype.resolveAndInstantiate = function (provider) {
        return this.instantiateResolved(Injector.resolve([provider])[0]);
    };
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
    Injector.prototype.instantiateResolved = function (provider) {
        return this._instantiateProvider(provider, Visibility.PublicAndPrivate);
    };
    /** @internal */
    Injector.prototype._new = function (provider, visibility) {
        if (this._constructionCounter++ > this._strategy.getMaxNumberOfObjects()) {
            throw new exceptions_1.CyclicDependencyError(this, provider.key);
        }
        return this._instantiateProvider(provider, visibility);
    };
    Injector.prototype._instantiateProvider = function (provider, visibility) {
        if (provider.multiProvider) {
            var res = collection_1.ListWrapper.createFixedSize(provider.resolvedFactories.length);
            for (var i = 0; i < provider.resolvedFactories.length; ++i) {
                res[i] = this._instantiate(provider, provider.resolvedFactories[i], visibility);
            }
            return res;
        }
        else {
            return this._instantiate(provider, provider.resolvedFactories[0], visibility);
        }
    };
    Injector.prototype._instantiate = function (provider, resolvedFactory, visibility) {
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
            if (e instanceof exceptions_1.AbstractProviderError || e instanceof exceptions_1.InstantiationError) {
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
            throw new exceptions_1.InstantiationError(this, e, e.stack, provider.key);
        }
        return obj;
    };
    Injector.prototype._getByDependency = function (provider, dep, providerVisibility) {
        var special = lang_1.isPresent(this._depProvider) ?
            this._depProvider.getDependency(this, provider, dep) :
            exports.UNDEFINED;
        if (special !== exports.UNDEFINED) {
            return special;
        }
        else {
            return this._getByKey(dep.key, dep.lowerBoundVisibility, dep.upperBoundVisibility, dep.optional, providerVisibility);
        }
    };
    Injector.prototype._getByKey = function (key, lowerBoundVisibility, upperBoundVisibility, optional, providerVisibility) {
        if (key === INJECTOR_KEY) {
            return this;
        }
        if (upperBoundVisibility instanceof metadata_1.SelfMetadata) {
            return this._getByKeySelf(key, optional, providerVisibility);
        }
        else if (upperBoundVisibility instanceof metadata_1.HostMetadata) {
            return this._getByKeyHost(key, optional, providerVisibility, lowerBoundVisibility);
        }
        else {
            return this._getByKeyDefault(key, optional, providerVisibility, lowerBoundVisibility);
        }
    };
    /** @internal */
    Injector.prototype._throwOrNull = function (key, optional) {
        if (optional) {
            return null;
        }
        else {
            throw new exceptions_1.NoProviderError(this, key);
        }
    };
    /** @internal */
    Injector.prototype._getByKeySelf = function (key, optional, providerVisibility) {
        var obj = this._strategy.getObjByKeyId(key.id, providerVisibility);
        return (obj !== exports.UNDEFINED) ? obj : this._throwOrNull(key, optional);
    };
    /** @internal */
    Injector.prototype._getByKeyHost = function (key, optional, providerVisibility, lowerBoundVisibility) {
        var inj = this;
        if (lowerBoundVisibility instanceof metadata_1.SkipSelfMetadata) {
            if (inj._isHostBoundary) {
                return this._getPrivateDependency(key, optional, inj);
            }
            else {
                inj = inj._parent;
            }
        }
        while (inj != null) {
            var obj = inj._strategy.getObjByKeyId(key.id, providerVisibility);
            if (obj !== exports.UNDEFINED)
                return obj;
            if (lang_1.isPresent(inj._parent) && inj._isHostBoundary) {
                return this._getPrivateDependency(key, optional, inj);
            }
            else {
                inj = inj._parent;
            }
        }
        return this._throwOrNull(key, optional);
    };
    /** @internal */
    Injector.prototype._getPrivateDependency = function (key, optional, inj) {
        var obj = inj._parent._strategy.getObjByKeyId(key.id, Visibility.Private);
        return (obj !== exports.UNDEFINED) ? obj : this._throwOrNull(key, optional);
    };
    /** @internal */
    Injector.prototype._getByKeyDefault = function (key, optional, providerVisibility, lowerBoundVisibility) {
        var inj = this;
        if (lowerBoundVisibility instanceof metadata_1.SkipSelfMetadata) {
            providerVisibility = inj._isHostBoundary ? Visibility.PublicAndPrivate : Visibility.Public;
            inj = inj._parent;
        }
        while (inj != null) {
            var obj = inj._strategy.getObjByKeyId(key.id, providerVisibility);
            if (obj !== exports.UNDEFINED)
                return obj;
            providerVisibility = inj._isHostBoundary ? Visibility.PublicAndPrivate : Visibility.Public;
            inj = inj._parent;
        }
        return this._throwOrNull(key, optional);
    };
    Object.defineProperty(Injector.prototype, "displayName", {
        get: function () {
            return "Injector(providers: [" + _mapProviders(this, function (b) { return (" \"" + b.key.displayName + "\" "); }).join(", ") + "])";
        },
        enumerable: true,
        configurable: true
    });
    Injector.prototype.toString = function () { return this.displayName; };
    return Injector;
})();
exports.Injector = Injector;
var INJECTOR_KEY = key_1.Key.get(Injector);
function _mapProviders(injector, fn) {
    var res = [];
    for (var i = 0; i < injector._proto.numberOfProviders; ++i) {
        res.push(fn(injector._proto.getProviderAtIndex(i)));
    }
    return res;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9kaS9pbmplY3Rvci50cyJdLCJuYW1lcyI6WyJWaXNpYmlsaXR5IiwiY2FuU2VlIiwiUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5IiwiUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5LmdldFByb3ZpZGVyQXRJbmRleCIsIlByb3RvSW5qZWN0b3JJbmxpbmVTdHJhdGVneS5jcmVhdGVJbmplY3RvclN0cmF0ZWd5IiwiUHJvdG9JbmplY3RvckR5bmFtaWNTdHJhdGVneSIsIlByb3RvSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJQcm90b0luamVjdG9yRHluYW1pY1N0cmF0ZWd5LmdldFByb3ZpZGVyQXRJbmRleCIsIlByb3RvSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuY3JlYXRlSW5qZWN0b3JTdHJhdGVneSIsIlByb3RvSW5qZWN0b3IiLCJQcm90b0luamVjdG9yLmNvbnN0cnVjdG9yIiwiUHJvdG9JbmplY3Rvci5mcm9tUmVzb2x2ZWRQcm92aWRlcnMiLCJQcm90b0luamVjdG9yLmdldFByb3ZpZGVyQXRJbmRleCIsIkluamVjdG9ySW5saW5lU3RyYXRlZ3kiLCJJbmplY3RvcklubGluZVN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiSW5qZWN0b3JJbmxpbmVTdHJhdGVneS5yZXNldENvbnN0cnVjdGlvbkNvdW50ZXIiLCJJbmplY3RvcklubGluZVN0cmF0ZWd5Lmluc3RhbnRpYXRlUHJvdmlkZXIiLCJJbmplY3RvcklubGluZVN0cmF0ZWd5LmdldE9iakJ5S2V5SWQiLCJJbmplY3RvcklubGluZVN0cmF0ZWd5LmdldE9iakF0SW5kZXgiLCJJbmplY3RvcklubGluZVN0cmF0ZWd5LmdldE1heE51bWJlck9mT2JqZWN0cyIsIkluamVjdG9yRHluYW1pY1N0cmF0ZWd5IiwiSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJJbmplY3RvckR5bmFtaWNTdHJhdGVneS5yZXNldENvbnN0cnVjdGlvbkNvdW50ZXIiLCJJbmplY3RvckR5bmFtaWNTdHJhdGVneS5pbnN0YW50aWF0ZVByb3ZpZGVyIiwiSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuZ2V0T2JqQnlLZXlJZCIsIkluamVjdG9yRHluYW1pY1N0cmF0ZWd5LmdldE9iakF0SW5kZXgiLCJJbmplY3RvckR5bmFtaWNTdHJhdGVneS5nZXRNYXhOdW1iZXJPZk9iamVjdHMiLCJQcm92aWRlcldpdGhWaXNpYmlsaXR5IiwiUHJvdmlkZXJXaXRoVmlzaWJpbGl0eS5jb25zdHJ1Y3RvciIsIlByb3ZpZGVyV2l0aFZpc2liaWxpdHkuZ2V0S2V5SWQiLCJJbmplY3RvciIsIkluamVjdG9yLmNvbnN0cnVjdG9yIiwiSW5qZWN0b3IucmVzb2x2ZSIsIkluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUiLCJJbmplY3Rvci5mcm9tUmVzb2x2ZWRQcm92aWRlcnMiLCJJbmplY3Rvci5mcm9tUmVzb2x2ZWRCaW5kaW5ncyIsIkluamVjdG9yLmhvc3RCb3VuZGFyeSIsIkluamVjdG9yLmRlYnVnQ29udGV4dCIsIkluamVjdG9yLmdldCIsIkluamVjdG9yLmdldE9wdGlvbmFsIiwiSW5qZWN0b3IuZ2V0QXQiLCJJbmplY3Rvci5wYXJlbnQiLCJJbmplY3Rvci5pbnRlcm5hbFN0cmF0ZWd5IiwiSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZUNoaWxkIiwiSW5qZWN0b3IuY3JlYXRlQ2hpbGRGcm9tUmVzb2x2ZWQiLCJJbmplY3Rvci5yZXNvbHZlQW5kSW5zdGFudGlhdGUiLCJJbmplY3Rvci5pbnN0YW50aWF0ZVJlc29sdmVkIiwiSW5qZWN0b3IuX25ldyIsIkluamVjdG9yLl9pbnN0YW50aWF0ZVByb3ZpZGVyIiwiSW5qZWN0b3IuX2luc3RhbnRpYXRlIiwiSW5qZWN0b3IuX2dldEJ5RGVwZW5kZW5jeSIsIkluamVjdG9yLl9nZXRCeUtleSIsIkluamVjdG9yLl90aHJvd09yTnVsbCIsIkluamVjdG9yLl9nZXRCeUtleVNlbGYiLCJJbmplY3Rvci5fZ2V0QnlLZXlIb3N0IiwiSW5qZWN0b3IuX2dldFByaXZhdGVEZXBlbmRlbmN5IiwiSW5qZWN0b3IuX2dldEJ5S2V5RGVmYXVsdCIsIkluamVjdG9yLmRpc3BsYXlOYW1lIiwiSW5qZWN0b3IudG9TdHJpbmciLCJfbWFwUHJvdmlkZXJzIl0sIm1hcHBpbmdzIjoiQUFBQSwyQkFBMkMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM1RSx5QkFRTyxZQUFZLENBQUMsQ0FBQTtBQUNwQiwyQkFPTyxjQUFjLENBQUMsQ0FBQTtBQUN0QixxQkFBb0UsMEJBQTBCLENBQUMsQ0FBQTtBQUMvRixvQkFBa0IsT0FBTyxDQUFDLENBQUE7QUFDMUIseUJBQTJELFlBQVksQ0FBQyxDQUFBO0FBRXhFLG9DQUFvQztBQUNwQyxJQUFNLHlCQUF5QixHQUFHLEVBQUUsQ0FBQztBQUV4QixpQkFBUyxHQUFXLGlCQUFVLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBRTFEOztHQUVHO0FBQ0gsV0FBWSxVQUFVO0lBQ3BCQTs7T0FFR0E7SUFDSEEsK0NBQU1BLENBQUFBO0lBQ05BOztPQUVHQTtJQUNIQSxpREFBT0EsQ0FBQUE7SUFDUEE7O09BRUdBO0lBQ0hBLG1FQUFnQkEsQ0FBQUE7QUFDbEJBLENBQUNBLEVBYlcsa0JBQVUsS0FBVixrQkFBVSxRQWFyQjtBQWJELElBQVksVUFBVSxHQUFWLGtCQWFYLENBQUE7QUFFRCxnQkFBZ0IsR0FBZSxFQUFFLEdBQWU7SUFDOUNDLE1BQU1BLENBQUNBLENBQUNBLEdBQUdBLEtBQUtBLEdBQUdBLENBQUNBO1FBQ2JBLENBQUNBLEdBQUdBLEtBQUtBLFVBQVVBLENBQUNBLGdCQUFnQkEsSUFBSUEsR0FBR0EsS0FBS0EsVUFBVUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQTtBQUN0RkEsQ0FBQ0E7QUFRRDtJQWtDRUMscUNBQVlBLE9BQXNCQSxFQUFFQSxHQUE2QkE7UUFqQ2pFQyxjQUFTQSxHQUFxQkEsSUFBSUEsQ0FBQ0E7UUFDbkNBLGNBQVNBLEdBQXFCQSxJQUFJQSxDQUFDQTtRQUNuQ0EsY0FBU0EsR0FBcUJBLElBQUlBLENBQUNBO1FBQ25DQSxjQUFTQSxHQUFxQkEsSUFBSUEsQ0FBQ0E7UUFDbkNBLGNBQVNBLEdBQXFCQSxJQUFJQSxDQUFDQTtRQUNuQ0EsY0FBU0EsR0FBcUJBLElBQUlBLENBQUNBO1FBQ25DQSxjQUFTQSxHQUFxQkEsSUFBSUEsQ0FBQ0E7UUFDbkNBLGNBQVNBLEdBQXFCQSxJQUFJQSxDQUFDQTtRQUNuQ0EsY0FBU0EsR0FBcUJBLElBQUlBLENBQUNBO1FBQ25DQSxjQUFTQSxHQUFxQkEsSUFBSUEsQ0FBQ0E7UUFFbkNBLFdBQU1BLEdBQVdBLElBQUlBLENBQUNBO1FBQ3RCQSxXQUFNQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUN0QkEsV0FBTUEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLFdBQU1BLEdBQVdBLElBQUlBLENBQUNBO1FBQ3RCQSxXQUFNQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUN0QkEsV0FBTUEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLFdBQU1BLEdBQVdBLElBQUlBLENBQUNBO1FBQ3RCQSxXQUFNQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUN0QkEsV0FBTUEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLFdBQU1BLEdBQVdBLElBQUlBLENBQUNBO1FBRXRCQSxnQkFBV0EsR0FBZUEsSUFBSUEsQ0FBQ0E7UUFDL0JBLGdCQUFXQSxHQUFlQSxJQUFJQSxDQUFDQTtRQUMvQkEsZ0JBQVdBLEdBQWVBLElBQUlBLENBQUNBO1FBQy9CQSxnQkFBV0EsR0FBZUEsSUFBSUEsQ0FBQ0E7UUFDL0JBLGdCQUFXQSxHQUFlQSxJQUFJQSxDQUFDQTtRQUMvQkEsZ0JBQVdBLEdBQWVBLElBQUlBLENBQUNBO1FBQy9CQSxnQkFBV0EsR0FBZUEsSUFBSUEsQ0FBQ0E7UUFDL0JBLGdCQUFXQSxHQUFlQSxJQUFJQSxDQUFDQTtRQUMvQkEsZ0JBQVdBLEdBQWVBLElBQUlBLENBQUNBO1FBQy9CQSxnQkFBV0EsR0FBZUEsSUFBSUEsQ0FBQ0E7UUFHN0JBLElBQUlBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBO1FBRXhCQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNmQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBO1FBQ3ZDQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVERCx3REFBa0JBLEdBQWxCQSxVQUFtQkEsS0FBYUE7UUFDOUJFLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBO1FBQ3RDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7UUFDdENBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBO1FBQ3RDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FB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QSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxpQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxpQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxpQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxpQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxpQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxpQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxpQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxpQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLEtBQUtBLElBQUlBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxpQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkJBLENBQUNBO1FBRURBLE1BQU1BLENBQUNBLGlCQUFTQSxDQUFDQTtJQUNuQkEsQ0FBQ0E7SUFFREosOENBQWFBLEdBQWJBLFVBQWNBLEtBQWFBO1FBQ3pCSyxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDakNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDakNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDakNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxD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VUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDOUVBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDOUVBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDOUVBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDOUVBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDOUVBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDOUVBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDOUVBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDOUVBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDOUVBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDOUVBLEdBQUdBLEdBQUdBLE1BQU1BLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDakZBLEdBQUdBLEdBQUdBLE1BQU1BLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDakZBLEdBQUdBLEdBQUdBLE1BQU1BLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDakZBLEdBQUdBLEdBQUdBLE1BQU1BLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDakZBLEdBQUdBLEdBQUdBLE1BQU1BLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDakZBLEdBQUdBLEdBQUdBLE1BQU1BLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDakZBLEdBQUdBLEdBQUdBLE1BQU1BLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDakZBLEdBQUdBLEdBQUdBLE1BQU1BLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDakZBLEdBQUdBLEdBQUdBLE1BQU1BLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDakZBLEdBQUdBLEdBQUdBLE1BQU1BLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDbkZBLENBQUVBO1FBQUFBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ1hBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFlBQVlBLGtDQUFxQkEsSUFBSUEsQ0FBQ0EsWUFBWUEsK0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDMUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLEVBQUVBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1lBQy9CQSxDQUFDQTtZQUNEQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUNWQSxDQUFDQTtRQUVEQSxJQUFJQSxHQUFHQSxDQUFDQTtRQUNSQSxJQUFJQSxDQUFDQTtZQUNIQSxNQUFNQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDZkEsS0FBS0EsQ0FBQ0E7b0JBQ0pBLEdBQUdBLEdBQUdBLE9BQU9BLEVBQUVBLENBQUNBO29CQUNoQkEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLENBQUNBO29CQUNKQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDbEJBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxDQUFDQTtvQkFDSkEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQ3RCQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsQ0FBQ0E7b0JBQ0pBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO29CQUMxQkEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLENBQUNBO29CQUNKQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDOUJBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxDQUFDQTtvQkFDSkEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQ2xDQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsQ0FBQ0E7b0JBQ0pBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO29CQUN0Q0EsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLENBQUNBO29CQUNKQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDMUNBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxDQUFDQTtvQkFDSkEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQzlDQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsQ0FBQ0E7b0JBQ0pBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO29CQUNsREEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLEVBQUVBO29CQUNMQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDdERBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxFQUFFQTtvQkFDTEEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQzNEQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsRUFBRUE7b0JBQ0xBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO29CQUNoRUEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLEVBQUVBO29CQUNMQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtvQkFDckVBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxFQUFFQTtvQkFDTEEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQzFFQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsRUFBRUE7b0JBQ0xBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO29CQUMvRUEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLEVBQUVBO29CQUNMQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtvQkFDcEZBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxFQUFFQTtvQkFDTEEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3pGQSxLQUFLQSxDQUFDQTtnQkFDUkEsS0FBS0EsRUFBRUE7b0JBQ0xBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQ3pFQSxHQUFHQSxDQUFDQSxDQUFDQTtvQkFDbkJBLEtBQUtBLENBQUNBO2dCQUNSQSxLQUFLQSxFQUFFQTtvQkFDTEEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFDekVBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO29CQUN4QkEsS0FBS0EsQ0FBQ0E7Z0JBQ1JBLEtBQUtBLEVBQUVBO29CQUNMQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUN6RUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQzdCQSxLQUFLQSxDQUFDQTtZQUNWQSxDQUFD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QjRCLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO0lBQ2pENUIsZUFBQ0E7QUFBREEsQ0FBQ0EsQUF2akJELElBdWpCQztBQXZqQlksZ0JBQVEsV0F1akJwQixDQUFBO0FBRUQsSUFBSSxZQUFZLEdBQUcsU0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUdyQyx1QkFBdUIsUUFBa0IsRUFBRSxFQUFZO0lBQ3JENkIsSUFBSUEsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFDYkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUMzREEsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN0REEsQ0FBQ0E7SUFDREEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7QUFDYkEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01hcCwgTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1xuICBSZXNvbHZlZFByb3ZpZGVyLFxuICBQcm92aWRlcixcbiAgRGVwZW5kZW5jeSxcbiAgUHJvdmlkZXJCdWlsZGVyLFxuICBSZXNvbHZlZEZhY3RvcnksXG4gIHByb3ZpZGUsXG4gIHJlc29sdmVQcm92aWRlcnNcbn0gZnJvbSAnLi9wcm92aWRlcic7XG5pbXBvcnQge1xuICBBYnN0cmFjdFByb3ZpZGVyRXJyb3IsXG4gIE5vUHJvdmlkZXJFcnJvcixcbiAgQ3ljbGljRGVwZW5kZW5jeUVycm9yLFxuICBJbnN0YW50aWF0aW9uRXJyb3IsXG4gIEludmFsaWRQcm92aWRlckVycm9yLFxuICBPdXRPZkJvdW5kc0Vycm9yXG59IGZyb20gJy4vZXhjZXB0aW9ucyc7XG5pbXBvcnQge0Z1bmN0aW9uV3JhcHBlciwgVHlwZSwgaXNQcmVzZW50LCBpc0JsYW5rLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtLZXl9IGZyb20gJy4va2V5JztcbmltcG9ydCB7U2VsZk1ldGFkYXRhLCBIb3N0TWV0YWRhdGEsIFNraXBTZWxmTWV0YWRhdGF9IGZyb20gJy4vbWV0YWRhdGEnO1xuXG4vLyBUaHJlc2hvbGQgZm9yIHRoZSBkeW5hbWljIHZlcnNpb25cbmNvbnN0IF9NQVhfQ09OU1RSVUNUSU9OX0NPVU5URVIgPSAxMDtcblxuZXhwb3J0IGNvbnN0IFVOREVGSU5FRDogT2JqZWN0ID0gQ09OU1RfRVhQUihuZXcgT2JqZWN0KCkpO1xuXG4vKipcbiAqIFZpc2liaWxpdHkgb2YgYSB7QGxpbmsgUHJvdmlkZXJ9LlxuICovXG5leHBvcnQgZW51bSBWaXNpYmlsaXR5IHtcbiAgLyoqXG4gICAqIEEgYFB1YmxpY2Age0BsaW5rIFByb3ZpZGVyfSBpcyBvbmx5IHZpc2libGUgdG8gcmVndWxhciAoYXMgb3Bwb3NlZCB0byBob3N0KSBjaGlsZCBpbmplY3RvcnMuXG4gICAqL1xuICBQdWJsaWMsXG4gIC8qKlxuICAgKiBBIGBQcml2YXRlYCB7QGxpbmsgUHJvdmlkZXJ9IGlzIG9ubHkgdmlzaWJsZSB0byBob3N0IChhcyBvcHBvc2VkIHRvIHJlZ3VsYXIpIGNoaWxkIGluamVjdG9ycy5cbiAgICovXG4gIFByaXZhdGUsXG4gIC8qKlxuICAgKiBBIGBQdWJsaWNBbmRQcml2YXRlYCB7QGxpbmsgUHJvdmlkZXJ9IGlzIHZpc2libGUgdG8gYm90aCBob3N0IGFuZCByZWd1bGFyIGNoaWxkIGluamVjdG9ycy5cbiAgICovXG4gIFB1YmxpY0FuZFByaXZhdGVcbn1cblxuZnVuY3Rpb24gY2FuU2VlKHNyYzogVmlzaWJpbGl0eSwgZHN0OiBWaXNpYmlsaXR5KTogYm9vbGVhbiB7XG4gIHJldHVybiAoc3JjID09PSBkc3QpIHx8XG4gICAgICAgICAoZHN0ID09PSBWaXNpYmlsaXR5LlB1YmxpY0FuZFByaXZhdGUgfHwgc3JjID09PSBWaXNpYmlsaXR5LlB1YmxpY0FuZFByaXZhdGUpO1xufVxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvdG9JbmplY3RvclN0cmF0ZWd5IHtcbiAgZ2V0UHJvdmlkZXJBdEluZGV4KGluZGV4OiBudW1iZXIpOiBSZXNvbHZlZFByb3ZpZGVyO1xuICBjcmVhdGVJbmplY3RvclN0cmF0ZWd5KGluajogSW5qZWN0b3IpOiBJbmplY3RvclN0cmF0ZWd5O1xufVxuXG5leHBvcnQgY2xhc3MgUHJvdG9JbmplY3RvcklubGluZVN0cmF0ZWd5IGltcGxlbWVudHMgUHJvdG9JbmplY3RvclN0cmF0ZWd5IHtcbiAgcHJvdmlkZXIwOiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXIxOiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXIyOiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXIzOiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI0OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI1OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI2OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI3OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI4OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcbiAgcHJvdmlkZXI5OiBSZXNvbHZlZFByb3ZpZGVyID0gbnVsbDtcblxuICBrZXlJZDA6IG51bWJlciA9IG51bGw7XG4gIGtleUlkMTogbnVtYmVyID0gbnVsbDtcbiAga2V5SWQyOiBudW1iZXIgPSBudWxsO1xuICBrZXlJZDM6IG51bWJlciA9IG51bGw7XG4gIGtleUlkNDogbnVtYmVyID0gbnVsbDtcbiAga2V5SWQ1OiBudW1iZXIgPSBudWxsO1xuICBrZXlJZDY6IG51bWJlciA9IG51bGw7XG4gIGtleUlkNzogbnVtYmVyID0gbnVsbDtcbiAga2V5SWQ4OiBudW1iZXIgPSBudWxsO1xuICBrZXlJZDk6IG51bWJlciA9IG51bGw7XG5cbiAgdmlzaWJpbGl0eTA6IFZpc2liaWxpdHkgPSBudWxsO1xuICB2aXNpYmlsaXR5MTogVmlzaWJpbGl0eSA9IG51bGw7XG4gIHZpc2liaWxpdHkyOiBWaXNpYmlsaXR5ID0gbnVsbDtcbiAgdmlzaWJpbGl0eTM6IFZpc2liaWxpdHkgPSBudWxsO1xuICB2aXNpYmlsaXR5NDogVmlzaWJpbGl0eSA9IG51bGw7XG4gIHZpc2liaWxpdHk1OiBWaXNpYmlsaXR5ID0gbnVsbDtcbiAgdmlzaWJpbGl0eTY6IFZpc2liaWxpdHkgPSBudWxsO1xuICB2aXNpYmlsaXR5NzogVmlzaWJpbGl0eSA9IG51bGw7XG4gIHZpc2liaWxpdHk4OiBWaXNpYmlsaXR5ID0gbnVsbDtcbiAgdmlzaWJpbGl0eTk6IFZpc2liaWxpdHkgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RvRUk6IFByb3RvSW5qZWN0b3IsIGJ3djogUHJvdmlkZXJXaXRoVmlzaWJpbGl0eVtdKSB7XG4gICAgdmFyIGxlbmd0aCA9IGJ3di5sZW5ndGg7XG5cbiAgICBpZiAobGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5wcm92aWRlcjAgPSBid3ZbMF0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkMCA9IGJ3dlswXS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5MCA9IGJ3dlswXS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gMSkge1xuICAgICAgdGhpcy5wcm92aWRlcjEgPSBid3ZbMV0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkMSA9IGJ3dlsxXS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5MSA9IGJ3dlsxXS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gMikge1xuICAgICAgdGhpcy5wcm92aWRlcjIgPSBid3ZbMl0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkMiA9IGJ3dlsyXS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5MiA9IGJ3dlsyXS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gMykge1xuICAgICAgdGhpcy5wcm92aWRlcjMgPSBid3ZbM10ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkMyA9IGJ3dlszXS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5MyA9IGJ3dlszXS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gNCkge1xuICAgICAgdGhpcy5wcm92aWRlcjQgPSBid3ZbNF0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkNCA9IGJ3dls0XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5NCA9IGJ3dls0XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gNSkge1xuICAgICAgdGhpcy5wcm92aWRlcjUgPSBid3ZbNV0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkNSA9IGJ3dls1XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5NSA9IGJ3dls1XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gNikge1xuICAgICAgdGhpcy5wcm92aWRlcjYgPSBid3ZbNl0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkNiA9IGJ3dls2XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5NiA9IGJ3dls2XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gNykge1xuICAgICAgdGhpcy5wcm92aWRlcjcgPSBid3ZbN10ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkNyA9IGJ3dls3XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5NyA9IGJ3dls3XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gOCkge1xuICAgICAgdGhpcy5wcm92aWRlcjggPSBid3ZbOF0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkOCA9IGJ3dls4XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5OCA9IGJ3dls4XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgICBpZiAobGVuZ3RoID4gOSkge1xuICAgICAgdGhpcy5wcm92aWRlcjkgPSBid3ZbOV0ucHJvdmlkZXI7XG4gICAgICB0aGlzLmtleUlkOSA9IGJ3dls5XS5nZXRLZXlJZCgpO1xuICAgICAgdGhpcy52aXNpYmlsaXR5OSA9IGJ3dls5XS52aXNpYmlsaXR5O1xuICAgIH1cbiAgfVxuXG4gIGdldFByb3ZpZGVyQXRJbmRleChpbmRleDogbnVtYmVyKTogUmVzb2x2ZWRQcm92aWRlciB7XG4gICAgaWYgKGluZGV4ID09IDApIHJldHVybiB0aGlzLnByb3ZpZGVyMDtcbiAgICBpZiAoaW5kZXggPT0gMSkgcmV0dXJuIHRoaXMucHJvdmlkZXIxO1xuICAgIGlmIChpbmRleCA9PSAyKSByZXR1cm4gdGhpcy5wcm92aWRlcjI7XG4gICAgaWYgKGluZGV4ID09IDMpIHJldHVybiB0aGlzLnByb3ZpZGVyMztcbiAgICBpZiAoaW5kZXggPT0gNCkgcmV0dXJuIHRoaXMucHJvdmlkZXI0O1xuICAgIGlmIChpbmRleCA9PSA1KSByZXR1cm4gdGhpcy5wcm92aWRlcjU7XG4gICAgaWYgKGluZGV4ID09IDYpIHJldHVybiB0aGlzLnByb3ZpZGVyNjtcbiAgICBpZiAoaW5kZXggPT0gNykgcmV0dXJuIHRoaXMucHJvdmlkZXI3O1xuICAgIGlmIChpbmRleCA9PSA4KSByZXR1cm4gdGhpcy5wcm92aWRlcjg7XG4gICAgaWYgKGluZGV4ID09IDkpIHJldHVybiB0aGlzLnByb3ZpZGVyOTtcbiAgICB0aHJvdyBuZXcgT3V0T2ZCb3VuZHNFcnJvcihpbmRleCk7XG4gIH1cblxuICBjcmVhdGVJbmplY3RvclN0cmF0ZWd5KGluamVjdG9yOiBJbmplY3Rvcik6IEluamVjdG9yU3RyYXRlZ3kge1xuICAgIHJldHVybiBuZXcgSW5qZWN0b3JJbmxpbmVTdHJhdGVneShpbmplY3RvciwgdGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFByb3RvSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kgaW1wbGVtZW50cyBQcm90b0luamVjdG9yU3RyYXRlZ3kge1xuICBwcm92aWRlcnM6IFJlc29sdmVkUHJvdmlkZXJbXTtcbiAga2V5SWRzOiBudW1iZXJbXTtcbiAgdmlzaWJpbGl0aWVzOiBWaXNpYmlsaXR5W107XG5cbiAgY29uc3RydWN0b3IocHJvdG9Jbmo6IFByb3RvSW5qZWN0b3IsIGJ3djogUHJvdmlkZXJXaXRoVmlzaWJpbGl0eVtdKSB7XG4gICAgdmFyIGxlbiA9IGJ3di5sZW5ndGg7XG5cbiAgICB0aGlzLnByb3ZpZGVycyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShsZW4pO1xuICAgIHRoaXMua2V5SWRzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGxlbik7XG4gICAgdGhpcy52aXNpYmlsaXRpZXMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUobGVuKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHRoaXMucHJvdmlkZXJzW2ldID0gYnd2W2ldLnByb3ZpZGVyO1xuICAgICAgdGhpcy5rZXlJZHNbaV0gPSBid3ZbaV0uZ2V0S2V5SWQoKTtcbiAgICAgIHRoaXMudmlzaWJpbGl0aWVzW2ldID0gYnd2W2ldLnZpc2liaWxpdHk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UHJvdmlkZXJBdEluZGV4KGluZGV4OiBudW1iZXIpOiBSZXNvbHZlZFByb3ZpZGVyIHtcbiAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMucHJvdmlkZXJzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IE91dE9mQm91bmRzRXJyb3IoaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcm92aWRlcnNbaW5kZXhdO1xuICB9XG5cbiAgY3JlYXRlSW5qZWN0b3JTdHJhdGVneShlaTogSW5qZWN0b3IpOiBJbmplY3RvclN0cmF0ZWd5IHtcbiAgICByZXR1cm4gbmV3IEluamVjdG9yRHluYW1pY1N0cmF0ZWd5KHRoaXMsIGVpKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJvdG9JbmplY3RvciB7XG4gIHN0YXRpYyBmcm9tUmVzb2x2ZWRQcm92aWRlcnMocHJvdmlkZXJzOiBSZXNvbHZlZFByb3ZpZGVyW10pOiBQcm90b0luamVjdG9yIHtcbiAgICB2YXIgYmQgPSBwcm92aWRlcnMubWFwKGIgPT4gbmV3IFByb3ZpZGVyV2l0aFZpc2liaWxpdHkoYiwgVmlzaWJpbGl0eS5QdWJsaWMpKTtcbiAgICByZXR1cm4gbmV3IFByb3RvSW5qZWN0b3IoYmQpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RyYXRlZ3k6IFByb3RvSW5qZWN0b3JTdHJhdGVneTtcbiAgbnVtYmVyT2ZQcm92aWRlcnM6IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcihid3Y6IFByb3ZpZGVyV2l0aFZpc2liaWxpdHlbXSkge1xuICAgIHRoaXMubnVtYmVyT2ZQcm92aWRlcnMgPSBid3YubGVuZ3RoO1xuICAgIHRoaXMuX3N0cmF0ZWd5ID0gYnd2Lmxlbmd0aCA+IF9NQVhfQ09OU1RSVUNUSU9OX0NPVU5URVIgP1xuICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQcm90b0luamVjdG9yRHluYW1pY1N0cmF0ZWd5KHRoaXMsIGJ3dikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQcm90b0luamVjdG9ySW5saW5lU3RyYXRlZ3kodGhpcywgYnd2KTtcbiAgfVxuXG4gIGdldFByb3ZpZGVyQXRJbmRleChpbmRleDogbnVtYmVyKTogUmVzb2x2ZWRQcm92aWRlciB7XG4gICAgcmV0dXJuIHRoaXMuX3N0cmF0ZWd5LmdldFByb3ZpZGVyQXRJbmRleChpbmRleCk7XG4gIH1cbn1cblxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5qZWN0b3JTdHJhdGVneSB7XG4gIGdldE9iakJ5S2V5SWQoa2V5SWQ6IG51bWJlciwgdmlzaWJpbGl0eTogVmlzaWJpbGl0eSk6IGFueTtcbiAgZ2V0T2JqQXRJbmRleChpbmRleDogbnVtYmVyKTogYW55O1xuICBnZXRNYXhOdW1iZXJPZk9iamVjdHMoKTogbnVtYmVyO1xuXG4gIHJlc2V0Q29uc3RydWN0aW9uQ291bnRlcigpOiB2b2lkO1xuICBpbnN0YW50aWF0ZVByb3ZpZGVyKHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCB2aXNpYmlsaXR5OiBWaXNpYmlsaXR5KTogYW55O1xufVxuXG5leHBvcnQgY2xhc3MgSW5qZWN0b3JJbmxpbmVTdHJhdGVneSBpbXBsZW1lbnRzIEluamVjdG9yU3RyYXRlZ3kge1xuICBvYmowOiBhbnkgPSBVTkRFRklORUQ7XG4gIG9iajE6IGFueSA9IFVOREVGSU5FRDtcbiAgb2JqMjogYW55ID0gVU5ERUZJTkVEO1xuICBvYmozOiBhbnkgPSBVTkRFRklORUQ7XG4gIG9iajQ6IGFueSA9IFVOREVGSU5FRDtcbiAgb2JqNTogYW55ID0gVU5ERUZJTkVEO1xuICBvYmo2OiBhbnkgPSBVTkRFRklORUQ7XG4gIG9iajc6IGFueSA9IFVOREVGSU5FRDtcbiAgb2JqODogYW55ID0gVU5ERUZJTkVEO1xuICBvYmo5OiBhbnkgPSBVTkRFRklORUQ7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGluamVjdG9yOiBJbmplY3RvciwgcHVibGljIHByb3RvU3RyYXRlZ3k6IFByb3RvSW5qZWN0b3JJbmxpbmVTdHJhdGVneSkge31cblxuICByZXNldENvbnN0cnVjdGlvbkNvdW50ZXIoKTogdm9pZCB7IHRoaXMuaW5qZWN0b3IuX2NvbnN0cnVjdGlvbkNvdW50ZXIgPSAwOyB9XG5cbiAgaW5zdGFudGlhdGVQcm92aWRlcihwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlciwgdmlzaWJpbGl0eTogVmlzaWJpbGl0eSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuaW5qZWN0b3IuX25ldyhwcm92aWRlciwgdmlzaWJpbGl0eSk7XG4gIH1cblxuICBnZXRPYmpCeUtleUlkKGtleUlkOiBudW1iZXIsIHZpc2liaWxpdHk6IFZpc2liaWxpdHkpOiBhbnkge1xuICAgIHZhciBwID0gdGhpcy5wcm90b1N0cmF0ZWd5O1xuICAgIHZhciBpbmogPSB0aGlzLmluamVjdG9yO1xuXG4gICAgaWYgKHAua2V5SWQwID09PSBrZXlJZCAmJiBjYW5TZWUocC52aXNpYmlsaXR5MCwgdmlzaWJpbGl0eSkpIHtcbiAgICAgIGlmICh0aGlzLm9iajAgPT09IFVOREVGSU5FRCkge1xuICAgICAgICB0aGlzLm9iajAgPSBpbmouX25ldyhwLnByb3ZpZGVyMCwgcC52aXNpYmlsaXR5MCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vYmowO1xuICAgIH1cbiAgICBpZiAocC5rZXlJZDEgPT09IGtleUlkICYmIGNhblNlZShwLnZpc2liaWxpdHkxLCB2aXNpYmlsaXR5KSkge1xuICAgICAgaWYgKHRoaXMub2JqMSA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgIHRoaXMub2JqMSA9IGluai5fbmV3KHAucHJvdmlkZXIxLCBwLnZpc2liaWxpdHkxKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm9iajE7XG4gICAgfVxuICAgIGlmIChwLmtleUlkMiA9PT0ga2V5SWQgJiYgY2FuU2VlKHAudmlzaWJpbGl0eTIsIHZpc2liaWxpdHkpKSB7XG4gICAgICBpZiAodGhpcy5vYmoyID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgdGhpcy5vYmoyID0gaW5qLl9uZXcocC5wcm92aWRlcjIsIHAudmlzaWJpbGl0eTIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub2JqMjtcbiAgICB9XG4gICAgaWYgKHAua2V5SWQzID09PSBrZXlJZCAmJiBjYW5TZWUocC52aXNpYmlsaXR5MywgdmlzaWJpbGl0eSkpIHtcbiAgICAgIGlmICh0aGlzLm9iajMgPT09IFVOREVGSU5FRCkge1xuICAgICAgICB0aGlzLm9iajMgPSBpbmouX25ldyhwLnByb3ZpZGVyMywgcC52aXNpYmlsaXR5Myk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vYmozO1xuICAgIH1cbiAgICBpZiAocC5rZXlJZDQgPT09IGtleUlkICYmIGNhblNlZShwLnZpc2liaWxpdHk0LCB2aXNpYmlsaXR5KSkge1xuICAgICAgaWYgKHRoaXMub2JqNCA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgIHRoaXMub2JqNCA9IGluai5fbmV3KHAucHJvdmlkZXI0LCBwLnZpc2liaWxpdHk0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm9iajQ7XG4gICAgfVxuICAgIGlmIChwLmtleUlkNSA9PT0ga2V5SWQgJiYgY2FuU2VlKHAudmlzaWJpbGl0eTUsIHZpc2liaWxpdHkpKSB7XG4gICAgICBpZiAodGhpcy5vYmo1ID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgdGhpcy5vYmo1ID0gaW5qLl9uZXcocC5wcm92aWRlcjUsIHAudmlzaWJpbGl0eTUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub2JqNTtcbiAgICB9XG4gICAgaWYgKHAua2V5SWQ2ID09PSBrZXlJZCAmJiBjYW5TZWUocC52aXNpYmlsaXR5NiwgdmlzaWJpbGl0eSkpIHtcbiAgICAgIGlmICh0aGlzLm9iajYgPT09IFVOREVGSU5FRCkge1xuICAgICAgICB0aGlzLm9iajYgPSBpbmouX25ldyhwLnByb3ZpZGVyNiwgcC52aXNpYmlsaXR5Nik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vYmo2O1xuICAgIH1cbiAgICBpZiAocC5rZXlJZDcgPT09IGtleUlkICYmIGNhblNlZShwLnZpc2liaWxpdHk3LCB2aXNpYmlsaXR5KSkge1xuICAgICAgaWYgKHRoaXMub2JqNyA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgIHRoaXMub2JqNyA9IGluai5fbmV3KHAucHJvdmlkZXI3LCBwLnZpc2liaWxpdHk3KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLm9iajc7XG4gICAgfVxuICAgIGlmIChwLmtleUlkOCA9PT0ga2V5SWQgJiYgY2FuU2VlKHAudmlzaWJpbGl0eTgsIHZpc2liaWxpdHkpKSB7XG4gICAgICBpZiAodGhpcy5vYmo4ID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgdGhpcy5vYmo4ID0gaW5qLl9uZXcocC5wcm92aWRlcjgsIHAudmlzaWJpbGl0eTgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMub2JqODtcbiAgICB9XG4gICAgaWYgKHAua2V5SWQ5ID09PSBrZXlJZCAmJiBjYW5TZWUocC52aXNpYmlsaXR5OSwgdmlzaWJpbGl0eSkpIHtcbiAgICAgIGlmICh0aGlzLm9iajkgPT09IFVOREVGSU5FRCkge1xuICAgICAgICB0aGlzLm9iajkgPSBpbmouX25ldyhwLnByb3ZpZGVyOSwgcC52aXNpYmlsaXR5OSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5vYmo5O1xuICAgIH1cblxuICAgIHJldHVybiBVTkRFRklORUQ7XG4gIH1cblxuICBnZXRPYmpBdEluZGV4KGluZGV4OiBudW1iZXIpOiBhbnkge1xuICAgIGlmIChpbmRleCA9PSAwKSByZXR1cm4gdGhpcy5vYmowO1xuICAgIGlmIChpbmRleCA9PSAxKSByZXR1cm4gdGhpcy5vYmoxO1xuICAgIGlmIChpbmRleCA9PSAyKSByZXR1cm4gdGhpcy5vYmoyO1xuICAgIGlmIChpbmRleCA9PSAzKSByZXR1cm4gdGhpcy5vYmozO1xuICAgIGlmIChpbmRleCA9PSA0KSByZXR1cm4gdGhpcy5vYmo0O1xuICAgIGlmIChpbmRleCA9PSA1KSByZXR1cm4gdGhpcy5vYmo1O1xuICAgIGlmIChpbmRleCA9PSA2KSByZXR1cm4gdGhpcy5vYmo2O1xuICAgIGlmIChpbmRleCA9PSA3KSByZXR1cm4gdGhpcy5vYmo3O1xuICAgIGlmIChpbmRleCA9PSA4KSByZXR1cm4gdGhpcy5vYmo4O1xuICAgIGlmIChpbmRleCA9PSA5KSByZXR1cm4gdGhpcy5vYmo5O1xuICAgIHRocm93IG5ldyBPdXRPZkJvdW5kc0Vycm9yKGluZGV4KTtcbiAgfVxuXG4gIGdldE1heE51bWJlck9mT2JqZWN0cygpOiBudW1iZXIgeyByZXR1cm4gX01BWF9DT05TVFJVQ1RJT05fQ09VTlRFUjsgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBJbmplY3RvckR5bmFtaWNTdHJhdGVneSBpbXBsZW1lbnRzIEluamVjdG9yU3RyYXRlZ3kge1xuICBvYmpzOiBhbnlbXTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJvdG9TdHJhdGVneTogUHJvdG9JbmplY3RvckR5bmFtaWNTdHJhdGVneSwgcHVibGljIGluamVjdG9yOiBJbmplY3Rvcikge1xuICAgIHRoaXMub2JqcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShwcm90b1N0cmF0ZWd5LnByb3ZpZGVycy5sZW5ndGgpO1xuICAgIExpc3RXcmFwcGVyLmZpbGwodGhpcy5vYmpzLCBVTkRFRklORUQpO1xuICB9XG5cbiAgcmVzZXRDb25zdHJ1Y3Rpb25Db3VudGVyKCk6IHZvaWQgeyB0aGlzLmluamVjdG9yLl9jb25zdHJ1Y3Rpb25Db3VudGVyID0gMDsgfVxuXG4gIGluc3RhbnRpYXRlUHJvdmlkZXIocHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIsIHZpc2liaWxpdHk6IFZpc2liaWxpdHkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmluamVjdG9yLl9uZXcocHJvdmlkZXIsIHZpc2liaWxpdHkpO1xuICB9XG5cbiAgZ2V0T2JqQnlLZXlJZChrZXlJZDogbnVtYmVyLCB2aXNpYmlsaXR5OiBWaXNpYmlsaXR5KTogYW55IHtcbiAgICB2YXIgcCA9IHRoaXMucHJvdG9TdHJhdGVneTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcC5rZXlJZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChwLmtleUlkc1tpXSA9PT0ga2V5SWQgJiYgY2FuU2VlKHAudmlzaWJpbGl0aWVzW2ldLCB2aXNpYmlsaXR5KSkge1xuICAgICAgICBpZiAodGhpcy5vYmpzW2ldID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgICB0aGlzLm9ianNbaV0gPSB0aGlzLmluamVjdG9yLl9uZXcocC5wcm92aWRlcnNbaV0sIHAudmlzaWJpbGl0aWVzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLm9ianNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFVOREVGSU5FRDtcbiAgfVxuXG4gIGdldE9iakF0SW5kZXgoaW5kZXg6IG51bWJlcik6IGFueSB7XG4gICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLm9ianMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgT3V0T2ZCb3VuZHNFcnJvcihpbmRleCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMub2Jqc1tpbmRleF07XG4gIH1cblxuICBnZXRNYXhOdW1iZXJPZk9iamVjdHMoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMub2Jqcy5sZW5ndGg7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFByb3ZpZGVyV2l0aFZpc2liaWxpdHkge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIsIHB1YmxpYyB2aXNpYmlsaXR5OiBWaXNpYmlsaXR5KXt9O1xuXG4gIGdldEtleUlkKCk6IG51bWJlciB7IHJldHVybiB0aGlzLnByb3ZpZGVyLmtleS5pZDsgfVxufVxuXG4vKipcbiAqIFVzZWQgdG8gcHJvdmlkZSBkZXBlbmRlbmNpZXMgdGhhdCBjYW5ub3QgYmUgZWFzaWx5IGV4cHJlc3NlZCBhcyBwcm92aWRlcnMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVwZW5kZW5jeVByb3ZpZGVyIHtcbiAgZ2V0RGVwZW5kZW5jeShpbmplY3RvcjogSW5qZWN0b3IsIHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCBkZXBlbmRlbmN5OiBEZXBlbmRlbmN5KTogYW55O1xufVxuXG4vKipcbiAqIEEgZGVwZW5kZW5jeSBpbmplY3Rpb24gY29udGFpbmVyIHVzZWQgZm9yIGluc3RhbnRpYXRpbmcgb2JqZWN0cyBhbmQgcmVzb2x2aW5nIGRlcGVuZGVuY2llcy5cbiAqXG4gKiBBbiBgSW5qZWN0b3JgIGlzIGEgcmVwbGFjZW1lbnQgZm9yIGEgYG5ld2Agb3BlcmF0b3IsIHdoaWNoIGNhbiBhdXRvbWF0aWNhbGx5IHJlc29sdmUgdGhlXG4gKiBjb25zdHJ1Y3RvciBkZXBlbmRlbmNpZXMuXG4gKlxuICogSW4gdHlwaWNhbCB1c2UsIGFwcGxpY2F0aW9uIGNvZGUgYXNrcyBmb3IgdGhlIGRlcGVuZGVuY2llcyBpbiB0aGUgY29uc3RydWN0b3IgYW5kIHRoZXkgYXJlXG4gKiByZXNvbHZlZCBieSB0aGUgYEluamVjdG9yYC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvanpqZWMwP3A9cHJldmlldykpXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYW4gYEluamVjdG9yYCBjb25maWd1cmVkIHRvIGNyZWF0ZSBgRW5naW5lYCBhbmQgYENhcmAuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgRW5naW5lIHtcbiAqIH1cbiAqXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBDYXIge1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgZW5naW5lOkVuZ2luZSkge31cbiAqIH1cbiAqXG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtDYXIsIEVuZ2luZV0pO1xuICogdmFyIGNhciA9IGluamVjdG9yLmdldChDYXIpO1xuICogZXhwZWN0KGNhciBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAqIGV4cGVjdChjYXIuZW5naW5lIGluc3RhbmNlb2YgRW5naW5lKS50b0JlKHRydWUpO1xuICogYGBgXG4gKlxuICogTm90aWNlLCB3ZSBkb24ndCB1c2UgdGhlIGBuZXdgIG9wZXJhdG9yIGJlY2F1c2Ugd2UgZXhwbGljaXRseSB3YW50IHRvIGhhdmUgdGhlIGBJbmplY3RvcmBcbiAqIHJlc29sdmUgYWxsIG9mIHRoZSBvYmplY3QncyBkZXBlbmRlbmNpZXMgYXV0b21hdGljYWxseS5cbiAqL1xuZXhwb3J0IGNsYXNzIEluamVjdG9yIHtcbiAgLyoqXG4gICAqIFR1cm5zIGFuIGFycmF5IG9mIHByb3ZpZGVyIGRlZmluaXRpb25zIGludG8gYW4gYXJyYXkgb2YgcmVzb2x2ZWQgcHJvdmlkZXJzLlxuICAgKlxuICAgKiBBIHJlc29sdXRpb24gaXMgYSBwcm9jZXNzIG9mIGZsYXR0ZW5pbmcgbXVsdGlwbGUgbmVzdGVkIGFycmF5cyBhbmQgY29udmVydGluZyBpbmRpdmlkdWFsXG4gICAqIHByb3ZpZGVycyBpbnRvIGFuIGFycmF5IG9mIHtAbGluayBSZXNvbHZlZFByb3ZpZGVyfXMuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9BaVhUSGk/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIEVuZ2luZSB7XG4gICAqIH1cbiAgICpcbiAgICogQEluamVjdGFibGUoKVxuICAgKiBjbGFzcyBDYXIge1xuICAgKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbmdpbmU6RW5naW5lKSB7fVxuICAgKiB9XG4gICAqXG4gICAqIHZhciBwcm92aWRlcnMgPSBJbmplY3Rvci5yZXNvbHZlKFtDYXIsIFtbRW5naW5lXV1dKTtcbiAgICpcbiAgICogZXhwZWN0KHByb3ZpZGVycy5sZW5ndGgpLnRvRXF1YWwoMik7XG4gICAqXG4gICAqIGV4cGVjdChwcm92aWRlcnNbMF0gaW5zdGFuY2VvZiBSZXNvbHZlZFByb3ZpZGVyKS50b0JlKHRydWUpO1xuICAgKiBleHBlY3QocHJvdmlkZXJzWzBdLmtleS5kaXNwbGF5TmFtZSkudG9CZShcIkNhclwiKTtcbiAgICogZXhwZWN0KHByb3ZpZGVyc1swXS5kZXBlbmRlbmNpZXMubGVuZ3RoKS50b0VxdWFsKDEpO1xuICAgKiBleHBlY3QocHJvdmlkZXJzWzBdLmZhY3RvcnkpLnRvQmVEZWZpbmVkKCk7XG4gICAqXG4gICAqIGV4cGVjdChwcm92aWRlcnNbMV0ua2V5LmRpc3BsYXlOYW1lKS50b0JlKFwiRW5naW5lXCIpO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqXG4gICAqIFNlZSB7QGxpbmsgSW5qZWN0b3IjZnJvbVJlc29sdmVkUHJvdmlkZXJzfSBmb3IgbW9yZSBpbmZvLlxuICAgKi9cbiAgc3RhdGljIHJlc29sdmUocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBSZXNvbHZlZFByb3ZpZGVyW10ge1xuICAgIHJldHVybiByZXNvbHZlUHJvdmlkZXJzKHByb3ZpZGVycyk7XG4gIH1cblxuICAvKipcbiAgICogUmVzb2x2ZXMgYW4gYXJyYXkgb2YgcHJvdmlkZXJzIGFuZCBjcmVhdGVzIGFuIGluamVjdG9yIGZyb20gdGhvc2UgcHJvdmlkZXJzLlxuICAgKlxuICAgKiBUaGUgcGFzc2VkLWluIHByb3ZpZGVycyBjYW4gYmUgYW4gYXJyYXkgb2YgYFR5cGVgLCB7QGxpbmsgUHJvdmlkZXJ9LFxuICAgKiBvciBhIHJlY3Vyc2l2ZSBhcnJheSBvZiBtb3JlIHByb3ZpZGVycy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2VQT2NjQT9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgRW5naW5lIHtcbiAgICogfVxuICAgKlxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIENhciB7XG4gICAqICAgY29uc3RydWN0b3IocHVibGljIGVuZ2luZTpFbmdpbmUpIHt9XG4gICAqIH1cbiAgICpcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbQ2FyLCBFbmdpbmVdKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChDYXIpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKiBgYGBcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBpcyBzbG93ZXIgdGhhbiB0aGUgY29ycmVzcG9uZGluZyBgZnJvbVJlc29sdmVkUHJvdmlkZXJzYFxuICAgKiBiZWNhdXNlIGl0IG5lZWRzIHRvIHJlc29sdmUgdGhlIHBhc3NlZC1pbiBwcm92aWRlcnMgZmlyc3QuXG4gICAqIFNlZSB7QGxpbmsgSW5qZWN0b3IjcmVzb2x2ZX0gYW5kIHtAbGluayBJbmplY3RvciNmcm9tUmVzb2x2ZWRQcm92aWRlcnN9LlxuICAgKi9cbiAgc3RhdGljIHJlc29sdmVBbmRDcmVhdGUocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBJbmplY3RvciB7XG4gICAgdmFyIHJlc29sdmVkUHJvdmlkZXJzID0gSW5qZWN0b3IucmVzb2x2ZShwcm92aWRlcnMpO1xuICAgIHJldHVybiBJbmplY3Rvci5mcm9tUmVzb2x2ZWRQcm92aWRlcnMocmVzb2x2ZWRQcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5qZWN0b3IgZnJvbSBwcmV2aW91c2x5IHJlc29sdmVkIHByb3ZpZGVycy5cbiAgICpcbiAgICogVGhpcyBBUEkgaXMgdGhlIHJlY29tbWVuZGVkIHdheSB0byBjb25zdHJ1Y3QgaW5qZWN0b3JzIGluIHBlcmZvcm1hbmNlLXNlbnNpdGl2ZSBwYXJ0cy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0tyU01jaT9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgRW5naW5lIHtcbiAgICogfVxuICAgKlxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIENhciB7XG4gICAqICAgY29uc3RydWN0b3IocHVibGljIGVuZ2luZTpFbmdpbmUpIHt9XG4gICAqIH1cbiAgICpcbiAgICogdmFyIHByb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUoW0NhciwgRW5naW5lXSk7XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLmZyb21SZXNvbHZlZFByb3ZpZGVycyhwcm92aWRlcnMpO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KENhcikgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgc3RhdGljIGZyb21SZXNvbHZlZFByb3ZpZGVycyhwcm92aWRlcnM6IFJlc29sdmVkUHJvdmlkZXJbXSk6IEluamVjdG9yIHtcbiAgICByZXR1cm4gbmV3IEluamVjdG9yKFByb3RvSW5qZWN0b3IuZnJvbVJlc29sdmVkUHJvdmlkZXJzKHByb3ZpZGVycykpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBzdGF0aWMgZnJvbVJlc29sdmVkQmluZGluZ3MocHJvdmlkZXJzOiBSZXNvbHZlZFByb3ZpZGVyW10pOiBJbmplY3RvciB7XG4gICAgcmV0dXJuIEluamVjdG9yLmZyb21SZXNvbHZlZFByb3ZpZGVycyhwcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RyYXRlZ3k6IEluamVjdG9yU3RyYXRlZ3k7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbnN0cnVjdGlvbkNvdW50ZXI6IG51bWJlciA9IDA7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF9wcm90bzogYW55IC8qIFByb3RvSW5qZWN0b3IgKi87XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF9wYXJlbnQ6IEluamVjdG9yO1xuICAvKipcbiAgICogUHJpdmF0ZVxuICAgKi9cbiAgY29uc3RydWN0b3IoX3Byb3RvOiBhbnkgLyogUHJvdG9JbmplY3RvciAqLywgX3BhcmVudDogSW5qZWN0b3IgPSBudWxsLFxuICAgICAgICAgICAgICBwcml2YXRlIF9pc0hvc3RCb3VuZGFyeTogYm9vbGVhbiA9IGZhbHNlLFxuICAgICAgICAgICAgICBwcml2YXRlIF9kZXBQcm92aWRlcjogYW55IC8qIERlcGVuZGVuY3lQcm92aWRlciAqLyA9IG51bGwsXG4gICAgICAgICAgICAgIHByaXZhdGUgX2RlYnVnQ29udGV4dDogRnVuY3Rpb24gPSBudWxsKSB7XG4gICAgdGhpcy5fcHJvdG8gPSBfcHJvdG87XG4gICAgdGhpcy5fcGFyZW50ID0gX3BhcmVudDtcbiAgICB0aGlzLl9zdHJhdGVneSA9IF9wcm90by5fc3RyYXRlZ3kuY3JlYXRlSW5qZWN0b3JTdHJhdGVneSh0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoaXMgaW5qZWN0b3IgaXMgYSBib3VuZGFyeSB0byBhIGhvc3QuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgZ2V0IGhvc3RCb3VuZGFyeSgpIHsgcmV0dXJuIHRoaXMuX2lzSG9zdEJvdW5kYXJ5OyB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgZGVidWdDb250ZXh0KCk6IGFueSB7IHJldHVybiB0aGlzLl9kZWJ1Z0NvbnRleHQoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYW4gaW5zdGFuY2UgZnJvbSB0aGUgaW5qZWN0b3IgYmFzZWQgb24gdGhlIHByb3ZpZGVkIHRva2VuLlxuICAgKiBUaHJvd3Mge0BsaW5rIE5vUHJvdmlkZXJFcnJvcn0gaWYgbm90IGZvdW5kLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvSGVYU0hnP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgcHJvdmlkZShcInZhbGlkVG9rZW5cIiwge3VzZVZhbHVlOiBcIlZhbHVlXCJ9KVxuICAgKiBdKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChcInZhbGlkVG9rZW5cIikpLnRvRXF1YWwoXCJWYWx1ZVwiKTtcbiAgICogZXhwZWN0KCgpID0+IGluamVjdG9yLmdldChcImludmFsaWRUb2tlblwiKSkudG9UaHJvd0Vycm9yKCk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBgSW5qZWN0b3JgIHJldHVybnMgaXRzZWxmIHdoZW4gZ2l2ZW4gYEluamVjdG9yYCBhcyBhIHRva2VuLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW10pO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KEluamVjdG9yKSkudG9CZShpbmplY3Rvcik7XG4gICAqIGBgYFxuICAgKi9cbiAgZ2V0KHRva2VuOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9nZXRCeUtleShLZXkuZ2V0KHRva2VuKSwgbnVsbCwgbnVsbCwgZmFsc2UsIFZpc2liaWxpdHkuUHVibGljQW5kUHJpdmF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIGFuIGluc3RhbmNlIGZyb20gdGhlIGluamVjdG9yIGJhc2VkIG9uIHRoZSBwcm92aWRlZCB0b2tlbi5cbiAgICogUmV0dXJucyBudWxsIGlmIG5vdCBmb3VuZC5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3RwRWJFeT9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIHByb3ZpZGUoXCJ2YWxpZFRva2VuXCIsIHt1c2VWYWx1ZTogXCJWYWx1ZVwifSlcbiAgICogXSk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXRPcHRpb25hbChcInZhbGlkVG9rZW5cIikpLnRvRXF1YWwoXCJWYWx1ZVwiKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldE9wdGlvbmFsKFwiaW52YWxpZFRva2VuXCIpKS50b0JlKG51bGwpO1xuICAgKiBgYGBcbiAgICpcbiAgICogYEluamVjdG9yYCByZXR1cm5zIGl0c2VsZiB3aGVuIGdpdmVuIGBJbmplY3RvcmAgYXMgYSB0b2tlbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtdKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldE9wdGlvbmFsKEluamVjdG9yKSkudG9CZShpbmplY3Rvcik7XG4gICAqIGBgYFxuICAgKi9cbiAgZ2V0T3B0aW9uYWwodG9rZW46IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldEJ5S2V5KEtleS5nZXQodG9rZW4pLCBudWxsLCBudWxsLCB0cnVlLCBWaXNpYmlsaXR5LlB1YmxpY0FuZFByaXZhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgZ2V0QXQoaW5kZXg6IG51bWJlcik6IGFueSB7IHJldHVybiB0aGlzLl9zdHJhdGVneS5nZXRPYmpBdEluZGV4KGluZGV4KTsgfVxuXG4gIC8qKlxuICAgKiBQYXJlbnQgb2YgdGhpcyBpbmplY3Rvci5cbiAgICpcbiAgICogPCEtLSBUT0RPOiBBZGQgYSBsaW5rIHRvIHRoZSBzZWN0aW9uIG9mIHRoZSB1c2VyIGd1aWRlIHRhbGtpbmcgYWJvdXQgaGllcmFyY2hpY2FsIGluamVjdGlvbi5cbiAgICogLS0+XG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9lb3NNR28/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgcGFyZW50ID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXSk7XG4gICAqIHZhciBjaGlsZCA9IHBhcmVudC5yZXNvbHZlQW5kQ3JlYXRlQ2hpbGQoW10pO1xuICAgKiBleHBlY3QoY2hpbGQucGFyZW50KS50b0JlKHBhcmVudCk7XG4gICAqIGBgYFxuICAgKi9cbiAgZ2V0IHBhcmVudCgpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9wYXJlbnQ7IH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqIEludGVybmFsLiBEbyBub3QgdXNlLlxuICAgKiBXZSByZXR1cm4gYGFueWAgbm90IHRvIGV4cG9ydCB0aGUgSW5qZWN0b3JTdHJhdGVneSB0eXBlLlxuICAgKi9cbiAgZ2V0IGludGVybmFsU3RyYXRlZ3koKTogYW55IHsgcmV0dXJuIHRoaXMuX3N0cmF0ZWd5OyB9XG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIGFuIGFycmF5IG9mIHByb3ZpZGVycyBhbmQgY3JlYXRlcyBhIGNoaWxkIGluamVjdG9yIGZyb20gdGhvc2UgcHJvdmlkZXJzLlxuICAgKlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpbmsgdG8gdGhlIHNlY3Rpb24gb2YgdGhlIHVzZXIgZ3VpZGUgdGFsa2luZyBhYm91dCBoaWVyYXJjaGljYWwgaW5qZWN0aW9uLlxuICAgKiAtLT5cbiAgICpcbiAgICogVGhlIHBhc3NlZC1pbiBwcm92aWRlcnMgY2FuIGJlIGFuIGFycmF5IG9mIGBUeXBlYCwge0BsaW5rIFByb3ZpZGVyfSxcbiAgICogb3IgYSByZWN1cnNpdmUgYXJyYXkgb2YgbW9yZSBwcm92aWRlcnMuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9vcEIzVDQ/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBQYXJlbnRQcm92aWRlciB7fVxuICAgKiBjbGFzcyBDaGlsZFByb3ZpZGVyIHt9XG4gICAqXG4gICAqIHZhciBwYXJlbnQgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtQYXJlbnRQcm92aWRlcl0pO1xuICAgKiB2YXIgY2hpbGQgPSBwYXJlbnQucmVzb2x2ZUFuZENyZWF0ZUNoaWxkKFtDaGlsZFByb3ZpZGVyXSk7XG4gICAqXG4gICAqIGV4cGVjdChjaGlsZC5nZXQoUGFyZW50UHJvdmlkZXIpIGluc3RhbmNlb2YgUGFyZW50UHJvdmlkZXIpLnRvQmUodHJ1ZSk7XG4gICAqIGV4cGVjdChjaGlsZC5nZXQoQ2hpbGRQcm92aWRlcikgaW5zdGFuY2VvZiBDaGlsZFByb3ZpZGVyKS50b0JlKHRydWUpO1xuICAgKiBleHBlY3QoY2hpbGQuZ2V0KFBhcmVudFByb3ZpZGVyKSkudG9CZShwYXJlbnQuZ2V0KFBhcmVudFByb3ZpZGVyKSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGlzIHNsb3dlciB0aGFuIHRoZSBjb3JyZXNwb25kaW5nIGBjcmVhdGVDaGlsZEZyb21SZXNvbHZlZGBcbiAgICogYmVjYXVzZSBpdCBuZWVkcyB0byByZXNvbHZlIHRoZSBwYXNzZWQtaW4gcHJvdmlkZXJzIGZpcnN0LlxuICAgKiBTZWUge0BsaW5rIEluamVjdG9yI3Jlc29sdmV9IGFuZCB7QGxpbmsgSW5qZWN0b3IjY3JlYXRlQ2hpbGRGcm9tUmVzb2x2ZWR9LlxuICAgKi9cbiAgcmVzb2x2ZUFuZENyZWF0ZUNoaWxkKHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogSW5qZWN0b3Ige1xuICAgIHZhciByZXNvbHZlZFByb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUocHJvdmlkZXJzKTtcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVDaGlsZEZyb21SZXNvbHZlZChyZXNvbHZlZFByb3ZpZGVycyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNoaWxkIGluamVjdG9yIGZyb20gcHJldmlvdXNseSByZXNvbHZlZCBwcm92aWRlcnMuXG4gICAqXG4gICAqIDwhLS0gVE9ETzogQWRkIGEgbGluayB0byB0aGUgc2VjdGlvbiBvZiB0aGUgdXNlciBndWlkZSB0YWxraW5nIGFib3V0IGhpZXJhcmNoaWNhbCBpbmplY3Rpb24uXG4gICAqIC0tPlxuICAgKlxuICAgKiBUaGlzIEFQSSBpcyB0aGUgcmVjb21tZW5kZWQgd2F5IHRvIGNvbnN0cnVjdCBpbmplY3RvcnMgaW4gcGVyZm9ybWFuY2Utc2Vuc2l0aXZlIHBhcnRzLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvVmh5ZmpOP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgUGFyZW50UHJvdmlkZXIge31cbiAgICogY2xhc3MgQ2hpbGRQcm92aWRlciB7fVxuICAgKlxuICAgKiB2YXIgcGFyZW50UHJvdmlkZXJzID0gSW5qZWN0b3IucmVzb2x2ZShbUGFyZW50UHJvdmlkZXJdKTtcbiAgICogdmFyIGNoaWxkUHJvdmlkZXJzID0gSW5qZWN0b3IucmVzb2x2ZShbQ2hpbGRQcm92aWRlcl0pO1xuICAgKlxuICAgKiB2YXIgcGFyZW50ID0gSW5qZWN0b3IuZnJvbVJlc29sdmVkUHJvdmlkZXJzKHBhcmVudFByb3ZpZGVycyk7XG4gICAqIHZhciBjaGlsZCA9IHBhcmVudC5jcmVhdGVDaGlsZEZyb21SZXNvbHZlZChjaGlsZFByb3ZpZGVycyk7XG4gICAqXG4gICAqIGV4cGVjdChjaGlsZC5nZXQoUGFyZW50UHJvdmlkZXIpIGluc3RhbmNlb2YgUGFyZW50UHJvdmlkZXIpLnRvQmUodHJ1ZSk7XG4gICAqIGV4cGVjdChjaGlsZC5nZXQoQ2hpbGRQcm92aWRlcikgaW5zdGFuY2VvZiBDaGlsZFByb3ZpZGVyKS50b0JlKHRydWUpO1xuICAgKiBleHBlY3QoY2hpbGQuZ2V0KFBhcmVudFByb3ZpZGVyKSkudG9CZShwYXJlbnQuZ2V0KFBhcmVudFByb3ZpZGVyKSk7XG4gICAqIGBgYFxuICAgKi9cbiAgY3JlYXRlQ2hpbGRGcm9tUmVzb2x2ZWQocHJvdmlkZXJzOiBSZXNvbHZlZFByb3ZpZGVyW10pOiBJbmplY3RvciB7XG4gICAgdmFyIGJkID0gcHJvdmlkZXJzLm1hcChiID0+IG5ldyBQcm92aWRlcldpdGhWaXNpYmlsaXR5KGIsIFZpc2liaWxpdHkuUHVibGljKSk7XG4gICAgdmFyIHByb3RvID0gbmV3IFByb3RvSW5qZWN0b3IoYmQpO1xuICAgIHZhciBpbmogPSBuZXcgSW5qZWN0b3IocHJvdG8pO1xuICAgIGluai5fcGFyZW50ID0gdGhpcztcbiAgICByZXR1cm4gaW5qO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIGEgcHJvdmlkZXIgYW5kIGluc3RhbnRpYXRlcyBhbiBvYmplY3QgaW4gdGhlIGNvbnRleHQgb2YgdGhlIGluamVjdG9yLlxuICAgKlxuICAgKiBUaGUgY3JlYXRlZCBvYmplY3QgZG9lcyBub3QgZ2V0IGNhY2hlZCBieSB0aGUgaW5qZWN0b3IuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC95dlZYb0I/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIEVuZ2luZSB7XG4gICAqIH1cbiAgICpcbiAgICogQEluamVjdGFibGUoKVxuICAgKiBjbGFzcyBDYXIge1xuICAgKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbmdpbmU6RW5naW5lKSB7fVxuICAgKiB9XG4gICAqXG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW0VuZ2luZV0pO1xuICAgKlxuICAgKiB2YXIgY2FyID0gaW5qZWN0b3IucmVzb2x2ZUFuZEluc3RhbnRpYXRlKENhcik7XG4gICAqIGV4cGVjdChjYXIuZW5naW5lKS50b0JlKGluamVjdG9yLmdldChFbmdpbmUpKTtcbiAgICogZXhwZWN0KGNhcikubm90LnRvQmUoaW5qZWN0b3IucmVzb2x2ZUFuZEluc3RhbnRpYXRlKENhcikpO1xuICAgKiBgYGBcbiAgICovXG4gIHJlc29sdmVBbmRJbnN0YW50aWF0ZShwcm92aWRlcjogVHlwZSB8IFByb3ZpZGVyKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5pbnN0YW50aWF0ZVJlc29sdmVkKEluamVjdG9yLnJlc29sdmUoW3Byb3ZpZGVyXSlbMF0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlcyBhbiBvYmplY3QgdXNpbmcgYSByZXNvbHZlZCBwcm92aWRlciBpbiB0aGUgY29udGV4dCBvZiB0aGUgaW5qZWN0b3IuXG4gICAqXG4gICAqIFRoZSBjcmVhdGVkIG9iamVjdCBkb2VzIG5vdCBnZXQgY2FjaGVkIGJ5IHRoZSBpbmplY3Rvci5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3B0Q0ltUT9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgRW5naW5lIHtcbiAgICogfVxuICAgKlxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIENhciB7XG4gICAqICAgY29uc3RydWN0b3IocHVibGljIGVuZ2luZTpFbmdpbmUpIHt9XG4gICAqIH1cbiAgICpcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbRW5naW5lXSk7XG4gICAqIHZhciBjYXJQcm92aWRlciA9IEluamVjdG9yLnJlc29sdmUoW0Nhcl0pWzBdO1xuICAgKiB2YXIgY2FyID0gaW5qZWN0b3IuaW5zdGFudGlhdGVSZXNvbHZlZChjYXJQcm92aWRlcik7XG4gICAqIGV4cGVjdChjYXIuZW5naW5lKS50b0JlKGluamVjdG9yLmdldChFbmdpbmUpKTtcbiAgICogZXhwZWN0KGNhcikubm90LnRvQmUoaW5qZWN0b3IuaW5zdGFudGlhdGVSZXNvbHZlZChjYXJQcm92aWRlcikpO1xuICAgKiBgYGBcbiAgICovXG4gIGluc3RhbnRpYXRlUmVzb2x2ZWQocHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl9pbnN0YW50aWF0ZVByb3ZpZGVyKHByb3ZpZGVyLCBWaXNpYmlsaXR5LlB1YmxpY0FuZFByaXZhdGUpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmV3KHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCB2aXNpYmlsaXR5OiBWaXNpYmlsaXR5KTogYW55IHtcbiAgICBpZiAodGhpcy5fY29uc3RydWN0aW9uQ291bnRlcisrID4gdGhpcy5fc3RyYXRlZ3kuZ2V0TWF4TnVtYmVyT2ZPYmplY3RzKCkpIHtcbiAgICAgIHRocm93IG5ldyBDeWNsaWNEZXBlbmRlbmN5RXJyb3IodGhpcywgcHJvdmlkZXIua2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2luc3RhbnRpYXRlUHJvdmlkZXIocHJvdmlkZXIsIHZpc2liaWxpdHkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5zdGFudGlhdGVQcm92aWRlcihwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlciwgdmlzaWJpbGl0eTogVmlzaWJpbGl0eSk6IGFueSB7XG4gICAgaWYgKHByb3ZpZGVyLm11bHRpUHJvdmlkZXIpIHtcbiAgICAgIHZhciByZXMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUocHJvdmlkZXIucmVzb2x2ZWRGYWN0b3JpZXMubGVuZ3RoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvdmlkZXIucmVzb2x2ZWRGYWN0b3JpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgcmVzW2ldID0gdGhpcy5faW5zdGFudGlhdGUocHJvdmlkZXIsIHByb3ZpZGVyLnJlc29sdmVkRmFjdG9yaWVzW2ldLCB2aXNpYmlsaXR5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9pbnN0YW50aWF0ZShwcm92aWRlciwgcHJvdmlkZXIucmVzb2x2ZWRGYWN0b3JpZXNbMF0sIHZpc2liaWxpdHkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2luc3RhbnRpYXRlKHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCByZXNvbHZlZEZhY3Rvcnk6IFJlc29sdmVkRmFjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJpbGl0eTogVmlzaWJpbGl0eSk6IGFueSB7XG4gICAgdmFyIGZhY3RvcnkgPSByZXNvbHZlZEZhY3RvcnkuZmFjdG9yeTtcbiAgICB2YXIgZGVwcyA9IHJlc29sdmVkRmFjdG9yeS5kZXBlbmRlbmNpZXM7XG4gICAgdmFyIGxlbmd0aCA9IGRlcHMubGVuZ3RoO1xuXG4gICAgdmFyIGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgsIGQ5LCBkMTAsIGQxMSwgZDEyLCBkMTMsIGQxNCwgZDE1LCBkMTYsIGQxNywgZDE4LCBkMTk7XG4gICAgdHJ5IHtcbiAgICAgIGQwID0gbGVuZ3RoID4gMCA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1swXSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDEgPSBsZW5ndGggPiAxID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzFdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMiA9IGxlbmd0aCA+IDIgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMl0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQzID0gbGVuZ3RoID4gMyA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1szXSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDQgPSBsZW5ndGggPiA0ID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzRdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkNSA9IGxlbmd0aCA+IDUgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbNV0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQ2ID0gbGVuZ3RoID4gNiA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1s2XSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDcgPSBsZW5ndGggPiA3ID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzddLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkOCA9IGxlbmd0aCA+IDggPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbOF0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQ5ID0gbGVuZ3RoID4gOSA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1s5XSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDEwID0gbGVuZ3RoID4gMTAgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMTBdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMTEgPSBsZW5ndGggPiAxMSA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1sxMV0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQxMiA9IGxlbmd0aCA+IDEyID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzEyXSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDEzID0gbGVuZ3RoID4gMTMgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMTNdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMTQgPSBsZW5ndGggPiAxNCA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1sxNF0sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQxNSA9IGxlbmd0aCA+IDE1ID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzE1XSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDE2ID0gbGVuZ3RoID4gMTYgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMTZdLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgICBkMTcgPSBsZW5ndGggPiAxNyA/IHRoaXMuX2dldEJ5RGVwZW5kZW5jeShwcm92aWRlciwgZGVwc1sxN10sIHZpc2liaWxpdHkpIDogbnVsbDtcbiAgICAgIGQxOCA9IGxlbmd0aCA+IDE4ID8gdGhpcy5fZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyLCBkZXBzWzE4XSwgdmlzaWJpbGl0eSkgOiBudWxsO1xuICAgICAgZDE5ID0gbGVuZ3RoID4gMTkgPyB0aGlzLl9nZXRCeURlcGVuZGVuY3kocHJvdmlkZXIsIGRlcHNbMTldLCB2aXNpYmlsaXR5KSA6IG51bGw7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBBYnN0cmFjdFByb3ZpZGVyRXJyb3IgfHwgZSBpbnN0YW5jZW9mIEluc3RhbnRpYXRpb25FcnJvcikge1xuICAgICAgICBlLmFkZEtleSh0aGlzLCBwcm92aWRlci5rZXkpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICB2YXIgb2JqO1xuICAgIHRyeSB7XG4gICAgICBzd2l0Y2ggKGxlbmd0aCkge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgODpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDExOlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDksIGQxMCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwLCBkMTEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDksIGQxMCwgZDExLCBkMTIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDksIGQxMCwgZDExLCBkMTIsIGQxMyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwLCBkMTEsIGQxMiwgZDEzLCBkMTQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDksIGQxMCwgZDExLCBkMTIsIGQxMywgZDE0LCBkMTUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE3OlxuICAgICAgICAgIG9iaiA9IGZhY3RvcnkoZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDksIGQxMCwgZDExLCBkMTIsIGQxMywgZDE0LCBkMTUsIGQxNik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwLCBkMTEsIGQxMiwgZDEzLCBkMTQsIGQxNSwgZDE2LFxuICAgICAgICAgICAgICAgICAgICAgICAgZDE3KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOTpcbiAgICAgICAgICBvYmogPSBmYWN0b3J5KGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgsIGQ5LCBkMTAsIGQxMSwgZDEyLCBkMTMsIGQxNCwgZDE1LCBkMTYsXG4gICAgICAgICAgICAgICAgICAgICAgICBkMTcsIGQxOCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgb2JqID0gZmFjdG9yeShkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSwgZDEwLCBkMTEsIGQxMiwgZDEzLCBkMTQsIGQxNSwgZDE2LFxuICAgICAgICAgICAgICAgICAgICAgICAgZDE3LCBkMTgsIGQxOSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEluc3RhbnRpYXRpb25FcnJvcih0aGlzLCBlLCBlLnN0YWNrLCBwcm92aWRlci5rZXkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0QnlEZXBlbmRlbmN5KHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCBkZXA6IERlcGVuZGVuY3ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlclZpc2liaWxpdHk6IFZpc2liaWxpdHkpOiBhbnkge1xuICAgIHZhciBzcGVjaWFsID0gaXNQcmVzZW50KHRoaXMuX2RlcFByb3ZpZGVyKSA/XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVwUHJvdmlkZXIuZ2V0RGVwZW5kZW5jeSh0aGlzLCBwcm92aWRlciwgZGVwKSA6XG4gICAgICAgICAgICAgICAgICAgICAgVU5ERUZJTkVEO1xuICAgIGlmIChzcGVjaWFsICE9PSBVTkRFRklORUQpIHtcbiAgICAgIHJldHVybiBzcGVjaWFsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0QnlLZXkoZGVwLmtleSwgZGVwLmxvd2VyQm91bmRWaXNpYmlsaXR5LCBkZXAudXBwZXJCb3VuZFZpc2liaWxpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwLm9wdGlvbmFsLCBwcm92aWRlclZpc2liaWxpdHkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2dldEJ5S2V5KGtleTogS2V5LCBsb3dlckJvdW5kVmlzaWJpbGl0eTogT2JqZWN0LCB1cHBlckJvdW5kVmlzaWJpbGl0eTogT2JqZWN0LFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25hbDogYm9vbGVhbiwgcHJvdmlkZXJWaXNpYmlsaXR5OiBWaXNpYmlsaXR5KTogYW55IHtcbiAgICBpZiAoa2V5ID09PSBJTkpFQ1RPUl9LRVkpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh1cHBlckJvdW5kVmlzaWJpbGl0eSBpbnN0YW5jZW9mIFNlbGZNZXRhZGF0YSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldEJ5S2V5U2VsZihrZXksIG9wdGlvbmFsLCBwcm92aWRlclZpc2liaWxpdHkpO1xuXG4gICAgfSBlbHNlIGlmICh1cHBlckJvdW5kVmlzaWJpbGl0eSBpbnN0YW5jZW9mIEhvc3RNZXRhZGF0YSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldEJ5S2V5SG9zdChrZXksIG9wdGlvbmFsLCBwcm92aWRlclZpc2liaWxpdHksIGxvd2VyQm91bmRWaXNpYmlsaXR5KTtcblxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0QnlLZXlEZWZhdWx0KGtleSwgb3B0aW9uYWwsIHByb3ZpZGVyVmlzaWJpbGl0eSwgbG93ZXJCb3VuZFZpc2liaWxpdHkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Rocm93T3JOdWxsKGtleTogS2V5LCBvcHRpb25hbDogYm9vbGVhbik6IGFueSB7XG4gICAgaWYgKG9wdGlvbmFsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IE5vUHJvdmlkZXJFcnJvcih0aGlzLCBrZXkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dldEJ5S2V5U2VsZihrZXk6IEtleSwgb3B0aW9uYWw6IGJvb2xlYW4sIHByb3ZpZGVyVmlzaWJpbGl0eTogVmlzaWJpbGl0eSk6IGFueSB7XG4gICAgdmFyIG9iaiA9IHRoaXMuX3N0cmF0ZWd5LmdldE9iakJ5S2V5SWQoa2V5LmlkLCBwcm92aWRlclZpc2liaWxpdHkpO1xuICAgIHJldHVybiAob2JqICE9PSBVTkRFRklORUQpID8gb2JqIDogdGhpcy5fdGhyb3dPck51bGwoa2V5LCBvcHRpb25hbCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZXRCeUtleUhvc3Qoa2V5OiBLZXksIG9wdGlvbmFsOiBib29sZWFuLCBwcm92aWRlclZpc2liaWxpdHk6IFZpc2liaWxpdHksXG4gICAgICAgICAgICAgICAgbG93ZXJCb3VuZFZpc2liaWxpdHk6IE9iamVjdCk6IGFueSB7XG4gICAgdmFyIGluajogSW5qZWN0b3IgPSB0aGlzO1xuXG4gICAgaWYgKGxvd2VyQm91bmRWaXNpYmlsaXR5IGluc3RhbmNlb2YgU2tpcFNlbGZNZXRhZGF0YSkge1xuICAgICAgaWYgKGluai5faXNIb3N0Qm91bmRhcnkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldFByaXZhdGVEZXBlbmRlbmN5KGtleSwgb3B0aW9uYWwsIGluaik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmogPSBpbmouX3BhcmVudDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB3aGlsZSAoaW5qICE9IG51bGwpIHtcbiAgICAgIHZhciBvYmogPSBpbmouX3N0cmF0ZWd5LmdldE9iakJ5S2V5SWQoa2V5LmlkLCBwcm92aWRlclZpc2liaWxpdHkpO1xuICAgICAgaWYgKG9iaiAhPT0gVU5ERUZJTkVEKSByZXR1cm4gb2JqO1xuXG4gICAgICBpZiAoaXNQcmVzZW50KGluai5fcGFyZW50KSAmJiBpbmouX2lzSG9zdEJvdW5kYXJ5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRQcml2YXRlRGVwZW5kZW5jeShrZXksIG9wdGlvbmFsLCBpbmopO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5qID0gaW5qLl9wYXJlbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3Rocm93T3JOdWxsKGtleSwgb3B0aW9uYWwpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZ2V0UHJpdmF0ZURlcGVuZGVuY3koa2V5OiBLZXksIG9wdGlvbmFsOiBib29sZWFuLCBpbmo6IEluamVjdG9yKTogYW55IHtcbiAgICB2YXIgb2JqID0gaW5qLl9wYXJlbnQuX3N0cmF0ZWd5LmdldE9iakJ5S2V5SWQoa2V5LmlkLCBWaXNpYmlsaXR5LlByaXZhdGUpO1xuICAgIHJldHVybiAob2JqICE9PSBVTkRFRklORUQpID8gb2JqIDogdGhpcy5fdGhyb3dPck51bGwoa2V5LCBvcHRpb25hbCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZXRCeUtleURlZmF1bHQoa2V5OiBLZXksIG9wdGlvbmFsOiBib29sZWFuLCBwcm92aWRlclZpc2liaWxpdHk6IFZpc2liaWxpdHksXG4gICAgICAgICAgICAgICAgICAgbG93ZXJCb3VuZFZpc2liaWxpdHk6IE9iamVjdCk6IGFueSB7XG4gICAgdmFyIGluajogSW5qZWN0b3IgPSB0aGlzO1xuXG4gICAgaWYgKGxvd2VyQm91bmRWaXNpYmlsaXR5IGluc3RhbmNlb2YgU2tpcFNlbGZNZXRhZGF0YSkge1xuICAgICAgcHJvdmlkZXJWaXNpYmlsaXR5ID0gaW5qLl9pc0hvc3RCb3VuZGFyeSA/IFZpc2liaWxpdHkuUHVibGljQW5kUHJpdmF0ZSA6IFZpc2liaWxpdHkuUHVibGljO1xuICAgICAgaW5qID0gaW5qLl9wYXJlbnQ7XG4gICAgfVxuXG4gICAgd2hpbGUgKGluaiAhPSBudWxsKSB7XG4gICAgICB2YXIgb2JqID0gaW5qLl9zdHJhdGVneS5nZXRPYmpCeUtleUlkKGtleS5pZCwgcHJvdmlkZXJWaXNpYmlsaXR5KTtcbiAgICAgIGlmIChvYmogIT09IFVOREVGSU5FRCkgcmV0dXJuIG9iajtcblxuICAgICAgcHJvdmlkZXJWaXNpYmlsaXR5ID0gaW5qLl9pc0hvc3RCb3VuZGFyeSA/IFZpc2liaWxpdHkuUHVibGljQW5kUHJpdmF0ZSA6IFZpc2liaWxpdHkuUHVibGljO1xuICAgICAgaW5qID0gaW5qLl9wYXJlbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3Rocm93T3JOdWxsKGtleSwgb3B0aW9uYWwpO1xuICB9XG5cbiAgZ2V0IGRpc3BsYXlOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBJbmplY3Rvcihwcm92aWRlcnM6IFske19tYXBQcm92aWRlcnModGhpcywgYiA9PiBgIFwiJHtiLmtleS5kaXNwbGF5TmFtZX1cIiBgKS5qb2luKFwiLCBcIil9XSlgO1xuICB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZGlzcGxheU5hbWU7IH1cbn1cblxudmFyIElOSkVDVE9SX0tFWSA9IEtleS5nZXQoSW5qZWN0b3IpO1xuXG5cbmZ1bmN0aW9uIF9tYXBQcm92aWRlcnMoaW5qZWN0b3I6IEluamVjdG9yLCBmbjogRnVuY3Rpb24pOiBhbnlbXSB7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmplY3Rvci5fcHJvdG8ubnVtYmVyT2ZQcm92aWRlcnM7ICsraSkge1xuICAgIHJlcy5wdXNoKGZuKGluamVjdG9yLl9wcm90by5nZXRQcm92aWRlckF0SW5kZXgoaSkpKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuIl19