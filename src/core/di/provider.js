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
         * with some default providers, and the user can register additonal providers.
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
 * @deprecated
 * Creates a {@link Provider}.
 *
 * To construct a {@link Provider}, bind a `token` to either a class, a value, a factory function,
 * or
 * to an existing `token`.
 * See {@link ProviderBuilder} for more details.
 *
 * The `token` is most commonly a class or {@link angular2/di/OpaqueToken}.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlci50cyJdLCJuYW1lcyI6WyJEZXBlbmRlbmN5IiwiRGVwZW5kZW5jeS5jb25zdHJ1Y3RvciIsIkRlcGVuZGVuY3kuZnJvbUtleSIsIlByb3ZpZGVyIiwiUHJvdmlkZXIuY29uc3RydWN0b3IiLCJQcm92aWRlci5tdWx0aSIsIkJpbmRpbmciLCJCaW5kaW5nLmNvbnN0cnVjdG9yIiwiQmluZGluZy50b0NsYXNzIiwiQmluZGluZy50b0FsaWFzIiwiQmluZGluZy50b0ZhY3RvcnkiLCJCaW5kaW5nLnRvVmFsdWUiLCJSZXNvbHZlZFByb3ZpZGVyXyIsIlJlc29sdmVkUHJvdmlkZXJfLmNvbnN0cnVjdG9yIiwiUmVzb2x2ZWRQcm92aWRlcl8ucmVzb2x2ZWRGYWN0b3J5IiwiUmVzb2x2ZWRGYWN0b3J5IiwiUmVzb2x2ZWRGYWN0b3J5LmNvbnN0cnVjdG9yIiwiYmluZCIsInByb3ZpZGUiLCJQcm92aWRlckJ1aWxkZXIiLCJQcm92aWRlckJ1aWxkZXIuY29uc3RydWN0b3IiLCJQcm92aWRlckJ1aWxkZXIudG9DbGFzcyIsIlByb3ZpZGVyQnVpbGRlci50b1ZhbHVlIiwiUHJvdmlkZXJCdWlsZGVyLnRvQWxpYXMiLCJQcm92aWRlckJ1aWxkZXIudG9GYWN0b3J5IiwicmVzb2x2ZUZhY3RvcnkiLCJyZXNvbHZlUHJvdmlkZXIiLCJyZXNvbHZlUHJvdmlkZXJzIiwiX05vcm1hbGl6ZWRQcm92aWRlciIsIl9Ob3JtYWxpemVkUHJvdmlkZXIuY29uc3RydWN0b3IiLCJfY3JlYXRlTGlzdE9mUHJvdmlkZXJzIiwiX25vcm1hbGl6ZVByb3ZpZGVycyIsIl9ub3JtYWxpemVQcm92aWRlciIsIl9jb25zdHJ1Y3REZXBlbmRlbmNpZXMiLCJfZGVwZW5kZW5jaWVzRm9yIiwiX2V4dHJhY3RUb2tlbiIsIl9jcmVhdGVEZXBlbmRlbmN5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLHFCQVdPLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsMkJBQXNDLGdDQUFnQyxDQUFDLENBQUE7QUFDdkUsMkJBQXdCLHlDQUF5QyxDQUFDLENBQUE7QUFDbEUsb0JBQWtCLE9BQU8sQ0FBQyxDQUFBO0FBQzFCLHlCQVFPLFlBQVksQ0FBQyxDQUFBO0FBQ3BCLDJCQUlPLGNBQWMsQ0FBQyxDQUFBO0FBQ3RCLDRCQUFnQyxlQUFlLENBQUMsQ0FBQTtBQUVoRDtJQUNFQSxvQkFBbUJBLEdBQVFBLEVBQVNBLFFBQWlCQSxFQUFTQSxvQkFBeUJBLEVBQ3BFQSxvQkFBeUJBLEVBQVNBLFVBQWlCQTtRQURuREMsUUFBR0EsR0FBSEEsR0FBR0EsQ0FBS0E7UUFBU0EsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBU0E7UUFBU0EseUJBQW9CQSxHQUFwQkEsb0JBQW9CQSxDQUFLQTtRQUNwRUEseUJBQW9CQSxHQUFwQkEsb0JBQW9CQSxDQUFLQTtRQUFTQSxlQUFVQSxHQUFWQSxVQUFVQSxDQUFPQTtJQUFHQSxDQUFDQTtJQUVuRUQsa0JBQU9BLEdBQWRBLFVBQWVBLEdBQVFBLElBQWdCRSxNQUFNQSxDQUFDQSxJQUFJQSxVQUFVQSxDQUFDQSxHQUFHQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM3RkYsaUJBQUNBO0FBQURBLENBQUNBLEFBTEQsSUFLQztBQUxZLGtCQUFVLGFBS3RCLENBQUE7QUFFRCxJQUFNLFdBQVcsR0FBRyxpQkFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRW5DOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0g7SUFtSUVHLGtCQUFZQSxLQUFLQSxFQUFFQSxFQU9sQkE7WUFQbUJDLFFBQVFBLGdCQUFFQSxRQUFRQSxnQkFBRUEsV0FBV0EsbUJBQUVBLFVBQVVBLGtCQUFFQSxJQUFJQSxZQUFFQSxLQUFLQTtRQVExRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDbkJBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLFFBQVFBLENBQUNBO1FBQ3pCQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxRQUFRQSxDQUFDQTtRQUN6QkEsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EsV0FBV0EsQ0FBQ0E7UUFDL0JBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLFVBQVVBLENBQUNBO1FBQzdCQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUN6QkEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDdEJBLENBQUNBO0lBZ0NERCxzQkFBSUEsMkJBQUtBO1FBOUJUQSxrRUFBa0VBO1FBQ2xFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQTRCR0E7YUFDSEEsY0FBdUJFLE1BQU1BLENBQUNBLG9CQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBbEw3REE7UUFBQ0EsWUFBS0EsRUFBRUE7O2lCQW1MUEE7SUFBREEsZUFBQ0E7QUFBREEsQ0FBQ0EsQUFuTEQsSUFtTEM7QUFsTFksZ0JBQVEsV0FrTHBCLENBQUE7QUFFRDs7R0FFRztBQUNIO0lBQzZCRywyQkFBUUE7SUFDbkNBLGlCQUFZQSxLQUFLQSxFQUFFQSxFQUtsQkE7WUFMbUJDLE9BQU9BLGVBQUVBLE9BQU9BLGVBQUVBLE9BQU9BLGVBQUVBLFNBQVNBLGlCQUFFQSxJQUFJQSxZQUFFQSxLQUFLQTtRQU1uRUEsa0JBQU1BLEtBQUtBLEVBQUVBO1lBQ1hBLFFBQVFBLEVBQUVBLE9BQU9BO1lBQ2pCQSxRQUFRQSxFQUFFQSxPQUFPQTtZQUNqQkEsV0FBV0EsRUFBRUEsT0FBT0E7WUFDcEJBLFVBQVVBLEVBQUVBLFNBQVNBO1lBQ3JCQSxJQUFJQSxFQUFFQSxJQUFJQTtZQUNWQSxLQUFLQSxFQUFFQSxLQUFLQTtTQUNiQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUtERCxzQkFBSUEsNEJBQU9BO1FBSFhBOztXQUVHQTthQUNIQSxjQUFnQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBRjtJQUt2Q0Esc0JBQUlBLDRCQUFPQTtRQUhYQTs7V0FFR0E7YUFDSEEsY0FBZ0JHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUg7SUFLMUNBLHNCQUFJQSw4QkFBU0E7UUFIYkE7O1dBRUdBO2FBQ0hBLGNBQWtCSSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFKO0lBSzNDQSxzQkFBSUEsNEJBQU9BO1FBSFhBOztXQUVHQTthQUNIQSxjQUFnQkssTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBTDtJQXBDekNBO1FBQUNBLFlBQUtBLEVBQUVBOztnQkFxQ1BBO0lBQURBLGNBQUNBO0FBQURBLENBQUNBLEFBckNELEVBQzZCLFFBQVEsRUFvQ3BDO0FBcENZLGVBQU8sVUFvQ25CLENBQUE7QUF3Q0Q7SUFDRU0sMkJBQW1CQSxHQUFRQSxFQUFTQSxpQkFBb0NBLEVBQ3JEQSxhQUFzQkE7UUFEdEJDLFFBQUdBLEdBQUhBLEdBQUdBLENBQUtBO1FBQVNBLHNCQUFpQkEsR0FBakJBLGlCQUFpQkEsQ0FBbUJBO1FBQ3JEQSxrQkFBYUEsR0FBYkEsYUFBYUEsQ0FBU0E7SUFBR0EsQ0FBQ0E7SUFFN0NELHNCQUFJQSw4Q0FBZUE7YUFBbkJBLGNBQXlDRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUY7SUFDOUVBLHdCQUFDQTtBQUFEQSxDQUFDQSxBQUxELElBS0M7QUFMWSx5QkFBaUIsb0JBSzdCLENBQUE7QUFFRDs7R0FFRztBQUNIO0lBQ0VHO1FBQ0lBOztXQUVHQTtRQUNJQSxPQUFpQkE7UUFFeEJBOztXQUVHQTtRQUNJQSxZQUEwQkE7UUFMMUJDLFlBQU9BLEdBQVBBLE9BQU9BLENBQVVBO1FBS2pCQSxpQkFBWUEsR0FBWkEsWUFBWUEsQ0FBY0E7SUFBR0EsQ0FBQ0E7SUFDM0NELHNCQUFDQTtBQUFEQSxDQUFDQSxBQVhELElBV0M7QUFYWSx1QkFBZSxrQkFXM0IsQ0FBQTtBQUVEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxjQUFxQixLQUFLO0lBQ3hCRSxNQUFNQSxDQUFDQSxJQUFJQSxlQUFlQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtBQUNwQ0EsQ0FBQ0E7QUFGZSxZQUFJLE9BRW5CLENBQUE7QUFFRDs7Ozs7O0dBTUc7QUFDSCxpQkFBd0IsS0FBSyxFQUFFLEVBTzlCO1FBUCtCQyxRQUFRQSxnQkFBRUEsUUFBUUEsZ0JBQUVBLFdBQVdBLG1CQUFFQSxVQUFVQSxrQkFBRUEsSUFBSUEsWUFBRUEsS0FBS0E7SUFRdEZBLE1BQU1BLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBO1FBQ3pCQSxRQUFRQSxFQUFFQSxRQUFRQTtRQUNsQkEsUUFBUUEsRUFBRUEsUUFBUUE7UUFDbEJBLFdBQVdBLEVBQUVBLFdBQVdBO1FBQ3hCQSxVQUFVQSxFQUFFQSxVQUFVQTtRQUN0QkEsSUFBSUEsRUFBRUEsSUFBSUE7UUFDVkEsS0FBS0EsRUFBRUEsS0FBS0E7S0FDYkEsQ0FBQ0EsQ0FBQ0E7QUFDTEEsQ0FBQ0E7QUFoQmUsZUFBTyxVQWdCdEIsQ0FBQTtBQUVEOztHQUVHO0FBQ0g7SUFDRUMseUJBQW1CQSxLQUFLQTtRQUFMQyxVQUFLQSxHQUFMQSxLQUFLQSxDQUFBQTtJQUFHQSxDQUFDQTtJQUU1QkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0E0QkdBO0lBQ0hBLGlDQUFPQSxHQUFQQSxVQUFRQSxJQUFVQTtRQUNoQkUsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsYUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbEJBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUNuQkEsNkNBQTBDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsdUJBQW1CQSxDQUFDQSxDQUFDQTtRQUNwRkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsRUFBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDcERBLENBQUNBO0lBRURGOzs7Ozs7Ozs7Ozs7T0FZR0E7SUFDSEEsaUNBQU9BLEdBQVBBLFVBQVFBLEtBQVVBLElBQWNHLE1BQU1BLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLEVBQUNBLFFBQVFBLEVBQUVBLEtBQUtBLEVBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRXJGSDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQStCR0E7SUFDSEEsaUNBQU9BLEdBQVBBLFVBQVFBLFVBQXdCQTtRQUM5QkksRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUFDQSxtQkFBaUJBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSx1QkFBb0JBLENBQUNBLENBQUNBO1FBQ3RGQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxFQUFDQSxXQUFXQSxFQUFFQSxVQUFVQSxFQUFDQSxDQUFDQSxDQUFDQTtJQUM3REEsQ0FBQ0E7SUFFREo7Ozs7Ozs7Ozs7Ozs7O09BY0dBO0lBQ0hBLG1DQUFTQSxHQUFUQSxVQUFVQSxPQUFpQkEsRUFBRUEsWUFBb0JBO1FBQy9DSyxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxpQkFBVUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDekJBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUNuQkEsK0NBQTRDQSxnQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsMEJBQXNCQSxDQUFDQSxDQUFDQTtRQUM1RkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsRUFBQ0EsVUFBVUEsRUFBRUEsT0FBT0EsRUFBRUEsSUFBSUEsRUFBRUEsWUFBWUEsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDN0VBLENBQUNBO0lBQ0hMLHNCQUFDQTtBQUFEQSxDQUFDQSxBQXBIRCxJQW9IQztBQXBIWSx1QkFBZSxrQkFvSDNCLENBQUE7QUFFRDs7R0FFRztBQUNILHdCQUErQixRQUFrQjtJQUMvQ00sSUFBSUEsU0FBbUJBLENBQUNBO0lBQ3hCQSxJQUFJQSxZQUFZQSxDQUFDQTtJQUNqQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFFBQVFBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ2pDQSxJQUFJQSxRQUFRQSxHQUFHQSwrQkFBaUJBLENBQUNBLFFBQVFBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1FBQ3BEQSxTQUFTQSxHQUFHQSxzQkFBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDeENBLFlBQVlBLEdBQUdBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDNUNBLENBQUNBO0lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMzQ0EsU0FBU0EsR0FBR0EsVUFBQ0EsYUFBYUEsSUFBS0EsT0FBQUEsYUFBYUEsRUFBYkEsQ0FBYUEsQ0FBQ0E7UUFDN0NBLFlBQVlBLEdBQUdBLENBQUNBLFVBQVVBLENBQUNBLE9BQU9BLENBQUNBLFNBQUdBLENBQUNBLEdBQUdBLENBQUNBLFFBQVFBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ3JFQSxDQUFDQTtJQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDMUNBLFNBQVNBLEdBQUdBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBO1FBQ2hDQSxZQUFZQSxHQUFHQSxzQkFBc0JBLENBQUNBLFFBQVFBLENBQUNBLFVBQVVBLEVBQUVBLFFBQVFBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO0lBQ3BGQSxDQUFDQTtJQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNOQSxTQUFTQSxHQUFHQSxjQUFNQSxPQUFBQSxRQUFRQSxDQUFDQSxRQUFRQSxFQUFqQkEsQ0FBaUJBLENBQUNBO1FBQ3BDQSxZQUFZQSxHQUFHQSxXQUFXQSxDQUFDQTtJQUM3QkEsQ0FBQ0E7SUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsZUFBZUEsQ0FBQ0EsU0FBU0EsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0E7QUFDdERBLENBQUNBO0FBbEJlLHNCQUFjLGlCQWtCN0IsQ0FBQTtBQUVEOzs7OztHQUtHO0FBQ0gseUJBQWdDLFFBQWtCO0lBQ2hEQyxNQUFNQSxDQUFDQSxJQUFJQSxpQkFBaUJBLENBQUNBLFNBQUdBLENBQUNBLEdBQUdBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLEVBQUVBLENBQUNBLGNBQWNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0FBQzNGQSxDQUFDQTtBQUZlLHVCQUFlLGtCQUU5QixDQUFBO0FBRUQ7O0dBRUc7QUFDSCwwQkFBaUMsU0FBeUM7SUFDeEVDLElBQUlBLFVBQVVBLEdBQUdBLHNCQUFzQkEsQ0FBQ0EsbUJBQW1CQSxDQUN2REEsU0FBU0EsRUFBRUEsSUFBSUEsR0FBR0EsRUFBdURBLENBQUNBLENBQUNBLENBQUNBO0lBQ2hGQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFBQSxDQUFDQTtRQUNyQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsaUJBQWlCQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxlQUFlQSxDQUFDQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUVsRUEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsR0FBR0EsR0FBMEJBLENBQUNBLENBQUNBO1lBQ25DQSxNQUFNQSxDQUFDQSxJQUFJQSxpQkFBaUJBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLFVBQUFBLENBQUNBLElBQUlBLE9BQUFBLENBQUNBLENBQUNBLGVBQWVBLEVBQWpCQSxDQUFpQkEsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDbEZBLENBQUNBO0lBQ0hBLENBQUNBLENBQUNBLENBQUNBO0FBQ0xBLENBQUNBO0FBWmUsd0JBQWdCLG1CQVkvQixDQUFBO0FBRUQ7Ozs7OztHQU1HO0FBQ0g7SUFDRUMsNkJBQW1CQSxHQUFRQSxFQUFTQSxlQUFnQ0E7UUFBakRDLFFBQUdBLEdBQUhBLEdBQUdBLENBQUtBO1FBQVNBLG9CQUFlQSxHQUFmQSxlQUFlQSxDQUFpQkE7SUFBR0EsQ0FBQ0E7SUFDMUVELDBCQUFDQTtBQUFEQSxDQUFDQSxBQUZELElBRUM7QUFFRCxnQ0FBZ0Msa0JBQW9DO0lBQ2xFRSxNQUFNQSxDQUFDQSx1QkFBVUEsQ0FBQ0EsTUFBTUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQTtBQUMvQ0EsQ0FBQ0E7QUFFRCw2QkFBNkIsU0FBMkQsRUFDM0QsR0FBNkQ7SUFFeEZDLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLFVBQUFBLENBQUNBO1FBQ2pCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxZQUFZQSxXQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0QkEsa0JBQWtCQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxFQUFDQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUVyREEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFFN0JBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFlBQVlBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQzlCQSxtQkFBbUJBLENBQUNBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1FBRTlCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxZQUFZQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4Q0EsTUFBTUEsSUFBSUEsaUNBQW9CQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUUxQ0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsTUFBTUEsSUFBSUEsaUNBQW9CQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNwQ0EsQ0FBQ0E7SUFDSEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFSEEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7QUFDYkEsQ0FBQ0E7QUFFRCw0QkFBNEIsQ0FBVyxFQUNYLEdBQTZEO0lBQ3ZGQyxJQUFJQSxHQUFHQSxHQUFHQSxTQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUMzQkEsSUFBSUEsT0FBT0EsR0FBR0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDaENBLElBQUlBLFVBQVVBLEdBQUdBLElBQUlBLG1CQUFtQkEsQ0FBQ0EsR0FBR0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFFdkRBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1FBQ1pBLElBQUlBLGdCQUFnQkEsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFFdkNBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFnQkEsWUFBWUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdENBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFFcENBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO1FBRWhDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxJQUFJQSwwREFBNkNBLENBQUNBLGdCQUFnQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDL0VBLENBQUNBO0lBRUhBLENBQUNBO0lBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ05BLElBQUlBLGdCQUFnQkEsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFFdkNBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFnQkEsWUFBWUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdENBLE1BQU1BLElBQUlBLDBEQUE2Q0EsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMvRUEsQ0FBQ0E7UUFFREEsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsRUFBRUEsVUFB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LENBQUNBO1lBQzlCQSxDQUFDQTtZQUNEQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUMvQkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREEsS0FBS0EsR0FBR0EsK0JBQWlCQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUVqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3JCQSxNQUFNQSxDQUFDQSxpQkFBaUJBLENBQUNBLEtBQUtBLEVBQUVBLFFBQVFBLEVBQUVBLG9CQUFvQkEsRUFBRUEsb0JBQW9CQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtJQUNsR0EsQ0FBQ0E7SUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDTkEsTUFBTUEsSUFBSUEsOEJBQWlCQSxDQUFDQSxVQUFVQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUNsREEsQ0FBQ0E7QUFDSEEsQ0FBQ0E7QUFFRCwyQkFBMkIsS0FBSyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBRSxvQkFBb0IsRUFDM0QsUUFBUTtJQUNqQ0MsTUFBTUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsU0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBRUEsUUFBUUEsRUFBRUEsb0JBQW9CQSxFQUFFQSxvQkFBb0JBLEVBQ3BFQSxRQUFRQSxDQUFDQSxDQUFDQTtBQUNsQ0EsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBUeXBlLFxuICBpc0JsYW5rLFxuICBpc1ByZXNlbnQsXG4gIENPTlNULFxuICBDT05TVF9FWFBSLFxuICBzdHJpbmdpZnksXG4gIGlzQXJyYXksXG4gIGlzVHlwZSxcbiAgaXNGdW5jdGlvbixcbiAgbm9ybWFsaXplQm9vbFxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtLZXl9IGZyb20gJy4va2V5JztcbmltcG9ydCB7XG4gIEluamVjdE1ldGFkYXRhLFxuICBJbmplY3RhYmxlTWV0YWRhdGEsXG4gIE9wdGlvbmFsTWV0YWRhdGEsXG4gIFNlbGZNZXRhZGF0YSxcbiAgSG9zdE1ldGFkYXRhLFxuICBTa2lwU2VsZk1ldGFkYXRhLFxuICBEZXBlbmRlbmN5TWV0YWRhdGFcbn0gZnJvbSAnLi9tZXRhZGF0YSc7XG5pbXBvcnQge1xuICBOb0Fubm90YXRpb25FcnJvcixcbiAgTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9yLFxuICBJbnZhbGlkUHJvdmlkZXJFcnJvclxufSBmcm9tICcuL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtyZXNvbHZlRm9yd2FyZFJlZn0gZnJvbSAnLi9mb3J3YXJkX3JlZic7XG5cbmV4cG9ydCBjbGFzcyBEZXBlbmRlbmN5IHtcbiAgY29uc3RydWN0b3IocHVibGljIGtleTogS2V5LCBwdWJsaWMgb3B0aW9uYWw6IGJvb2xlYW4sIHB1YmxpYyBsb3dlckJvdW5kVmlzaWJpbGl0eTogYW55LFxuICAgICAgICAgICAgICBwdWJsaWMgdXBwZXJCb3VuZFZpc2liaWxpdHk6IGFueSwgcHVibGljIHByb3BlcnRpZXM6IGFueVtdKSB7fVxuXG4gIHN0YXRpYyBmcm9tS2V5KGtleTogS2V5KTogRGVwZW5kZW5jeSB7IHJldHVybiBuZXcgRGVwZW5kZW5jeShrZXksIGZhbHNlLCBudWxsLCBudWxsLCBbXSk7IH1cbn1cblxuY29uc3QgX0VNUFRZX0xJU1QgPSBDT05TVF9FWFBSKFtdKTtcblxuLyoqXG4gKiBEZXNjcmliZXMgaG93IHRoZSB7QGxpbmsgSW5qZWN0b3J9IHNob3VsZCBpbnN0YW50aWF0ZSBhIGdpdmVuIHRva2VuLlxuICpcbiAqIFNlZSB7QGxpbmsgcHJvdmlkZX0uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0dOQXlqNks2UGZZZzJOQnpnd1o1P3AlM0RwcmV2aWV3JnA9cHJldmlldykpXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gKiAgIG5ldyBQcm92aWRlcihcIm1lc3NhZ2VcIiwgeyB1c2VWYWx1ZTogJ0hlbGxvJyB9KVxuICogXSk7XG4gKlxuICogZXhwZWN0KGluamVjdG9yLmdldChcIm1lc3NhZ2VcIikpLnRvRXF1YWwoJ0hlbGxvJyk7XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBQcm92aWRlciB7XG4gIC8qKlxuICAgKiBUb2tlbiB1c2VkIHdoZW4gcmV0cmlldmluZyB0aGlzIHByb3ZpZGVyLiBVc3VhbGx5LCBpdCBpcyBhIHR5cGUge0BsaW5rIFR5cGV9LlxuICAgKi9cbiAgdG9rZW47XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYW4gaW1wbGVtZW50YXRpb24gY2xhc3MuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9SU1RHODZxZ21veEN5ajlTV1B3WT9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBCZWNhdXNlIGB1c2VFeGlzdGluZ2AgYW5kIGB1c2VDbGFzc2AgYXJlIG9mdGVuIGNvbmZ1c2VkLCB0aGUgZXhhbXBsZSBjb250YWluc1xuICAgKiBib3RoIHVzZSBjYXNlcyBmb3IgZWFzeSBjb21wYXJpc29uLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFZlaGljbGUge31cbiAgICpcbiAgICogY2xhc3MgQ2FyIGV4dGVuZHMgVmVoaWNsZSB7fVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3JDbGFzcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBuZXcgUHJvdmlkZXIoVmVoaWNsZSwgeyB1c2VDbGFzczogQ2FyIH0pXG4gICAqIF0pO1xuICAgKiB2YXIgaW5qZWN0b3JBbGlhcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBuZXcgUHJvdmlkZXIoVmVoaWNsZSwgeyB1c2VFeGlzdGluZzogQ2FyIH0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkpLm5vdC50b0JlKGluamVjdG9yQ2xhc3MuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSkudG9CZShpbmplY3RvckFsaWFzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKiBgYGBcbiAgICovXG4gIHVzZUNsYXNzOiBUeXBlO1xuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGEgdmFsdWUuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9VRlZzTVZRSURlN2w0d2FXemlFUz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGBqYXZhc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIG5ldyBQcm92aWRlcihcIm1lc3NhZ2VcIiwgeyB1c2VWYWx1ZTogJ0hlbGxvJyB9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChcIm1lc3NhZ2VcIikpLnRvRXF1YWwoJ0hlbGxvJyk7XG4gICAqIGBgYFxuICAgKi9cbiAgdXNlVmFsdWU7XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYW4gZXhpc3RpbmcgdG9rZW4uXG4gICAqXG4gICAqIHtAbGluayBJbmplY3Rvcn0gcmV0dXJucyB0aGUgc2FtZSBpbnN0YW5jZSBhcyBpZiB0aGUgcHJvdmlkZWQgdG9rZW4gd2FzIHVzZWQuXG4gICAqIFRoaXMgaXMgaW4gY29udHJhc3QgdG8gYHVzZUNsYXNzYCB3aGVyZSBhIHNlcGFyYXRlIGluc3RhbmNlIG9mIGB1c2VDbGFzc2AgaXMgcmV0dXJuZWQuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9Rc2F0c09KSjZQOFQyZk1lOWdyOD9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBCZWNhdXNlIGB1c2VFeGlzdGluZ2AgYW5kIGB1c2VDbGFzc2AgYXJlIG9mdGVuIGNvbmZ1c2VkIHRoZSBleGFtcGxlIGNvbnRhaW5zXG4gICAqIGJvdGggdXNlIGNhc2VzIGZvciBlYXN5IGNvbXBhcmlzb24uXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgVmVoaWNsZSB7fVxuICAgKlxuICAgKiBjbGFzcyBDYXIgZXh0ZW5kcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIHZhciBpbmplY3RvckFsaWFzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIG5ldyBQcm92aWRlcihWZWhpY2xlLCB7IHVzZUV4aXN0aW5nOiBDYXIgfSlcbiAgICogXSk7XG4gICAqIHZhciBpbmplY3RvckNsYXNzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIG5ldyBQcm92aWRlcihWZWhpY2xlLCB7IHVzZUNsYXNzOiBDYXIgfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSkudG9CZShpbmplY3RvckFsaWFzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkpLm5vdC50b0JlKGluamVjdG9yQ2xhc3MuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdXNlRXhpc3Rpbmc7XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSBmdW5jdGlvbiB3aGljaCBjb21wdXRlcyB0aGUgdmFsdWUuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9TY294eTBwSk5xS0dBUFpZMVZWQz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIG5ldyBQcm92aWRlcihOdW1iZXIsIHsgdXNlRmFjdG9yeTogKCkgPT4geyByZXR1cm4gMSsyOyB9fSksXG4gICAqICAgbmV3IFByb3ZpZGVyKFN0cmluZywgeyB1c2VGYWN0b3J5OiAodmFsdWUpID0+IHsgcmV0dXJuIFwiVmFsdWU6IFwiICsgdmFsdWU7IH0sXG4gICAqICAgICAgICAgICAgICAgICAgICAgICBkZXBzOiBbTnVtYmVyXSB9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChOdW1iZXIpKS50b0VxdWFsKDMpO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFN0cmluZykpLnRvRXF1YWwoJ1ZhbHVlOiAzJyk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBVc2VkIGluIGNvbmp1Y3Rpb24gd2l0aCBkZXBlbmRlbmNpZXMuXG4gICAqL1xuICB1c2VGYWN0b3J5OiBGdW5jdGlvbjtcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGEgc2V0IG9mIGRlcGVuZGVuY2llc1xuICAgKiAoYXMgYHRva2VuYHMpIHdoaWNoIHNob3VsZCBiZSBpbmplY3RlZCBpbnRvIHRoZSBmYWN0b3J5IGZ1bmN0aW9uLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvU2NveHkwcEpOcUtHQVBaWTFWVkM/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBuZXcgUHJvdmlkZXIoTnVtYmVyLCB7IHVzZUZhY3Rvcnk6ICgpID0+IHsgcmV0dXJuIDErMjsgfX0pLFxuICAgKiAgIG5ldyBQcm92aWRlcihTdHJpbmcsIHsgdXNlRmFjdG9yeTogKHZhbHVlKSA9PiB7IHJldHVybiBcIlZhbHVlOiBcIiArIHZhbHVlOyB9LFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgZGVwczogW051bWJlcl0gfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoTnVtYmVyKSkudG9FcXVhbCgzKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChTdHJpbmcpKS50b0VxdWFsKCdWYWx1ZTogMycpO1xuICAgKiBgYGBcbiAgICpcbiAgICogVXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGB1c2VGYWN0b3J5YC5cbiAgICovXG4gIGRlcGVuZGVuY2llczogT2JqZWN0W107XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbXVsdGk6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IodG9rZW4sIHt1c2VDbGFzcywgdXNlVmFsdWUsIHVzZUV4aXN0aW5nLCB1c2VGYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgICB1c2VDbGFzcz86IFR5cGUsXG4gICAgdXNlVmFsdWU/OiBhbnksXG4gICAgdXNlRXhpc3Rpbmc/OiBhbnksXG4gICAgdXNlRmFjdG9yeT86IEZ1bmN0aW9uLFxuICAgIGRlcHM/OiBPYmplY3RbXSxcbiAgICBtdWx0aT86IGJvb2xlYW5cbiAgfSkge1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgICB0aGlzLnVzZUNsYXNzID0gdXNlQ2xhc3M7XG4gICAgdGhpcy51c2VWYWx1ZSA9IHVzZVZhbHVlO1xuICAgIHRoaXMudXNlRXhpc3RpbmcgPSB1c2VFeGlzdGluZztcbiAgICB0aGlzLnVzZUZhY3RvcnkgPSB1c2VGYWN0b3J5O1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVwcztcbiAgICB0aGlzLl9tdWx0aSA9IG11bHRpO1xuICB9XG5cbiAgLy8gVE9ETzogUHJvdmlkZSBhIGZ1bGwgd29ya2luZyBleGFtcGxlIGFmdGVyIGFscGhhMzggaXMgcmVsZWFzZWQuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG11bHRpcGxlIHByb3ZpZGVycyBtYXRjaGluZyB0aGUgc2FtZSB0b2tlbiAoYSBtdWx0aS1wcm92aWRlcikuXG4gICAqXG4gICAqIE11bHRpLXByb3ZpZGVycyBhcmUgdXNlZCBmb3IgY3JlYXRpbmcgcGx1Z2dhYmxlIHNlcnZpY2UsIHdoZXJlIHRoZSBzeXN0ZW0gY29tZXNcbiAgICogd2l0aCBzb21lIGRlZmF1bHQgcHJvdmlkZXJzLCBhbmQgdGhlIHVzZXIgY2FuIHJlZ2lzdGVyIGFkZGl0b25hbCBwcm92aWRlcnMuXG4gICAqIFRoZSBjb21iaW5hdGlvbiBvZiB0aGUgZGVmYXVsdCBwcm92aWRlcnMgYW5kIHRoZSBhZGRpdGlvbmFsIHByb3ZpZGVycyB3aWxsIGJlXG4gICAqIHVzZWQgdG8gZHJpdmUgdGhlIGJlaGF2aW9yIG9mIHRoZSBzeXN0ZW0uXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7IHVzZVZhbHVlOiBcIlN0cmluZzFcIiwgbXVsdGk6IHRydWV9KSxcbiAgICogICBuZXcgUHJvdmlkZXIoXCJTdHJpbmdzXCIsIHsgdXNlVmFsdWU6IFwiU3RyaW5nMlwiLCBtdWx0aTogdHJ1ZX0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFwiU3RyaW5nc1wiKSkudG9FcXVhbChbXCJTdHJpbmcxXCIsIFwiU3RyaW5nMlwiXSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBNdWx0aS1wcm92aWRlcnMgYW5kIHJlZ3VsYXIgcHJvdmlkZXJzIGNhbm5vdCBiZSBtaXhlZC4gVGhlIGZvbGxvd2luZ1xuICAgKiB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbjpcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBuZXcgUHJvdmlkZXIoXCJTdHJpbmdzXCIsIHsgdXNlVmFsdWU6IFwiU3RyaW5nMVwiLCBtdWx0aTogdHJ1ZSB9KSxcbiAgICogICBuZXcgUHJvdmlkZXIoXCJTdHJpbmdzXCIsIHsgdXNlVmFsdWU6IFwiU3RyaW5nMlwifSlcbiAgICogXSk7XG4gICAqIGBgYFxuICAgKi9cbiAgZ2V0IG11bHRpKCk6IGJvb2xlYW4geyByZXR1cm4gbm9ybWFsaXplQm9vbCh0aGlzLl9tdWx0aSk7IH1cbn1cblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEJpbmRpbmcgZXh0ZW5kcyBQcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKHRva2VuLCB7dG9DbGFzcywgdG9WYWx1ZSwgdG9BbGlhcywgdG9GYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgICB0b0NsYXNzPzogVHlwZSxcbiAgICB0b1ZhbHVlPzogYW55LFxuICAgIHRvQWxpYXM/OiBhbnksXG4gICAgdG9GYWN0b3J5OiBGdW5jdGlvbiwgZGVwcz86IE9iamVjdFtdLCBtdWx0aT86IGJvb2xlYW5cbiAgfSkge1xuICAgIHN1cGVyKHRva2VuLCB7XG4gICAgICB1c2VDbGFzczogdG9DbGFzcyxcbiAgICAgIHVzZVZhbHVlOiB0b1ZhbHVlLFxuICAgICAgdXNlRXhpc3Rpbmc6IHRvQWxpYXMsXG4gICAgICB1c2VGYWN0b3J5OiB0b0ZhY3RvcnksXG4gICAgICBkZXBzOiBkZXBzLFxuICAgICAgbXVsdGk6IG11bHRpXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdldCB0b0NsYXNzKCkgeyByZXR1cm4gdGhpcy51c2VDbGFzczsgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgZ2V0IHRvQWxpYXMoKSB7IHJldHVybiB0aGlzLnVzZUV4aXN0aW5nOyB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBnZXQgdG9GYWN0b3J5KCkgeyByZXR1cm4gdGhpcy51c2VGYWN0b3J5OyB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBnZXQgdG9WYWx1ZSgpIHsgcmV0dXJuIHRoaXMudXNlVmFsdWU7IH1cbn1cblxuLyoqXG4gKiBBbiBpbnRlcm5hbCByZXNvbHZlZCByZXByZXNlbnRhdGlvbiBvZiBhIHtAbGluayBQcm92aWRlcn0gdXNlZCBieSB0aGUge0BsaW5rIEluamVjdG9yfS5cbiAqXG4gKiBJdCBpcyB1c3VhbGx5IGNyZWF0ZWQgYXV0b21hdGljYWxseSBieSBgSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZWAuXG4gKlxuICogSXQgY2FuIGJlIGNyZWF0ZWQgbWFudWFsbHksIGFzIGZvbGxvd3M6XG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1JmRW5oaDhrVUVJMEczcXNuSWVUP3AlM0RwcmV2aWV3JnA9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogdmFyIHJlc29sdmVkUHJvdmlkZXJzID0gSW5qZWN0b3IucmVzb2x2ZShbbmV3IFByb3ZpZGVyKCdtZXNzYWdlJywge3VzZVZhbHVlOiAnSGVsbG8nfSldKTtcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLmZyb21SZXNvbHZlZFByb3ZpZGVycyhyZXNvbHZlZFByb3ZpZGVycyk7XG4gKlxuICogZXhwZWN0KGluamVjdG9yLmdldCgnbWVzc2FnZScpKS50b0VxdWFsKCdIZWxsbycpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb2x2ZWRQcm92aWRlciB7XG4gIC8qKlxuICAgKiBBIGtleSwgdXN1YWxseSBhIGBUeXBlYC5cbiAgICovXG4gIGtleTogS2V5O1xuXG4gIC8qKlxuICAgKiBGYWN0b3J5IGZ1bmN0aW9uIHdoaWNoIGNhbiByZXR1cm4gYW4gaW5zdGFuY2Ugb2YgYW4gb2JqZWN0IHJlcHJlc2VudGVkIGJ5IGEga2V5LlxuICAgKi9cbiAgcmVzb2x2ZWRGYWN0b3JpZXM6IFJlc29sdmVkRmFjdG9yeVtdO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgaWYgdGhlIHByb3ZpZGVyIGlzIGEgbXVsdGktcHJvdmlkZXIgb3IgYSByZWd1bGFyIHByb3ZpZGVyLlxuICAgKi9cbiAgbXVsdGlQcm92aWRlcjogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlc29sdmVkQmluZGluZyBleHRlbmRzIFJlc29sdmVkUHJvdmlkZXIge31cblxuZXhwb3J0IGNsYXNzIFJlc29sdmVkUHJvdmlkZXJfIGltcGxlbWVudHMgUmVzb2x2ZWRCaW5kaW5nIHtcbiAgY29uc3RydWN0b3IocHVibGljIGtleTogS2V5LCBwdWJsaWMgcmVzb2x2ZWRGYWN0b3JpZXM6IFJlc29sdmVkRmFjdG9yeVtdLFxuICAgICAgICAgICAgICBwdWJsaWMgbXVsdGlQcm92aWRlcjogYm9vbGVhbikge31cblxuICBnZXQgcmVzb2x2ZWRGYWN0b3J5KCk6IFJlc29sdmVkRmFjdG9yeSB7IHJldHVybiB0aGlzLnJlc29sdmVkRmFjdG9yaWVzWzBdOyB9XG59XG5cbi8qKlxuICogQW4gaW50ZXJuYWwgcmVzb2x2ZWQgcmVwcmVzZW50YXRpb24gb2YgYSBmYWN0b3J5IGZ1bmN0aW9uIGNyZWF0ZWQgYnkgcmVzb2x2aW5nIHtAbGluayBQcm92aWRlcn0uXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNvbHZlZEZhY3Rvcnkge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKlxuICAgICAgICogRmFjdG9yeSBmdW5jdGlvbiB3aGljaCBjYW4gcmV0dXJuIGFuIGluc3RhbmNlIG9mIGFuIG9iamVjdCByZXByZXNlbnRlZCBieSBhIGtleS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGZhY3Rvcnk6IEZ1bmN0aW9uLFxuXG4gICAgICAvKipcbiAgICAgICAqIEFyZ3VtZW50cyAoZGVwZW5kZW5jaWVzKSB0byB0aGUgYGZhY3RvcnlgIGZ1bmN0aW9uLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgZGVwZW5kZW5jaWVzOiBEZXBlbmRlbmN5W10pIHt9XG59XG5cbi8qKlxuICogQGRlcHJlY2F0ZWRcbiAqIENyZWF0ZXMgYSB7QGxpbmsgUHJvdmlkZXJ9LlxuICpcbiAqIFRvIGNvbnN0cnVjdCBhIHtAbGluayBQcm92aWRlcn0sIGJpbmQgYSBgdG9rZW5gIHRvIGVpdGhlciBhIGNsYXNzLCBhIHZhbHVlLCBhIGZhY3RvcnkgZnVuY3Rpb24sXG4gKiBvclxuICogdG8gYW4gZXhpc3RpbmcgYHRva2VuYC5cbiAqIFNlZSB7QGxpbmsgUHJvdmlkZXJCdWlsZGVyfSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFRoZSBgdG9rZW5gIGlzIG1vc3QgY29tbW9ubHkgYSBjbGFzcyBvciB7QGxpbmsgYW5ndWxhcjIvZGkvT3BhcXVlVG9rZW59LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYmluZCh0b2tlbik6IFByb3ZpZGVyQnVpbGRlciB7XG4gIHJldHVybiBuZXcgUHJvdmlkZXJCdWlsZGVyKHRva2VuKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEge0BsaW5rIFByb3ZpZGVyfS5cbiAqXG4gKiBTZWUge0BsaW5rIFByb3ZpZGVyfSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIDwhLS0gVE9ETzogaW1wcm92ZSB0aGUgZG9jcyAtLT5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGUodG9rZW4sIHt1c2VDbGFzcywgdXNlVmFsdWUsIHVzZUV4aXN0aW5nLCB1c2VGYWN0b3J5LCBkZXBzLCBtdWx0aX06IHtcbiAgdXNlQ2xhc3M/OiBUeXBlLFxuICB1c2VWYWx1ZT86IGFueSxcbiAgdXNlRXhpc3Rpbmc/OiBhbnksXG4gIHVzZUZhY3Rvcnk/OiBGdW5jdGlvbixcbiAgZGVwcz86IE9iamVjdFtdLFxuICBtdWx0aT86IGJvb2xlYW5cbn0pOiBQcm92aWRlciB7XG4gIHJldHVybiBuZXcgUHJvdmlkZXIodG9rZW4sIHtcbiAgICB1c2VDbGFzczogdXNlQ2xhc3MsXG4gICAgdXNlVmFsdWU6IHVzZVZhbHVlLFxuICAgIHVzZUV4aXN0aW5nOiB1c2VFeGlzdGluZyxcbiAgICB1c2VGYWN0b3J5OiB1c2VGYWN0b3J5LFxuICAgIGRlcHM6IGRlcHMsXG4gICAgbXVsdGk6IG11bHRpXG4gIH0pO1xufVxuXG4vKipcbiAqIEhlbHBlciBjbGFzcyBmb3IgdGhlIHtAbGluayBiaW5kfSBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFByb3ZpZGVyQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0b2tlbikge31cblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIGNsYXNzLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvWnBCQ1NZcXY2ZTJ1ZDVLWExkeFE/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogQmVjYXVzZSBgdG9BbGlhc2AgYW5kIGB0b0NsYXNzYCBhcmUgb2Z0ZW4gY29uZnVzZWQsIHRoZSBleGFtcGxlIGNvbnRhaW5zXG4gICAqIGJvdGggdXNlIGNhc2VzIGZvciBlYXN5IGNvbXBhcmlzb24uXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgVmVoaWNsZSB7fVxuICAgKlxuICAgKiBjbGFzcyBDYXIgZXh0ZW5kcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIHZhciBpbmplY3RvckNsYXNzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIHByb3ZpZGUoVmVoaWNsZSwge3VzZUNsYXNzOiBDYXJ9KVxuICAgKiBdKTtcbiAgICogdmFyIGluamVjdG9yQWxpYXMgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgcHJvdmlkZShWZWhpY2xlLCB7dXNlRXhpc3Rpbmc6IENhcn0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkpLm5vdC50b0JlKGluamVjdG9yQ2xhc3MuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSkudG9CZShpbmplY3RvckFsaWFzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKiBgYGBcbiAgICovXG4gIHRvQ2xhc3ModHlwZTogVHlwZSk6IFByb3ZpZGVyIHtcbiAgICBpZiAoIWlzVHlwZSh0eXBlKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgYFRyeWluZyB0byBjcmVhdGUgYSBjbGFzcyBwcm92aWRlciBidXQgXCIke3N0cmluZ2lmeSh0eXBlKX1cIiBpcyBub3QgYSBjbGFzcyFgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm92aWRlcih0aGlzLnRva2VuLCB7dXNlQ2xhc3M6IHR5cGV9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGEgdmFsdWUuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9HMDI0UEZIbURMMGNKRmdmWks4Tz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIHByb3ZpZGUoJ21lc3NhZ2UnLCB7dXNlVmFsdWU6ICdIZWxsbyd9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldCgnbWVzc2FnZScpKS50b0VxdWFsKCdIZWxsbycpO1xuICAgKiBgYGBcbiAgICovXG4gIHRvVmFsdWUodmFsdWU6IGFueSk6IFByb3ZpZGVyIHsgcmV0dXJuIG5ldyBQcm92aWRlcih0aGlzLnRva2VuLCB7dXNlVmFsdWU6IHZhbHVlfSk7IH1cblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhbiBleGlzdGluZyB0b2tlbi5cbiAgICpcbiAgICogQW5ndWxhciB3aWxsIHJldHVybiB0aGUgc2FtZSBpbnN0YW5jZSBhcyBpZiB0aGUgcHJvdmlkZWQgdG9rZW4gd2FzIHVzZWQuIChUaGlzIGlzXG4gICAqIGluIGNvbnRyYXN0IHRvIGB1c2VDbGFzc2Agd2hlcmUgYSBzZXBhcmF0ZSBpbnN0YW5jZSBvZiBgdXNlQ2xhc3NgIHdpbGwgYmUgcmV0dXJuZWQuKVxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvdUJhb0YycE41Y2ZjNUFmWmFwTnc/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogQmVjYXVzZSBgdG9BbGlhc2AgYW5kIGB0b0NsYXNzYCBhcmUgb2Z0ZW4gY29uZnVzZWQsIHRoZSBleGFtcGxlIGNvbnRhaW5zXG4gICAqIGJvdGggdXNlIGNhc2VzIGZvciBlYXN5IGNvbXBhcmlzb24uXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgVmVoaWNsZSB7fVxuICAgKlxuICAgKiBjbGFzcyBDYXIgZXh0ZW5kcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIHZhciBpbmplY3RvckFsaWFzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIHByb3ZpZGUoVmVoaWNsZSwge3VzZUV4aXN0aW5nOiBDYXJ9KVxuICAgKiBdKTtcbiAgICogdmFyIGluamVjdG9yQ2xhc3MgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgcHJvdmlkZShWZWhpY2xlLCB7dXNlQ2xhc3M6IENhcn0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkpLnRvQmUoaW5qZWN0b3JBbGlhcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpKS5ub3QudG9CZShpbmplY3RvckNsYXNzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKiBgYGBcbiAgICovXG4gIHRvQWxpYXMoYWxpYXNUb2tlbjogLypUeXBlKi8gYW55KTogUHJvdmlkZXIge1xuICAgIGlmIChpc0JsYW5rKGFsaWFzVG9rZW4pKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ2FuIG5vdCBhbGlhcyAke3N0cmluZ2lmeSh0aGlzLnRva2VuKX0gdG8gYSBibGFuayB2YWx1ZSFgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm92aWRlcih0aGlzLnRva2VuLCB7dXNlRXhpc3Rpbmc6IGFsaWFzVG9rZW59KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGEgZnVuY3Rpb24gd2hpY2ggY29tcHV0ZXMgdGhlIHZhbHVlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvT2VqTklmVFQzemIxaUJ4YUlZT2I/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBwcm92aWRlKE51bWJlciwge3VzZUZhY3Rvcnk6ICgpID0+IHsgcmV0dXJuIDErMjsgfX0pLFxuICAgKiAgIHByb3ZpZGUoU3RyaW5nLCB7dXNlRmFjdG9yeTogKHYpID0+IHsgcmV0dXJuIFwiVmFsdWU6IFwiICsgdjsgfSwgZGVwczogW051bWJlcl19KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChOdW1iZXIpKS50b0VxdWFsKDMpO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFN0cmluZykpLnRvRXF1YWwoJ1ZhbHVlOiAzJyk7XG4gICAqIGBgYFxuICAgKi9cbiAgdG9GYWN0b3J5KGZhY3Rvcnk6IEZ1bmN0aW9uLCBkZXBlbmRlbmNpZXM/OiBhbnlbXSk6IFByb3ZpZGVyIHtcbiAgICBpZiAoIWlzRnVuY3Rpb24oZmFjdG9yeSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBUcnlpbmcgdG8gY3JlYXRlIGEgZmFjdG9yeSBwcm92aWRlciBidXQgXCIke3N0cmluZ2lmeShmYWN0b3J5KX1cIiBpcyBub3QgYSBmdW5jdGlvbiFgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm92aWRlcih0aGlzLnRva2VuLCB7dXNlRmFjdG9yeTogZmFjdG9yeSwgZGVwczogZGVwZW5kZW5jaWVzfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXNvbHZlIGEgc2luZ2xlIHByb3ZpZGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUZhY3RvcnkocHJvdmlkZXI6IFByb3ZpZGVyKTogUmVzb2x2ZWRGYWN0b3J5IHtcbiAgdmFyIGZhY3RvcnlGbjogRnVuY3Rpb247XG4gIHZhciByZXNvbHZlZERlcHM7XG4gIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlQ2xhc3MpKSB7XG4gICAgdmFyIHVzZUNsYXNzID0gcmVzb2x2ZUZvcndhcmRSZWYocHJvdmlkZXIudXNlQ2xhc3MpO1xuICAgIGZhY3RvcnlGbiA9IHJlZmxlY3Rvci5mYWN0b3J5KHVzZUNsYXNzKTtcbiAgICByZXNvbHZlZERlcHMgPSBfZGVwZW5kZW5jaWVzRm9yKHVzZUNsYXNzKTtcbiAgfSBlbHNlIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlRXhpc3RpbmcpKSB7XG4gICAgZmFjdG9yeUZuID0gKGFsaWFzSW5zdGFuY2UpID0+IGFsaWFzSW5zdGFuY2U7XG4gICAgcmVzb2x2ZWREZXBzID0gW0RlcGVuZGVuY3kuZnJvbUtleShLZXkuZ2V0KHByb3ZpZGVyLnVzZUV4aXN0aW5nKSldO1xuICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VGYWN0b3J5KSkge1xuICAgIGZhY3RvcnlGbiA9IHByb3ZpZGVyLnVzZUZhY3Rvcnk7XG4gICAgcmVzb2x2ZWREZXBzID0gX2NvbnN0cnVjdERlcGVuZGVuY2llcyhwcm92aWRlci51c2VGYWN0b3J5LCBwcm92aWRlci5kZXBlbmRlbmNpZXMpO1xuICB9IGVsc2Uge1xuICAgIGZhY3RvcnlGbiA9ICgpID0+IHByb3ZpZGVyLnVzZVZhbHVlO1xuICAgIHJlc29sdmVkRGVwcyA9IF9FTVBUWV9MSVNUO1xuICB9XG4gIHJldHVybiBuZXcgUmVzb2x2ZWRGYWN0b3J5KGZhY3RvcnlGbiwgcmVzb2x2ZWREZXBzKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUge0BsaW5rIFByb3ZpZGVyfSBpbnRvIHtAbGluayBSZXNvbHZlZFByb3ZpZGVyfS5cbiAqXG4gKiB7QGxpbmsgSW5qZWN0b3J9IGludGVybmFsbHkgb25seSB1c2VzIHtAbGluayBSZXNvbHZlZFByb3ZpZGVyfSwge0BsaW5rIFByb3ZpZGVyfSBjb250YWluc1xuICogY29udmVuaWVuY2UgcHJvdmlkZXIgc3ludGF4LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVByb3ZpZGVyKHByb3ZpZGVyOiBQcm92aWRlcik6IFJlc29sdmVkUHJvdmlkZXIge1xuICByZXR1cm4gbmV3IFJlc29sdmVkUHJvdmlkZXJfKEtleS5nZXQocHJvdmlkZXIudG9rZW4pLCBbcmVzb2x2ZUZhY3RvcnkocHJvdmlkZXIpXSwgZmFsc2UpO1xufVxuXG4vKipcbiAqIFJlc29sdmUgYSBsaXN0IG9mIFByb3ZpZGVycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQcm92aWRlcnMocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBSZXNvbHZlZFByb3ZpZGVyW10ge1xuICB2YXIgbm9ybWFsaXplZCA9IF9jcmVhdGVMaXN0T2ZQcm92aWRlcnMoX25vcm1hbGl6ZVByb3ZpZGVycyhcbiAgICAgIHByb3ZpZGVycywgbmV3IE1hcDxudW1iZXIsIF9Ob3JtYWxpemVkUHJvdmlkZXIgfCBfTm9ybWFsaXplZFByb3ZpZGVyW10+KCkpKTtcbiAgcmV0dXJuIG5vcm1hbGl6ZWQubWFwKGIgPT4ge1xuICAgIGlmIChiIGluc3RhbmNlb2YgX05vcm1hbGl6ZWRQcm92aWRlcikge1xuICAgICAgcmV0dXJuIG5ldyBSZXNvbHZlZFByb3ZpZGVyXyhiLmtleSwgW2IucmVzb2x2ZWRGYWN0b3J5XSwgZmFsc2UpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBhcnIgPSA8X05vcm1hbGl6ZWRQcm92aWRlcltdPmI7XG4gICAgICByZXR1cm4gbmV3IFJlc29sdmVkUHJvdmlkZXJfKGFyclswXS5rZXksIGFyci5tYXAoXyA9PiBfLnJlc29sdmVkRmFjdG9yeSksIHRydWUpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVGhlIGFsZ29yaXRobSB3b3JrcyBhcyBmb2xsb3dzOlxuICpcbiAqIFtQcm92aWRlcl0gLT4gW19Ob3JtYWxpemVkUHJvdmlkZXJ8W19Ob3JtYWxpemVkUHJvdmlkZXJdXSAtPiBbUmVzb2x2ZWRQcm92aWRlcl1cbiAqXG4gKiBfTm9ybWFsaXplZFByb3ZpZGVyIGlzIGVzc2VudGlhbGx5IGEgcmVzb2x2ZWQgcHJvdmlkZXIgYmVmb3JlIGl0IHdhcyBncm91cGVkIGJ5IGtleS5cbiAqL1xuY2xhc3MgX05vcm1hbGl6ZWRQcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBrZXk6IEtleSwgcHVibGljIHJlc29sdmVkRmFjdG9yeTogUmVzb2x2ZWRGYWN0b3J5KSB7fVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlTGlzdE9mUHJvdmlkZXJzKGZsYXR0ZW5lZFByb3ZpZGVyczogTWFwPG51bWJlciwgYW55Pik6IGFueVtdIHtcbiAgcmV0dXJuIE1hcFdyYXBwZXIudmFsdWVzKGZsYXR0ZW5lZFByb3ZpZGVycyk7XG59XG5cbmZ1bmN0aW9uIF9ub3JtYWxpemVQcm92aWRlcnMocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBQcm92aWRlckJ1aWxkZXIgfCBhbnlbXT4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlczogTWFwPG51bWJlciwgX05vcm1hbGl6ZWRQcm92aWRlciB8IF9Ob3JtYWxpemVkUHJvdmlkZXJbXT4pOlxuICAgIE1hcDxudW1iZXIsIF9Ob3JtYWxpemVkUHJvdmlkZXIgfCBfTm9ybWFsaXplZFByb3ZpZGVyW10+IHtcbiAgcHJvdmlkZXJzLmZvckVhY2goYiA9PiB7XG4gICAgaWYgKGIgaW5zdGFuY2VvZiBUeXBlKSB7XG4gICAgICBfbm9ybWFsaXplUHJvdmlkZXIocHJvdmlkZShiLCB7dXNlQ2xhc3M6IGJ9KSwgcmVzKTtcblxuICAgIH0gZWxzZSBpZiAoYiBpbnN0YW5jZW9mIFByb3ZpZGVyKSB7XG4gICAgICBfbm9ybWFsaXplUHJvdmlkZXIoYiwgcmVzKTtcblxuICAgIH0gZWxzZSBpZiAoYiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBfbm9ybWFsaXplUHJvdmlkZXJzKGIsIHJlcyk7XG5cbiAgICB9IGVsc2UgaWYgKGIgaW5zdGFuY2VvZiBQcm92aWRlckJ1aWxkZXIpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUHJvdmlkZXJFcnJvcihiLnRva2VuKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFByb3ZpZGVyRXJyb3IoYik7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBfbm9ybWFsaXplUHJvdmlkZXIoYjogUHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzOiBNYXA8bnVtYmVyLCBfTm9ybWFsaXplZFByb3ZpZGVyIHwgX05vcm1hbGl6ZWRQcm92aWRlcltdPik6IHZvaWQge1xuICB2YXIga2V5ID0gS2V5LmdldChiLnRva2VuKTtcbiAgdmFyIGZhY3RvcnkgPSByZXNvbHZlRmFjdG9yeShiKTtcbiAgdmFyIG5vcm1hbGl6ZWQgPSBuZXcgX05vcm1hbGl6ZWRQcm92aWRlcihrZXksIGZhY3RvcnkpO1xuXG4gIGlmIChiLm11bHRpKSB7XG4gICAgdmFyIGV4aXN0aW5nUHJvdmlkZXIgPSByZXMuZ2V0KGtleS5pZCk7XG5cbiAgICBpZiAoZXhpc3RpbmdQcm92aWRlciBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBleGlzdGluZ1Byb3ZpZGVyLnB1c2gobm9ybWFsaXplZCk7XG5cbiAgICB9IGVsc2UgaWYgKGlzQmxhbmsoZXhpc3RpbmdQcm92aWRlcikpIHtcbiAgICAgIHJlcy5zZXQoa2V5LmlkLCBbbm9ybWFsaXplZF0pO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBNaXhpbmdNdWx0aVByb3ZpZGVyc1dpdGhSZWd1bGFyUHJvdmlkZXJzRXJyb3IoZXhpc3RpbmdQcm92aWRlciwgYik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyIGV4aXN0aW5nUHJvdmlkZXIgPSByZXMuZ2V0KGtleS5pZCk7XG5cbiAgICBpZiAoZXhpc3RpbmdQcm92aWRlciBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICB0aHJvdyBuZXcgTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9yKGV4aXN0aW5nUHJvdmlkZXIsIGIpO1xuICAgIH1cblxuICAgIHJlcy5zZXQoa2V5LmlkLCBub3JtYWxpemVkKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY29uc3RydWN0RGVwZW5kZW5jaWVzKGZhY3RvcnlGdW5jdGlvbjogRnVuY3Rpb24sIGRlcGVuZGVuY2llczogYW55W10pOiBEZXBlbmRlbmN5W10ge1xuICBpZiAoaXNCbGFuayhkZXBlbmRlbmNpZXMpKSB7XG4gICAgcmV0dXJuIF9kZXBlbmRlbmNpZXNGb3IoZmFjdG9yeUZ1bmN0aW9uKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFyYW1zOiBhbnlbXVtdID0gZGVwZW5kZW5jaWVzLm1hcCh0ID0+IFt0XSk7XG4gICAgcmV0dXJuIGRlcGVuZGVuY2llcy5tYXAodCA9PiBfZXh0cmFjdFRva2VuKGZhY3RvcnlGdW5jdGlvbiwgdCwgcGFyYW1zKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2RlcGVuZGVuY2llc0Zvcih0eXBlT3JGdW5jKTogRGVwZW5kZW5jeVtdIHtcbiAgdmFyIHBhcmFtcyA9IHJlZmxlY3Rvci5wYXJhbWV0ZXJzKHR5cGVPckZ1bmMpO1xuICBpZiAoaXNCbGFuayhwYXJhbXMpKSByZXR1cm4gW107XG4gIGlmIChwYXJhbXMuc29tZShpc0JsYW5rKSkge1xuICAgIHRocm93IG5ldyBOb0Fubm90YXRpb25FcnJvcih0eXBlT3JGdW5jLCBwYXJhbXMpO1xuICB9XG4gIHJldHVybiBwYXJhbXMubWFwKChwOiBhbnlbXSkgPT4gX2V4dHJhY3RUb2tlbih0eXBlT3JGdW5jLCBwLCBwYXJhbXMpKTtcbn1cblxuZnVuY3Rpb24gX2V4dHJhY3RUb2tlbih0eXBlT3JGdW5jLCBtZXRhZGF0YSAvKmFueVtdIHwgYW55Ki8sIHBhcmFtczogYW55W11bXSk6IERlcGVuZGVuY3kge1xuICB2YXIgZGVwUHJvcHMgPSBbXTtcbiAgdmFyIHRva2VuID0gbnVsbDtcbiAgdmFyIG9wdGlvbmFsID0gZmFsc2U7XG5cbiAgaWYgKCFpc0FycmF5KG1ldGFkYXRhKSkge1xuICAgIGlmIChtZXRhZGF0YSBpbnN0YW5jZW9mIEluamVjdE1ldGFkYXRhKSB7XG4gICAgICByZXR1cm4gX2NyZWF0ZURlcGVuZGVuY3kobWV0YWRhdGEudG9rZW4sIG9wdGlvbmFsLCBudWxsLCBudWxsLCBkZXBQcm9wcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBfY3JlYXRlRGVwZW5kZW5jeShtZXRhZGF0YSwgb3B0aW9uYWwsIG51bGwsIG51bGwsIGRlcFByb3BzKTtcbiAgICB9XG4gIH1cblxuICB2YXIgbG93ZXJCb3VuZFZpc2liaWxpdHkgPSBudWxsO1xuICB2YXIgdXBwZXJCb3VuZFZpc2liaWxpdHkgPSBudWxsO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWV0YWRhdGEubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgcGFyYW1NZXRhZGF0YSA9IG1ldGFkYXRhW2ldO1xuXG4gICAgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBUeXBlKSB7XG4gICAgICB0b2tlbiA9IHBhcmFtTWV0YWRhdGE7XG5cbiAgICB9IGVsc2UgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBJbmplY3RNZXRhZGF0YSkge1xuICAgICAgdG9rZW4gPSBwYXJhbU1ldGFkYXRhLnRva2VuO1xuXG4gICAgfSBlbHNlIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgT3B0aW9uYWxNZXRhZGF0YSkge1xuICAgICAgb3B0aW9uYWwgPSB0cnVlO1xuXG4gICAgfSBlbHNlIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgU2VsZk1ldGFkYXRhKSB7XG4gICAgICB1cHBlckJvdW5kVmlzaWJpbGl0eSA9IHBhcmFtTWV0YWRhdGE7XG5cbiAgICB9IGVsc2UgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBIb3N0TWV0YWRhdGEpIHtcbiAgICAgIHVwcGVyQm91bmRWaXNpYmlsaXR5ID0gcGFyYW1NZXRhZGF0YTtcblxuICAgIH0gZWxzZSBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIFNraXBTZWxmTWV0YWRhdGEpIHtcbiAgICAgIGxvd2VyQm91bmRWaXNpYmlsaXR5ID0gcGFyYW1NZXRhZGF0YTtcblxuICAgIH0gZWxzZSBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIERlcGVuZGVuY3lNZXRhZGF0YSkge1xuICAgICAgaWYgKGlzUHJlc2VudChwYXJhbU1ldGFkYXRhLnRva2VuKSkge1xuICAgICAgICB0b2tlbiA9IHBhcmFtTWV0YWRhdGEudG9rZW47XG4gICAgICB9XG4gICAgICBkZXBQcm9wcy5wdXNoKHBhcmFtTWV0YWRhdGEpO1xuICAgIH1cbiAgfVxuXG4gIHRva2VuID0gcmVzb2x2ZUZvcndhcmRSZWYodG9rZW4pO1xuXG4gIGlmIChpc1ByZXNlbnQodG9rZW4pKSB7XG4gICAgcmV0dXJuIF9jcmVhdGVEZXBlbmRlbmN5KHRva2VuLCBvcHRpb25hbCwgbG93ZXJCb3VuZFZpc2liaWxpdHksIHVwcGVyQm91bmRWaXNpYmlsaXR5LCBkZXBQcm9wcyk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IE5vQW5ub3RhdGlvbkVycm9yKHR5cGVPckZ1bmMsIHBhcmFtcyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZURlcGVuZGVuY3kodG9rZW4sIG9wdGlvbmFsLCBsb3dlckJvdW5kVmlzaWJpbGl0eSwgdXBwZXJCb3VuZFZpc2liaWxpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBQcm9wcyk6IERlcGVuZGVuY3kge1xuICByZXR1cm4gbmV3IERlcGVuZGVuY3koS2V5LmdldCh0b2tlbiksIG9wdGlvbmFsLCBsb3dlckJvdW5kVmlzaWJpbGl0eSwgdXBwZXJCb3VuZFZpc2liaWxpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXBQcm9wcyk7XG59XG4iXX0=