'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var key_1 = require('./key');
var metadata_1 = require('./metadata');
var exceptions_2 = require('./exceptions');
var forward_ref_1 = require('./forward_ref');
/**
 * `Dependency` is used by the framework to extend DI.
 * This is internal to Angular and should not be used directly.
 */
var Dependency = (function () {
    function Dependency(key, optional, lowerBoundVisibility, upperBoundVisibility, properties) {
        this.key = key;
        this.optional = optional;
        this.lowerBoundVisibility = lowerBoundVisibility;
        this.upperBoundVisibility = upperBoundVisibility;
        this.properties = properties;
    }
    Dependency.fromKey = function (key) { return new Dependency(key, false, null, null, []); };
    return Dependency;
})();
exports.Dependency = Dependency;
var _EMPTY_LIST = lang_1.CONST_EXPR([]);
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
 */
var Provider = (function () {
    function Provider(token, _a) {
        var useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps, multi = _a.multi;
        this.token = token;
        this.useClass = useClass;
        this.useValue = useValue;
        this.useExisting = useExisting;
        this.useFactory = useFactory;
        this.dependencies = deps;
        this._multi = multi;
    }
    Object.defineProperty(Provider.prototype, "multi", {
        // TODO: Provide a full working example after alpha38 is released.
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
        get: function () { return lang_1.normalizeBool(this._multi); },
        enumerable: true,
        configurable: true
    });
    Provider = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object, Object])
    ], Provider);
    return Provider;
})();
exports.Provider = Provider;
/**
 * See {@link Provider} instead.
 *
 * @deprecated
 */
