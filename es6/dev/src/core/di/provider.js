var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Type, isBlank, isPresent, CONST, CONST_EXPR, stringify, isArray, isType, isFunction, normalizeBool } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { MapWrapper } from 'angular2/src/facade/collection';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { Key } from './key';
import { InjectMetadata, OptionalMetadata, SelfMetadata, HostMetadata, SkipSelfMetadata, DependencyMetadata } from './metadata';
import { NoAnnotationError, MixingMultiProvidersWithRegularProvidersError, InvalidProviderError } from './exceptions';
import { resolveForwardRef } from './forward_ref';
export class Dependency {
    constructor(key, optional, lowerBoundVisibility, upperBoundVisibility, properties) {
        this.key = key;
        this.optional = optional;
        this.lowerBoundVisibility = lowerBoundVisibility;
        this.upperBoundVisibility = upperBoundVisibility;
        this.properties = properties;
    }
    static fromKey(key) { return new Dependency(key, false, null, null, []); }
}
const _EMPTY_LIST = CONST_EXPR([]);
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
export let Provider = class {
    constructor(token, { useClass, useValue, useExisting, useFactory, deps, multi }) {
        this.token = token;
        this.useClass = useClass;
        this.useValue = useValue;
        this.useExisting = useExisting;
        this.useFactory = useFactory;
        this.dependencies = deps;
        this._multi = multi;
    }
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
    get multi() { return normalizeBool(this._multi); }
};
Provider = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object, Object])
], Provider);
/**
 * @deprecated
 */
export let Binding = class extends Provider {
    constructor(token, { toClass, toValue, toAlias, toFactory, deps, multi }) {
        super(token, {
            useClass: toClass,
            useValue: toValue,
            useExisting: toAlias,
            useFactory: toFactory,
            deps: deps,
            multi: multi
        });
    }
    /**
     * @deprecated
     */
    get toClass() { return this.useClass; }
    /**
     * @deprecated
     */
    get toAlias() { return this.useExisting; }
    /**
     * @deprecated
     */
    get toFactory() { return this.useFactory; }
    /**
     * @deprecated
     */
    get toValue() { return this.useValue; }
};
Binding = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object, Object])
], Binding);
export class ResolvedProvider_ {
    constructor(key, resolvedFactories, multiProvider) {
        this.key = key;
        this.resolvedFactories = resolvedFactories;
        this.multiProvider = multiProvider;
    }
    get resolvedFactory() { return this.resolvedFactories[0]; }
}
/**
 * An internal resolved representation of a factory function created by resolving {@link Provider}.
 */
