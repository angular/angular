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
    return new ResolvedProvider_(key_1.Key.get(provider.token), [resolveFactory(provider)], provider.multi);
}
exports.resolveProvider = resolveProvider;
/**
 * Resolve a list of Providers.
 */
function resolveProviders(providers) {
    var normalized = _normalizeProviders(providers, []);
    var resolved = normalized.map(resolveProvider);
    return collection_1.MapWrapper.values(mergeResolvedProviders(resolved, new Map()));
}
exports.resolveProviders = resolveProviders;
/**
 * Merges a list of ResolvedProviders into a list where
 * each key is contained exactly once and multi providers
 * have been merged.
 */
function mergeResolvedProviders(providers, normalizedProvidersMap) {
    for (var i = 0; i < providers.length; i++) {
        var provider = providers[i];
        var existing = normalizedProvidersMap.get(provider.key.id);
        if (lang_1.isPresent(existing)) {
            if (provider.multiProvider !== existing.multiProvider) {
                throw new exceptions_2.MixingMultiProvidersWithRegularProvidersError(existing, provider);
            }
            if (provider.multiProvider) {
                for (var j = 0; j < provider.resolvedFactories.length; j++) {
                    existing.resolvedFactories.push(provider.resolvedFactories[j]);
                }
            }
            else {
                normalizedProvidersMap.set(provider.key.id, provider);
            }
        }
        else {
            var resolvedProvider;
            if (provider.multiProvider) {
                resolvedProvider = new ResolvedProvider_(provider.key, collection_1.ListWrapper.clone(provider.resolvedFactories), provider.multiProvider);
            }
            else {
                resolvedProvider = provider;
            }
            normalizedProvidersMap.set(provider.key.id, resolvedProvider);
        }
    }
    return normalizedProvidersMap;
}
exports.mergeResolvedProviders = mergeResolvedProviders;
function _normalizeProviders(providers, res) {
    providers.forEach(function (b) {
        if (b instanceof lang_1.Type) {
            res.push(provide(b, { useClass: b }));
        }
        else if (b instanceof Provider) {
            res.push(b);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlci50cyJdLCJuYW1lcyI6WyJEZXBlbmRlbmN5IiwiRGVwZW5kZW5jeS5jb25zdHJ1Y3RvciIsIkRlcGVuZGVuY3kuZnJvbUtleSIsIlByb3ZpZGVyIiwiUHJvdmlkZXIuY29uc3RydWN0b3IiLCJQcm92aWRlci5tdWx0aSIsIkJpbmRpbmciLCJCaW5kaW5nLmNvbnN0cnVjdG9yIiwiQmluZGluZy50b0NsYXNzIiwiQmluZGluZy50b0FsaWFzIiwiQmluZGluZy50b0ZhY3RvcnkiLCJCaW5kaW5nLnRvVmFsdWUiLCJSZXNvbHZlZFByb3ZpZGVyXyIsIlJlc29sdmVkUHJvdmlkZXJfLmNvbnN0cnVjdG9yIiwiUmVzb2x2ZWRQcm92aWRlcl8ucmVzb2x2ZWRGYWN0b3J5IiwiUmVzb2x2ZWRGYWN0b3J5IiwiUmVzb2x2ZWRGYWN0b3J5LmNvbnN0cnVjdG9yIiwiYmluZCIsInByb3ZpZGUiLCJQcm92aWRlckJ1aWxkZXIiLCJQcm92aWRlckJ1aWxkZXIuY29uc3RydWN0b3IiLCJQcm92aWRlckJ1aWxkZXIudG9DbGFzcyIsIlByb3ZpZGVyQnVpbGRlci50b1ZhbHVlIiwiUHJvdmlkZXJCdWlsZGVyLnRvQWxpYXMiLCJQcm92aWRlckJ1aWxkZXIudG9GYWN0b3J5IiwicmVzb2x2ZUZhY3RvcnkiLCJyZXNvbHZlUHJvdmlkZXIiLCJyZXNvbHZlUHJvdmlkZXJzIiwibWVyZ2VSZXNvbHZlZFByb3ZpZGVycyIsIl9ub3JtYWxpemVQcm92aWRlcnMiLCJfY29uc3RydWN0RGVwZW5kZW5jaWVzIiwiX2RlcGVuZGVuY2llc0ZvciIsIl9leHRyYWN0VG9rZW4iLCJfY3JlYXRlRGVwZW5kZW5jeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQkFXTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLDJCQUE4QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQy9F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QUFDQTtJQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNOQSxNQUFNQSxJQUFJQSw4QkFBaUJBLENBQUNBLFVBQVVBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO0lBQ2xEQSxDQUFDQTtBQUNIQSxDQUFDQTtBQUVELDJCQUEyQixLQUFLLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixFQUFFLG9CQUFvQixFQUMzRCxRQUFRO0lBQ2pDQyxNQUFNQSxDQUFDQSxJQUFJQSxVQUFVQSxDQUFDQSxTQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxFQUFFQSxRQUFRQSxFQUFFQSxvQkFBb0JBLEVBQUVBLG9CQUFvQkEsRUFDcEVBLFFBQVFBLENBQUNBLENBQUNBO0FBQ2xDQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFR5cGUsXG4gIGlzQmxhbmssXG4gIGlzUHJlc2VudCxcbiAgQ09OU1QsXG4gIENPTlNUX0VYUFIsXG4gIHN0cmluZ2lmeSxcbiAgaXNBcnJheSxcbiAgaXNUeXBlLFxuICBpc0Z1bmN0aW9uLFxuICBub3JtYWxpemVCb29sXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge01hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge0tleX0gZnJvbSAnLi9rZXknO1xuaW1wb3J0IHtcbiAgSW5qZWN0TWV0YWRhdGEsXG4gIEluamVjdGFibGVNZXRhZGF0YSxcbiAgT3B0aW9uYWxNZXRhZGF0YSxcbiAgU2VsZk1ldGFkYXRhLFxuICBIb3N0TWV0YWRhdGEsXG4gIFNraXBTZWxmTWV0YWRhdGEsXG4gIERlcGVuZGVuY3lNZXRhZGF0YVxufSBmcm9tICcuL21ldGFkYXRhJztcbmltcG9ydCB7XG4gIE5vQW5ub3RhdGlvbkVycm9yLFxuICBNaXhpbmdNdWx0aVByb3ZpZGVyc1dpdGhSZWd1bGFyUHJvdmlkZXJzRXJyb3IsXG4gIEludmFsaWRQcm92aWRlckVycm9yXG59IGZyb20gJy4vZXhjZXB0aW9ucyc7XG5pbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmfSBmcm9tICcuL2ZvcndhcmRfcmVmJztcblxuLyoqXG4gKiBgRGVwZW5kZW5jeWAgaXMgdXNlZCBieSB0aGUgZnJhbWV3b3JrIHRvIGV4dGVuZCBESS5cbiAqIFRoaXMgaXMgaW50ZXJuYWwgdG8gQW5ndWxhciBhbmQgc2hvdWxkIG5vdCBiZSB1c2VkIGRpcmVjdGx5LlxuICovXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jeSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBrZXk6IEtleSwgcHVibGljIG9wdGlvbmFsOiBib29sZWFuLCBwdWJsaWMgbG93ZXJCb3VuZFZpc2liaWxpdHk6IGFueSxcbiAgICAgICAgICAgICAgcHVibGljIHVwcGVyQm91bmRWaXNpYmlsaXR5OiBhbnksIHB1YmxpYyBwcm9wZXJ0aWVzOiBhbnlbXSkge31cblxuICBzdGF0aWMgZnJvbUtleShrZXk6IEtleSk6IERlcGVuZGVuY3kgeyByZXR1cm4gbmV3IERlcGVuZGVuY3koa2V5LCBmYWxzZSwgbnVsbCwgbnVsbCwgW10pOyB9XG59XG5cbmNvbnN0IF9FTVBUWV9MSVNUID0gQ09OU1RfRVhQUihbXSk7XG5cbi8qKlxuICogRGVzY3JpYmVzIGhvdyB0aGUge0BsaW5rIEluamVjdG9yfSBzaG91bGQgaW5zdGFudGlhdGUgYSBnaXZlbiB0b2tlbi5cbiAqXG4gKiBTZWUge0BsaW5rIHByb3ZpZGV9LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9HTkF5ajZLNlBmWWcyTkJ6Z3daNT9wJTNEcHJldmlldyZwPXByZXZpZXcpKVxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICogICBuZXcgUHJvdmlkZXIoXCJtZXNzYWdlXCIsIHsgdXNlVmFsdWU6ICdIZWxsbycgfSlcbiAqIF0pO1xuICpcbiAqIGV4cGVjdChpbmplY3Rvci5nZXQoXCJtZXNzYWdlXCIpKS50b0VxdWFsKCdIZWxsbycpO1xuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgUHJvdmlkZXIge1xuICAvKipcbiAgICogVG9rZW4gdXNlZCB3aGVuIHJldHJpZXZpbmcgdGhpcyBwcm92aWRlci4gVXN1YWxseSwgaXQgaXMgYSB0eXBlIHtAbGluayBUeXBlfS5cbiAgICovXG4gIHRva2VuO1xuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGFuIGltcGxlbWVudGF0aW9uIGNsYXNzLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvUlNURzg2cWdtb3hDeWo5U1dQd1k/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogQmVjYXVzZSBgdXNlRXhpc3RpbmdgIGFuZCBgdXNlQ2xhc3NgIGFyZSBvZnRlbiBjb25mdXNlZCwgdGhlIGV4YW1wbGUgY29udGFpbnNcbiAgICogYm90aCB1c2UgY2FzZXMgZm9yIGVhc3kgY29tcGFyaXNvbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIGNsYXNzIENhciBleHRlbmRzIFZlaGljbGUge31cbiAgICpcbiAgICogdmFyIGluamVjdG9yQ2xhc3MgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgbmV3IFByb3ZpZGVyKFZlaGljbGUsIHsgdXNlQ2xhc3M6IENhciB9KVxuICAgKiBdKTtcbiAgICogdmFyIGluamVjdG9yQWxpYXMgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgbmV3IFByb3ZpZGVyKFZlaGljbGUsIHsgdXNlRXhpc3Rpbmc6IENhciB9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpKS5ub3QudG9CZShpbmplY3RvckNsYXNzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkpLnRvQmUoaW5qZWN0b3JBbGlhcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICB1c2VDbGFzczogVHlwZTtcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIHZhbHVlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvVUZWc01WUUlEZTdsNHdhV3ppRVM/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgamF2YXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBuZXcgUHJvdmlkZXIoXCJtZXNzYWdlXCIsIHsgdXNlVmFsdWU6ICdIZWxsbycgfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoXCJtZXNzYWdlXCIpKS50b0VxdWFsKCdIZWxsbycpO1xuICAgKiBgYGBcbiAgICovXG4gIHVzZVZhbHVlO1xuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGFuIGV4aXN0aW5nIHRva2VuLlxuICAgKlxuICAgKiB7QGxpbmsgSW5qZWN0b3J9IHJldHVybnMgdGhlIHNhbWUgaW5zdGFuY2UgYXMgaWYgdGhlIHByb3ZpZGVkIHRva2VuIHdhcyB1c2VkLlxuICAgKiBUaGlzIGlzIGluIGNvbnRyYXN0IHRvIGB1c2VDbGFzc2Agd2hlcmUgYSBzZXBhcmF0ZSBpbnN0YW5jZSBvZiBgdXNlQ2xhc3NgIGlzIHJldHVybmVkLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvUXNhdHNPSko2UDhUMmZNZTlncjg/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogQmVjYXVzZSBgdXNlRXhpc3RpbmdgIGFuZCBgdXNlQ2xhc3NgIGFyZSBvZnRlbiBjb25mdXNlZCB0aGUgZXhhbXBsZSBjb250YWluc1xuICAgKiBib3RoIHVzZSBjYXNlcyBmb3IgZWFzeSBjb21wYXJpc29uLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFZlaGljbGUge31cbiAgICpcbiAgICogY2xhc3MgQ2FyIGV4dGVuZHMgVmVoaWNsZSB7fVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3JBbGlhcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBuZXcgUHJvdmlkZXIoVmVoaWNsZSwgeyB1c2VFeGlzdGluZzogQ2FyIH0pXG4gICAqIF0pO1xuICAgKiB2YXIgaW5qZWN0b3JDbGFzcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBuZXcgUHJvdmlkZXIoVmVoaWNsZSwgeyB1c2VDbGFzczogQ2FyIH0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkpLnRvQmUoaW5qZWN0b3JBbGlhcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpKS5ub3QudG9CZShpbmplY3RvckNsYXNzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKiBgYGBcbiAgICovXG4gIHVzZUV4aXN0aW5nO1xuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGEgZnVuY3Rpb24gd2hpY2ggY29tcHV0ZXMgdGhlIHZhbHVlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvU2NveHkwcEpOcUtHQVBaWTFWVkM/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBuZXcgUHJvdmlkZXIoTnVtYmVyLCB7IHVzZUZhY3Rvcnk6ICgpID0+IHsgcmV0dXJuIDErMjsgfX0pLFxuICAgKiAgIG5ldyBQcm92aWRlcihTdHJpbmcsIHsgdXNlRmFjdG9yeTogKHZhbHVlKSA9PiB7IHJldHVybiBcIlZhbHVlOiBcIiArIHZhbHVlOyB9LFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgZGVwczogW051bWJlcl0gfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoTnVtYmVyKSkudG9FcXVhbCgzKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChTdHJpbmcpKS50b0VxdWFsKCdWYWx1ZTogMycpO1xuICAgKiBgYGBcbiAgICpcbiAgICogVXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGRlcGVuZGVuY2llcy5cbiAgICovXG4gIHVzZUZhY3Rvcnk6IEZ1bmN0aW9uO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgYSBzZXQgb2YgZGVwZW5kZW5jaWVzXG4gICAqIChhcyBgdG9rZW5gcykgd2hpY2ggc2hvdWxkIGJlIGluamVjdGVkIGludG8gdGhlIGZhY3RvcnkgZnVuY3Rpb24uXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9TY294eTBwSk5xS0dBUFpZMVZWQz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIG5ldyBQcm92aWRlcihOdW1iZXIsIHsgdXNlRmFjdG9yeTogKCkgPT4geyByZXR1cm4gMSsyOyB9fSksXG4gICAqICAgbmV3IFByb3ZpZGVyKFN0cmluZywgeyB1c2VGYWN0b3J5OiAodmFsdWUpID0+IHsgcmV0dXJuIFwiVmFsdWU6IFwiICsgdmFsdWU7IH0sXG4gICAqICAgICAgICAgICAgICAgICAgICAgICBkZXBzOiBbTnVtYmVyXSB9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChOdW1iZXIpKS50b0VxdWFsKDMpO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFN0cmluZykpLnRvRXF1YWwoJ1ZhbHVlOiAzJyk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBVc2VkIGluIGNvbmp1bmN0aW9uIHdpdGggYHVzZUZhY3RvcnlgLlxuICAgKi9cbiAgZGVwZW5kZW5jaWVzOiBPYmplY3RbXTtcblxuICAvKiogQGludGVybmFsICovXG4gIF9tdWx0aTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcih0b2tlbiwge3VzZUNsYXNzLCB1c2VWYWx1ZSwgdXNlRXhpc3RpbmcsIHVzZUZhY3RvcnksIGRlcHMsIG11bHRpfToge1xuICAgIHVzZUNsYXNzPzogVHlwZSxcbiAgICB1c2VWYWx1ZT86IGFueSxcbiAgICB1c2VFeGlzdGluZz86IGFueSxcbiAgICB1c2VGYWN0b3J5PzogRnVuY3Rpb24sXG4gICAgZGVwcz86IE9iamVjdFtdLFxuICAgIG11bHRpPzogYm9vbGVhblxuICB9KSB7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICAgIHRoaXMudXNlQ2xhc3MgPSB1c2VDbGFzcztcbiAgICB0aGlzLnVzZVZhbHVlID0gdXNlVmFsdWU7XG4gICAgdGhpcy51c2VFeGlzdGluZyA9IHVzZUV4aXN0aW5nO1xuICAgIHRoaXMudXNlRmFjdG9yeSA9IHVzZUZhY3Rvcnk7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBzO1xuICAgIHRoaXMuX211bHRpID0gbXVsdGk7XG4gIH1cblxuICAvLyBUT0RPOiBQcm92aWRlIGEgZnVsbCB3b3JraW5nIGV4YW1wbGUgYWZ0ZXIgYWxwaGEzOCBpcyByZWxlYXNlZC5cbiAgLyoqXG4gICAqIENyZWF0ZXMgbXVsdGlwbGUgcHJvdmlkZXJzIG1hdGNoaW5nIHRoZSBzYW1lIHRva2VuIChhIG11bHRpLXByb3ZpZGVyKS5cbiAgICpcbiAgICogTXVsdGktcHJvdmlkZXJzIGFyZSB1c2VkIGZvciBjcmVhdGluZyBwbHVnZ2FibGUgc2VydmljZSwgd2hlcmUgdGhlIHN5c3RlbSBjb21lc1xuICAgKiB3aXRoIHNvbWUgZGVmYXVsdCBwcm92aWRlcnMsIGFuZCB0aGUgdXNlciBjYW4gcmVnaXN0ZXIgYWRkaXRpb25hbCBwcm92aWRlcnMuXG4gICAqIFRoZSBjb21iaW5hdGlvbiBvZiB0aGUgZGVmYXVsdCBwcm92aWRlcnMgYW5kIHRoZSBhZGRpdGlvbmFsIHByb3ZpZGVycyB3aWxsIGJlXG4gICAqIHVzZWQgdG8gZHJpdmUgdGhlIGJlaGF2aW9yIG9mIHRoZSBzeXN0ZW0uXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7IHVzZVZhbHVlOiBcIlN0cmluZzFcIiwgbXVsdGk6IHRydWV9KSxcbiAgICogICBuZXcgUHJvdmlkZXIoXCJTdHJpbmdzXCIsIHsgdXNlVmFsdWU6IFwiU3RyaW5nMlwiLCBtdWx0aTogdHJ1ZX0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFwiU3RyaW5nc1wiKSkudG9FcXVhbChbXCJTdHJpbmcxXCIsIFwiU3RyaW5nMlwiXSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBNdWx0aS1wcm92aWRlcnMgYW5kIHJlZ3VsYXIgcHJvdmlkZXJzIGNhbm5vdCBiZSBtaXhlZC4gVGhlIGZvbGxvd2luZ1xuICAgKiB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbjpcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBuZXcgUHJvdmlkZXIoXCJTdHJpbmdzXCIsIHsgdXNlVmFsdWU6IFwiU3RyaW5nMVwiLCBtdWx0aTogdHJ1ZSB9KSxcbiAgICogICBuZXcgUHJvdmlkZXIoXCJTdHJpbmdzXCIsIHsgdXNlVmFsdWU6IFwiU3RyaW5nMlwifSlcbiAgICogXSk7XG4gICAqIGBgYFxuICAgKi9cbiAgZ2V0IG11bHRpKCk6IGJvb2xlYW4geyByZXR1cm4gbm9ybWFsaXplQm9vbCh0aGlzLl9tdWx0aSk7IH1cbn1cblxuLyoqXG4gKiBTZWUge0BsaW5rIFByb3ZpZGVyfSBpbnN0ZWFkLlxuICpcbiAqIEBkZXByZWNhdGVkXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQmluZGluZyBleHRlbmRzIFByb3ZpZGVyIHtcbiAgY29uc3RydWN0b3IodG9rZW4sIHt0b0NsYXNzLCB0b1ZhbHVlLCB0b0FsaWFzLCB0b0ZhY3RvcnksIGRlcHMsIG11bHRpfToge1xuICAgIHRvQ2xhc3M/OiBUeXBlLFxuICAgIHRvVmFsdWU/OiBhbnksXG4gICAgdG9BbGlhcz86IGFueSxcbiAgICB0b0ZhY3Rvcnk6IEZ1bmN0aW9uLCBkZXBzPzogT2JqZWN0W10sIG11bHRpPzogYm9vbGVhblxuICB9KSB7XG4gICAgc3VwZXIodG9rZW4sIHtcbiAgICAgIHVzZUNsYXNzOiB0b0NsYXNzLFxuICAgICAgdXNlVmFsdWU6IHRvVmFsdWUsXG4gICAgICB1c2VFeGlzdGluZzogdG9BbGlhcyxcbiAgICAgIHVzZUZhY3Rvcnk6IHRvRmFjdG9yeSxcbiAgICAgIGRlcHM6IGRlcHMsXG4gICAgICBtdWx0aTogbXVsdGlcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgZ2V0IHRvQ2xhc3MoKSB7IHJldHVybiB0aGlzLnVzZUNsYXNzOyB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBnZXQgdG9BbGlhcygpIHsgcmV0dXJuIHRoaXMudXNlRXhpc3Rpbmc7IH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdldCB0b0ZhY3RvcnkoKSB7IHJldHVybiB0aGlzLnVzZUZhY3Rvcnk7IH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdldCB0b1ZhbHVlKCkgeyByZXR1cm4gdGhpcy51c2VWYWx1ZTsgfVxufVxuXG4vKipcbiAqIEFuIGludGVybmFsIHJlc29sdmVkIHJlcHJlc2VudGF0aW9uIG9mIGEge0BsaW5rIFByb3ZpZGVyfSB1c2VkIGJ5IHRoZSB7QGxpbmsgSW5qZWN0b3J9LlxuICpcbiAqIEl0IGlzIHVzdWFsbHkgY3JlYXRlZCBhdXRvbWF0aWNhbGx5IGJ5IGBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlYC5cbiAqXG4gKiBJdCBjYW4gYmUgY3JlYXRlZCBtYW51YWxseSwgYXMgZm9sbG93czpcbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvUmZFbmhoOGtVRUkwRzNxc25JZVQ/cCUzRHByZXZpZXcmcD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB2YXIgcmVzb2x2ZWRQcm92aWRlcnMgPSBJbmplY3Rvci5yZXNvbHZlKFtuZXcgUHJvdmlkZXIoJ21lc3NhZ2UnLCB7dXNlVmFsdWU6ICdIZWxsbyd9KV0pO1xuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IuZnJvbVJlc29sdmVkUHJvdmlkZXJzKHJlc29sdmVkUHJvdmlkZXJzKTtcbiAqXG4gKiBleHBlY3QoaW5qZWN0b3IuZ2V0KCdtZXNzYWdlJykpLnRvRXF1YWwoJ0hlbGxvJyk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXNvbHZlZFByb3ZpZGVyIHtcbiAgLyoqXG4gICAqIEEga2V5LCB1c3VhbGx5IGEgYFR5cGVgLlxuICAgKi9cbiAga2V5OiBLZXk7XG5cbiAgLyoqXG4gICAqIEZhY3RvcnkgZnVuY3Rpb24gd2hpY2ggY2FuIHJldHVybiBhbiBpbnN0YW5jZSBvZiBhbiBvYmplY3QgcmVwcmVzZW50ZWQgYnkgYSBrZXkuXG4gICAqL1xuICByZXNvbHZlZEZhY3RvcmllczogUmVzb2x2ZWRGYWN0b3J5W107XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyBpZiB0aGUgcHJvdmlkZXIgaXMgYSBtdWx0aS1wcm92aWRlciBvciBhIHJlZ3VsYXIgcHJvdmlkZXIuXG4gICAqL1xuICBtdWx0aVByb3ZpZGVyOiBib29sZWFuO1xufVxuXG4vKipcbiAqIFNlZSB7QGxpbmsgUmVzb2x2ZWRQcm92aWRlcn0gaW5zdGVhZC5cbiAqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlc29sdmVkQmluZGluZyBleHRlbmRzIFJlc29sdmVkUHJvdmlkZXIge31cblxuZXhwb3J0IGNsYXNzIFJlc29sdmVkUHJvdmlkZXJfIGltcGxlbWVudHMgUmVzb2x2ZWRCaW5kaW5nIHtcbiAgY29uc3RydWN0b3IocHVibGljIGtleTogS2V5LCBwdWJsaWMgcmVzb2x2ZWRGYWN0b3JpZXM6IFJlc29sdmVkRmFjdG9yeVtdLFxuICAgICAgICAgICAgICBwdWJsaWMgbXVsdGlQcm92aWRlcjogYm9vbGVhbikge31cblxuICBnZXQgcmVzb2x2ZWRGYWN0b3J5KCk6IFJlc29sdmVkRmFjdG9yeSB7IHJldHVybiB0aGlzLnJlc29sdmVkRmFjdG9yaWVzWzBdOyB9XG59XG5cbi8qKlxuICogQW4gaW50ZXJuYWwgcmVzb2x2ZWQgcmVwcmVzZW50YXRpb24gb2YgYSBmYWN0b3J5IGZ1bmN0aW9uIGNyZWF0ZWQgYnkgcmVzb2x2aW5nIHtAbGluayBQcm92aWRlcn0uXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNvbHZlZEZhY3Rvcnkge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKlxuICAgICAgICogRmFjdG9yeSBmdW5jdGlvbiB3aGljaCBjYW4gcmV0dXJuIGFuIGluc3RhbmNlIG9mIGFuIG9iamVjdCByZXByZXNlbnRlZCBieSBhIGtleS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGZhY3Rvcnk6IEZ1bmN0aW9uLFxuXG4gICAgICAvKipcbiAgICAgICAqIEFyZ3VtZW50cyAoZGVwZW5kZW5jaWVzKSB0byB0aGUgYGZhY3RvcnlgIGZ1bmN0aW9uLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgZGVwZW5kZW5jaWVzOiBEZXBlbmRlbmN5W10pIHt9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBQcm92aWRlcn0uXG4gKlxuICogVG8gY29uc3RydWN0IGEge0BsaW5rIFByb3ZpZGVyfSwgYmluZCBhIGB0b2tlbmAgdG8gZWl0aGVyIGEgY2xhc3MsIGEgdmFsdWUsIGEgZmFjdG9yeSBmdW5jdGlvbixcbiAqIG9yXG4gKiB0byBhbiBleGlzdGluZyBgdG9rZW5gLlxuICogU2VlIHtAbGluayBQcm92aWRlckJ1aWxkZXJ9IGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogVGhlIGB0b2tlbmAgaXMgbW9zdCBjb21tb25seSBhIGNsYXNzIG9yIHtAbGluayBhbmd1bGFyMi9kaS9PcGFxdWVUb2tlbn0uXG4gKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmQodG9rZW4pOiBQcm92aWRlckJ1aWxkZXIge1xuICByZXR1cm4gbmV3IFByb3ZpZGVyQnVpbGRlcih0b2tlbik7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBQcm92aWRlcn0uXG4gKlxuICogU2VlIHtAbGluayBQcm92aWRlcn0gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiA8IS0tIFRPRE86IGltcHJvdmUgdGhlIGRvY3MgLS0+XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlKHRva2VuLCB7dXNlQ2xhc3MsIHVzZVZhbHVlLCB1c2VFeGlzdGluZywgdXNlRmFjdG9yeSwgZGVwcywgbXVsdGl9OiB7XG4gIHVzZUNsYXNzPzogVHlwZSxcbiAgdXNlVmFsdWU/OiBhbnksXG4gIHVzZUV4aXN0aW5nPzogYW55LFxuICB1c2VGYWN0b3J5PzogRnVuY3Rpb24sXG4gIGRlcHM/OiBPYmplY3RbXSxcbiAgbXVsdGk/OiBib29sZWFuXG59KTogUHJvdmlkZXIge1xuICByZXR1cm4gbmV3IFByb3ZpZGVyKHRva2VuLCB7XG4gICAgdXNlQ2xhc3M6IHVzZUNsYXNzLFxuICAgIHVzZVZhbHVlOiB1c2VWYWx1ZSxcbiAgICB1c2VFeGlzdGluZzogdXNlRXhpc3RpbmcsXG4gICAgdXNlRmFjdG9yeTogdXNlRmFjdG9yeSxcbiAgICBkZXBzOiBkZXBzLFxuICAgIG11bHRpOiBtdWx0aVxuICB9KTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgZm9yIHRoZSB7QGxpbmsgYmluZH0gZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm92aWRlckJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG9rZW4pIHt9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSBjbGFzcy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1pwQkNTWXF2NmUydWQ1S1hMZHhRP3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHRvQWxpYXNgIGFuZCBgdG9DbGFzc2AgYXJlIG9mdGVuIGNvbmZ1c2VkLCB0aGUgZXhhbXBsZSBjb250YWluc1xuICAgKiBib3RoIHVzZSBjYXNlcyBmb3IgZWFzeSBjb21wYXJpc29uLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFZlaGljbGUge31cbiAgICpcbiAgICogY2xhc3MgQ2FyIGV4dGVuZHMgVmVoaWNsZSB7fVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3JDbGFzcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBwcm92aWRlKFZlaGljbGUsIHt1c2VDbGFzczogQ2FyfSlcbiAgICogXSk7XG4gICAqIHZhciBpbmplY3RvckFsaWFzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIHByb3ZpZGUoVmVoaWNsZSwge3VzZUV4aXN0aW5nOiBDYXJ9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpKS5ub3QudG9CZShpbmplY3RvckNsYXNzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkpLnRvQmUoaW5qZWN0b3JBbGlhcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICB0b0NsYXNzKHR5cGU6IFR5cGUpOiBQcm92aWRlciB7XG4gICAgaWYgKCFpc1R5cGUodHlwZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBUcnlpbmcgdG8gY3JlYXRlIGEgY2xhc3MgcHJvdmlkZXIgYnV0IFwiJHtzdHJpbmdpZnkodHlwZSl9XCIgaXMgbm90IGEgY2xhc3MhYCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvdmlkZXIodGhpcy50b2tlbiwge3VzZUNsYXNzOiB0eXBlfSk7XG4gIH1cblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIHZhbHVlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvRzAyNFBGSG1ETDBjSkZnZlpLOE8/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBwcm92aWRlKCdtZXNzYWdlJywge3VzZVZhbHVlOiAnSGVsbG8nfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoJ21lc3NhZ2UnKSkudG9FcXVhbCgnSGVsbG8nKTtcbiAgICogYGBgXG4gICAqL1xuICB0b1ZhbHVlKHZhbHVlOiBhbnkpOiBQcm92aWRlciB7IHJldHVybiBuZXcgUHJvdmlkZXIodGhpcy50b2tlbiwge3VzZVZhbHVlOiB2YWx1ZX0pOyB9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYW4gZXhpc3RpbmcgdG9rZW4uXG4gICAqXG4gICAqIEFuZ3VsYXIgd2lsbCByZXR1cm4gdGhlIHNhbWUgaW5zdGFuY2UgYXMgaWYgdGhlIHByb3ZpZGVkIHRva2VuIHdhcyB1c2VkLiAoVGhpcyBpc1xuICAgKiBpbiBjb250cmFzdCB0byBgdXNlQ2xhc3NgIHdoZXJlIGEgc2VwYXJhdGUgaW5zdGFuY2Ugb2YgYHVzZUNsYXNzYCB3aWxsIGJlIHJldHVybmVkLilcbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3VCYW9GMnBONWNmYzVBZlphcE53P3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHRvQWxpYXNgIGFuZCBgdG9DbGFzc2AgYXJlIG9mdGVuIGNvbmZ1c2VkLCB0aGUgZXhhbXBsZSBjb250YWluc1xuICAgKiBib3RoIHVzZSBjYXNlcyBmb3IgZWFzeSBjb21wYXJpc29uLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFZlaGljbGUge31cbiAgICpcbiAgICogY2xhc3MgQ2FyIGV4dGVuZHMgVmVoaWNsZSB7fVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3JBbGlhcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBwcm92aWRlKFZlaGljbGUsIHt1c2VFeGlzdGluZzogQ2FyfSlcbiAgICogXSk7XG4gICAqIHZhciBpbmplY3RvckNsYXNzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIHByb3ZpZGUoVmVoaWNsZSwge3VzZUNsYXNzOiBDYXJ9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpKS50b0JlKGluamVjdG9yQWxpYXMuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSkubm90LnRvQmUoaW5qZWN0b3JDbGFzcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICB0b0FsaWFzKGFsaWFzVG9rZW46IC8qVHlwZSovIGFueSk6IFByb3ZpZGVyIHtcbiAgICBpZiAoaXNCbGFuayhhbGlhc1Rva2VuKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbiBub3QgYWxpYXMgJHtzdHJpbmdpZnkodGhpcy50b2tlbil9IHRvIGEgYmxhbmsgdmFsdWUhYCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvdmlkZXIodGhpcy50b2tlbiwge3VzZUV4aXN0aW5nOiBhbGlhc1Rva2VufSk7XG4gIH1cblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIGZ1bmN0aW9uIHdoaWNoIGNvbXB1dGVzIHRoZSB2YWx1ZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L09lak5JZlRUM3piMWlCeGFJWU9iP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgcHJvdmlkZShOdW1iZXIsIHt1c2VGYWN0b3J5OiAoKSA9PiB7IHJldHVybiAxKzI7IH19KSxcbiAgICogICBwcm92aWRlKFN0cmluZywge3VzZUZhY3Rvcnk6ICh2KSA9PiB7IHJldHVybiBcIlZhbHVlOiBcIiArIHY7IH0sIGRlcHM6IFtOdW1iZXJdfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoTnVtYmVyKSkudG9FcXVhbCgzKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChTdHJpbmcpKS50b0VxdWFsKCdWYWx1ZTogMycpO1xuICAgKiBgYGBcbiAgICovXG4gIHRvRmFjdG9yeShmYWN0b3J5OiBGdW5jdGlvbiwgZGVwZW5kZW5jaWVzPzogYW55W10pOiBQcm92aWRlciB7XG4gICAgaWYgKCFpc0Z1bmN0aW9uKGZhY3RvcnkpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgVHJ5aW5nIHRvIGNyZWF0ZSBhIGZhY3RvcnkgcHJvdmlkZXIgYnV0IFwiJHtzdHJpbmdpZnkoZmFjdG9yeSl9XCIgaXMgbm90IGEgZnVuY3Rpb24hYCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvdmlkZXIodGhpcy50b2tlbiwge3VzZUZhY3Rvcnk6IGZhY3RvcnksIGRlcHM6IGRlcGVuZGVuY2llc30pO1xuICB9XG59XG5cbi8qKlxuICogUmVzb2x2ZSBhIHNpbmdsZSBwcm92aWRlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVGYWN0b3J5KHByb3ZpZGVyOiBQcm92aWRlcik6IFJlc29sdmVkRmFjdG9yeSB7XG4gIHZhciBmYWN0b3J5Rm46IEZ1bmN0aW9uO1xuICB2YXIgcmVzb2x2ZWREZXBzO1xuICBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUNsYXNzKSkge1xuICAgIHZhciB1c2VDbGFzcyA9IHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyLnVzZUNsYXNzKTtcbiAgICBmYWN0b3J5Rm4gPSByZWZsZWN0b3IuZmFjdG9yeSh1c2VDbGFzcyk7XG4gICAgcmVzb2x2ZWREZXBzID0gX2RlcGVuZGVuY2llc0Zvcih1c2VDbGFzcyk7XG4gIH0gZWxzZSBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUV4aXN0aW5nKSkge1xuICAgIGZhY3RvcnlGbiA9IChhbGlhc0luc3RhbmNlKSA9PiBhbGlhc0luc3RhbmNlO1xuICAgIHJlc29sdmVkRGVwcyA9IFtEZXBlbmRlbmN5LmZyb21LZXkoS2V5LmdldChwcm92aWRlci51c2VFeGlzdGluZykpXTtcbiAgfSBlbHNlIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlRmFjdG9yeSkpIHtcbiAgICBmYWN0b3J5Rm4gPSBwcm92aWRlci51c2VGYWN0b3J5O1xuICAgIHJlc29sdmVkRGVwcyA9IF9jb25zdHJ1Y3REZXBlbmRlbmNpZXMocHJvdmlkZXIudXNlRmFjdG9yeSwgcHJvdmlkZXIuZGVwZW5kZW5jaWVzKTtcbiAgfSBlbHNlIHtcbiAgICBmYWN0b3J5Rm4gPSAoKSA9PiBwcm92aWRlci51c2VWYWx1ZTtcbiAgICByZXNvbHZlZERlcHMgPSBfRU1QVFlfTElTVDtcbiAgfVxuICByZXR1cm4gbmV3IFJlc29sdmVkRmFjdG9yeShmYWN0b3J5Rm4sIHJlc29sdmVkRGVwcyk7XG59XG5cbi8qKlxuICogQ29udmVydHMgdGhlIHtAbGluayBQcm92aWRlcn0gaW50byB7QGxpbmsgUmVzb2x2ZWRQcm92aWRlcn0uXG4gKlxuICoge0BsaW5rIEluamVjdG9yfSBpbnRlcm5hbGx5IG9ubHkgdXNlcyB7QGxpbmsgUmVzb2x2ZWRQcm92aWRlcn0sIHtAbGluayBQcm92aWRlcn0gY29udGFpbnNcbiAqIGNvbnZlbmllbmNlIHByb3ZpZGVyIHN5bnRheC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQcm92aWRlcihwcm92aWRlcjogUHJvdmlkZXIpOiBSZXNvbHZlZFByb3ZpZGVyIHtcbiAgcmV0dXJuIG5ldyBSZXNvbHZlZFByb3ZpZGVyXyhLZXkuZ2V0KHByb3ZpZGVyLnRva2VuKSwgW3Jlc29sdmVGYWN0b3J5KHByb3ZpZGVyKV0sIHByb3ZpZGVyLm11bHRpKTtcbn1cblxuLyoqXG4gKiBSZXNvbHZlIGEgbGlzdCBvZiBQcm92aWRlcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlUHJvdmlkZXJzKHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUmVzb2x2ZWRQcm92aWRlcltdIHtcbiAgdmFyIG5vcm1hbGl6ZWQgPSBfbm9ybWFsaXplUHJvdmlkZXJzKHByb3ZpZGVycywgW10pO1xuICB2YXIgcmVzb2x2ZWQgPSBub3JtYWxpemVkLm1hcChyZXNvbHZlUHJvdmlkZXIpO1xuICByZXR1cm4gTWFwV3JhcHBlci52YWx1ZXMobWVyZ2VSZXNvbHZlZFByb3ZpZGVycyhyZXNvbHZlZCwgbmV3IE1hcDxudW1iZXIsIFJlc29sdmVkUHJvdmlkZXI+KCkpKTtcbn1cblxuLyoqXG4gKiBNZXJnZXMgYSBsaXN0IG9mIFJlc29sdmVkUHJvdmlkZXJzIGludG8gYSBsaXN0IHdoZXJlXG4gKiBlYWNoIGtleSBpcyBjb250YWluZWQgZXhhY3RseSBvbmNlIGFuZCBtdWx0aSBwcm92aWRlcnNcbiAqIGhhdmUgYmVlbiBtZXJnZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVJlc29sdmVkUHJvdmlkZXJzKFxuICAgIHByb3ZpZGVyczogUmVzb2x2ZWRQcm92aWRlcltdLFxuICAgIG5vcm1hbGl6ZWRQcm92aWRlcnNNYXA6IE1hcDxudW1iZXIsIFJlc29sdmVkUHJvdmlkZXI+KTogTWFwPG51bWJlciwgUmVzb2x2ZWRQcm92aWRlcj4ge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBwcm92aWRlciA9IHByb3ZpZGVyc1tpXTtcbiAgICB2YXIgZXhpc3RpbmcgPSBub3JtYWxpemVkUHJvdmlkZXJzTWFwLmdldChwcm92aWRlci5rZXkuaWQpO1xuICAgIGlmIChpc1ByZXNlbnQoZXhpc3RpbmcpKSB7XG4gICAgICBpZiAocHJvdmlkZXIubXVsdGlQcm92aWRlciAhPT0gZXhpc3RpbmcubXVsdGlQcm92aWRlcikge1xuICAgICAgICB0aHJvdyBuZXcgTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9yKGV4aXN0aW5nLCBwcm92aWRlcik7XG4gICAgICB9XG4gICAgICBpZiAocHJvdmlkZXIubXVsdGlQcm92aWRlcikge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHByb3ZpZGVyLnJlc29sdmVkRmFjdG9yaWVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgZXhpc3RpbmcucmVzb2x2ZWRGYWN0b3JpZXMucHVzaChwcm92aWRlci5yZXNvbHZlZEZhY3Rvcmllc1tqXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vcm1hbGl6ZWRQcm92aWRlcnNNYXAuc2V0KHByb3ZpZGVyLmtleS5pZCwgcHJvdmlkZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmVzb2x2ZWRQcm92aWRlcjtcbiAgICAgIGlmIChwcm92aWRlci5tdWx0aVByb3ZpZGVyKSB7XG4gICAgICAgIHJlc29sdmVkUHJvdmlkZXIgPSBuZXcgUmVzb2x2ZWRQcm92aWRlcl8oXG4gICAgICAgICAgICBwcm92aWRlci5rZXksIExpc3RXcmFwcGVyLmNsb25lKHByb3ZpZGVyLnJlc29sdmVkRmFjdG9yaWVzKSwgcHJvdmlkZXIubXVsdGlQcm92aWRlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlZFByb3ZpZGVyID0gcHJvdmlkZXI7XG4gICAgICB9XG4gICAgICBub3JtYWxpemVkUHJvdmlkZXJzTWFwLnNldChwcm92aWRlci5rZXkuaWQsIHJlc29sdmVkUHJvdmlkZXIpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbm9ybWFsaXplZFByb3ZpZGVyc01hcDtcbn1cblxuZnVuY3Rpb24gX25vcm1hbGl6ZVByb3ZpZGVycyhwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IFByb3ZpZGVyQnVpbGRlciB8IGFueVtdPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzOiBQcm92aWRlcltdKTogUHJvdmlkZXJbXSB7XG4gIHByb3ZpZGVycy5mb3JFYWNoKGIgPT4ge1xuICAgIGlmIChiIGluc3RhbmNlb2YgVHlwZSkge1xuICAgICAgcmVzLnB1c2gocHJvdmlkZShiLCB7dXNlQ2xhc3M6IGJ9KSk7XG5cbiAgICB9IGVsc2UgaWYgKGIgaW5zdGFuY2VvZiBQcm92aWRlcikge1xuICAgICAgcmVzLnB1c2goYik7XG5cbiAgICB9IGVsc2UgaWYgKGIgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgX25vcm1hbGl6ZVByb3ZpZGVycyhiLCByZXMpO1xuXG4gICAgfSBlbHNlIGlmIChiIGluc3RhbmNlb2YgUHJvdmlkZXJCdWlsZGVyKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFByb3ZpZGVyRXJyb3IoYi50b2tlbik7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQcm92aWRlckVycm9yKGIpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gX2NvbnN0cnVjdERlcGVuZGVuY2llcyhmYWN0b3J5RnVuY3Rpb246IEZ1bmN0aW9uLCBkZXBlbmRlbmNpZXM6IGFueVtdKTogRGVwZW5kZW5jeVtdIHtcbiAgaWYgKGlzQmxhbmsoZGVwZW5kZW5jaWVzKSkge1xuICAgIHJldHVybiBfZGVwZW5kZW5jaWVzRm9yKGZhY3RvcnlGdW5jdGlvbik7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcmFtczogYW55W11bXSA9IGRlcGVuZGVuY2llcy5tYXAodCA9PiBbdF0pO1xuICAgIHJldHVybiBkZXBlbmRlbmNpZXMubWFwKHQgPT4gX2V4dHJhY3RUb2tlbihmYWN0b3J5RnVuY3Rpb24sIHQsIHBhcmFtcykpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9kZXBlbmRlbmNpZXNGb3IodHlwZU9yRnVuYyk6IERlcGVuZGVuY3lbXSB7XG4gIHZhciBwYXJhbXMgPSByZWZsZWN0b3IucGFyYW1ldGVycyh0eXBlT3JGdW5jKTtcbiAgaWYgKGlzQmxhbmsocGFyYW1zKSkgcmV0dXJuIFtdO1xuICBpZiAocGFyYW1zLnNvbWUoaXNCbGFuaykpIHtcbiAgICB0aHJvdyBuZXcgTm9Bbm5vdGF0aW9uRXJyb3IodHlwZU9yRnVuYywgcGFyYW1zKTtcbiAgfVxuICByZXR1cm4gcGFyYW1zLm1hcCgocDogYW55W10pID0+IF9leHRyYWN0VG9rZW4odHlwZU9yRnVuYywgcCwgcGFyYW1zKSk7XG59XG5cbmZ1bmN0aW9uIF9leHRyYWN0VG9rZW4odHlwZU9yRnVuYywgbWV0YWRhdGEgLyphbnlbXSB8IGFueSovLCBwYXJhbXM6IGFueVtdW10pOiBEZXBlbmRlbmN5IHtcbiAgdmFyIGRlcFByb3BzID0gW107XG4gIHZhciB0b2tlbiA9IG51bGw7XG4gIHZhciBvcHRpb25hbCA9IGZhbHNlO1xuXG4gIGlmICghaXNBcnJheShtZXRhZGF0YSkpIHtcbiAgICBpZiAobWV0YWRhdGEgaW5zdGFuY2VvZiBJbmplY3RNZXRhZGF0YSkge1xuICAgICAgcmV0dXJuIF9jcmVhdGVEZXBlbmRlbmN5KG1ldGFkYXRhLnRva2VuLCBvcHRpb25hbCwgbnVsbCwgbnVsbCwgZGVwUHJvcHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gX2NyZWF0ZURlcGVuZGVuY3kobWV0YWRhdGEsIG9wdGlvbmFsLCBudWxsLCBudWxsLCBkZXBQcm9wcyk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGxvd2VyQm91bmRWaXNpYmlsaXR5ID0gbnVsbDtcbiAgdmFyIHVwcGVyQm91bmRWaXNpYmlsaXR5ID0gbnVsbDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1ldGFkYXRhLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHBhcmFtTWV0YWRhdGEgPSBtZXRhZGF0YVtpXTtcblxuICAgIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgVHlwZSkge1xuICAgICAgdG9rZW4gPSBwYXJhbU1ldGFkYXRhO1xuXG4gICAgfSBlbHNlIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgSW5qZWN0TWV0YWRhdGEpIHtcbiAgICAgIHRva2VuID0gcGFyYW1NZXRhZGF0YS50b2tlbjtcblxuICAgIH0gZWxzZSBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIE9wdGlvbmFsTWV0YWRhdGEpIHtcbiAgICAgIG9wdGlvbmFsID0gdHJ1ZTtcblxuICAgIH0gZWxzZSBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIFNlbGZNZXRhZGF0YSkge1xuICAgICAgdXBwZXJCb3VuZFZpc2liaWxpdHkgPSBwYXJhbU1ldGFkYXRhO1xuXG4gICAgfSBlbHNlIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgSG9zdE1ldGFkYXRhKSB7XG4gICAgICB1cHBlckJvdW5kVmlzaWJpbGl0eSA9IHBhcmFtTWV0YWRhdGE7XG5cbiAgICB9IGVsc2UgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBTa2lwU2VsZk1ldGFkYXRhKSB7XG4gICAgICBsb3dlckJvdW5kVmlzaWJpbGl0eSA9IHBhcmFtTWV0YWRhdGE7XG5cbiAgICB9IGVsc2UgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBEZXBlbmRlbmN5TWV0YWRhdGEpIHtcbiAgICAgIGlmIChpc1ByZXNlbnQocGFyYW1NZXRhZGF0YS50b2tlbikpIHtcbiAgICAgICAgdG9rZW4gPSBwYXJhbU1ldGFkYXRhLnRva2VuO1xuICAgICAgfVxuICAgICAgZGVwUHJvcHMucHVzaChwYXJhbU1ldGFkYXRhKTtcbiAgICB9XG4gIH1cblxuICB0b2tlbiA9IHJlc29sdmVGb3J3YXJkUmVmKHRva2VuKTtcblxuICBpZiAoaXNQcmVzZW50KHRva2VuKSkge1xuICAgIHJldHVybiBfY3JlYXRlRGVwZW5kZW5jeSh0b2tlbiwgb3B0aW9uYWwsIGxvd2VyQm91bmRWaXNpYmlsaXR5LCB1cHBlckJvdW5kVmlzaWJpbGl0eSwgZGVwUHJvcHMpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBOb0Fubm90YXRpb25FcnJvcih0eXBlT3JGdW5jLCBwYXJhbXMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVEZXBlbmRlbmN5KHRva2VuLCBvcHRpb25hbCwgbG93ZXJCb3VuZFZpc2liaWxpdHksIHVwcGVyQm91bmRWaXNpYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwUHJvcHMpOiBEZXBlbmRlbmN5IHtcbiAgcmV0dXJuIG5ldyBEZXBlbmRlbmN5KEtleS5nZXQodG9rZW4pLCBvcHRpb25hbCwgbG93ZXJCb3VuZFZpc2liaWxpdHksIHVwcGVyQm91bmRWaXNpYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwUHJvcHMpO1xufVxuIl19