var Binding = (function (_super) {
    __extends(Binding, _super);
    function Binding(token, _a) {
        var toClass = _a.toClass, toValue = _a.toValue, toAlias = _a.toAlias, toFactory = _a.toFactory, deps = _a.deps, multi = _a.multi;
        _super.call(this, token, {
            useClass: toClass,
            useValue: toValue,
            useExisting: toAlias,
            useFactory: toFactory,
            deps: deps,
            multi: multi
        });
    }
    Object.defineProperty(Binding.prototype, "toClass", {
        /**
         * @deprecated
         */
        get: function () { return this.useClass; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Binding.prototype, "toAlias", {
        /**
         * @deprecated
         */
        get: function () { return this.useExisting; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Binding.prototype, "toFactory", {
        /**
         * @deprecated
         */
        get: function () { return this.useFactory; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Binding.prototype, "toValue", {
        /**
         * @deprecated
         */
        get: function () { return this.useValue; },
        enumerable: true,
        configurable: true
    });
    Binding = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object, Object])
    ], Binding);
    return Binding;
})(Provider);
exports.Binding = Binding;
var ResolvedProvider_ = (function () {
    function ResolvedProvider_(key, resolvedFactories, multiProvider) {
        this.key = key;
        this.resolvedFactories = resolvedFactories;
        this.multiProvider = multiProvider;
    }
    Object.defineProperty(ResolvedProvider_.prototype, "resolvedFactory", {
        get: function () { return this.resolvedFactories[0]; },
        enumerable: true,
        configurable: true
    });
    return ResolvedProvider_;
})();
exports.ResolvedProvider_ = ResolvedProvider_;
/**
 * An internal resolved representation of a factory function created by resolving {@link Provider}.
 */
var ResolvedFactory = (function () {
    function ResolvedFactory(
        /**
         * Factory function which can return an instance of an object represented by a key.
         */
        factory, 
        /**
         * Arguments (dependencies) to the `factory` function.
         */
        dependencies) {
        this.factory = factory;
        this.dependencies = dependencies;
    }
    return ResolvedFactory;
})();
exports.ResolvedFactory = ResolvedFactory;
/**
 * Creates a {@link Provider}.
 *
 * To construct a {@link Provider}, bind a `token` to either a class, a value, a factory function,
 * or
 * to an existing `token`.
 * See {@link ProviderBuilder} for more details.
 *
 * The `token` is most commonly a class or {@link angular2/di/OpaqueToken}.
 *
 * @deprecated
 */
function bind(token) {
    return new ProviderBuilder(token);
}
exports.bind = bind;
/**
 * Creates a {@link Provider}.
 *
 * See {@link Provider} for more details.
 *
 * <!-- TODO: improve the docs -->
 */
function provide(token, _a) {
    var useClass = _a.useClass, useValue = _a.useValue, useExisting = _a.useExisting, useFactory = _a.useFactory, deps = _a.deps, multi = _a.multi;
    return new Provider(token, {
        useClass: useClass,
        useValue: useValue,
        useExisting: useExisting,
        useFactory: useFactory,
        deps: deps,
        multi: multi
    });
}
exports.provide = provide;
/**
 * Helper class for the {@link bind} function.
 */
var ProviderBuilder = (function () {
    function ProviderBuilder(token) {
        this.token = token;
    }
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
    ProviderBuilder.prototype.toClass = function (type) {
        if (!lang_1.isType(type)) {
            throw new exceptions_1.BaseException("Trying to create a class provider but \"" + lang_1.stringify(type) + "\" is not a class!");
        }
        return new Provider(this.token, { useClass: type });
    };
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
    ProviderBuilder.prototype.toValue = function (value) { return new Provider(this.token, { useValue: value }); };
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
    ProviderBuilder.prototype.toAlias = function (aliasToken) {
        if (lang_1.isBlank(aliasToken)) {
            throw new exceptions_1.BaseException("Can not alias " + lang_1.stringify(this.token) + " to a blank value!");
        }
        return new Provider(this.token, { useExisting: aliasToken });
    };
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
    ProviderBuilder.prototype.toFactory = function (factory, dependencies) {
        if (!lang_1.isFunction(factory)) {
            throw new exceptions_1.BaseException("Trying to create a factory provider but \"" + lang_1.stringify(factory) + "\" is not a function!");
        }
        return new Provider(this.token, { useFactory: factory, deps: dependencies });
    };
    return ProviderBuilder;
})();
exports.ProviderBuilder = ProviderBuilder;
/**
 * Resolve a single provider.
 */
function resolveFactory(provider) {
    var factoryFn;
    var resolvedDeps;
    if (lang_1.isPresent(provider.useClass)) {
        var useClass = forward_ref_1.resolveForwardRef(provider.useClass);
        factoryFn = reflection_1.reflector.factory(useClass);
        resolvedDeps = _dependenciesFor(useClass);
    }
    else if (lang_1.isPresent(provider.useExisting)) {
        factoryFn = function (aliasInstance) { return aliasInstance; };
        resolvedDeps = [Dependency.fromKey(key_1.Key.get(provider.useExisting))];
    }
    else if (lang_1.isPresent(provider.useFactory)) {
        factoryFn = provider.useFactory;
        resolvedDeps = _constructDependencies(provider.useFactory, provider.dependencies);
    }
    else {
        factoryFn = function () { return provider.useValue; };
        resolvedDeps = _EMPTY_LIST;
    }
    return new ResolvedFactory(factoryFn, resolvedDeps);
}
exports.resolveFactory = resolveFactory;
/**
 * Converts the {@link Provider} into {@link ResolvedProvider}.
 *
 * {@link Injector} internally only uses {@link ResolvedProvider}, {@link Provider} contains
 * convenience provider syntax.
 */
function resolveProvider(provider) {
    return new ResolvedProvider_(key_1.Key.get(provider.token), [resolveFactory(provider)], false);
}
exports.resolveProvider = resolveProvider;
/**
 * Resolve a list of Providers.
 */
function resolveProviders(providers) {
    var normalized = _createListOfProviders(_normalizeProviders(providers, new Map()));
    return normalized.map(function (b) {
        if (b instanceof _NormalizedProvider) {
            return new ResolvedProvider_(b.key, [b.resolvedFactory], false);
        }
        else {
            var arr = b;
            return new ResolvedProvider_(arr[0].key, arr.map(function (_) { return _.resolvedFactory; }), true);
        }
    });
}
exports.resolveProviders = resolveProviders;
/**
 * The algorithm works as follows:
 *
 * [Provider] -> [_NormalizedProvider|[_NormalizedProvider]] -> [ResolvedProvider]
 *
 * _NormalizedProvider is essentially a resolved provider before it was grouped by key.
 */
var _NormalizedProvider = (function () {
    function _NormalizedProvider(key, resolvedFactory) {
        this.key = key;
        this.resolvedFactory = resolvedFactory;
    }
    return _NormalizedProvider;
})();
function _createListOfProviders(flattenedProviders) {
    return collection_1.MapWrapper.values(flattenedProviders);
}
function _normalizeProviders(providers, res) {
    providers.forEach(function (b) {
        if (b instanceof lang_1.Type) {
            _normalizeProvider(provide(b, { useClass: b }), res);
        }
        else if (b instanceof Provider) {
            _normalizeProvider(b, res);
        }
        else if (b instanceof Array) {
            _normalizeProviders(b, res);
        }
        else if (b instanceof ProviderBuilder) {
            throw new exceptions_2.InvalidProviderError(b.token);
        }
        else {
            throw new exceptions_2.InvalidProviderError(b);
        }
    });
    return res;
}
function _normalizeProvider(b, res) {
    var key = key_1.Key.get(b.token);
    var factory = resolveFactory(b);
    var normalized = new _NormalizedProvider(key, factory);
    if (b.multi) {
        var existingProvider = res.get(key.id);
        if (existingProvider instanceof Array) {
            existingProvider.push(normalized);
        }
        else if (lang_1.isBlank(existingProvider)) {
            res.set(key.id, [normalized]);
        }
        else {
            throw new exceptions_2.MixingMultiProvidersWithRegularProvidersError(existingProvider, b);
        }
    }
    else {
        var existingProvider = res.get(key.id);
        if (existingProvider instanceof Array) {
            throw new exceptions_2.MixingMultiProvidersWithRegularProvidersError(existingProvider, b);
        }
        res.set(key.id, normalized);
    }
}
function _constructDependencies(factoryFunction, dependencies) {
    if (lang_1.isBlank(dependencies)) {
        return _dependenciesFor(factoryFunction);
    }
    else {
        var params = dependencies.map(function (t) { return [t]; });
        return dependencies.map(function (t) { return _extractToken(factoryFunction, t, params); });
    }
}
function _dependenciesFor(typeOrFunc) {
    var params = reflection_1.reflector.parameters(typeOrFunc);
    if (lang_1.isBlank(params))
        return [];
    if (params.some(lang_1.isBlank)) {
        throw new exceptions_2.NoAnnotationError(typeOrFunc, params);
    }
    return params.map(function (p) { return _extractToken(typeOrFunc, p, params); });
}
function _extractToken(typeOrFunc, metadata /*any[] | any*/, params) {
    var depProps = [];
    var token = null;
    var optional = false;
    if (!lang_1.isArray(metadata)) {
        if (metadata instanceof metadata_1.InjectMetadata) {
            return _createDependency(metadata.token, optional, null, null, depProps);
        }
        else {
            return _createDependency(metadata, optional, null, null, depProps);
        }
    }
    var lowerBoundVisibility = null;
    var upperBoundVisibility = null;
    for (var i = 0; i < metadata.length; ++i) {
        var paramMetadata = metadata[i];
        if (paramMetadata instanceof lang_1.Type) {
            token = paramMetadata;
        }
        else if (paramMetadata instanceof metadata_1.InjectMetadata) {
            token = paramMetadata.token;
        }
        else if (paramMetadata instanceof metadata_1.OptionalMetadata) {
            optional = true;
        }
        else if (paramMetadata instanceof metadata_1.SelfMetadata) {
            upperBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof metadata_1.HostMetadata) {
            upperBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof metadata_1.SkipSelfMetadata) {
            lowerBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof metadata_1.DependencyMetadata) {
            if (lang_1.isPresent(paramMetadata.token)) {
                token = paramMetadata.token;
            }
            depProps.push(paramMetadata);
        }
    }
    token = forward_ref_1.resolveForwardRef(token);
    if (lang_1.isPresent(token)) {
        return _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps);
    }
    else {
        throw new exceptions_2.NoAnnotationError(typeOrFunc, params);
    }
}
function _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps) {
    return new Dependency(key_1.Key.get(token), optional, lowerBoundVisibility, upperBoundVisibility, depProps);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlci50cyJdLCJuYW1lcyI6WyJEZXBlbmRlbmN5IiwiRGVwZW5kZW5jeS5jb25zdHJ1Y3RvciIsIkRlcGVuZGVuY3kuZnJvbUtleSIsIlByb3ZpZGVyIiwiUHJvdmlkZXIuY29uc3RydWN0b3IiLCJQcm92aWRlci5tdWx0aSIsIkJpbmRpbmciLCJCaW5kaW5nLmNvbnN0cnVjdG9yIiwiQmluZGluZy50b0NsYXNzIiwiQmluZGluZy50b0FsaWFzIiwiQmluZGluZy50b0ZhY3RvcnkiLCJCaW5kaW5nLnRvVmFsdWUiLCJSZXNvbHZlZFByb3ZpZGVyXyIsIlJlc29sdmVkUHJvdmlkZXJfLmNvbnN0cnVjdG9yIiwiUmVzb2x2ZWRQcm92aWRlcl8ucmVzb2x2ZWRGYWN0b3J5IiwiUmVzb2x2ZWRGYWN0b3J5IiwiUmVzb2x2ZWRGYWN0b3J5LmNvbnN0cnVjdG9yIiwiYmluZCIsInByb3ZpZGUiLCJQcm92aWRlckJ1aWxkZXIiLCJQcm92aWRlckJ1aWxkZXIuY29uc3RydWN0b3IiLCJQcm92aWRlckJ1aWxkZXIudG9DbGFzcyIsIlByb3ZpZGVyQnVpbGRlci50b1ZhbHVlIiwiUHJvdmlkZXJCdWlsZGVyLnRvQWxpYXMiLCJQcm92aWRlckJ1aWxkZXIudG9GYWN0b3J5IiwicmVzb2x2ZUZhY3RvcnkiLCJyZXNvbHZlUHJvdmlkZXIiLCJyZXNvbHZlUHJvdmlkZXJzIiwiX05vcm1hbGl6ZWRQcm92aWRlciIsIl9Ob3JtYWxpemVkUHJvdmlkZXIuY29uc3RydWN0b3IiLCJfY3JlYXRlTGlzdE9mUHJvdmlkZXJzIiwiX25vcm1hbGl6ZVByb3ZpZGVycyIsIl9ub3JtYWxpemVQcm92aWRlciIsIl9jb25zdHJ1Y3REZXBlbmRlbmNpZXMiLCJfZGVwZW5kZW5jaWVzRm9yIiwiX2V4dHJhY3RUb2tlbiIsIl9jcmVhdGVEZXBlbmRlbmN5Il0sIm1hcHBpbmdzIjoi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QUdBLElBQUlBLG1CQUFtQkEsQ0FBQ0EsR0FBR0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFFdkRBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1FBQ1pBLElBQUlBLGdCQUFnQkEsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFFdkNBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFnQkEsWUFBWUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdENBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFFcENBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO1FBRWhDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxJQUFJQSwwREFBNkNBLENBQUNBLGdCQUFnQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDL0VBLENBQUNBO0lBRUhBLENBQUNBO0lBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ05BLElBQUlBLGdCQUFnQkEsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFFdkNBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFnQkEsWUFBWUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdENBLE1BQU1BLElBQUlBLDBEQUE2Q0EsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMvRUEsQ0FBQ0E7UUFFREEsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0Es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QWFBLENBQUNBLEtBQUtBLENBQUNBO1lBQzlCQSxDQUFDQTtZQUNEQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUMvQkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREEsS0FBS0EsR0FBR0EsK0JBQWlCQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUVqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3JCQSxNQUFNQSxDQUFDQSxpQkFBaUJBLENBQUNBLEtBQUtBLEVBQUVBLFFBQVFBLEVBQUVBLG9CQUFvQkEsRUFBRUEsb0JBQW9CQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtJQUNsR0EsQ0FBQ0E7SUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDTkEsTUFBTUEsSUFBSUEsOEJBQWlCQSxDQUFDQSxVQUFVQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUNsREEsQ0FBQ0E7QUFDSEEsQ0FBQ0E7QUFFRCwyQkFBMkIsS0FBSyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBRSxvQkFBb0IsRUFDM0QsUUFBUTtJQUNqQ0MsTUFBTUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsU0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBRUEsUUFBUUEsRUFBRUEsb0JBQW9CQSxFQUFFQSxvQkFBb0JBLEVBQ3BFQSxRQUFRQSxDQUFDQSxDQUFDQTtBQUNsQ0EsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBUeXBlLFxuICBpc0JsYW5rLFxuICBpc1ByZXNlbnQsXG4gIENPTlNULFxuICBDT05TVF9FWFBSLFxuICBzdHJpbmdpZnksXG4gIGlzQXJyYXksXG4gIGlzVHlwZSxcbiAgaXNGdW5jdGlvbixcbiAgbm9ybWFsaXplQm9vbFxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtLZXl9IGZyb20gJy4va2V5JztcbmltcG9ydCB7XG4gIEluamVjdE1ldGFkYXRhLFxuICBJbmplY3RhYmxlTWV0YWRhdGEsXG4gIE9wdGlvbmFsTWV0YWRhdGEsXG4gIFNlbGZNZXRhZGF0YSxcbiAgSG9zdE1ldGFkYXRhLFxuICBTa2lwU2VsZk1ldGFkYXRhLFxuICBEZXBlbmRlbmN5TWV0YWRhdGFcbn0gZnJvbSAnLi9tZXRhZGF0YSc7XG5pbXBvcnQge1xuICBOb0Fubm90YXRpb25FcnJvcixcbiAgTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9yLFxuICBJbnZhbGlkUHJvdmlkZXJFcnJvclxufSBmcm9tICcuL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtyZXNvbHZlRm9yd2FyZFJlZn0gZnJvbSAnLi9mb3J3YXJkX3JlZic7XG5cbi8qKlxuICogYERlcGVuZGVuY3lgIGlzIHVzZWQgYnkgdGhlIGZyYW1ld29yayB0byBleHRlbmQgREkuXG4gKiBUaGlzIGlzIGludGVybmFsIHRvIEFuZ3VsYXIgYW5kIHNob3VsZCBub3QgYmUgdXNlZCBkaXJlY3RseS5cbiAqL1xuZXhwb3J0IGNsYXNzIERlcGVuZGVuY3kge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMga2V5OiBLZXksIHB1YmxpYyBvcHRpb25hbDogYm9vbGVhbiwgcHVibGljIGxvd2VyQm91bmRWaXNpYmlsaXR5OiBhbnksXG4gICAgICAgICAgICAgIHB1YmxpYyB1cHBlckJvdW5kVmlzaWJpbGl0eTogYW55LCBwdWJsaWMgcHJvcGVydGllczogYW55W10pIHt9XG5cbiAgc3RhdGljIGZyb21LZXkoa2V5OiBLZXkpOiBEZXBlbmRlbmN5IHsgcmV0dXJuIG5ldyBEZXBlbmRlbmN5KGtleSwgZmFsc2UsIG51bGwsIG51bGwsIFtdKTsgfVxufVxuXG5jb25zdCBfRU1QVFlfTElTVCA9IENPTlNUX0VYUFIoW10pO1xuXG4vKipcbiAqIERlc2NyaWJlcyBob3cgdGhlIHtAbGluayBJbmplY3Rvcn0gc2hvdWxkIGluc3RhbnRpYXRlIGEgZ2l2ZW4gdG9rZW4uXG4gKlxuICogU2VlIHtAbGluayBwcm92aWRlfS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvR05BeWo2SzZQZllnMk5Cemd3WjU/cCUzRHByZXZpZXcmcD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAqICAgbmV3IFByb3ZpZGVyKFwibWVzc2FnZVwiLCB7IHVzZVZhbHVlOiAnSGVsbG8nIH0pXG4gKiBdKTtcbiAqXG4gKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFwibWVzc2FnZVwiKSkudG9FcXVhbCgnSGVsbG8nKTtcbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFByb3ZpZGVyIHtcbiAgLyoqXG4gICAqIFRva2VuIHVzZWQgd2hlbiByZXRyaWV2aW5nIHRoaXMgcHJvdmlkZXIuIFVzdWFsbHksIGl0IGlzIGEgdHlwZSB7QGxpbmsgVHlwZX0uXG4gICAqL1xuICB0b2tlbjtcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhbiBpbXBsZW1lbnRhdGlvbiBjbGFzcy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1JTVEc4NnFnbW94Q3lqOVNXUHdZP3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHVzZUV4aXN0aW5nYCBhbmQgYHVzZUNsYXNzYCBhcmUgb2Z0ZW4gY29uZnVzZWQsIHRoZSBleGFtcGxlIGNvbnRhaW5zXG4gICAqIGJvdGggdXNlIGNhc2VzIGZvciBlYXN5IGNvbXBhcmlzb24uXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgVmVoaWNsZSB7fVxuICAgKlxuICAgKiBjbGFzcyBDYXIgZXh0ZW5kcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIHZhciBpbmplY3RvckNsYXNzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIG5ldyBQcm92aWRlcihWZWhpY2xlLCB7IHVzZUNsYXNzOiBDYXIgfSlcbiAgICogXSk7XG4gICAqIHZhciBpbmplY3RvckFsaWFzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIG5ldyBQcm92aWRlcihWZWhpY2xlLCB7IHVzZUV4aXN0aW5nOiBDYXIgfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSkubm90LnRvQmUoaW5qZWN0b3JDbGFzcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpKS50b0JlKGluamVjdG9yQWxpYXMuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdXNlQ2xhc3M6IFR5cGU7XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSB2YWx1ZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1VGVnNNVlFJRGU3bDR3YVd6aUVTP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYGphdmFzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKFwibWVzc2FnZVwiLCB7IHVzZVZhbHVlOiAnSGVsbG8nIH0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFwibWVzc2FnZVwiKSkudG9FcXVhbCgnSGVsbG8nKTtcbiAgICogYGBgXG4gICAqL1xuICB1c2VWYWx1ZTtcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhbiBleGlzdGluZyB0b2tlbi5cbiAgICpcbiAgICoge0BsaW5rIEluamVjdG9yfSByZXR1cm5zIHRoZSBzYW1lIGluc3RhbmNlIGFzIGlmIHRoZSBwcm92aWRlZCB0b2tlbiB3YXMgdXNlZC5cbiAgICogVGhpcyBpcyBpbiBjb250cmFzdCB0byBgdXNlQ2xhc3NgIHdoZXJlIGEgc2VwYXJhdGUgaW5zdGFuY2Ugb2YgYHVzZUNsYXNzYCBpcyByZXR1cm5lZC5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1FzYXRzT0pKNlA4VDJmTWU5Z3I4P3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHVzZUV4aXN0aW5nYCBhbmQgYHVzZUNsYXNzYCBhcmUgb2Z0ZW4gY29uZnVzZWQgdGhlIGV4YW1wbGUgY29udGFpbnNcbiAgICogYm90aCB1c2UgY2FzZXMgZm9yIGVhc3kgY29tcGFyaXNvbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIGNsYXNzIENhciBleHRlbmRzIFZlaGljbGUge31cbiAgICpcbiAgICogdmFyIGluamVjdG9yQWxpYXMgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgbmV3IFByb3ZpZGVyKFZlaGljbGUsIHsgdXNlRXhpc3Rpbmc6IENhciB9KVxuICAgKiBdKTtcbiAgICogdmFyIGluamVjdG9yQ2xhc3MgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgbmV3IFByb3ZpZGVyKFZlaGljbGUsIHsgdXNlQ2xhc3M6IENhciB9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpKS50b0JlKGluamVjdG9yQWxpYXMuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSkubm90LnRvQmUoaW5qZWN0b3JDbGFzcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICB1c2VFeGlzdGluZztcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIGZ1bmN0aW9uIHdoaWNoIGNvbXB1dGVzIHRoZSB2YWx1ZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1Njb3h5MHBKTnFLR0FQWlkxVlZDP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKE51bWJlciwgeyB1c2VGYWN0b3J5OiAoKSA9PiB7IHJldHVybiAxKzI7IH19KSxcbiAgICogICBuZXcgUHJvdmlkZXIoU3RyaW5nLCB7IHVzZUZhY3Rvcnk6ICh2YWx1ZSkgPT4geyByZXR1cm4gXCJWYWx1ZTogXCIgKyB2YWx1ZTsgfSxcbiAgICogICAgICAgICAgICAgICAgICAgICAgIGRlcHM6IFtOdW1iZXJdIH0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KE51bWJlcikpLnRvRXF1YWwoMyk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoU3RyaW5nKSkudG9FcXVhbCgnVmFsdWU6IDMnKTtcbiAgICogYGBgXG4gICAqXG4gICAqIFVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBkZXBlbmRlbmNpZXMuXG4gICAqL1xuICB1c2VGYWN0b3J5OiBGdW5jdGlvbjtcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGEgc2V0IG9mIGRlcGVuZGVuY2llc1xuICAgKiAoYXMgYHRva2VuYHMpIHdoaWNoIHNob3VsZCBiZSBpbmplY3RlZCBpbnRvIHRoZSBmYWN0b3J5IGZ1bmN0aW9uLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvU2NveHkwcEpOcUtHQVBaWTFWVkM/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBuZXcgUHJvdmlkZXIoTnVtYmVyLCB7IHVzZUZhY3Rvcnk6ICgpID0+IHsgcmV0dXJuIDErMjsgfX0pLFxuICAgKiAgIG5ldyBQcm92aWRlcihTdHJpbmcsIHsgdXNlRmFjdG9yeTogKHZhbHVlKSA9PiB7IHJldHVybiBcIlZhbHVlOiBcIiArIHZhbHVlOyB9LFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgZGVwczogW051bWJlcl0gfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoTnVtYmVyKSkudG9FcXVhbCgzKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChTdHJpbmcpKS50b0VxdWFsKCdWYWx1ZTogMycpO1xuICAgKiBgYGBcbiAgICpcbiAgICogVXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGB1c2VGYWN0b3J5YC5cbiAgICovXG4gIGRlcGVuZGVuY2llczogT2JqZWN0W107XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbXVsdGk6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IodG9rZW4sIHt1c2VDbGFzcywgdXNlVmFsdWUsIHVzZUV4aXN0aW5nLCB1c2VGYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgICB1c2VDbGFzcz86IFR5cGUsXG4gICAgdXNlVmFsdWU/OiBhbnksXG4gICAgdXNlRXhpc3Rpbmc/OiBhbnksXG4gICAgdXNlRmFjdG9yeT86IEZ1bmN0aW9uLFxuICAgIGRlcHM/OiBPYmplY3RbXSxcbiAgICBtdWx0aT86IGJvb2xlYW5cbiAgfSkge1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgICB0aGlzLnVzZUNsYXNzID0gdXNlQ2xhc3M7XG4gICAgdGhpcy51c2VWYWx1ZSA9IHVzZVZhbHVlO1xuICAgIHRoaXMudXNlRXhpc3RpbmcgPSB1c2VFeGlzdGluZztcbiAgICB0aGlzLnVzZUZhY3RvcnkgPSB1c2VGYWN0b3J5O1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVwcztcbiAgICB0aGlzLl9tdWx0aSA9IG11bHRpO1xuICB9XG5cbiAgLy8gVE9ETzogUHJvdmlkZSBhIGZ1bGwgd29ya2luZyBleGFtcGxlIGFmdGVyIGFscGhhMzggaXMgcmVsZWFzZWQuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG11bHRpcGxlIHByb3ZpZGVycyBtYXRjaGluZyB0aGUgc2FtZSB0b2tlbiAoYSBtdWx0aS1wcm92aWRlcikuXG4gICAqXG4gICAqIE11bHRpLXByb3ZpZGVycyBhcmUgdXNlZCBmb3IgY3JlYXRpbmcgcGx1Z2dhYmxlIHNlcnZpY2UsIHdoZXJlIHRoZSBzeXN0ZW0gY29tZXNcbiAgICogd2l0aCBzb21lIGRlZmF1bHQgcHJvdmlkZXJzLCBhbmQgdGhlIHVzZXIgY2FuIHJlZ2lzdGVyIGFkZGl0aW9uYWwgcHJvdmlkZXJzLlxuICAgKiBUaGUgY29tYmluYXRpb24gb2YgdGhlIGRlZmF1bHQgcHJvdmlkZXJzIGFuZCB0aGUgYWRkaXRpb25hbCBwcm92aWRlcnMgd2lsbCBiZVxuICAgKiB1c2VkIHRvIGRyaXZlIHRoZSBiZWhhdmlvciBvZiB0aGUgc3lzdGVtLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIG5ldyBQcm92aWRlcihcIlN0cmluZ3NcIiwgeyB1c2VWYWx1ZTogXCJTdHJpbmcxXCIsIG11bHRpOiB0cnVlfSksXG4gICAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7IHVzZVZhbHVlOiBcIlN0cmluZzJcIiwgbXVsdGk6IHRydWV9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChcIlN0cmluZ3NcIikpLnRvRXF1YWwoW1wiU3RyaW5nMVwiLCBcIlN0cmluZzJcIl0pO1xuICAgKiBgYGBcbiAgICpcbiAgICogTXVsdGktcHJvdmlkZXJzIGFuZCByZWd1bGFyIHByb3ZpZGVycyBjYW5ub3QgYmUgbWl4ZWQuIFRoZSBmb2xsb3dpbmdcbiAgICogd2lsbCB0aHJvdyBhbiBleGNlcHRpb246XG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7IHVzZVZhbHVlOiBcIlN0cmluZzFcIiwgbXVsdGk6IHRydWUgfSksXG4gICAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7IHVzZVZhbHVlOiBcIlN0cmluZzJcIn0pXG4gICAqIF0pO1xuICAgKiBgYGBcbiAgICovXG4gIGdldCBtdWx0aSgpOiBib29sZWFuIHsgcmV0dXJuIG5vcm1hbGl6ZUJvb2wodGhpcy5fbXVsdGkpOyB9XG59XG5cbi8qKlxuICogU2VlIHtAbGluayBQcm92aWRlcn0gaW5zdGVhZC5cbiAqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEJpbmRpbmcgZXh0ZW5kcyBQcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKHRva2VuLCB7dG9DbGFzcywgdG9WYWx1ZSwgdG9BbGlhcywgdG9GYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgICB0b0NsYXNzPzogVHlwZSxcbiAgICB0b1ZhbHVlPzogYW55LFxuICAgIHRvQWxpYXM/OiBhbnksXG4gICAgdG9GYWN0b3J5OiBGdW5jdGlvbiwgZGVwcz86IE9iamVjdFtdLCBtdWx0aT86IGJvb2xlYW5cbiAgfSkge1xuICAgIHN1cGVyKHRva2VuLCB7XG4gICAgICB1c2VDbGFzczogdG9DbGFzcyxcbiAgICAgIHVzZVZhbHVlOiB0b1ZhbHVlLFxuICAgICAgdXNlRXhpc3Rpbmc6IHRvQWxpYXMsXG4gICAgICB1c2VGYWN0b3J5OiB0b0ZhY3RvcnksXG4gICAgICBkZXBzOiBkZXBzLFxuICAgICAgbXVsdGk6IG11bHRpXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdldCB0b0NsYXNzKCkgeyByZXR1cm4gdGhpcy51c2VDbGFzczsgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgZ2V0IHRvQWxpYXMoKSB7IHJldHVybiB0aGlzLnVzZUV4aXN0aW5nOyB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBnZXQgdG9GYWN0b3J5KCkgeyByZXR1cm4gdGhpcy51c2VGYWN0b3J5OyB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBnZXQgdG9WYWx1ZSgpIHsgcmV0dXJuIHRoaXMudXNlVmFsdWU7IH1cbn1cblxuLyoqXG4gKiBBbiBpbnRlcm5hbCByZXNvbHZlZCByZXByZXNlbnRhdGlvbiBvZiBhIHtAbGluayBQcm92aWRlcn0gdXNlZCBieSB0aGUge0BsaW5rIEluamVjdG9yfS5cbiAqXG4gKiBJdCBpcyB1c3VhbGx5IGNyZWF0ZWQgYXV0b21hdGljYWxseSBieSBgSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZWAuXG4gKlxuICogSXQgY2FuIGJlIGNyZWF0ZWQgbWFudWFsbHksIGFzIGZvbGxvd3M6XG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1JmRW5oaDhrVUVJMEczcXNuSWVUP3AlM0RwcmV2aWV3JnA9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdmFyIHJlc29sdmVkUHJvdmlkZXJzID0gSW5qZWN0b3IucmVzb2x2ZShbbmV3IFByb3ZpZGVyKCdtZXNzYWdlJywge3VzZVZhbHVlOiAnSGVsbG8nfSldKTtcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLmZyb21SZXNvbHZlZFByb3ZpZGVycyhyZXNvbHZlZFByb3ZpZGVycyk7XG4gKlxuICogZXhwZWN0KGluamVjdG9yLmdldCgnbWVzc2FnZScpKS50b0VxdWFsKCdIZWxsbycpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb2x2ZWRQcm92aWRlciB7XG4gIC8qKlxuICAgKiBBIGtleSwgdXN1YWxseSBhIGBUeXBlYC5cbiAgICovXG4gIGtleTogS2V5O1xuXG4gIC8qKlxuICAgKiBGYWN0b3J5IGZ1bmN0aW9uIHdoaWNoIGNhbiByZXR1cm4gYW4gaW5zdGFuY2Ugb2YgYW4gb2JqZWN0IHJlcHJlc2VudGVkIGJ5IGEga2V5LlxuICAgKi9cbiAgcmVzb2x2ZWRGYWN0b3JpZXM6IFJlc29sdmVkRmFjdG9yeVtdO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgaWYgdGhlIHByb3ZpZGVyIGlzIGEgbXVsdGktcHJvdmlkZXIgb3IgYSByZWd1bGFyIHByb3ZpZGVyLlxuICAgKi9cbiAgbXVsdGlQcm92aWRlcjogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBTZWUge0BsaW5rIFJlc29sdmVkUHJvdmlkZXJ9IGluc3RlYWQuXG4gKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXNvbHZlZEJpbmRpbmcgZXh0ZW5kcyBSZXNvbHZlZFByb3ZpZGVyIHt9XG5cbmV4cG9ydCBjbGFzcyBSZXNvbHZlZFByb3ZpZGVyXyBpbXBsZW1lbnRzIFJlc29sdmVkQmluZGluZyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBrZXk6IEtleSwgcHVibGljIHJlc29sdmVkRmFjdG9yaWVzOiBSZXNvbHZlZEZhY3RvcnlbXSxcbiAgICAgICAgICAgICAgcHVibGljIG11bHRpUHJvdmlkZXI6IGJvb2xlYW4pIHt9XG5cbiAgZ2V0IHJlc29sdmVkRmFjdG9yeSgpOiBSZXNvbHZlZEZhY3RvcnkgeyByZXR1cm4gdGhpcy5yZXNvbHZlZEZhY3Rvcmllc1swXTsgfVxufVxuXG4vKipcbiAqIEFuIGludGVybmFsIHJlc29sdmVkIHJlcHJlc2VudGF0aW9uIG9mIGEgZmFjdG9yeSBmdW5jdGlvbiBjcmVhdGVkIGJ5IHJlc29sdmluZyB7QGxpbmsgUHJvdmlkZXJ9LlxuICovXG5leHBvcnQgY2xhc3MgUmVzb2x2ZWRGYWN0b3J5IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICAvKipcbiAgICAgICAqIEZhY3RvcnkgZnVuY3Rpb24gd2hpY2ggY2FuIHJldHVybiBhbiBpbnN0YW5jZSBvZiBhbiBvYmplY3QgcmVwcmVzZW50ZWQgYnkgYSBrZXkuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBmYWN0b3J5OiBGdW5jdGlvbixcblxuICAgICAgLyoqXG4gICAgICAgKiBBcmd1bWVudHMgKGRlcGVuZGVuY2llcykgdG8gdGhlIGBmYWN0b3J5YCBmdW5jdGlvbi5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGRlcGVuZGVuY2llczogRGVwZW5kZW5jeVtdKSB7fVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgUHJvdmlkZXJ9LlxuICpcbiAqIFRvIGNvbnN0cnVjdCBhIHtAbGluayBQcm92aWRlcn0sIGJpbmQgYSBgdG9rZW5gIHRvIGVpdGhlciBhIGNsYXNzLCBhIHZhbHVlLCBhIGZhY3RvcnkgZnVuY3Rpb24sXG4gKiBvclxuICogdG8gYW4gZXhpc3RpbmcgYHRva2VuYC5cbiAqIFNlZSB7QGxpbmsgUHJvdmlkZXJCdWlsZGVyfSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFRoZSBgdG9rZW5gIGlzIG1vc3QgY29tbW9ubHkgYSBjbGFzcyBvciB7QGxpbmsgYW5ndWxhcjIvZGkvT3BhcXVlVG9rZW59LlxuICpcbiAqIEBkZXByZWNhdGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5kKHRva2VuKTogUHJvdmlkZXJCdWlsZGVyIHtcbiAgcmV0dXJuIG5ldyBQcm92aWRlckJ1aWxkZXIodG9rZW4pO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgUHJvdmlkZXJ9LlxuICpcbiAqIFNlZSB7QGxpbmsgUHJvdmlkZXJ9IGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogPCEtLSBUT0RPOiBpbXByb3ZlIHRoZSBkb2NzIC0tPlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZSh0b2tlbiwge3VzZUNsYXNzLCB1c2VWYWx1ZSwgdXNlRXhpc3RpbmcsIHVzZUZhY3RvcnksIGRlcHMsIG11bHRpfToge1xuICB1c2VDbGFzcz86IFR5cGUsXG4gIHVzZVZhbHVlPzogYW55LFxuICB1c2VFeGlzdGluZz86IGFueSxcbiAgdXNlRmFjdG9yeT86IEZ1bmN0aW9uLFxuICBkZXBzPzogT2JqZWN0W10sXG4gIG11bHRpPzogYm9vbGVhblxufSk6IFByb3ZpZGVyIHtcbiAgcmV0dXJuIG5ldyBQcm92aWRlcih0b2tlbiwge1xuICAgIHVzZUNsYXNzOiB1c2VDbGFzcyxcbiAgICB1c2VWYWx1ZTogdXNlVmFsdWUsXG4gICAgdXNlRXhpc3Rpbmc6IHVzZUV4aXN0aW5nLFxuICAgIHVzZUZhY3Rvcnk6IHVzZUZhY3RvcnksXG4gICAgZGVwczogZGVwcyxcbiAgICBtdWx0aTogbXVsdGlcbiAgfSk7XG59XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIGZvciB0aGUge0BsaW5rIGJpbmR9IGZ1bmN0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgUHJvdmlkZXJCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IocHVibGljIHRva2VuKSB7fVxuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGEgY2xhc3MuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9acEJDU1lxdjZlMnVkNUtYTGR4UT9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBCZWNhdXNlIGB0b0FsaWFzYCBhbmQgYHRvQ2xhc3NgIGFyZSBvZnRlbiBjb25mdXNlZCwgdGhlIGV4YW1wbGUgY29udGFpbnNcbiAgICogYm90aCB1c2UgY2FzZXMgZm9yIGVhc3kgY29tcGFyaXNvbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIGNsYXNzIENhciBleHRlbmRzIFZlaGljbGUge31cbiAgICpcbiAgICogdmFyIGluamVjdG9yQ2xhc3MgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgcHJvdmlkZShWZWhpY2xlLCB7dXNlQ2xhc3M6IENhcn0pXG4gICAqIF0pO1xuICAgKiB2YXIgaW5qZWN0b3JBbGlhcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBwcm92aWRlKFZlaGljbGUsIHt1c2VFeGlzdGluZzogQ2FyfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSkubm90LnRvQmUoaW5qZWN0b3JDbGFzcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpKS50b0JlKGluamVjdG9yQWxpYXMuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdG9DbGFzcyh0eXBlOiBUeXBlKTogUHJvdmlkZXIge1xuICAgIGlmICghaXNUeXBlKHR5cGUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgVHJ5aW5nIHRvIGNyZWF0ZSBhIGNsYXNzIHByb3ZpZGVyIGJ1dCBcIiR7c3RyaW5naWZ5KHR5cGUpfVwiIGlzIG5vdCBhIGNsYXNzIWApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb3ZpZGVyKHRoaXMudG9rZW4sIHt1c2VDbGFzczogdHlwZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSB2YWx1ZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0cwMjRQRkhtREwwY0pGZ2ZaSzhPP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgcHJvdmlkZSgnbWVzc2FnZScsIHt1c2VWYWx1ZTogJ0hlbGxvJ30pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KCdtZXNzYWdlJykpLnRvRXF1YWwoJ0hlbGxvJyk7XG4gICAqIGBgYFxuICAgKi9cbiAgdG9WYWx1ZSh2YWx1ZTogYW55KTogUHJvdmlkZXIgeyByZXR1cm4gbmV3IFByb3ZpZGVyKHRoaXMudG9rZW4sIHt1c2VWYWx1ZTogdmFsdWV9KTsgfVxuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGFuIGV4aXN0aW5nIHRva2VuLlxuICAgKlxuICAgKiBBbmd1bGFyIHdpbGwgcmV0dXJuIHRoZSBzYW1lIGluc3RhbmNlIGFzIGlmIHRoZSBwcm92aWRlZCB0b2tlbiB3YXMgdXNlZC4gKFRoaXMgaXNcbiAgICogaW4gY29udHJhc3QgdG8gYHVzZUNsYXNzYCB3aGVyZSBhIHNlcGFyYXRlIGluc3RhbmNlIG9mIGB1c2VDbGFzc2Agd2lsbCBiZSByZXR1cm5lZC4pXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC91QmFvRjJwTjVjZmM1QWZaYXBOdz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBCZWNhdXNlIGB0b0FsaWFzYCBhbmQgYHRvQ2xhc3NgIGFyZSBvZnRlbiBjb25mdXNlZCwgdGhlIGV4YW1wbGUgY29udGFpbnNcbiAgICogYm90aCB1c2UgY2FzZXMgZm9yIGVhc3kgY29tcGFyaXNvbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIGNsYXNzIENhciBleHRlbmRzIFZlaGljbGUge31cbiAgICpcbiAgICogdmFyIGluamVjdG9yQWxpYXMgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgcHJvdmlkZShWZWhpY2xlLCB7dXNlRXhpc3Rpbmc6IENhcn0pXG4gICAqIF0pO1xuICAgKiB2YXIgaW5qZWN0b3JDbGFzcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBwcm92aWRlKFZlaGljbGUsIHt1c2VDbGFzczogQ2FyfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSkudG9CZShpbmplY3RvckFsaWFzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkpLm5vdC50b0JlKGluamVjdG9yQ2xhc3MuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdG9BbGlhcyhhbGlhc1Rva2VuOiAvKlR5cGUqLyBhbnkpOiBQcm92aWRlciB7XG4gICAgaWYgKGlzQmxhbmsoYWxpYXNUb2tlbikpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW4gbm90IGFsaWFzICR7c3RyaW5naWZ5KHRoaXMudG9rZW4pfSB0byBhIGJsYW5rIHZhbHVlIWApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb3ZpZGVyKHRoaXMudG9rZW4sIHt1c2VFeGlzdGluZzogYWxpYXNUb2tlbn0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSBmdW5jdGlvbiB3aGljaCBjb21wdXRlcyB0aGUgdmFsdWUuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9PZWpOSWZUVDN6YjFpQnhhSVlPYj9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIHByb3ZpZGUoTnVtYmVyLCB7dXNlRmFjdG9yeTogKCkgPT4geyByZXR1cm4gMSsyOyB9fSksXG4gICAqICAgcHJvdmlkZShTdHJpbmcsIHt1c2VGYWN0b3J5OiAodikgPT4geyByZXR1cm4gXCJWYWx1ZTogXCIgKyB2OyB9LCBkZXBzOiBbTnVtYmVyXX0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KE51bWJlcikpLnRvRXF1YWwoMyk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoU3RyaW5nKSkudG9FcXVhbCgnVmFsdWU6IDMnKTtcbiAgICogYGBgXG4gICAqL1xuICB0b0ZhY3RvcnkoZmFjdG9yeTogRnVuY3Rpb24sIGRlcGVuZGVuY2llcz86IGFueVtdKTogUHJvdmlkZXIge1xuICAgIGlmICghaXNGdW5jdGlvbihmYWN0b3J5KSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgYFRyeWluZyB0byBjcmVhdGUgYSBmYWN0b3J5IHByb3ZpZGVyIGJ1dCBcIiR7c3RyaW5naWZ5KGZhY3RvcnkpfVwiIGlzIG5vdCBhIGZ1bmN0aW9uIWApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb3ZpZGVyKHRoaXMudG9rZW4sIHt1c2VGYWN0b3J5OiBmYWN0b3J5LCBkZXBzOiBkZXBlbmRlbmNpZXN9KTtcbiAgfVxufVxuXG4vKipcbiAqIFJlc29sdmUgYSBzaW5nbGUgcHJvdmlkZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRmFjdG9yeShwcm92aWRlcjogUHJvdmlkZXIpOiBSZXNvbHZlZEZhY3Rvcnkge1xuICB2YXIgZmFjdG9yeUZuOiBGdW5jdGlvbjtcbiAgdmFyIHJlc29sdmVkRGVwcztcbiAgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VDbGFzcykpIHtcbiAgICB2YXIgdXNlQ2xhc3MgPSByZXNvbHZlRm9yd2FyZFJlZihwcm92aWRlci51c2VDbGFzcyk7XG4gICAgZmFjdG9yeUZuID0gcmVmbGVjdG9yLmZhY3RvcnkodXNlQ2xhc3MpO1xuICAgIHJlc29sdmVkRGVwcyA9IF9kZXBlbmRlbmNpZXNGb3IodXNlQ2xhc3MpO1xuICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VFeGlzdGluZykpIHtcbiAgICBmYWN0b3J5Rm4gPSAoYWxpYXNJbnN0YW5jZSkgPT4gYWxpYXNJbnN0YW5jZTtcbiAgICByZXNvbHZlZERlcHMgPSBbRGVwZW5kZW5jeS5mcm9tS2V5KEtleS5nZXQocHJvdmlkZXIudXNlRXhpc3RpbmcpKV07XG4gIH0gZWxzZSBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUZhY3RvcnkpKSB7XG4gICAgZmFjdG9yeUZuID0gcHJvdmlkZXIudXNlRmFjdG9yeTtcbiAgICByZXNvbHZlZERlcHMgPSBfY29uc3RydWN0RGVwZW5kZW5jaWVzKHByb3ZpZGVyLnVzZUZhY3RvcnksIHByb3ZpZGVyLmRlcGVuZGVuY2llcyk7XG4gIH0gZWxzZSB7XG4gICAgZmFjdG9yeUZuID0gKCkgPT4gcHJvdmlkZXIudXNlVmFsdWU7XG4gICAgcmVzb2x2ZWREZXBzID0gX0VNUFRZX0xJU1Q7XG4gIH1cbiAgcmV0dXJuIG5ldyBSZXNvbHZlZEZhY3RvcnkoZmFjdG9yeUZuLCByZXNvbHZlZERlcHMpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHRoZSB7QGxpbmsgUHJvdmlkZXJ9IGludG8ge0BsaW5rIFJlc29sdmVkUHJvdmlkZXJ9LlxuICpcbiAqIHtAbGluayBJbmplY3Rvcn0gaW50ZXJuYWxseSBvbmx5IHVzZXMge0BsaW5rIFJlc29sdmVkUHJvdmlkZXJ9LCB7QGxpbmsgUHJvdmlkZXJ9IGNvbnRhaW5zXG4gKiBjb252ZW5pZW5jZSBwcm92aWRlciBzeW50YXguXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlUHJvdmlkZXIocHJvdmlkZXI6IFByb3ZpZGVyKTogUmVzb2x2ZWRQcm92aWRlciB7XG4gIHJldHVybiBuZXcgUmVzb2x2ZWRQcm92aWRlcl8oS2V5LmdldChwcm92aWRlci50b2tlbiksIFtyZXNvbHZlRmFjdG9yeShwcm92aWRlcildLCBmYWxzZSk7XG59XG5cbi8qKlxuICogUmVzb2x2ZSBhIGxpc3Qgb2YgUHJvdmlkZXJzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVByb3ZpZGVycyhwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IFJlc29sdmVkUHJvdmlkZXJbXSB7XG4gIHZhciBub3JtYWxpemVkID0gX2NyZWF0ZUxpc3RPZlByb3ZpZGVycyhfbm9ybWFsaXplUHJvdmlkZXJzKFxuICAgICAgcHJvdmlkZXJzLCBuZXcgTWFwPG51bWJlciwgX05vcm1hbGl6ZWRQcm92aWRlciB8IF9Ob3JtYWxpemVkUHJvdmlkZXJbXT4oKSkpO1xuICByZXR1cm4gbm9ybWFsaXplZC5tYXAoYiA9PiB7XG4gICAgaWYgKGIgaW5zdGFuY2VvZiBfTm9ybWFsaXplZFByb3ZpZGVyKSB7XG4gICAgICByZXR1cm4gbmV3IFJlc29sdmVkUHJvdmlkZXJfKGIua2V5LCBbYi5yZXNvbHZlZEZhY3RvcnldLCBmYWxzZSk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGFyciA9IDxfTm9ybWFsaXplZFByb3ZpZGVyW10+YjtcbiAgICAgIHJldHVybiBuZXcgUmVzb2x2ZWRQcm92aWRlcl8oYXJyWzBdLmtleSwgYXJyLm1hcChfID0+IF8ucmVzb2x2ZWRGYWN0b3J5KSwgdHJ1ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBUaGUgYWxnb3JpdGhtIHdvcmtzIGFzIGZvbGxvd3M6XG4gKlxuICogW1Byb3ZpZGVyXSAtPiBbX05vcm1hbGl6ZWRQcm92aWRlcnxbX05vcm1hbGl6ZWRQcm92aWRlcl1dIC0+IFtSZXNvbHZlZFByb3ZpZGVyXVxuICpcbiAqIF9Ob3JtYWxpemVkUHJvdmlkZXIgaXMgZXNzZW50aWFsbHkgYSByZXNvbHZlZCBwcm92aWRlciBiZWZvcmUgaXQgd2FzIGdyb3VwZWQgYnkga2V5LlxuICovXG5jbGFzcyBfTm9ybWFsaXplZFByb3ZpZGVyIHtcbiAgY29uc3RydWN0b3IocHVibGljIGtleTogS2V5LCBwdWJsaWMgcmVzb2x2ZWRGYWN0b3J5OiBSZXNvbHZlZEZhY3RvcnkpIHt9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVMaXN0T2ZQcm92aWRlcnMoZmxhdHRlbmVkUHJvdmlkZXJzOiBNYXA8bnVtYmVyLCBhbnk+KTogYW55W10ge1xuICByZXR1cm4gTWFwV3JhcHBlci52YWx1ZXMoZmxhdHRlbmVkUHJvdmlkZXJzKTtcbn1cblxuZnVuY3Rpb24gX25vcm1hbGl6ZVByb3ZpZGVycyhwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IFByb3ZpZGVyQnVpbGRlciB8IGFueVtdPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzOiBNYXA8bnVtYmVyLCBfTm9ybWFsaXplZFByb3ZpZGVyIHwgX05vcm1hbGl6ZWRQcm92aWRlcltdPik6XG4gICAgTWFwPG51bWJlciwgX05vcm1hbGl6ZWRQcm92aWRlciB8IF9Ob3JtYWxpemVkUHJvdmlkZXJbXT4ge1xuICBwcm92aWRlcnMuZm9yRWFjaChiID0+IHtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIFR5cGUpIHtcbiAgICAgIF9ub3JtYWxpemVQcm92aWRlcihwcm92aWRlKGIsIHt1c2VDbGFzczogYn0pLCByZXMpO1xuXG4gICAgfSBlbHNlIGlmIChiIGluc3RhbmNlb2YgUHJvdmlkZXIpIHtcbiAgICAgIF9ub3JtYWxpemVQcm92aWRlcihiLCByZXMpO1xuXG4gICAgfSBlbHNlIGlmIChiIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIF9ub3JtYWxpemVQcm92aWRlcnMoYiwgcmVzKTtcblxuICAgIH0gZWxzZSBpZiAoYiBpbnN0YW5jZW9mIFByb3ZpZGVyQnVpbGRlcikge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQcm92aWRlckVycm9yKGIudG9rZW4pO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUHJvdmlkZXJFcnJvcihiKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIF9ub3JtYWxpemVQcm92aWRlcihiOiBQcm92aWRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXM6IE1hcDxudW1iZXIsIF9Ob3JtYWxpemVkUHJvdmlkZXIgfCBfTm9ybWFsaXplZFByb3ZpZGVyW10+KTogdm9pZCB7XG4gIHZhciBrZXkgPSBLZXkuZ2V0KGIudG9rZW4pO1xuICB2YXIgZmFjdG9yeSA9IHJlc29sdmVGYWN0b3J5KGIpO1xuICB2YXIgbm9ybWFsaXplZCA9IG5ldyBfTm9ybWFsaXplZFByb3ZpZGVyKGtleSwgZmFjdG9yeSk7XG5cbiAgaWYgKGIubXVsdGkpIHtcbiAgICB2YXIgZXhpc3RpbmdQcm92aWRlciA9IHJlcy5nZXQoa2V5LmlkKTtcblxuICAgIGlmIChleGlzdGluZ1Byb3ZpZGVyIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIGV4aXN0aW5nUHJvdmlkZXIucHVzaChub3JtYWxpemVkKTtcblxuICAgIH0gZWxzZSBpZiAoaXNCbGFuayhleGlzdGluZ1Byb3ZpZGVyKSkge1xuICAgICAgcmVzLnNldChrZXkuaWQsIFtub3JtYWxpemVkXSk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IE1peGluZ011bHRpUHJvdmlkZXJzV2l0aFJlZ3VsYXJQcm92aWRlcnNFcnJvcihleGlzdGluZ1Byb3ZpZGVyLCBiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgZXhpc3RpbmdQcm92aWRlciA9IHJlcy5nZXQoa2V5LmlkKTtcblxuICAgIGlmIChleGlzdGluZ1Byb3ZpZGVyIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIHRocm93IG5ldyBNaXhpbmdNdWx0aVByb3ZpZGVyc1dpdGhSZWd1bGFyUHJvdmlkZXJzRXJyb3IoZXhpc3RpbmdQcm92aWRlciwgYik7XG4gICAgfVxuXG4gICAgcmVzLnNldChrZXkuaWQsIG5vcm1hbGl6ZWQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jb25zdHJ1Y3REZXBlbmRlbmNpZXMoZmFjdG9yeUZ1bmN0aW9uOiBGdW5jdGlvbiwgZGVwZW5kZW5jaWVzOiBhbnlbXSk6IERlcGVuZGVuY3lbXSB7XG4gIGlmIChpc0JsYW5rKGRlcGVuZGVuY2llcykpIHtcbiAgICByZXR1cm4gX2RlcGVuZGVuY2llc0ZvcihmYWN0b3J5RnVuY3Rpb24pO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJhbXM6IGFueVtdW10gPSBkZXBlbmRlbmNpZXMubWFwKHQgPT4gW3RdKTtcbiAgICByZXR1cm4gZGVwZW5kZW5jaWVzLm1hcCh0ID0+IF9leHRyYWN0VG9rZW4oZmFjdG9yeUZ1bmN0aW9uLCB0LCBwYXJhbXMpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfZGVwZW5kZW5jaWVzRm9yKHR5cGVPckZ1bmMpOiBEZXBlbmRlbmN5W10ge1xuICB2YXIgcGFyYW1zID0gcmVmbGVjdG9yLnBhcmFtZXRlcnModHlwZU9yRnVuYyk7XG4gIGlmIChpc0JsYW5rKHBhcmFtcykpIHJldHVybiBbXTtcbiAgaWYgKHBhcmFtcy5zb21lKGlzQmxhbmspKSB7XG4gICAgdGhyb3cgbmV3IE5vQW5ub3RhdGlvbkVycm9yKHR5cGVPckZ1bmMsIHBhcmFtcyk7XG4gIH1cbiAgcmV0dXJuIHBhcmFtcy5tYXAoKHA6IGFueVtdKSA9PiBfZXh0cmFjdFRva2VuKHR5cGVPckZ1bmMsIHAsIHBhcmFtcykpO1xufVxuXG5mdW5jdGlvbiBfZXh0cmFjdFRva2VuKHR5cGVPckZ1bmMsIG1ldGFkYXRhIC8qYW55W10gfCBhbnkqLywgcGFyYW1zOiBhbnlbXVtdKTogRGVwZW5kZW5jeSB7XG4gIHZhciBkZXBQcm9wcyA9IFtdO1xuICB2YXIgdG9rZW4gPSBudWxsO1xuICB2YXIgb3B0aW9uYWwgPSBmYWxzZTtcblxuICBpZiAoIWlzQXJyYXkobWV0YWRhdGEpKSB7XG4gICAgaWYgKG1ldGFkYXRhIGluc3RhbmNlb2YgSW5qZWN0TWV0YWRhdGEpIHtcbiAgICAgIHJldHVybiBfY3JlYXRlRGVwZW5kZW5jeShtZXRhZGF0YS50b2tlbiwgb3B0aW9uYWwsIG51bGwsIG51bGwsIGRlcFByb3BzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIF9jcmVhdGVEZXBlbmRlbmN5KG1ldGFkYXRhLCBvcHRpb25hbCwgbnVsbCwgbnVsbCwgZGVwUHJvcHMpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBsb3dlckJvdW5kVmlzaWJpbGl0eSA9IG51bGw7XG4gIHZhciB1cHBlckJvdW5kVmlzaWJpbGl0eSA9IG51bGw7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZXRhZGF0YS5sZW5ndGg7ICsraSkge1xuICAgIHZhciBwYXJhbU1ldGFkYXRhID0gbWV0YWRhdGFbaV07XG5cbiAgICBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIFR5cGUpIHtcbiAgICAgIHRva2VuID0gcGFyYW1NZXRhZGF0YTtcblxuICAgIH0gZWxzZSBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIEluamVjdE1ldGFkYXRhKSB7XG4gICAgICB0b2tlbiA9IHBhcmFtTWV0YWRhdGEudG9rZW47XG5cbiAgICB9IGVsc2UgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBPcHRpb25hbE1ldGFkYXRhKSB7XG4gICAgICBvcHRpb25hbCA9IHRydWU7XG5cbiAgICB9IGVsc2UgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBTZWxmTWV0YWRhdGEpIHtcbiAgICAgIHVwcGVyQm91bmRWaXNpYmlsaXR5ID0gcGFyYW1NZXRhZGF0YTtcblxuICAgIH0gZWxzZSBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIEhvc3RNZXRhZGF0YSkge1xuICAgICAgdXBwZXJCb3VuZFZpc2liaWxpdHkgPSBwYXJhbU1ldGFkYXRhO1xuXG4gICAgfSBlbHNlIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgU2tpcFNlbGZNZXRhZGF0YSkge1xuICAgICAgbG93ZXJCb3VuZFZpc2liaWxpdHkgPSBwYXJhbU1ldGFkYXRhO1xuXG4gICAgfSBlbHNlIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgRGVwZW5kZW5jeU1ldGFkYXRhKSB7XG4gICAgICBpZiAoaXNQcmVzZW50KHBhcmFtTWV0YWRhdGEudG9rZW4pKSB7XG4gICAgICAgIHRva2VuID0gcGFyYW1NZXRhZGF0YS50b2tlbjtcbiAgICAgIH1cbiAgICAgIGRlcFByb3BzLnB1c2gocGFyYW1NZXRhZGF0YSk7XG4gICAgfVxuICB9XG5cbiAgdG9rZW4gPSByZXNvbHZlRm9yd2FyZFJlZih0b2tlbik7XG5cbiAgaWYgKGlzUHJlc2VudCh0b2tlbikpIHtcbiAgICByZXR1cm4gX2NyZWF0ZURlcGVuZGVuY3kodG9rZW4sIG9wdGlvbmFsLCBsb3dlckJvdW5kVmlzaWJpbGl0eSwgdXBwZXJCb3VuZFZpc2liaWxpdHksIGRlcFByb3BzKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgTm9Bbm5vdGF0aW9uRXJyb3IodHlwZU9yRnVuYywgcGFyYW1zKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlRGVwZW5kZW5jeSh0b2tlbiwgb3B0aW9uYWwsIGxvd2VyQm91bmRWaXNpYmlsaXR5LCB1cHBlckJvdW5kVmlzaWJpbGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcFByb3BzKTogRGVwZW5kZW5jeSB7XG4gIHJldHVybiBuZXcgRGVwZW5kZW5jeShLZXkuZ2V0KHRva2VuKSwgb3B0aW9uYWwsIGxvd2VyQm91bmRWaXNpYmlsaXR5LCB1cHBlckJvdW5kVmlzaWJpbGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcFByb3BzKTtcbn1cbiJdfQ==