export class ResolvedFactory {
    constructor(
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
}
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
export function bind(token) {
    return new ProviderBuilder(token);
}
/**
 * Creates a {@link Provider}.
 *
 * See {@link Provider} for more details.
 *
 * <!-- TODO: improve the docs -->
 */
export function provide(token, { useClass, useValue, useExisting, useFactory, deps, multi }) {
    return new Provider(token, {
        useClass: useClass,
        useValue: useValue,
        useExisting: useExisting,
        useFactory: useFactory,
        deps: deps,
        multi: multi
    });
}
/**
 * Helper class for the {@link bind} function.
 */
export class ProviderBuilder {
    constructor(token) {
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
    toClass(type) {
        if (!isType(type)) {
            throw new BaseException(`Trying to create a class provider but "${stringify(type)}" is not a class!`);
        }
        return new Provider(this.token, { useClass: type });
    }
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
    toValue(value) { return new Provider(this.token, { useValue: value }); }
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
    toAlias(aliasToken) {
        if (isBlank(aliasToken)) {
            throw new BaseException(`Can not alias ${stringify(this.token)} to a blank value!`);
        }
        return new Provider(this.token, { useExisting: aliasToken });
    }
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
    toFactory(factory, dependencies) {
        if (!isFunction(factory)) {
            throw new BaseException(`Trying to create a factory provider but "${stringify(factory)}" is not a function!`);
        }
        return new Provider(this.token, { useFactory: factory, deps: dependencies });
    }
}
/**
 * Resolve a single provider.
 */
export function resolveFactory(provider) {
    var factoryFn;
    var resolvedDeps;
    if (isPresent(provider.useClass)) {
        var useClass = resolveForwardRef(provider.useClass);
        factoryFn = reflector.factory(useClass);
        resolvedDeps = _dependenciesFor(useClass);
    }
    else if (isPresent(provider.useExisting)) {
        factoryFn = (aliasInstance) => aliasInstance;
        resolvedDeps = [Dependency.fromKey(Key.get(provider.useExisting))];
    }
    else if (isPresent(provider.useFactory)) {
        factoryFn = provider.useFactory;
        resolvedDeps = _constructDependencies(provider.useFactory, provider.dependencies);
    }
    else {
        factoryFn = () => provider.useValue;
        resolvedDeps = _EMPTY_LIST;
    }
    return new ResolvedFactory(factoryFn, resolvedDeps);
}
/**
 * Converts the {@link Provider} into {@link ResolvedProvider}.
 *
 * {@link Injector} internally only uses {@link ResolvedProvider}, {@link Provider} contains
 * convenience provider syntax.
 */
export function resolveProvider(provider) {
    return new ResolvedProvider_(Key.get(provider.token), [resolveFactory(provider)], false);
}
/**
 * Resolve a list of Providers.
 */
export function resolveProviders(providers) {
    var normalized = _createListOfProviders(_normalizeProviders(providers, new Map()));
    return normalized.map(b => {
        if (b instanceof _NormalizedProvider) {
            return new ResolvedProvider_(b.key, [b.resolvedFactory], false);
        }
        else {
            var arr = b;
            return new ResolvedProvider_(arr[0].key, arr.map(_ => _.resolvedFactory), true);
        }
    });
}
/**
 * The algorithm works as follows:
 *
 * [Provider] -> [_NormalizedProvider|[_NormalizedProvider]] -> [ResolvedProvider]
 *
 * _NormalizedProvider is essentially a resolved provider before it was grouped by key.
 */
class _NormalizedProvider {
    constructor(key, resolvedFactory) {
        this.key = key;
        this.resolvedFactory = resolvedFactory;
    }
}
function _createListOfProviders(flattenedProviders) {
    return MapWrapper.values(flattenedProviders);
}
function _normalizeProviders(providers, res) {
    providers.forEach(b => {
        if (b instanceof Type) {
            _normalizeProvider(provide(b, { useClass: b }), res);
        }
        else if (b instanceof Provider) {
            _normalizeProvider(b, res);
        }
        else if (b instanceof Array) {
            _normalizeProviders(b, res);
        }
        else if (b instanceof ProviderBuilder) {
            throw new InvalidProviderError(b.token);
        }
        else {
            throw new InvalidProviderError(b);
        }
    });
    return res;
}
function _normalizeProvider(b, res) {
    var key = Key.get(b.token);
    var factory = resolveFactory(b);
    var normalized = new _NormalizedProvider(key, factory);
    if (b.multi) {
        var existingProvider = res.get(key.id);
        if (existingProvider instanceof Array) {
            existingProvider.push(normalized);
        }
        else if (isBlank(existingProvider)) {
            res.set(key.id, [normalized]);
        }
        else {
            throw new MixingMultiProvidersWithRegularProvidersError(existingProvider, b);
        }
    }
    else {
        var existingProvider = res.get(key.id);
        if (existingProvider instanceof Array) {
            throw new MixingMultiProvidersWithRegularProvidersError(existingProvider, b);
        }
        res.set(key.id, normalized);
    }
}
function _constructDependencies(factoryFunction, dependencies) {
    if (isBlank(dependencies)) {
        return _dependenciesFor(factoryFunction);
    }
    else {
        var params = dependencies.map(t => [t]);
        return dependencies.map(t => _extractToken(factoryFunction, t, params));
    }
}
function _dependenciesFor(typeOrFunc) {
    var params = reflector.parameters(typeOrFunc);
    if (isBlank(params))
        return [];
    if (params.some(isBlank)) {
        throw new NoAnnotationError(typeOrFunc, params);
    }
    return params.map((p) => _extractToken(typeOrFunc, p, params));
}
function _extractToken(typeOrFunc, metadata /*any[] | any*/, params) {
    var depProps = [];
    var token = null;
    var optional = false;
    if (!isArray(metadata)) {
        if (metadata instanceof InjectMetadata) {
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
        if (paramMetadata instanceof Type) {
            token = paramMetadata;
        }
        else if (paramMetadata instanceof InjectMetadata) {
            token = paramMetadata.token;
        }
        else if (paramMetadata instanceof OptionalMetadata) {
            optional = true;
        }
        else if (paramMetadata instanceof SelfMetadata) {
            upperBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof HostMetadata) {
            upperBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof SkipSelfMetadata) {
            lowerBoundVisibility = paramMetadata;
        }
        else if (paramMetadata instanceof DependencyMetadata) {
            if (isPresent(paramMetadata.token)) {
                token = paramMetadata.token;
            }
            depProps.push(paramMetadata);
        }
    }
    token = resolveForwardRef(token);
    if (isPresent(token)) {
        return _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps);
    }
    else {
        throw new NoAnnotationError(typeOrFunc, params);
    }
}
function _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps) {
    return new Dependency(Key.get(token), optional, lowerBoundVisibility, upperBoundVisibility, depProps);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlci50cyJdLCJuYW1lcyI6WyJEZXBlbmRlbmN5IiwiRGVwZW5kZW5jeS5jb25zdHJ1Y3RvciIsIkRlcGVuZGVuY3kuZnJvbUtleSIsIlByb3ZpZGVyIiwiUHJvdmlkZXIuY29uc3RydWN0b3IiLCJQcm92aWRlci5tdWx0aSIsIkJpbmRpbmciLCJCaW5kaW5nLmNvbnN0cnVjdG9yIiwiQmluZGluZy50b0NsYXNzIiwiQmluZGluZy50b0FsaWFzIiwiQmluZGluZy50b0ZhY3RvcnkiLCJCaW5kaW5nLnRvVmFsdWUiLCJSZXNvbHZlZFByb3ZpZGVyXyIsIlJlc29sdmVkUHJvdmlkZXJfLmNvbnN0cnVjdG9yIiwiUmVzb2x2ZWRQcm92aWRlcl8ucmVzb2x2ZWRGYWN0b3J5IiwiUmVzb2x2ZWRGYWN0b3J5IiwiUmVzb2x2ZWRGYWN0b3J5LmNvbnN0cnVjdG9yIiwiYmluZCIsInByb3ZpZGUiLCJQcm92aWRlckJ1aWxkZXIiLCJQcm92aWRlckJ1aWxkZXIuY29uc3RydWN0b3IiLCJQcm92aWRlckJ1aWxkZXIudG9DbGFzcyIsIlByb3ZpZGVyQnVpbGRlci50b1ZhbHVlIiwiUHJvdmlkZXJCdWlsZGVyLnRvQWxpYXMiLCJQcm92aWRlckJ1aWxkZXIudG9GYWN0b3J5IiwicmVzb2x2ZUZhY3RvcnkiLCJyZXNvbHZlUHJvdmlkZXIiLCJyZXNvbHZlUHJvdmlkZXJzIiwiX05vcm1hbGl6ZWRQcm92aWRlciIsIl9Ob3JtYWxpemVkUHJvdmlkZXIuY29uc3RydWN0b3IiLCJfY3JlYXRlTGlzdE9mUHJvdmlkZXJzIiwiX25vcm1hbGl6ZVByb3ZpZGVycyIsIl9ub3JtYWxpemVQcm92aWRlciIsIl9jb25zdHJ1Y3REZXBlbmRlbmNpZXMiLCJfZGVwZW5kZW5jaWVzRm9yIiwiX2V4dHJhY3RUb2tlbiIsIl9jcmVhdGVEZXBlbmRlbmN5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUNMLElBQUksRUFDSixPQUFPLEVBQ1AsU0FBUyxFQUNULEtBQUssRUFDTCxVQUFVLEVBQ1YsU0FBUyxFQUNULE9BQU8sRUFDUCxNQUFNLEVBQ04sVUFBVSxFQUNWLGFBQWEsRUFDZCxNQUFNLDBCQUEwQjtPQUMxQixFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7T0FDdkUsRUFBQyxVQUFVLEVBQWMsTUFBTSxnQ0FBZ0M7T0FDL0QsRUFBQyxTQUFTLEVBQUMsTUFBTSx5Q0FBeUM7T0FDMUQsRUFBQyxHQUFHLEVBQUMsTUFBTSxPQUFPO09BQ2xCLEVBQ0wsY0FBYyxFQUVkLGdCQUFnQixFQUNoQixZQUFZLEVBQ1osWUFBWSxFQUNaLGdCQUFnQixFQUNoQixrQkFBa0IsRUFDbkIsTUFBTSxZQUFZO09BQ1osRUFDTCxpQkFBaUIsRUFDakIsNkNBQTZDLEVBQzdDLG9CQUFvQixFQUNyQixNQUFNLGNBQWM7T0FDZCxFQUFDLGlCQUFpQixFQUFDLE1BQU0sZUFBZTtBQUUvQztJQUNFQSxZQUFtQkEsR0FBUUEsRUFBU0EsUUFBaUJBLEVBQVNBLG9CQUF5QkEsRUFDcEVBLG9CQUF5QkEsRUFBU0EsVUFBaUJBO1FBRG5EQyxRQUFHQSxHQUFIQSxHQUFHQSxDQUFLQTtRQUFTQSxhQUFRQSxHQUFSQSxRQUFRQSxDQUFTQTtRQUFTQSx5QkFBb0JBLEdBQXBCQSxvQkFBb0JBLENBQUtBO1FBQ3BFQSx5QkFBb0JBLEdBQXBCQSxvQkFBb0JBLENBQUtBO1FBQVNBLGVBQVVBLEdBQVZBLFVBQVVBLENBQU9BO0lBQUdBLENBQUNBO0lBRTFFRCxPQUFPQSxPQUFPQSxDQUFDQSxHQUFRQSxJQUFnQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsR0FBR0EsRUFBRUEsS0FBS0EsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDN0ZGLENBQUNBO0FBRUQsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRW5DOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0g7SUFtSUVHLFlBQVlBLEtBQUtBLEVBQUVBLEVBQUNBLFFBQVFBLEVBQUVBLFFBQVFBLEVBQUVBLFdBQVdBLEVBQUVBLFVBQVVBLEVBQUVBLElBQUlBLEVBQUVBLEtBQUtBLEVBTzNFQTtRQUNDQyxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUNuQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLFFBQVFBLENBQUNBO1FBQ3pCQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxXQUFXQSxDQUFDQTtRQUMvQkEsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsVUFBVUEsQ0FBQ0E7UUFDN0JBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3pCQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUN0QkEsQ0FBQ0E7SUFFREQsa0VBQWtFQTtJQUNsRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0E0QkdBO0lBQ0hBLElBQUlBLEtBQUtBLEtBQWNFLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQzdERixDQUFDQTtBQW5MRDtJQUFDLEtBQUssRUFBRTs7YUFtTFA7QUFFRDs7R0FFRztBQUNILG1DQUM2QixRQUFRO0lBQ25DRyxZQUFZQSxLQUFLQSxFQUFFQSxFQUFDQSxPQUFPQSxFQUFFQSxPQUFPQSxFQUFFQSxPQUFPQSxFQUFFQSxTQUFTQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUtwRUE7UUFDQ0MsTUFBTUEsS0FBS0EsRUFBRUE7WUFDWEEsUUFBUUEsRUFBRUEsT0FBT0E7WUFDakJBLFFBQVFBLEVBQUVBLE9BQU9BO1lBQ2pCQSxXQUFXQSxFQUFFQSxPQUFPQTtZQUNwQkEsVUFBVUEsRUFBRUEsU0FBU0E7WUFDckJBLElBQUlBLEVBQUVBLElBQUlBO1lBQ1ZBLEtBQUtBLEVBQUVBLEtBQUtBO1NBQ2JBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBRUREOztPQUVHQTtJQUNIQSxJQUFJQSxPQUFPQSxLQUFLRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUV2Q0Y7O09BRUdBO0lBQ0hBLElBQUlBLE9BQU9BLEtBQUtHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO0lBRTFDSDs7T0FFR0E7SUFDSEEsSUFBSUEsU0FBU0EsS0FBS0ksTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFM0NKOztPQUVHQTtJQUNIQSxJQUFJQSxPQUFPQSxLQUFLSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUN6Q0wsQ0FBQ0E7QUFyQ0Q7SUFBQyxLQUFLLEVBQUU7O1lBcUNQO0FBd0NEO0lBQ0VNLFlBQW1CQSxHQUFRQSxFQUFTQSxpQkFBb0NBLEVBQ3JEQSxhQUFzQkE7UUFEdEJDLFFBQUdBLEdBQUhBLEdBQUdBLENBQUtBO1FBQVNBLHNCQUFpQkEsR0FBakJBLGlCQUFpQkEsQ0FBbUJBO1FBQ3JEQSxrQkFBYUEsR0FBYkEsYUFBYUEsQ0FBU0E7SUFBR0EsQ0FBQ0E7SUFFN0NELElBQUlBLGVBQWVBLEtBQXNCRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQzlFRixDQUFDQTtBQUVEOztHQUVHO0FBQ0g7SUFDRUc7UUFDSUE7O1dBRUdBO1FBQ0lBLE9BQWlCQTtRQUV4QkE7O1dBRUdBO1FBQ0lBLFlBQTBCQTtRQUwxQkMsWUFBT0EsR0FBUEEsT0FBT0EsQ0FBVUE7UUFLakJBLGlCQUFZQSxHQUFaQSxZQUFZQSxDQUFjQTtJQUFHQSxDQUFDQTtBQUMzQ0QsQ0FBQ0E7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBQ0gscUJBQXFCLEtBQUs7SUFDeEJFLE1BQU1BLENBQUNBLElBQUlBLGVBQWVBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0FBQ3BDQSxDQUFDQTtBQUVEOzs7Ozs7R0FNRztBQUNILHdCQUF3QixLQUFLLEVBQUUsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFPdkY7SUFDQ0MsTUFBTUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUE7UUFDekJBLFFBQVFBLEVBQUVBLFFBQVFBO1FBQ2xCQSxRQUFRQSxFQUFFQSxRQUFRQTtRQUNsQkEsV0FBV0EsRUFBRUEsV0FBV0E7UUFDeEJBLFVBQVVBLEVBQUVBLFVBQVVBO1FBQ3RCQSxJQUFJQSxFQUFFQSxJQUFJQTtRQUNWQSxLQUFLQSxFQUFFQSxLQUFLQTtLQUNiQSxDQUFDQSxDQUFDQTtBQUNMQSxDQUFDQTtBQUVEOztHQUVHO0FBQ0g7SUFDRUMsWUFBbUJBLEtBQUtBO1FBQUxDLFVBQUtBLEdBQUxBLEtBQUtBLENBQUFBO0lBQUdBLENBQUNBO0lBRTVCRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQTRCR0E7SUFDSEEsT0FBT0EsQ0FBQ0EsSUFBVUE7UUFDaEJFLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xCQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUNuQkEsMENBQTBDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBO1FBQ3BGQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxFQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxFQUFDQSxDQUFDQSxDQUFDQTtJQUNwREEsQ0FBQ0E7SUFFREY7Ozs7Ozs7Ozs7OztPQVlHQTtJQUNIQSxPQUFPQSxDQUFDQSxLQUFVQSxJQUFjRyxNQUFNQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxFQUFDQSxRQUFRQSxFQUFFQSxLQUFLQSxFQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVyRkg7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0ErQkdBO0lBQ0hBLE9BQU9BLENBQUNBLFVBQXdCQTtRQUM5QkksRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLE1BQU1BLElBQUlBLGFBQWFBLENBQUNBLGlCQUFpQkEsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQTtRQUN0RkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsRUFBQ0EsV0FBV0EsRUFBRUEsVUFBVUEsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDN0RBLENBQUNBO0lBRURKOzs7Ozs7Ozs7Ozs7OztPQWNHQTtJQUNIQSxTQUFTQSxDQUFDQSxPQUFpQkEsRUFBRUEsWUFBb0JBO1FBQy9DSyxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN6QkEsTUFBTUEsSUFBSUEsYUFBYUEsQ0FDbkJBLDRDQUE0Q0EsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxDQUFDQTtRQUM1RkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsRUFBQ0EsVUFBVUEsRUFBRUEsT0FBT0EsRUFBRUEsSUFBSUEsRUFBRUEsWUFBWUEsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDN0VBLENBQUNBO0FBQ0hMLENBQUNBO0FBRUQ7O0dBRUc7QUFDSCwrQkFBK0IsUUFBa0I7SUFDL0NNLElBQUlBLFNBQW1CQSxDQUFDQTtJQUN4QkEsSUFBSUEsWUFBWUEsQ0FBQ0E7SUFDakJBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLFFBQVFBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ2pDQSxJQUFJQSxRQUFRQSxHQUFHQSxpQkFBaUJBLENBQUNBLFFBQVFBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1FBQ3BEQSxTQUFTQSxHQUFHQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUN4Q0EsWUFBWUEsR0FBR0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtJQUM1Q0EsQ0FBQ0E7SUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDM0NBLFNBQVNBLEdBQUdBLENBQUNBLGFBQWFBLEtBQUtBLGFBQWFBLENBQUNBO1FBQzdDQSxZQUFZQSxHQUFHQSxDQUFDQSxVQUFVQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNyRUEsQ0FBQ0E7SUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDMUNBLFNBQVNBLEdBQUdBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBO1FBQ2hDQSxZQUFZQSxHQUFHQSxzQkFBc0JBLENBQUNBLFFBQVFBLENBQUNBLFVBQVVBLEVBQUVBLFFBQVFBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO0lBQ3BGQSxDQUFDQTtJQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNOQSxTQUFTQSxHQUFHQSxNQUFNQSxRQUFRQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUNwQ0EsWUFBWUEsR0FBR0EsV0FBV0EsQ0FBQ0E7SUFDN0JBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLGVBQWVBLENBQUNBLFNBQVNBLEVBQUVBLFlBQVlBLENBQUNBLENBQUNBO0FBQ3REQSxDQUFDQTtBQUVEOzs7OztHQUtHO0FBQ0gsZ0NBQWdDLFFBQWtCO0lBQ2hEQyxNQUFNQSxDQUFDQSxJQUFJQSxpQkFBaUJBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLEVBQUVBLENBQUNBLGNBQWNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0FBQzNGQSxDQUFDQTtBQUVEOztHQUVHO0FBQ0gsaUNBQWlDLFNBQXlDO0lBQ3hFQyxJQUFJQSxVQUFVQSxHQUFHQSxzQkFBc0JBLENBQUNBLG1CQUFtQkEsQ0FDdkRBLFNBQVNBLEVBQUVBLElBQUlBLEdBQUdBLEVBQXVEQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNoRkEsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDckJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFlBQVlBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckNBLE1BQU1BLENBQUNBLElBQUlBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFFbEVBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLElBQUlBLEdBQUdBLEdBQTBCQSxDQUFDQSxDQUFDQTtZQUNuQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsaUJBQWlCQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxlQUFlQSxDQUFDQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNsRkEsQ0FBQ0E7SUFDSEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDTEEsQ0FBQ0E7QUFFRDs7Ozs7O0dBTUc7QUFDSDtJQUNFQyxZQUFtQkEsR0FBUUEsRUFBU0EsZUFBZ0NBO1FBQWpEQyxRQUFHQSxHQUFIQSxHQUFHQSxDQUFLQTtRQUFTQSxvQkFBZUEsR0FBZkEsZUFBZUEsQ0FBaUJBO0lBQUdBLENBQUNBO0FBQzFFRCxDQUFDQTtBQUVELGdDQUFnQyxrQkFBb0M7SUFDbEVFLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLE1BQU1BLENBQUNBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0E7QUFDL0NBLENBQUNBO0FBRUQsNkJBQTZCLFNBQTJELEVBQzNELEdBQTZEO0lBRXhGQyxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUNqQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLGtCQUFrQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsRUFBQ0EsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFFckRBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFlBQVlBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSxrQkFBa0JBLENBQUNBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1FBRTdCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxZQUFZQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM5QkEsbUJBQW1CQSxDQUFDQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUU5QkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsZUFBZUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeENBLE1BQU1BLElBQUlBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFFMUNBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLE1BQU1BLElBQUlBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDcENBLENBQUNBO0lBQ0hBLENBQUNBLENBQUNBLENBQUNBO0lBRUhBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBO0FBQ2JBLENBQUNBO0FBRUQsNEJBQTRCLENBQVcsRUFDWCxHQUE2RDtJQUN2RkMsSUFBSUEsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDM0JBLElBQUlBLE9BQU9BLEdBQUdBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ2hDQSxJQUFJQSxVQUFVQSxHQUFHQSxJQUFJQSxtQkFBbUJBLENBQUNBLEdBQUdBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0lBRXZEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNaQSxJQUFJQSxnQkFBZ0JBLEdBQUdBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO1FBRXZDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBZ0JBLFlBQVlBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1FBRXBDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUVoQ0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsTUFBTUEsSUFBSUEsNkNBQTZDQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1FBQy9FQSxDQUFDQTtJQUVIQSxDQUFDQTtJQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNOQSxJQUFJQSxnQkFBZ0JBLEdBQUdBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO1FBRXZDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBZ0JBLFlBQVlBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RDQSxNQUFNQSxJQUFJQSw2Q0FBNkNBLENBQUNBLGdCQUFnQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDL0VBLENBQUNBO1FBRURBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBO0lBQzlCQSxDQUFDQTtBQUNIQSxDQUFDQTtBQUVELGdDQUFnQyxlQUF5QixFQUFFLFlBQW1CO0lBQzVFQyxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMxQkEsTUFBTUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQTtJQUMzQ0EsQ0FBQ0E7SUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDTkEsSUFBSUEsTUFBTUEsR0FBWUEsWUFBWUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakRBLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLGFBQWFBLENBQUNBLGVBQWVBLEVBQUVBLENBQUNBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO0lBQzFFQSxDQUFDQTtBQUNIQSxDQUFDQTtBQUVELDBCQUEwQixVQUFVO0lBQ2xDQyxJQUFJQSxNQUFNQSxHQUFHQSxTQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtJQUM5Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7SUFDL0JBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3pCQSxNQUFNQSxJQUFJQSxpQkFBaUJBLENBQUNBLFVBQVVBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO0lBQ2xEQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFRQSxLQUFLQSxhQUFhQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUN4RUEsQ0FBQ0E7QUFFRCx1QkFBdUIsVUFBVSxFQUFFLFFBQVEsQ0FBQyxlQUFlLEVBQUUsTUFBZTtJQUMxRUMsSUFBSUEsUUFBUUEsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFDbEJBLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO0lBQ2pCQSxJQUFJQSxRQUFRQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUVyQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDdkJBLEVBQUVBLENBQUNBLENBQUNBLFFBQVFBLFlBQVlBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZDQSxNQUFNQSxDQUFDQSxpQkFBaUJBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLFFBQVFBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO1FBQzNFQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxDQUFDQSxpQkFBaUJBLENBQUNBLFFBQVFBLEVBQUVBLFFBQVFBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO1FBQ3JFQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVEQSxJQUFJQSxvQkFBb0JBLEdBQUdBLElBQUlBLENBQUNBO0lBQ2hDQSxJQUFJQSxvQkFBb0JBLEdBQUdBLElBQUlBLENBQUNBO0lBRWhDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxRQUFRQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUN6Q0EsSUFBSUEsYUFBYUEsR0FBR0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFFaENBLEVBQUVBLENBQUNBLENBQUNBLGFBQWFBLFlBQVlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xDQSxLQUFLQSxHQUFHQSxhQUFhQSxDQUFDQTtRQUV4QkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsYUFBYUEsWUFBWUEsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLEtBQUtBLEdBQUdBLGFBQWFBLENBQUNBLEtBQUtBLENBQUNBO1FBRTlCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxhQUFhQSxZQUFZQSxnQkFBZ0JBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JEQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUVsQkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsYUFBYUEsWUFBWUEsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakRBLG9CQUFvQkEsR0FBR0EsYUFBYUEsQ0FBQ0E7UUFFdkNBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLGFBQWFBLFlBQVlBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pEQSxvQkFBb0JBLEdBQUdBLGFBQWFBLENBQUNBO1FBRXZDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxhQUFhQSxZQUFZQSxnQkFBZ0JBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JEQSxvQkFBb0JBLEdBQUdBLGFBQWFBLENBQUNBO1FBRXZDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxhQUFhQSxZQUFZQSxrQkFBa0JBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkNBLEtBQUtBLEdBQUdBLGFBQWFBLENBQUNBLEtBQUtBLENBQUNBO1lBQzlCQSxDQUFDQTtZQUNEQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUMvQkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREEsS0FBS0EsR0FBR0EsaUJBQWlCQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUVqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDckJBLE1BQU1BLENBQUNBLGlCQUFpQkEsQ0FBQ0EsS0FBS0EsRUFBRUEsUUFBUUEsRUFBRUEsb0JBQW9CQSxFQUFFQSxvQkFBb0JBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO0lBQ2xHQSxDQUFDQTtJQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNOQSxNQUFNQSxJQUFJQSxpQkFBaUJBLENBQUNBLFVBQVVBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO0lBQ2xEQSxDQUFDQTtBQUNIQSxDQUFDQTtBQUVELDJCQUEyQixLQUFLLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixFQUFFLG9CQUFvQixFQUMzRCxRQUFRO0lBQ2pDQyxNQUFNQSxDQUFDQSxJQUFJQSxVQUFVQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxFQUFFQSxRQUFRQSxFQUFFQSxvQkFBb0JBLEVBQUVBLG9CQUFvQkEsRUFDcEVBLFFBQVFBLENBQUNBLENBQUNBO0FBQ2xDQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFR5cGUsXG4gIGlzQmxhbmssXG4gIGlzUHJlc2VudCxcbiAgQ09OU1QsXG4gIENPTlNUX0VYUFIsXG4gIHN0cmluZ2lmeSxcbiAgaXNBcnJheSxcbiAgaXNUeXBlLFxuICBpc0Z1bmN0aW9uLFxuICBub3JtYWxpemVCb29sXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge01hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge0tleX0gZnJvbSAnLi9rZXknO1xuaW1wb3J0IHtcbiAgSW5qZWN0TWV0YWRhdGEsXG4gIEluamVjdGFibGVNZXRhZGF0YSxcbiAgT3B0aW9uYWxNZXRhZGF0YSxcbiAgU2VsZk1ldGFkYXRhLFxuICBIb3N0TWV0YWRhdGEsXG4gIFNraXBTZWxmTWV0YWRhdGEsXG4gIERlcGVuZGVuY3lNZXRhZGF0YVxufSBmcm9tICcuL21ldGFkYXRhJztcbmltcG9ydCB7XG4gIE5vQW5ub3RhdGlvbkVycm9yLFxuICBNaXhpbmdNdWx0aVByb3ZpZGVyc1dpdGhSZWd1bGFyUHJvdmlkZXJzRXJyb3IsXG4gIEludmFsaWRQcm92aWRlckVycm9yXG59IGZyb20gJy4vZXhjZXB0aW9ucyc7XG5pbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmfSBmcm9tICcuL2ZvcndhcmRfcmVmJztcblxuZXhwb3J0IGNsYXNzIERlcGVuZGVuY3kge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMga2V5OiBLZXksIHB1YmxpYyBvcHRpb25hbDogYm9vbGVhbiwgcHVibGljIGxvd2VyQm91bmRWaXNpYmlsaXR5OiBhbnksXG4gICAgICAgICAgICAgIHB1YmxpYyB1cHBlckJvdW5kVmlzaWJpbGl0eTogYW55LCBwdWJsaWMgcHJvcGVydGllczogYW55W10pIHt9XG5cbiAgc3RhdGljIGZyb21LZXkoa2V5OiBLZXkpOiBEZXBlbmRlbmN5IHsgcmV0dXJuIG5ldyBEZXBlbmRlbmN5KGtleSwgZmFsc2UsIG51bGwsIG51bGwsIFtdKTsgfVxufVxuXG5jb25zdCBfRU1QVFlfTElTVCA9IENPTlNUX0VYUFIoW10pO1xuXG4vKipcbiAqIERlc2NyaWJlcyBob3cgdGhlIHtAbGluayBJbmplY3Rvcn0gc2hvdWxkIGluc3RhbnRpYXRlIGEgZ2l2ZW4gdG9rZW4uXG4gKlxuICogU2VlIHtAbGluayBwcm92aWRlfS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvR05BeWo2SzZQZllnMk5Cemd3WjU/cCUzRHByZXZpZXcmcD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAqICAgbmV3IFByb3ZpZGVyKFwibWVzc2FnZVwiLCB7IHVzZVZhbHVlOiAnSGVsbG8nIH0pXG4gKiBdKTtcbiAqXG4gKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFwibWVzc2FnZVwiKSkudG9FcXVhbCgnSGVsbG8nKTtcbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFByb3ZpZGVyIHtcbiAgLyoqXG4gICAqIFRva2VuIHVzZWQgd2hlbiByZXRyaWV2aW5nIHRoaXMgcHJvdmlkZXIuIFVzdWFsbHksIGl0IGlzIGEgdHlwZSB7QGxpbmsgVHlwZX0uXG4gICAqL1xuICB0b2tlbjtcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhbiBpbXBsZW1lbnRhdGlvbiBjbGFzcy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1JTVEc4NnFnbW94Q3lqOVNXUHdZP3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHVzZUV4aXN0aW5nYCBhbmQgYHVzZUNsYXNzYCBhcmUgb2Z0ZW4gY29uZnVzZWQsIHRoZSBleGFtcGxlIGNvbnRhaW5zXG4gICAqIGJvdGggdXNlIGNhc2VzIGZvciBlYXN5IGNvbXBhcmlzb24uXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogY2xhc3MgVmVoaWNsZSB7fVxuICAgKlxuICAgKiBjbGFzcyBDYXIgZXh0ZW5kcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIHZhciBpbmplY3RvckNsYXNzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIG5ldyBQcm92aWRlcihWZWhpY2xlLCB7IHVzZUNsYXNzOiBDYXIgfSlcbiAgICogXSk7XG4gICAqIHZhciBpbmplY3RvckFsaWFzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIG5ldyBQcm92aWRlcihWZWhpY2xlLCB7IHVzZUV4aXN0aW5nOiBDYXIgfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSkubm90LnRvQmUoaW5qZWN0b3JDbGFzcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpKS50b0JlKGluamVjdG9yQWxpYXMuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdXNlQ2xhc3M6IFR5cGU7XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSB2YWx1ZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1VGVnNNVlFJRGU3bDR3YVd6aUVTP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYGphdmFzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKFwibWVzc2FnZVwiLCB7IHVzZVZhbHVlOiAnSGVsbG8nIH0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFwibWVzc2FnZVwiKSkudG9FcXVhbCgnSGVsbG8nKTtcbiAgICogYGBgXG4gICAqL1xuICB1c2VWYWx1ZTtcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhbiBleGlzdGluZyB0b2tlbi5cbiAgICpcbiAgICoge0BsaW5rIEluamVjdG9yfSByZXR1cm5zIHRoZSBzYW1lIGluc3RhbmNlIGFzIGlmIHRoZSBwcm92aWRlZCB0b2tlbiB3YXMgdXNlZC5cbiAgICogVGhpcyBpcyBpbiBjb250cmFzdCB0byBgdXNlQ2xhc3NgIHdoZXJlIGEgc2VwYXJhdGUgaW5zdGFuY2Ugb2YgYHVzZUNsYXNzYCBpcyByZXR1cm5lZC5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1FzYXRzT0pKNlA4VDJmTWU5Z3I4P3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHVzZUV4aXN0aW5nYCBhbmQgYHVzZUNsYXNzYCBhcmUgb2Z0ZW4gY29uZnVzZWQgdGhlIGV4YW1wbGUgY29udGFpbnNcbiAgICogYm90aCB1c2UgY2FzZXMgZm9yIGVhc3kgY29tcGFyaXNvbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIGNsYXNzIENhciBleHRlbmRzIFZlaGljbGUge31cbiAgICpcbiAgICogdmFyIGluamVjdG9yQWxpYXMgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgbmV3IFByb3ZpZGVyKFZlaGljbGUsIHsgdXNlRXhpc3Rpbmc6IENhciB9KVxuICAgKiBdKTtcbiAgICogdmFyIGluamVjdG9yQ2xhc3MgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgbmV3IFByb3ZpZGVyKFZlaGljbGUsIHsgdXNlQ2xhc3M6IENhciB9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpKS50b0JlKGluamVjdG9yQWxpYXMuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSkubm90LnRvQmUoaW5qZWN0b3JDbGFzcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICB1c2VFeGlzdGluZztcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIGZ1bmN0aW9uIHdoaWNoIGNvbXB1dGVzIHRoZSB2YWx1ZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1Njb3h5MHBKTnFLR0FQWlkxVlZDP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKE51bWJlciwgeyB1c2VGYWN0b3J5OiAoKSA9PiB7IHJldHVybiAxKzI7IH19KSxcbiAgICogICBuZXcgUHJvdmlkZXIoU3RyaW5nLCB7IHVzZUZhY3Rvcnk6ICh2YWx1ZSkgPT4geyByZXR1cm4gXCJWYWx1ZTogXCIgKyB2YWx1ZTsgfSxcbiAgICogICAgICAgICAgICAgICAgICAgICAgIGRlcHM6IFtOdW1iZXJdIH0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KE51bWJlcikpLnRvRXF1YWwoMyk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoU3RyaW5nKSkudG9FcXVhbCgnVmFsdWU6IDMnKTtcbiAgICogYGBgXG4gICAqXG4gICAqIFVzZWQgaW4gY29uanVjdGlvbiB3aXRoIGRlcGVuZGVuY2llcy5cbiAgICovXG4gIHVzZUZhY3Rvcnk6IEZ1bmN0aW9uO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgYSBzZXQgb2YgZGVwZW5kZW5jaWVzXG4gICAqIChhcyBgdG9rZW5gcykgd2hpY2ggc2hvdWxkIGJlIGluamVjdGVkIGludG8gdGhlIGZhY3RvcnkgZnVuY3Rpb24uXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9TY294eTBwSk5xS0dBUFpZMVZWQz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIG5ldyBQcm92aWRlcihOdW1iZXIsIHsgdXNlRmFjdG9yeTogKCkgPT4geyByZXR1cm4gMSsyOyB9fSksXG4gICAqICAgbmV3IFByb3ZpZGVyKFN0cmluZywgeyB1c2VGYWN0b3J5OiAodmFsdWUpID0+IHsgcmV0dXJuIFwiVmFsdWU6IFwiICsgdmFsdWU7IH0sXG4gICAqICAgICAgICAgICAgICAgICAgICAgICBkZXBzOiBbTnVtYmVyXSB9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChOdW1iZXIpKS50b0VxdWFsKDMpO1xuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KFN0cmluZykpLnRvRXF1YWwoJ1ZhbHVlOiAzJyk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBVc2VkIGluIGNvbmp1bmN0aW9uIHdpdGggYHVzZUZhY3RvcnlgLlxuICAgKi9cbiAgZGVwZW5kZW5jaWVzOiBPYmplY3RbXTtcblxuICAvKiogQGludGVybmFsICovXG4gIF9tdWx0aTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcih0b2tlbiwge3VzZUNsYXNzLCB1c2VWYWx1ZSwgdXNlRXhpc3RpbmcsIHVzZUZhY3RvcnksIGRlcHMsIG11bHRpfToge1xuICAgIHVzZUNsYXNzPzogVHlwZSxcbiAgICB1c2VWYWx1ZT86IGFueSxcbiAgICB1c2VFeGlzdGluZz86IGFueSxcbiAgICB1c2VGYWN0b3J5PzogRnVuY3Rpb24sXG4gICAgZGVwcz86IE9iamVjdFtdLFxuICAgIG11bHRpPzogYm9vbGVhblxuICB9KSB7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICAgIHRoaXMudXNlQ2xhc3MgPSB1c2VDbGFzcztcbiAgICB0aGlzLnVzZVZhbHVlID0gdXNlVmFsdWU7XG4gICAgdGhpcy51c2VFeGlzdGluZyA9IHVzZUV4aXN0aW5nO1xuICAgIHRoaXMudXNlRmFjdG9yeSA9IHVzZUZhY3Rvcnk7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBkZXBzO1xuICAgIHRoaXMuX211bHRpID0gbXVsdGk7XG4gIH1cblxuICAvLyBUT0RPOiBQcm92aWRlIGEgZnVsbCB3b3JraW5nIGV4YW1wbGUgYWZ0ZXIgYWxwaGEzOCBpcyByZWxlYXNlZC5cbiAgLyoqXG4gICAqIENyZWF0ZXMgbXVsdGlwbGUgcHJvdmlkZXJzIG1hdGNoaW5nIHRoZSBzYW1lIHRva2VuIChhIG11bHRpLXByb3ZpZGVyKS5cbiAgICpcbiAgICogTXVsdGktcHJvdmlkZXJzIGFyZSB1c2VkIGZvciBjcmVhdGluZyBwbHVnZ2FibGUgc2VydmljZSwgd2hlcmUgdGhlIHN5c3RlbSBjb21lc1xuICAgKiB3aXRoIHNvbWUgZGVmYXVsdCBwcm92aWRlcnMsIGFuZCB0aGUgdXNlciBjYW4gcmVnaXN0ZXIgYWRkaXRvbmFsIHByb3ZpZGVycy5cbiAgICogVGhlIGNvbWJpbmF0aW9uIG9mIHRoZSBkZWZhdWx0IHByb3ZpZGVycyBhbmQgdGhlIGFkZGl0aW9uYWwgcHJvdmlkZXJzIHdpbGwgYmVcbiAgICogdXNlZCB0byBkcml2ZSB0aGUgYmVoYXZpb3Igb2YgdGhlIHN5c3RlbS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBuZXcgUHJvdmlkZXIoXCJTdHJpbmdzXCIsIHsgdXNlVmFsdWU6IFwiU3RyaW5nMVwiLCBtdWx0aTogdHJ1ZX0pLFxuICAgKiAgIG5ldyBQcm92aWRlcihcIlN0cmluZ3NcIiwgeyB1c2VWYWx1ZTogXCJTdHJpbmcyXCIsIG11bHRpOiB0cnVlfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoXCJTdHJpbmdzXCIpKS50b0VxdWFsKFtcIlN0cmluZzFcIiwgXCJTdHJpbmcyXCJdKTtcbiAgICogYGBgXG4gICAqXG4gICAqIE11bHRpLXByb3ZpZGVycyBhbmQgcmVndWxhciBwcm92aWRlcnMgY2Fubm90IGJlIG1peGVkLiBUaGUgZm9sbG93aW5nXG4gICAqIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uOlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIG5ldyBQcm92aWRlcihcIlN0cmluZ3NcIiwgeyB1c2VWYWx1ZTogXCJTdHJpbmcxXCIsIG11bHRpOiB0cnVlIH0pLFxuICAgKiAgIG5ldyBQcm92aWRlcihcIlN0cmluZ3NcIiwgeyB1c2VWYWx1ZTogXCJTdHJpbmcyXCJ9KVxuICAgKiBdKTtcbiAgICogYGBgXG4gICAqL1xuICBnZXQgbXVsdGkoKTogYm9vbGVhbiB7IHJldHVybiBub3JtYWxpemVCb29sKHRoaXMuX211bHRpKTsgfVxufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQmluZGluZyBleHRlbmRzIFByb3ZpZGVyIHtcbiAgY29uc3RydWN0b3IodG9rZW4sIHt0b0NsYXNzLCB0b1ZhbHVlLCB0b0FsaWFzLCB0b0ZhY3RvcnksIGRlcHMsIG11bHRpfToge1xuICAgIHRvQ2xhc3M/OiBUeXBlLFxuICAgIHRvVmFsdWU/OiBhbnksXG4gICAgdG9BbGlhcz86IGFueSxcbiAgICB0b0ZhY3Rvcnk6IEZ1bmN0aW9uLCBkZXBzPzogT2JqZWN0W10sIG11bHRpPzogYm9vbGVhblxuICB9KSB7XG4gICAgc3VwZXIodG9rZW4sIHtcbiAgICAgIHVzZUNsYXNzOiB0b0NsYXNzLFxuICAgICAgdXNlVmFsdWU6IHRvVmFsdWUsXG4gICAgICB1c2VFeGlzdGluZzogdG9BbGlhcyxcbiAgICAgIHVzZUZhY3Rvcnk6IHRvRmFjdG9yeSxcbiAgICAgIGRlcHM6IGRlcHMsXG4gICAgICBtdWx0aTogbXVsdGlcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgZ2V0IHRvQ2xhc3MoKSB7IHJldHVybiB0aGlzLnVzZUNsYXNzOyB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBnZXQgdG9BbGlhcygpIHsgcmV0dXJuIHRoaXMudXNlRXhpc3Rpbmc7IH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdldCB0b0ZhY3RvcnkoKSB7IHJldHVybiB0aGlzLnVzZUZhY3Rvcnk7IH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdldCB0b1ZhbHVlKCkgeyByZXR1cm4gdGhpcy51c2VWYWx1ZTsgfVxufVxuXG4vKipcbiAqIEFuIGludGVybmFsIHJlc29sdmVkIHJlcHJlc2VudGF0aW9uIG9mIGEge0BsaW5rIFByb3ZpZGVyfSB1c2VkIGJ5IHRoZSB7QGxpbmsgSW5qZWN0b3J9LlxuICpcbiAqIEl0IGlzIHVzdWFsbHkgY3JlYXRlZCBhdXRvbWF0aWNhbGx5IGJ5IGBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlYC5cbiAqXG4gKiBJdCBjYW4gYmUgY3JlYXRlZCBtYW51YWxseSwgYXMgZm9sbG93czpcbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvUmZFbmhoOGtVRUkwRzNxc25JZVQ/cCUzRHByZXZpZXcmcD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiB2YXIgcmVzb2x2ZWRQcm92aWRlcnMgPSBJbmplY3Rvci5yZXNvbHZlKFtuZXcgUHJvdmlkZXIoJ21lc3NhZ2UnLCB7dXNlVmFsdWU6ICdIZWxsbyd9KV0pO1xuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IuZnJvbVJlc29sdmVkUHJvdmlkZXJzKHJlc29sdmVkUHJvdmlkZXJzKTtcbiAqXG4gKiBleHBlY3QoaW5qZWN0b3IuZ2V0KCdtZXNzYWdlJykpLnRvRXF1YWwoJ0hlbGxvJyk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXNvbHZlZFByb3ZpZGVyIHtcbiAgLyoqXG4gICAqIEEga2V5LCB1c3VhbGx5IGEgYFR5cGVgLlxuICAgKi9cbiAga2V5OiBLZXk7XG5cbiAgLyoqXG4gICAqIEZhY3RvcnkgZnVuY3Rpb24gd2hpY2ggY2FuIHJldHVybiBhbiBpbnN0YW5jZSBvZiBhbiBvYmplY3QgcmVwcmVzZW50ZWQgYnkgYSBrZXkuXG4gICAqL1xuICByZXNvbHZlZEZhY3RvcmllczogUmVzb2x2ZWRGYWN0b3J5W107XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyBpZiB0aGUgcHJvdmlkZXIgaXMgYSBtdWx0aS1wcm92aWRlciBvciBhIHJlZ3VsYXIgcHJvdmlkZXIuXG4gICAqL1xuICBtdWx0aVByb3ZpZGVyOiBib29sZWFuO1xufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb2x2ZWRCaW5kaW5nIGV4dGVuZHMgUmVzb2x2ZWRQcm92aWRlciB7fVxuXG5leHBvcnQgY2xhc3MgUmVzb2x2ZWRQcm92aWRlcl8gaW1wbGVtZW50cyBSZXNvbHZlZEJpbmRpbmcge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMga2V5OiBLZXksIHB1YmxpYyByZXNvbHZlZEZhY3RvcmllczogUmVzb2x2ZWRGYWN0b3J5W10sXG4gICAgICAgICAgICAgIHB1YmxpYyBtdWx0aVByb3ZpZGVyOiBib29sZWFuKSB7fVxuXG4gIGdldCByZXNvbHZlZEZhY3RvcnkoKTogUmVzb2x2ZWRGYWN0b3J5IHsgcmV0dXJuIHRoaXMucmVzb2x2ZWRGYWN0b3JpZXNbMF07IH1cbn1cblxuLyoqXG4gKiBBbiBpbnRlcm5hbCByZXNvbHZlZCByZXByZXNlbnRhdGlvbiBvZiBhIGZhY3RvcnkgZnVuY3Rpb24gY3JlYXRlZCBieSByZXNvbHZpbmcge0BsaW5rIFByb3ZpZGVyfS5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlc29sdmVkRmFjdG9yeSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqXG4gICAgICAgKiBGYWN0b3J5IGZ1bmN0aW9uIHdoaWNoIGNhbiByZXR1cm4gYW4gaW5zdGFuY2Ugb2YgYW4gb2JqZWN0IHJlcHJlc2VudGVkIGJ5IGEga2V5LlxuICAgICAgICovXG4gICAgICBwdWJsaWMgZmFjdG9yeTogRnVuY3Rpb24sXG5cbiAgICAgIC8qKlxuICAgICAgICogQXJndW1lbnRzIChkZXBlbmRlbmNpZXMpIHRvIHRoZSBgZmFjdG9yeWAgZnVuY3Rpb24uXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBkZXBlbmRlbmNpZXM6IERlcGVuZGVuY3lbXSkge31cbn1cblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICogQ3JlYXRlcyBhIHtAbGluayBQcm92aWRlcn0uXG4gKlxuICogVG8gY29uc3RydWN0IGEge0BsaW5rIFByb3ZpZGVyfSwgYmluZCBhIGB0b2tlbmAgdG8gZWl0aGVyIGEgY2xhc3MsIGEgdmFsdWUsIGEgZmFjdG9yeSBmdW5jdGlvbixcbiAqIG9yXG4gKiB0byBhbiBleGlzdGluZyBgdG9rZW5gLlxuICogU2VlIHtAbGluayBQcm92aWRlckJ1aWxkZXJ9IGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogVGhlIGB0b2tlbmAgaXMgbW9zdCBjb21tb25seSBhIGNsYXNzIG9yIHtAbGluayBhbmd1bGFyMi9kaS9PcGFxdWVUb2tlbn0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5kKHRva2VuKTogUHJvdmlkZXJCdWlsZGVyIHtcbiAgcmV0dXJuIG5ldyBQcm92aWRlckJ1aWxkZXIodG9rZW4pO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSB7QGxpbmsgUHJvdmlkZXJ9LlxuICpcbiAqIFNlZSB7QGxpbmsgUHJvdmlkZXJ9IGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogPCEtLSBUT0RPOiBpbXByb3ZlIHRoZSBkb2NzIC0tPlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZSh0b2tlbiwge3VzZUNsYXNzLCB1c2VWYWx1ZSwgdXNlRXhpc3RpbmcsIHVzZUZhY3RvcnksIGRlcHMsIG11bHRpfToge1xuICB1c2VDbGFzcz86IFR5cGUsXG4gIHVzZVZhbHVlPzogYW55LFxuICB1c2VFeGlzdGluZz86IGFueSxcbiAgdXNlRmFjdG9yeT86IEZ1bmN0aW9uLFxuICBkZXBzPzogT2JqZWN0W10sXG4gIG11bHRpPzogYm9vbGVhblxufSk6IFByb3ZpZGVyIHtcbiAgcmV0dXJuIG5ldyBQcm92aWRlcih0b2tlbiwge1xuICAgIHVzZUNsYXNzOiB1c2VDbGFzcyxcbiAgICB1c2VWYWx1ZTogdXNlVmFsdWUsXG4gICAgdXNlRXhpc3Rpbmc6IHVzZUV4aXN0aW5nLFxuICAgIHVzZUZhY3Rvcnk6IHVzZUZhY3RvcnksXG4gICAgZGVwczogZGVwcyxcbiAgICBtdWx0aTogbXVsdGlcbiAgfSk7XG59XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIGZvciB0aGUge0BsaW5rIGJpbmR9IGZ1bmN0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgUHJvdmlkZXJCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IocHVibGljIHRva2VuKSB7fVxuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGEgY2xhc3MuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9acEJDU1lxdjZlMnVkNUtYTGR4UT9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBCZWNhdXNlIGB0b0FsaWFzYCBhbmQgYHRvQ2xhc3NgIGFyZSBvZnRlbiBjb25mdXNlZCwgdGhlIGV4YW1wbGUgY29udGFpbnNcbiAgICogYm90aCB1c2UgY2FzZXMgZm9yIGVhc3kgY29tcGFyaXNvbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIGNsYXNzIENhciBleHRlbmRzIFZlaGljbGUge31cbiAgICpcbiAgICogdmFyIGluamVjdG9yQ2xhc3MgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgcHJvdmlkZShWZWhpY2xlLCB7dXNlQ2xhc3M6IENhcn0pXG4gICAqIF0pO1xuICAgKiB2YXIgaW5qZWN0b3JBbGlhcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBwcm92aWRlKFZlaGljbGUsIHt1c2VFeGlzdGluZzogQ2FyfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSkubm90LnRvQmUoaW5qZWN0b3JDbGFzcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpKS50b0JlKGluamVjdG9yQWxpYXMuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdG9DbGFzcyh0eXBlOiBUeXBlKTogUHJvdmlkZXIge1xuICAgIGlmICghaXNUeXBlKHR5cGUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgVHJ5aW5nIHRvIGNyZWF0ZSBhIGNsYXNzIHByb3ZpZGVyIGJ1dCBcIiR7c3RyaW5naWZ5KHR5cGUpfVwiIGlzIG5vdCBhIGNsYXNzIWApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb3ZpZGVyKHRoaXMudG9rZW4sIHt1c2VDbGFzczogdHlwZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSB2YWx1ZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0cwMjRQRkhtREwwY0pGZ2ZaSzhPP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgcHJvdmlkZSgnbWVzc2FnZScsIHt1c2VWYWx1ZTogJ0hlbGxvJ30pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KCdtZXNzYWdlJykpLnRvRXF1YWwoJ0hlbGxvJyk7XG4gICAqIGBgYFxuICAgKi9cbiAgdG9WYWx1ZSh2YWx1ZTogYW55KTogUHJvdmlkZXIgeyByZXR1cm4gbmV3IFByb3ZpZGVyKHRoaXMudG9rZW4sIHt1c2VWYWx1ZTogdmFsdWV9KTsgfVxuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGFuIGV4aXN0aW5nIHRva2VuLlxuICAgKlxuICAgKiBBbmd1bGFyIHdpbGwgcmV0dXJuIHRoZSBzYW1lIGluc3RhbmNlIGFzIGlmIHRoZSBwcm92aWRlZCB0b2tlbiB3YXMgdXNlZC4gKFRoaXMgaXNcbiAgICogaW4gY29udHJhc3QgdG8gYHVzZUNsYXNzYCB3aGVyZSBhIHNlcGFyYXRlIGluc3RhbmNlIG9mIGB1c2VDbGFzc2Agd2lsbCBiZSByZXR1cm5lZC4pXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC91QmFvRjJwTjVjZmM1QWZaYXBOdz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBCZWNhdXNlIGB0b0FsaWFzYCBhbmQgYHRvQ2xhc3NgIGFyZSBvZnRlbiBjb25mdXNlZCwgdGhlIGV4YW1wbGUgY29udGFpbnNcbiAgICogYm90aCB1c2UgY2FzZXMgZm9yIGVhc3kgY29tcGFyaXNvbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIGNsYXNzIENhciBleHRlbmRzIFZlaGljbGUge31cbiAgICpcbiAgICogdmFyIGluamVjdG9yQWxpYXMgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgcHJvdmlkZShWZWhpY2xlLCB7dXNlRXhpc3Rpbmc6IENhcn0pXG4gICAqIF0pO1xuICAgKiB2YXIgaW5qZWN0b3JDbGFzcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBwcm92aWRlKFZlaGljbGUsIHt1c2VDbGFzczogQ2FyfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSkudG9CZShpbmplY3RvckFsaWFzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkpLm5vdC50b0JlKGluamVjdG9yQ2xhc3MuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JDbGFzcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdG9BbGlhcyhhbGlhc1Rva2VuOiAvKlR5cGUqLyBhbnkpOiBQcm92aWRlciB7XG4gICAgaWYgKGlzQmxhbmsoYWxpYXNUb2tlbikpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW4gbm90IGFsaWFzICR7c3RyaW5naWZ5KHRoaXMudG9rZW4pfSB0byBhIGJsYW5rIHZhbHVlIWApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb3ZpZGVyKHRoaXMudG9rZW4sIHt1c2VFeGlzdGluZzogYWxpYXNUb2tlbn0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSBmdW5jdGlvbiB3aGljaCBjb21wdXRlcyB0aGUgdmFsdWUuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9PZWpOSWZUVDN6YjFpQnhhSVlPYj9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIHByb3ZpZGUoTnVtYmVyLCB7dXNlRmFjdG9yeTogKCkgPT4geyByZXR1cm4gMSsyOyB9fSksXG4gICAqICAgcHJvdmlkZShTdHJpbmcsIHt1c2VGYWN0b3J5OiAodikgPT4geyByZXR1cm4gXCJWYWx1ZTogXCIgKyB2OyB9LCBkZXBzOiBbTnVtYmVyXX0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KE51bWJlcikpLnRvRXF1YWwoMyk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoU3RyaW5nKSkudG9FcXVhbCgnVmFsdWU6IDMnKTtcbiAgICogYGBgXG4gICAqL1xuICB0b0ZhY3RvcnkoZmFjdG9yeTogRnVuY3Rpb24sIGRlcGVuZGVuY2llcz86IGFueVtdKTogUHJvdmlkZXIge1xuICAgIGlmICghaXNGdW5jdGlvbihmYWN0b3J5KSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgYFRyeWluZyB0byBjcmVhdGUgYSBmYWN0b3J5IHByb3ZpZGVyIGJ1dCBcIiR7c3RyaW5naWZ5KGZhY3RvcnkpfVwiIGlzIG5vdCBhIGZ1bmN0aW9uIWApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb3ZpZGVyKHRoaXMudG9rZW4sIHt1c2VGYWN0b3J5OiBmYWN0b3J5LCBkZXBzOiBkZXBlbmRlbmNpZXN9KTtcbiAgfVxufVxuXG4vKipcbiAqIFJlc29sdmUgYSBzaW5nbGUgcHJvdmlkZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRmFjdG9yeShwcm92aWRlcjogUHJvdmlkZXIpOiBSZXNvbHZlZEZhY3Rvcnkge1xuICB2YXIgZmFjdG9yeUZuOiBGdW5jdGlvbjtcbiAgdmFyIHJlc29sdmVkRGVwcztcbiAgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VDbGFzcykpIHtcbiAgICB2YXIgdXNlQ2xhc3MgPSByZXNvbHZlRm9yd2FyZFJlZihwcm92aWRlci51c2VDbGFzcyk7XG4gICAgZmFjdG9yeUZuID0gcmVmbGVjdG9yLmZhY3RvcnkodXNlQ2xhc3MpO1xuICAgIHJlc29sdmVkRGVwcyA9IF9kZXBlbmRlbmNpZXNGb3IodXNlQ2xhc3MpO1xuICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VFeGlzdGluZykpIHtcbiAgICBmYWN0b3J5Rm4gPSAoYWxpYXNJbnN0YW5jZSkgPT4gYWxpYXNJbnN0YW5jZTtcbiAgICByZXNvbHZlZERlcHMgPSBbRGVwZW5kZW5jeS5mcm9tS2V5KEtleS5nZXQocHJvdmlkZXIudXNlRXhpc3RpbmcpKV07XG4gIH0gZWxzZSBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUZhY3RvcnkpKSB7XG4gICAgZmFjdG9yeUZuID0gcHJvdmlkZXIudXNlRmFjdG9yeTtcbiAgICByZXNvbHZlZERlcHMgPSBfY29uc3RydWN0RGVwZW5kZW5jaWVzKHByb3ZpZGVyLnVzZUZhY3RvcnksIHByb3ZpZGVyLmRlcGVuZGVuY2llcyk7XG4gIH0gZWxzZSB7XG4gICAgZmFjdG9yeUZuID0gKCkgPT4gcHJvdmlkZXIudXNlVmFsdWU7XG4gICAgcmVzb2x2ZWREZXBzID0gX0VNUFRZX0xJU1Q7XG4gIH1cbiAgcmV0dXJuIG5ldyBSZXNvbHZlZEZhY3RvcnkoZmFjdG9yeUZuLCByZXNvbHZlZERlcHMpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHRoZSB7QGxpbmsgUHJvdmlkZXJ9IGludG8ge0BsaW5rIFJlc29sdmVkUHJvdmlkZXJ9LlxuICpcbiAqIHtAbGluayBJbmplY3Rvcn0gaW50ZXJuYWxseSBvbmx5IHVzZXMge0BsaW5rIFJlc29sdmVkUHJvdmlkZXJ9LCB7QGxpbmsgUHJvdmlkZXJ9IGNvbnRhaW5zXG4gKiBjb252ZW5pZW5jZSBwcm92aWRlciBzeW50YXguXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlUHJvdmlkZXIocHJvdmlkZXI6IFByb3ZpZGVyKTogUmVzb2x2ZWRQcm92aWRlciB7XG4gIHJldHVybiBuZXcgUmVzb2x2ZWRQcm92aWRlcl8oS2V5LmdldChwcm92aWRlci50b2tlbiksIFtyZXNvbHZlRmFjdG9yeShwcm92aWRlcildLCBmYWxzZSk7XG59XG5cbi8qKlxuICogUmVzb2x2ZSBhIGxpc3Qgb2YgUHJvdmlkZXJzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVByb3ZpZGVycyhwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IFJlc29sdmVkUHJvdmlkZXJbXSB7XG4gIHZhciBub3JtYWxpemVkID0gX2NyZWF0ZUxpc3RPZlByb3ZpZGVycyhfbm9ybWFsaXplUHJvdmlkZXJzKFxuICAgICAgcHJvdmlkZXJzLCBuZXcgTWFwPG51bWJlciwgX05vcm1hbGl6ZWRQcm92aWRlciB8IF9Ob3JtYWxpemVkUHJvdmlkZXJbXT4oKSkpO1xuICByZXR1cm4gbm9ybWFsaXplZC5tYXAoYiA9PiB7XG4gICAgaWYgKGIgaW5zdGFuY2VvZiBfTm9ybWFsaXplZFByb3ZpZGVyKSB7XG4gICAgICByZXR1cm4gbmV3IFJlc29sdmVkUHJvdmlkZXJfKGIua2V5LCBbYi5yZXNvbHZlZEZhY3RvcnldLCBmYWxzZSk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGFyciA9IDxfTm9ybWFsaXplZFByb3ZpZGVyW10+YjtcbiAgICAgIHJldHVybiBuZXcgUmVzb2x2ZWRQcm92aWRlcl8oYXJyWzBdLmtleSwgYXJyLm1hcChfID0+IF8ucmVzb2x2ZWRGYWN0b3J5KSwgdHJ1ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBUaGUgYWxnb3JpdGhtIHdvcmtzIGFzIGZvbGxvd3M6XG4gKlxuICogW1Byb3ZpZGVyXSAtPiBbX05vcm1hbGl6ZWRQcm92aWRlcnxbX05vcm1hbGl6ZWRQcm92aWRlcl1dIC0+IFtSZXNvbHZlZFByb3ZpZGVyXVxuICpcbiAqIF9Ob3JtYWxpemVkUHJvdmlkZXIgaXMgZXNzZW50aWFsbHkgYSByZXNvbHZlZCBwcm92aWRlciBiZWZvcmUgaXQgd2FzIGdyb3VwZWQgYnkga2V5LlxuICovXG5jbGFzcyBfTm9ybWFsaXplZFByb3ZpZGVyIHtcbiAgY29uc3RydWN0b3IocHVibGljIGtleTogS2V5LCBwdWJsaWMgcmVzb2x2ZWRGYWN0b3J5OiBSZXNvbHZlZEZhY3RvcnkpIHt9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVMaXN0T2ZQcm92aWRlcnMoZmxhdHRlbmVkUHJvdmlkZXJzOiBNYXA8bnVtYmVyLCBhbnk+KTogYW55W10ge1xuICByZXR1cm4gTWFwV3JhcHBlci52YWx1ZXMoZmxhdHRlbmVkUHJvdmlkZXJzKTtcbn1cblxuZnVuY3Rpb24gX25vcm1hbGl6ZVByb3ZpZGVycyhwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IFByb3ZpZGVyQnVpbGRlciB8IGFueVtdPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzOiBNYXA8bnVtYmVyLCBfTm9ybWFsaXplZFByb3ZpZGVyIHwgX05vcm1hbGl6ZWRQcm92aWRlcltdPik6XG4gICAgTWFwPG51bWJlciwgX05vcm1hbGl6ZWRQcm92aWRlciB8IF9Ob3JtYWxpemVkUHJvdmlkZXJbXT4ge1xuICBwcm92aWRlcnMuZm9yRWFjaChiID0+IHtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIFR5cGUpIHtcbiAgICAgIF9ub3JtYWxpemVQcm92aWRlcihwcm92aWRlKGIsIHt1c2VDbGFzczogYn0pLCByZXMpO1xuXG4gICAgfSBlbHNlIGlmIChiIGluc3RhbmNlb2YgUHJvdmlkZXIpIHtcbiAgICAgIF9ub3JtYWxpemVQcm92aWRlcihiLCByZXMpO1xuXG4gICAgfSBlbHNlIGlmIChiIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIF9ub3JtYWxpemVQcm92aWRlcnMoYiwgcmVzKTtcblxuICAgIH0gZWxzZSBpZiAoYiBpbnN0YW5jZW9mIFByb3ZpZGVyQnVpbGRlcikge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQcm92aWRlckVycm9yKGIudG9rZW4pO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUHJvdmlkZXJFcnJvcihiKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIF9ub3JtYWxpemVQcm92aWRlcihiOiBQcm92aWRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXM6IE1hcDxudW1iZXIsIF9Ob3JtYWxpemVkUHJvdmlkZXIgfCBfTm9ybWFsaXplZFByb3ZpZGVyW10+KTogdm9pZCB7XG4gIHZhciBrZXkgPSBLZXkuZ2V0KGIudG9rZW4pO1xuICB2YXIgZmFjdG9yeSA9IHJlc29sdmVGYWN0b3J5KGIpO1xuICB2YXIgbm9ybWFsaXplZCA9IG5ldyBfTm9ybWFsaXplZFByb3ZpZGVyKGtleSwgZmFjdG9yeSk7XG5cbiAgaWYgKGIubXVsdGkpIHtcbiAgICB2YXIgZXhpc3RpbmdQcm92aWRlciA9IHJlcy5nZXQoa2V5LmlkKTtcblxuICAgIGlmIChleGlzdGluZ1Byb3ZpZGVyIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIGV4aXN0aW5nUHJvdmlkZXIucHVzaChub3JtYWxpemVkKTtcblxuICAgIH0gZWxzZSBpZiAoaXNCbGFuayhleGlzdGluZ1Byb3ZpZGVyKSkge1xuICAgICAgcmVzLnNldChrZXkuaWQsIFtub3JtYWxpemVkXSk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IE1peGluZ011bHRpUHJvdmlkZXJzV2l0aFJlZ3VsYXJQcm92aWRlcnNFcnJvcihleGlzdGluZ1Byb3ZpZGVyLCBiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgZXhpc3RpbmdQcm92aWRlciA9IHJlcy5nZXQoa2V5LmlkKTtcblxuICAgIGlmIChleGlzdGluZ1Byb3ZpZGVyIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIHRocm93IG5ldyBNaXhpbmdNdWx0aVByb3ZpZGVyc1dpdGhSZWd1bGFyUHJvdmlkZXJzRXJyb3IoZXhpc3RpbmdQcm92aWRlciwgYik7XG4gICAgfVxuXG4gICAgcmVzLnNldChrZXkuaWQsIG5vcm1hbGl6ZWQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jb25zdHJ1Y3REZXBlbmRlbmNpZXMoZmFjdG9yeUZ1bmN0aW9uOiBGdW5jdGlvbiwgZGVwZW5kZW5jaWVzOiBhbnlbXSk6IERlcGVuZGVuY3lbXSB7XG4gIGlmIChpc0JsYW5rKGRlcGVuZGVuY2llcykpIHtcbiAgICByZXR1cm4gX2RlcGVuZGVuY2llc0ZvcihmYWN0b3J5RnVuY3Rpb24pO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJhbXM6IGFueVtdW10gPSBkZXBlbmRlbmNpZXMubWFwKHQgPT4gW3RdKTtcbiAgICByZXR1cm4gZGVwZW5kZW5jaWVzLm1hcCh0ID0+IF9leHRyYWN0VG9rZW4oZmFjdG9yeUZ1bmN0aW9uLCB0LCBwYXJhbXMpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfZGVwZW5kZW5jaWVzRm9yKHR5cGVPckZ1bmMpOiBEZXBlbmRlbmN5W10ge1xuICB2YXIgcGFyYW1zID0gcmVmbGVjdG9yLnBhcmFtZXRlcnModHlwZU9yRnVuYyk7XG4gIGlmIChpc0JsYW5rKHBhcmFtcykpIHJldHVybiBbXTtcbiAgaWYgKHBhcmFtcy5zb21lKGlzQmxhbmspKSB7XG4gICAgdGhyb3cgbmV3IE5vQW5ub3RhdGlvbkVycm9yKHR5cGVPckZ1bmMsIHBhcmFtcyk7XG4gIH1cbiAgcmV0dXJuIHBhcmFtcy5tYXAoKHA6IGFueVtdKSA9PiBfZXh0cmFjdFRva2VuKHR5cGVPckZ1bmMsIHAsIHBhcmFtcykpO1xufVxuXG5mdW5jdGlvbiBfZXh0cmFjdFRva2VuKHR5cGVPckZ1bmMsIG1ldGFkYXRhIC8qYW55W10gfCBhbnkqLywgcGFyYW1zOiBhbnlbXVtdKTogRGVwZW5kZW5jeSB7XG4gIHZhciBkZXBQcm9wcyA9IFtdO1xuICB2YXIgdG9rZW4gPSBudWxsO1xuICB2YXIgb3B0aW9uYWwgPSBmYWxzZTtcblxuICBpZiAoIWlzQXJyYXkobWV0YWRhdGEpKSB7XG4gICAgaWYgKG1ldGFkYXRhIGluc3RhbmNlb2YgSW5qZWN0TWV0YWRhdGEpIHtcbiAgICAgIHJldHVybiBfY3JlYXRlRGVwZW5kZW5jeShtZXRhZGF0YS50b2tlbiwgb3B0aW9uYWwsIG51bGwsIG51bGwsIGRlcFByb3BzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIF9jcmVhdGVEZXBlbmRlbmN5KG1ldGFkYXRhLCBvcHRpb25hbCwgbnVsbCwgbnVsbCwgZGVwUHJvcHMpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBsb3dlckJvdW5kVmlzaWJpbGl0eSA9IG51bGw7XG4gIHZhciB1cHBlckJvdW5kVmlzaWJpbGl0eSA9IG51bGw7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZXRhZGF0YS5sZW5ndGg7ICsraSkge1xuICAgIHZhciBwYXJhbU1ldGFkYXRhID0gbWV0YWRhdGFbaV07XG5cbiAgICBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIFR5cGUpIHtcbiAgICAgIHRva2VuID0gcGFyYW1NZXRhZGF0YTtcblxuICAgIH0gZWxzZSBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIEluamVjdE1ldGFkYXRhKSB7XG4gICAgICB0b2tlbiA9IHBhcmFtTWV0YWRhdGEudG9rZW47XG5cbiAgICB9IGVsc2UgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBPcHRpb25hbE1ldGFkYXRhKSB7XG4gICAgICBvcHRpb25hbCA9IHRydWU7XG5cbiAgICB9IGVsc2UgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBTZWxmTWV0YWRhdGEpIHtcbiAgICAgIHVwcGVyQm91bmRWaXNpYmlsaXR5ID0gcGFyYW1NZXRhZGF0YTtcblxuICAgIH0gZWxzZSBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIEhvc3RNZXRhZGF0YSkge1xuICAgICAgdXBwZXJCb3VuZFZpc2liaWxpdHkgPSBwYXJhbU1ldGFkYXRhO1xuXG4gICAgfSBlbHNlIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgU2tpcFNlbGZNZXRhZGF0YSkge1xuICAgICAgbG93ZXJCb3VuZFZpc2liaWxpdHkgPSBwYXJhbU1ldGFkYXRhO1xuXG4gICAgfSBlbHNlIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgRGVwZW5kZW5jeU1ldGFkYXRhKSB7XG4gICAgICBpZiAoaXNQcmVzZW50KHBhcmFtTWV0YWRhdGEudG9rZW4pKSB7XG4gICAgICAgIHRva2VuID0gcGFyYW1NZXRhZGF0YS50b2tlbjtcbiAgICAgIH1cbiAgICAgIGRlcFByb3BzLnB1c2gocGFyYW1NZXRhZGF0YSk7XG4gICAgfVxuICB9XG5cbiAgdG9rZW4gPSByZXNvbHZlRm9yd2FyZFJlZih0b2tlbik7XG5cbiAgaWYgKGlzUHJlc2VudCh0b2tlbikpIHtcbiAgICByZXR1cm4gX2NyZWF0ZURlcGVuZGVuY3kodG9rZW4sIG9wdGlvbmFsLCBsb3dlckJvdW5kVmlzaWJpbGl0eSwgdXBwZXJCb3VuZFZpc2liaWxpdHksIGRlcFByb3BzKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgTm9Bbm5vdGF0aW9uRXJyb3IodHlwZU9yRnVuYywgcGFyYW1zKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlRGVwZW5kZW5jeSh0b2tlbiwgb3B0aW9uYWwsIGxvd2VyQm91bmRWaXNpYmlsaXR5LCB1cHBlckJvdW5kVmlzaWJpbGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcFByb3BzKTogRGVwZW5kZW5jeSB7XG4gIHJldHVybiBuZXcgRGVwZW5kZW5jeShLZXkuZ2V0KHRva2VuKSwgb3B0aW9uYWwsIGxvd2VyQm91bmRWaXNpYmlsaXR5LCB1cHBlckJvdW5kVmlzaWJpbGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcFByb3BzKTtcbn1cbiJdfQ==