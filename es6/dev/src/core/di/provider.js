var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlci50cyJdLCJuYW1lcyI6WyJEZXBlbmRlbmN5IiwiRGVwZW5kZW5jeS5jb25zdHJ1Y3RvciIsIkRlcGVuZGVuY3kuZnJvbUtleSIsIlByb3ZpZGVyIiwiUHJvdmlkZXIuY29uc3RydWN0b3IiLCJQcm92aWRlci5tdWx0aSIsIkJpbmRpbmciLCJCaW5kaW5nLmNvbnN0cnVjdG9yIiwiQmluZGluZy50b0NsYXNzIiwiQmluZGluZy50b0FsaWFzIiwiQmluZGluZy50b0ZhY3RvcnkiLCJCaW5kaW5nLnRvVmFsdWUiLCJSZXNvbHZlZFByb3ZpZGVyXyIsIlJlc29sdmVkUHJvdmlkZXJfLmNvbnN0cnVjdG9yIiwiUmVzb2x2ZWRQcm92aWRlcl8ucmVzb2x2ZWRGYWN0b3J5IiwiUmVzb2x2ZWRGYWN0b3J5IiwiUmVzb2x2ZWRGYWN0b3J5LmNvbnN0cnVjdG9yIiwiYmluZCIsInByb3ZpZGUiLCJQcm92aWRlckJ1aWxkZXIiLCJQcm92aWRlckJ1aWxkZXIuY29uc3RydWN0b3IiLCJQcm92aWRlckJ1aWxkZXIudG9DbGFzcyIsIlByb3ZpZGVyQnVpbGRlci50b1ZhbHVlIiwiUHJvdmlkZXJCdWlsZGVyLnRvQWxpYXMiLCJQcm92aWRlckJ1aWxkZXIudG9GYWN0b3J5IiwicmVzb2x2ZUZhY3RvcnkiLCJyZXNvbHZlUHJvdmlkZXIiLCJyZXNvbHZlUHJvdmlkZXJzIiwiX05vcm1hbGl6ZWRQcm92aWRlciIsIl9Ob3JtYWxpemVkUHJvdmlkZXIuY29uc3RydWN0b3IiLCJfY3JlYXRlTGlzdE9mUHJvdmlkZXJzIiwiX25vcm1hbGl6ZVByb3ZpZGVycyIsIl9ub3JtYWxpemVQcm92aWRlciIsIl9jb25zdHJ1Y3REZXBlbmRlbmNpZXMiLCJfZGVwZW5kZW5jaWVzRm9yIiwiX2V4dHJhY3RUb2tlbiIsIl9jcmVhdGVEZXBlbmRlbmN5Il0sIm1hcHBpbmdzIjoi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LFFBQVFBLEVBQUVBLG9CQUFvQkEsRUFBRUEsb0JBQW9CQSxFQUNwRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7QUFDbENBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgVHlwZSxcbiAgaXNCbGFuayxcbiAgaXNQcmVzZW50LFxuICBDT05TVCxcbiAgQ09OU1RfRVhQUixcbiAgc3RyaW5naWZ5LFxuICBpc0FycmF5LFxuICBpc1R5cGUsXG4gIGlzRnVuY3Rpb24sXG4gIG5vcm1hbGl6ZUJvb2xcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcbmltcG9ydCB7S2V5fSBmcm9tICcuL2tleSc7XG5pbXBvcnQge1xuICBJbmplY3RNZXRhZGF0YSxcbiAgSW5qZWN0YWJsZU1ldGFkYXRhLFxuICBPcHRpb25hbE1ldGFkYXRhLFxuICBTZWxmTWV0YWRhdGEsXG4gIEhvc3RNZXRhZGF0YSxcbiAgU2tpcFNlbGZNZXRhZGF0YSxcbiAgRGVwZW5kZW5jeU1ldGFkYXRhXG59IGZyb20gJy4vbWV0YWRhdGEnO1xuaW1wb3J0IHtcbiAgTm9Bbm5vdGF0aW9uRXJyb3IsXG4gIE1peGluZ011bHRpUHJvdmlkZXJzV2l0aFJlZ3VsYXJQcm92aWRlcnNFcnJvcixcbiAgSW52YWxpZFByb3ZpZGVyRXJyb3Jcbn0gZnJvbSAnLi9leGNlcHRpb25zJztcbmltcG9ydCB7cmVzb2x2ZUZvcndhcmRSZWZ9IGZyb20gJy4vZm9yd2FyZF9yZWYnO1xuXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jeSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBrZXk6IEtleSwgcHVibGljIG9wdGlvbmFsOiBib29sZWFuLCBwdWJsaWMgbG93ZXJCb3VuZFZpc2liaWxpdHk6IGFueSxcbiAgICAgICAgICAgICAgcHVibGljIHVwcGVyQm91bmRWaXNpYmlsaXR5OiBhbnksIHB1YmxpYyBwcm9wZXJ0aWVzOiBhbnlbXSkge31cblxuICBzdGF0aWMgZnJvbUtleShrZXk6IEtleSk6IERlcGVuZGVuY3kgeyByZXR1cm4gbmV3IERlcGVuZGVuY3koa2V5LCBmYWxzZSwgbnVsbCwgbnVsbCwgW10pOyB9XG59XG5cbmNvbnN0IF9FTVBUWV9MSVNUID0gQ09OU1RfRVhQUihbXSk7XG5cbi8qKlxuICogRGVzY3JpYmVzIGhvdyB0aGUge0BsaW5rIEluamVjdG9yfSBzaG91bGQgaW5zdGFudGlhdGUgYSBnaXZlbiB0b2tlbi5cbiAqXG4gKiBTZWUge0BsaW5rIHByb3ZpZGV9LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9HTkF5ajZLNlBmWWcyTkJ6Z3daNT9wJTNEcHJldmlldyZwPXByZXZpZXcpKVxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICogICBuZXcgUHJvdmlkZXIoXCJtZXNzYWdlXCIsIHsgdXNlVmFsdWU6ICdIZWxsbycgfSlcbiAqIF0pO1xuICpcbiAqIGV4cGVjdChpbmplY3Rvci5nZXQoXCJtZXNzYWdlXCIpKS50b0VxdWFsKCdIZWxsbycpO1xuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgUHJvdmlkZXIge1xuICAvKipcbiAgICogVG9rZW4gdXNlZCB3aGVuIHJldHJpZXZpbmcgdGhpcyBwcm92aWRlci4gVXN1YWxseSwgaXQgaXMgYSB0eXBlIHtAbGluayBUeXBlfS5cbiAgICovXG4gIHRva2VuO1xuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGFuIGltcGxlbWVudGF0aW9uIGNsYXNzLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvUlNURzg2cWdtb3hDeWo5U1dQd1k/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogQmVjYXVzZSBgdXNlRXhpc3RpbmdgIGFuZCBgdXNlQ2xhc3NgIGFyZSBvZnRlbiBjb25mdXNlZCwgdGhlIGV4YW1wbGUgY29udGFpbnNcbiAgICogYm90aCB1c2UgY2FzZXMgZm9yIGVhc3kgY29tcGFyaXNvbi5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBjbGFzcyBWZWhpY2xlIHt9XG4gICAqXG4gICAqIGNsYXNzIENhciBleHRlbmRzIFZlaGljbGUge31cbiAgICpcbiAgICogdmFyIGluamVjdG9yQ2xhc3MgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgbmV3IFByb3ZpZGVyKFZlaGljbGUsIHsgdXNlQ2xhc3M6IENhciB9KVxuICAgKiBdKTtcbiAgICogdmFyIGluamVjdG9yQWxpYXMgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBDYXIsXG4gICAqICAgbmV3IFByb3ZpZGVyKFZlaGljbGUsIHsgdXNlRXhpc3Rpbmc6IENhciB9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpKS5ub3QudG9CZShpbmplY3RvckNsYXNzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkpLnRvQmUoaW5qZWN0b3JBbGlhcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICB1c2VDbGFzczogVHlwZTtcblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIHZhbHVlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvVUZWc01WUUlEZTdsNHdhV3ppRVM/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgamF2YXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBuZXcgUHJvdmlkZXIoXCJtZXNzYWdlXCIsIHsgdXNlVmFsdWU6ICdIZWxsbycgfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoXCJtZXNzYWdlXCIpKS50b0VxdWFsKCdIZWxsbycpO1xuICAgKiBgYGBcbiAgICovXG4gIHVzZVZhbHVlO1xuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGFuIGV4aXN0aW5nIHRva2VuLlxuICAgKlxuICAgKiB7QGxpbmsgSW5qZWN0b3J9IHJldHVybnMgdGhlIHNhbWUgaW5zdGFuY2UgYXMgaWYgdGhlIHByb3ZpZGVkIHRva2VuIHdhcyB1c2VkLlxuICAgKiBUaGlzIGlzIGluIGNvbnRyYXN0IHRvIGB1c2VDbGFzc2Agd2hlcmUgYSBzZXBhcmF0ZSBpbnN0YW5jZSBvZiBgdXNlQ2xhc3NgIGlzIHJldHVybmVkLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvUXNhdHNPSko2UDhUMmZNZTlncjg/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogQmVjYXVzZSBgdXNlRXhpc3RpbmdgIGFuZCBgdXNlQ2xhc3NgIGFyZSBvZnRlbiBjb25mdXNlZCB0aGUgZXhhbXBsZSBjb250YWluc1xuICAgKiBib3RoIHVzZSBjYXNlcyBmb3IgZWFzeSBjb21wYXJpc29uLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFZlaGljbGUge31cbiAgICpcbiAgICogY2xhc3MgQ2FyIGV4dGVuZHMgVmVoaWNsZSB7fVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3JBbGlhcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBuZXcgUHJvdmlkZXIoVmVoaWNsZSwgeyB1c2VFeGlzdGluZzogQ2FyIH0pXG4gICAqIF0pO1xuICAgKiB2YXIgaW5qZWN0b3JDbGFzcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBuZXcgUHJvdmlkZXIoVmVoaWNsZSwgeyB1c2VDbGFzczogQ2FyIH0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkpLnRvQmUoaW5qZWN0b3JBbGlhcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpKS5ub3QudG9CZShpbmplY3RvckNsYXNzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKiBgYGBcbiAgICovXG4gIHVzZUV4aXN0aW5nO1xuXG4gIC8qKlxuICAgKiBCaW5kcyBhIERJIHRva2VuIHRvIGEgZnVuY3Rpb24gd2hpY2ggY29tcHV0ZXMgdGhlIHZhbHVlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvU2NveHkwcEpOcUtHQVBaWTFWVkM/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBuZXcgUHJvdmlkZXIoTnVtYmVyLCB7IHVzZUZhY3Rvcnk6ICgpID0+IHsgcmV0dXJuIDErMjsgfX0pLFxuICAgKiAgIG5ldyBQcm92aWRlcihTdHJpbmcsIHsgdXNlRmFjdG9yeTogKHZhbHVlKSA9PiB7IHJldHVybiBcIlZhbHVlOiBcIiArIHZhbHVlOyB9LFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgZGVwczogW051bWJlcl0gfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoTnVtYmVyKSkudG9FcXVhbCgzKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChTdHJpbmcpKS50b0VxdWFsKCdWYWx1ZTogMycpO1xuICAgKiBgYGBcbiAgICpcbiAgICogVXNlZCBpbiBjb25qdWN0aW9uIHdpdGggZGVwZW5kZW5jaWVzLlxuICAgKi9cbiAgdXNlRmFjdG9yeTogRnVuY3Rpb247XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBhIHNldCBvZiBkZXBlbmRlbmNpZXNcbiAgICogKGFzIGB0b2tlbmBzKSB3aGljaCBzaG91bGQgYmUgaW5qZWN0ZWQgaW50byB0aGUgZmFjdG9yeSBmdW5jdGlvbi5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1Njb3h5MHBKTnFLR0FQWlkxVlZDP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKE51bWJlciwgeyB1c2VGYWN0b3J5OiAoKSA9PiB7IHJldHVybiAxKzI7IH19KSxcbiAgICogICBuZXcgUHJvdmlkZXIoU3RyaW5nLCB7IHVzZUZhY3Rvcnk6ICh2YWx1ZSkgPT4geyByZXR1cm4gXCJWYWx1ZTogXCIgKyB2YWx1ZTsgfSxcbiAgICogICAgICAgICAgICAgICAgICAgICAgIGRlcHM6IFtOdW1iZXJdIH0pXG4gICAqIF0pO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3IuZ2V0KE51bWJlcikpLnRvRXF1YWwoMyk7XG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoU3RyaW5nKSkudG9FcXVhbCgnVmFsdWU6IDMnKTtcbiAgICogYGBgXG4gICAqXG4gICAqIFVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBgdXNlRmFjdG9yeWAuXG4gICAqL1xuICBkZXBlbmRlbmNpZXM6IE9iamVjdFtdO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX211bHRpOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHRva2VuLCB7dXNlQ2xhc3MsIHVzZVZhbHVlLCB1c2VFeGlzdGluZywgdXNlRmFjdG9yeSwgZGVwcywgbXVsdGl9OiB7XG4gICAgdXNlQ2xhc3M/OiBUeXBlLFxuICAgIHVzZVZhbHVlPzogYW55LFxuICAgIHVzZUV4aXN0aW5nPzogYW55LFxuICAgIHVzZUZhY3Rvcnk/OiBGdW5jdGlvbixcbiAgICBkZXBzPzogT2JqZWN0W10sXG4gICAgbXVsdGk/OiBib29sZWFuXG4gIH0pIHtcbiAgICB0aGlzLnRva2VuID0gdG9rZW47XG4gICAgdGhpcy51c2VDbGFzcyA9IHVzZUNsYXNzO1xuICAgIHRoaXMudXNlVmFsdWUgPSB1c2VWYWx1ZTtcbiAgICB0aGlzLnVzZUV4aXN0aW5nID0gdXNlRXhpc3Rpbmc7XG4gICAgdGhpcy51c2VGYWN0b3J5ID0gdXNlRmFjdG9yeTtcbiAgICB0aGlzLmRlcGVuZGVuY2llcyA9IGRlcHM7XG4gICAgdGhpcy5fbXVsdGkgPSBtdWx0aTtcbiAgfVxuXG4gIC8vIFRPRE86IFByb3ZpZGUgYSBmdWxsIHdvcmtpbmcgZXhhbXBsZSBhZnRlciBhbHBoYTM4IGlzIHJlbGVhc2VkLlxuICAvKipcbiAgICogQ3JlYXRlcyBtdWx0aXBsZSBwcm92aWRlcnMgbWF0Y2hpbmcgdGhlIHNhbWUgdG9rZW4gKGEgbXVsdGktcHJvdmlkZXIpLlxuICAgKlxuICAgKiBNdWx0aS1wcm92aWRlcnMgYXJlIHVzZWQgZm9yIGNyZWF0aW5nIHBsdWdnYWJsZSBzZXJ2aWNlLCB3aGVyZSB0aGUgc3lzdGVtIGNvbWVzXG4gICAqIHdpdGggc29tZSBkZWZhdWx0IHByb3ZpZGVycywgYW5kIHRoZSB1c2VyIGNhbiByZWdpc3RlciBhZGRpdG9uYWwgcHJvdmlkZXJzLlxuICAgKiBUaGUgY29tYmluYXRpb24gb2YgdGhlIGRlZmF1bHQgcHJvdmlkZXJzIGFuZCB0aGUgYWRkaXRpb25hbCBwcm92aWRlcnMgd2lsbCBiZVxuICAgKiB1c2VkIHRvIGRyaXZlIHRoZSBiZWhhdmlvciBvZiB0aGUgc3lzdGVtLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIG5ldyBQcm92aWRlcihcIlN0cmluZ3NcIiwgeyB1c2VWYWx1ZTogXCJTdHJpbmcxXCIsIG11bHRpOiB0cnVlfSksXG4gICAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7IHVzZVZhbHVlOiBcIlN0cmluZzJcIiwgbXVsdGk6IHRydWV9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChcIlN0cmluZ3NcIikpLnRvRXF1YWwoW1wiU3RyaW5nMVwiLCBcIlN0cmluZzJcIl0pO1xuICAgKiBgYGBcbiAgICpcbiAgICogTXVsdGktcHJvdmlkZXJzIGFuZCByZWd1bGFyIHByb3ZpZGVycyBjYW5ub3QgYmUgbWl4ZWQuIFRoZSBmb2xsb3dpbmdcbiAgICogd2lsbCB0aHJvdyBhbiBleGNlcHRpb246XG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7IHVzZVZhbHVlOiBcIlN0cmluZzFcIiwgbXVsdGk6IHRydWUgfSksXG4gICAqICAgbmV3IFByb3ZpZGVyKFwiU3RyaW5nc1wiLCB7IHVzZVZhbHVlOiBcIlN0cmluZzJcIn0pXG4gICAqIF0pO1xuICAgKiBgYGBcbiAgICovXG4gIGdldCBtdWx0aSgpOiBib29sZWFuIHsgcmV0dXJuIG5vcm1hbGl6ZUJvb2wodGhpcy5fbXVsdGkpOyB9XG59XG5cbi8qKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBCaW5kaW5nIGV4dGVuZHMgUHJvdmlkZXIge1xuICBjb25zdHJ1Y3Rvcih0b2tlbiwge3RvQ2xhc3MsIHRvVmFsdWUsIHRvQWxpYXMsIHRvRmFjdG9yeSwgZGVwcywgbXVsdGl9OiB7XG4gICAgdG9DbGFzcz86IFR5cGUsXG4gICAgdG9WYWx1ZT86IGFueSxcbiAgICB0b0FsaWFzPzogYW55LFxuICAgIHRvRmFjdG9yeTogRnVuY3Rpb24sIGRlcHM/OiBPYmplY3RbXSwgbXVsdGk/OiBib29sZWFuXG4gIH0pIHtcbiAgICBzdXBlcih0b2tlbiwge1xuICAgICAgdXNlQ2xhc3M6IHRvQ2xhc3MsXG4gICAgICB1c2VWYWx1ZTogdG9WYWx1ZSxcbiAgICAgIHVzZUV4aXN0aW5nOiB0b0FsaWFzLFxuICAgICAgdXNlRmFjdG9yeTogdG9GYWN0b3J5LFxuICAgICAgZGVwczogZGVwcyxcbiAgICAgIG11bHRpOiBtdWx0aVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBnZXQgdG9DbGFzcygpIHsgcmV0dXJuIHRoaXMudXNlQ2xhc3M7IH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdldCB0b0FsaWFzKCkgeyByZXR1cm4gdGhpcy51c2VFeGlzdGluZzsgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgZ2V0IHRvRmFjdG9yeSgpIHsgcmV0dXJuIHRoaXMudXNlRmFjdG9yeTsgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgZ2V0IHRvVmFsdWUoKSB7IHJldHVybiB0aGlzLnVzZVZhbHVlOyB9XG59XG5cbi8qKlxuICogQW4gaW50ZXJuYWwgcmVzb2x2ZWQgcmVwcmVzZW50YXRpb24gb2YgYSB7QGxpbmsgUHJvdmlkZXJ9IHVzZWQgYnkgdGhlIHtAbGluayBJbmplY3Rvcn0uXG4gKlxuICogSXQgaXMgdXN1YWxseSBjcmVhdGVkIGF1dG9tYXRpY2FsbHkgYnkgYEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGVgLlxuICpcbiAqIEl0IGNhbiBiZSBjcmVhdGVkIG1hbnVhbGx5LCBhcyBmb2xsb3dzOlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9SZkVuaGg4a1VFSTBHM3FzbkllVD9wJTNEcHJldmlldyZwPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHZhciByZXNvbHZlZFByb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUoW25ldyBQcm92aWRlcignbWVzc2FnZScsIHt1c2VWYWx1ZTogJ0hlbGxvJ30pXSk7XG4gKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5mcm9tUmVzb2x2ZWRQcm92aWRlcnMocmVzb2x2ZWRQcm92aWRlcnMpO1xuICpcbiAqIGV4cGVjdChpbmplY3Rvci5nZXQoJ21lc3NhZ2UnKSkudG9FcXVhbCgnSGVsbG8nKTtcbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlc29sdmVkUHJvdmlkZXIge1xuICAvKipcbiAgICogQSBrZXksIHVzdWFsbHkgYSBgVHlwZWAuXG4gICAqL1xuICBrZXk6IEtleTtcblxuICAvKipcbiAgICogRmFjdG9yeSBmdW5jdGlvbiB3aGljaCBjYW4gcmV0dXJuIGFuIGluc3RhbmNlIG9mIGFuIG9iamVjdCByZXByZXNlbnRlZCBieSBhIGtleS5cbiAgICovXG4gIHJlc29sdmVkRmFjdG9yaWVzOiBSZXNvbHZlZEZhY3RvcnlbXTtcblxuICAvKipcbiAgICogSW5kaWNhdGVzIGlmIHRoZSBwcm92aWRlciBpcyBhIG11bHRpLXByb3ZpZGVyIG9yIGEgcmVndWxhciBwcm92aWRlci5cbiAgICovXG4gIG11bHRpUHJvdmlkZXI6IGJvb2xlYW47XG59XG5cbi8qKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXNvbHZlZEJpbmRpbmcgZXh0ZW5kcyBSZXNvbHZlZFByb3ZpZGVyIHt9XG5cbmV4cG9ydCBjbGFzcyBSZXNvbHZlZFByb3ZpZGVyXyBpbXBsZW1lbnRzIFJlc29sdmVkQmluZGluZyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBrZXk6IEtleSwgcHVibGljIHJlc29sdmVkRmFjdG9yaWVzOiBSZXNvbHZlZEZhY3RvcnlbXSxcbiAgICAgICAgICAgICAgcHVibGljIG11bHRpUHJvdmlkZXI6IGJvb2xlYW4pIHt9XG5cbiAgZ2V0IHJlc29sdmVkRmFjdG9yeSgpOiBSZXNvbHZlZEZhY3RvcnkgeyByZXR1cm4gdGhpcy5yZXNvbHZlZEZhY3Rvcmllc1swXTsgfVxufVxuXG4vKipcbiAqIEFuIGludGVybmFsIHJlc29sdmVkIHJlcHJlc2VudGF0aW9uIG9mIGEgZmFjdG9yeSBmdW5jdGlvbiBjcmVhdGVkIGJ5IHJlc29sdmluZyB7QGxpbmsgUHJvdmlkZXJ9LlxuICovXG5leHBvcnQgY2xhc3MgUmVzb2x2ZWRGYWN0b3J5IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICAvKipcbiAgICAgICAqIEZhY3RvcnkgZnVuY3Rpb24gd2hpY2ggY2FuIHJldHVybiBhbiBpbnN0YW5jZSBvZiBhbiBvYmplY3QgcmVwcmVzZW50ZWQgYnkgYSBrZXkuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBmYWN0b3J5OiBGdW5jdGlvbixcblxuICAgICAgLyoqXG4gICAgICAgKiBBcmd1bWVudHMgKGRlcGVuZGVuY2llcykgdG8gdGhlIGBmYWN0b3J5YCBmdW5jdGlvbi5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGRlcGVuZGVuY2llczogRGVwZW5kZW5jeVtdKSB7fVxufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKiBDcmVhdGVzIGEge0BsaW5rIFByb3ZpZGVyfS5cbiAqXG4gKiBUbyBjb25zdHJ1Y3QgYSB7QGxpbmsgUHJvdmlkZXJ9LCBiaW5kIGEgYHRva2VuYCB0byBlaXRoZXIgYSBjbGFzcywgYSB2YWx1ZSwgYSBmYWN0b3J5IGZ1bmN0aW9uLFxuICogb3JcbiAqIHRvIGFuIGV4aXN0aW5nIGB0b2tlbmAuXG4gKiBTZWUge0BsaW5rIFByb3ZpZGVyQnVpbGRlcn0gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBUaGUgYHRva2VuYCBpcyBtb3N0IGNvbW1vbmx5IGEgY2xhc3Mgb3Ige0BsaW5rIGFuZ3VsYXIyL2RpL09wYXF1ZVRva2VufS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmQodG9rZW4pOiBQcm92aWRlckJ1aWxkZXIge1xuICByZXR1cm4gbmV3IFByb3ZpZGVyQnVpbGRlcih0b2tlbik7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHtAbGluayBQcm92aWRlcn0uXG4gKlxuICogU2VlIHtAbGluayBQcm92aWRlcn0gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiA8IS0tIFRPRE86IGltcHJvdmUgdGhlIGRvY3MgLS0+XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlKHRva2VuLCB7dXNlQ2xhc3MsIHVzZVZhbHVlLCB1c2VFeGlzdGluZywgdXNlRmFjdG9yeSwgZGVwcywgbXVsdGl9OiB7XG4gIHVzZUNsYXNzPzogVHlwZSxcbiAgdXNlVmFsdWU/OiBhbnksXG4gIHVzZUV4aXN0aW5nPzogYW55LFxuICB1c2VGYWN0b3J5PzogRnVuY3Rpb24sXG4gIGRlcHM/OiBPYmplY3RbXSxcbiAgbXVsdGk/OiBib29sZWFuXG59KTogUHJvdmlkZXIge1xuICByZXR1cm4gbmV3IFByb3ZpZGVyKHRva2VuLCB7XG4gICAgdXNlQ2xhc3M6IHVzZUNsYXNzLFxuICAgIHVzZVZhbHVlOiB1c2VWYWx1ZSxcbiAgICB1c2VFeGlzdGluZzogdXNlRXhpc3RpbmcsXG4gICAgdXNlRmFjdG9yeTogdXNlRmFjdG9yeSxcbiAgICBkZXBzOiBkZXBzLFxuICAgIG11bHRpOiBtdWx0aVxuICB9KTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgZm9yIHRoZSB7QGxpbmsgYmluZH0gZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm92aWRlckJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG9rZW4pIHt9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYSBjbGFzcy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1pwQkNTWXF2NmUydWQ1S1hMZHhRP3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHRvQWxpYXNgIGFuZCBgdG9DbGFzc2AgYXJlIG9mdGVuIGNvbmZ1c2VkLCB0aGUgZXhhbXBsZSBjb250YWluc1xuICAgKiBib3RoIHVzZSBjYXNlcyBmb3IgZWFzeSBjb21wYXJpc29uLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFZlaGljbGUge31cbiAgICpcbiAgICogY2xhc3MgQ2FyIGV4dGVuZHMgVmVoaWNsZSB7fVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3JDbGFzcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBwcm92aWRlKFZlaGljbGUsIHt1c2VDbGFzczogQ2FyfSlcbiAgICogXSk7XG4gICAqIHZhciBpbmplY3RvckFsaWFzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIHByb3ZpZGUoVmVoaWNsZSwge3VzZUV4aXN0aW5nOiBDYXJ9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpKS5ub3QudG9CZShpbmplY3RvckNsYXNzLmdldChDYXIpKTtcbiAgICogZXhwZWN0KGluamVjdG9yQ2xhc3MuZ2V0KFZlaGljbGUpIGluc3RhbmNlb2YgQ2FyKS50b0JlKHRydWUpO1xuICAgKlxuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkpLnRvQmUoaW5qZWN0b3JBbGlhcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckFsaWFzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICB0b0NsYXNzKHR5cGU6IFR5cGUpOiBQcm92aWRlciB7XG4gICAgaWYgKCFpc1R5cGUodHlwZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBUcnlpbmcgdG8gY3JlYXRlIGEgY2xhc3MgcHJvdmlkZXIgYnV0IFwiJHtzdHJpbmdpZnkodHlwZSl9XCIgaXMgbm90IGEgY2xhc3MhYCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvdmlkZXIodGhpcy50b2tlbiwge3VzZUNsYXNzOiB0eXBlfSk7XG4gIH1cblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIHZhbHVlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvRzAyNFBGSG1ETDBjSkZnZlpLOE8/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICBwcm92aWRlKCdtZXNzYWdlJywge3VzZVZhbHVlOiAnSGVsbG8nfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoJ21lc3NhZ2UnKSkudG9FcXVhbCgnSGVsbG8nKTtcbiAgICogYGBgXG4gICAqL1xuICB0b1ZhbHVlKHZhbHVlOiBhbnkpOiBQcm92aWRlciB7IHJldHVybiBuZXcgUHJvdmlkZXIodGhpcy50b2tlbiwge3VzZVZhbHVlOiB2YWx1ZX0pOyB9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgREkgdG9rZW4gdG8gYW4gZXhpc3RpbmcgdG9rZW4uXG4gICAqXG4gICAqIEFuZ3VsYXIgd2lsbCByZXR1cm4gdGhlIHNhbWUgaW5zdGFuY2UgYXMgaWYgdGhlIHByb3ZpZGVkIHRva2VuIHdhcyB1c2VkLiAoVGhpcyBpc1xuICAgKiBpbiBjb250cmFzdCB0byBgdXNlQ2xhc3NgIHdoZXJlIGEgc2VwYXJhdGUgaW5zdGFuY2Ugb2YgYHVzZUNsYXNzYCB3aWxsIGJlIHJldHVybmVkLilcbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3VCYW9GMnBONWNmYzVBZlphcE53P3A9cHJldmlldykpXG4gICAqXG4gICAqIEJlY2F1c2UgYHRvQWxpYXNgIGFuZCBgdG9DbGFzc2AgYXJlIG9mdGVuIGNvbmZ1c2VkLCB0aGUgZXhhbXBsZSBjb250YWluc1xuICAgKiBib3RoIHVzZSBjYXNlcyBmb3IgZWFzeSBjb21wYXJpc29uLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIFZlaGljbGUge31cbiAgICpcbiAgICogY2xhc3MgQ2FyIGV4dGVuZHMgVmVoaWNsZSB7fVxuICAgKlxuICAgKiB2YXIgaW5qZWN0b3JBbGlhcyA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgIENhcixcbiAgICogICBwcm92aWRlKFZlaGljbGUsIHt1c2VFeGlzdGluZzogQ2FyfSlcbiAgICogXSk7XG4gICAqIHZhciBpbmplY3RvckNsYXNzID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgQ2FyLFxuICAgKiAgIHByb3ZpZGUoVmVoaWNsZSwge3VzZUNsYXNzOiBDYXJ9KVxuICAgKiBdKTtcbiAgICpcbiAgICogZXhwZWN0KGluamVjdG9yQWxpYXMuZ2V0KFZlaGljbGUpKS50b0JlKGluamVjdG9yQWxpYXMuZ2V0KENhcikpO1xuICAgKiBleHBlY3QoaW5qZWN0b3JBbGlhcy5nZXQoVmVoaWNsZSkgaW5zdGFuY2VvZiBDYXIpLnRvQmUodHJ1ZSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSkubm90LnRvQmUoaW5qZWN0b3JDbGFzcy5nZXQoQ2FyKSk7XG4gICAqIGV4cGVjdChpbmplY3RvckNsYXNzLmdldChWZWhpY2xlKSBpbnN0YW5jZW9mIENhcikudG9CZSh0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuICB0b0FsaWFzKGFsaWFzVG9rZW46IC8qVHlwZSovIGFueSk6IFByb3ZpZGVyIHtcbiAgICBpZiAoaXNCbGFuayhhbGlhc1Rva2VuKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbiBub3QgYWxpYXMgJHtzdHJpbmdpZnkodGhpcy50b2tlbil9IHRvIGEgYmxhbmsgdmFsdWUhYCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvdmlkZXIodGhpcy50b2tlbiwge3VzZUV4aXN0aW5nOiBhbGlhc1Rva2VufSk7XG4gIH1cblxuICAvKipcbiAgICogQmluZHMgYSBESSB0b2tlbiB0byBhIGZ1bmN0aW9uIHdoaWNoIGNvbXB1dGVzIHRoZSB2YWx1ZS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L09lak5JZlRUM3piMWlCeGFJWU9iP3A9cHJldmlldykpXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgcHJvdmlkZShOdW1iZXIsIHt1c2VGYWN0b3J5OiAoKSA9PiB7IHJldHVybiAxKzI7IH19KSxcbiAgICogICBwcm92aWRlKFN0cmluZywge3VzZUZhY3Rvcnk6ICh2KSA9PiB7IHJldHVybiBcIlZhbHVlOiBcIiArIHY7IH0sIGRlcHM6IFtOdW1iZXJdfSlcbiAgICogXSk7XG4gICAqXG4gICAqIGV4cGVjdChpbmplY3Rvci5nZXQoTnVtYmVyKSkudG9FcXVhbCgzKTtcbiAgICogZXhwZWN0KGluamVjdG9yLmdldChTdHJpbmcpKS50b0VxdWFsKCdWYWx1ZTogMycpO1xuICAgKiBgYGBcbiAgICovXG4gIHRvRmFjdG9yeShmYWN0b3J5OiBGdW5jdGlvbiwgZGVwZW5kZW5jaWVzPzogYW55W10pOiBQcm92aWRlciB7XG4gICAgaWYgKCFpc0Z1bmN0aW9uKGZhY3RvcnkpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgVHJ5aW5nIHRvIGNyZWF0ZSBhIGZhY3RvcnkgcHJvdmlkZXIgYnV0IFwiJHtzdHJpbmdpZnkoZmFjdG9yeSl9XCIgaXMgbm90IGEgZnVuY3Rpb24hYCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvdmlkZXIodGhpcy50b2tlbiwge3VzZUZhY3Rvcnk6IGZhY3RvcnksIGRlcHM6IGRlcGVuZGVuY2llc30pO1xuICB9XG59XG5cbi8qKlxuICogUmVzb2x2ZSBhIHNpbmdsZSBwcm92aWRlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVGYWN0b3J5KHByb3ZpZGVyOiBQcm92aWRlcik6IFJlc29sdmVkRmFjdG9yeSB7XG4gIHZhciBmYWN0b3J5Rm46IEZ1bmN0aW9uO1xuICB2YXIgcmVzb2x2ZWREZXBzO1xuICBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUNsYXNzKSkge1xuICAgIHZhciB1c2VDbGFzcyA9IHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyLnVzZUNsYXNzKTtcbiAgICBmYWN0b3J5Rm4gPSByZWZsZWN0b3IuZmFjdG9yeSh1c2VDbGFzcyk7XG4gICAgcmVzb2x2ZWREZXBzID0gX2RlcGVuZGVuY2llc0Zvcih1c2VDbGFzcyk7XG4gIH0gZWxzZSBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZUV4aXN0aW5nKSkge1xuICAgIGZhY3RvcnlGbiA9IChhbGlhc0luc3RhbmNlKSA9PiBhbGlhc0luc3RhbmNlO1xuICAgIHJlc29sdmVkRGVwcyA9IFtEZXBlbmRlbmN5LmZyb21LZXkoS2V5LmdldChwcm92aWRlci51c2VFeGlzdGluZykpXTtcbiAgfSBlbHNlIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlRmFjdG9yeSkpIHtcbiAgICBmYWN0b3J5Rm4gPSBwcm92aWRlci51c2VGYWN0b3J5O1xuICAgIHJlc29sdmVkRGVwcyA9IF9jb25zdHJ1Y3REZXBlbmRlbmNpZXMocHJvdmlkZXIudXNlRmFjdG9yeSwgcHJvdmlkZXIuZGVwZW5kZW5jaWVzKTtcbiAgfSBlbHNlIHtcbiAgICBmYWN0b3J5Rm4gPSAoKSA9PiBwcm92aWRlci51c2VWYWx1ZTtcbiAgICByZXNvbHZlZERlcHMgPSBfRU1QVFlfTElTVDtcbiAgfVxuICByZXR1cm4gbmV3IFJlc29sdmVkRmFjdG9yeShmYWN0b3J5Rm4sIHJlc29sdmVkRGVwcyk7XG59XG5cbi8qKlxuICogQ29udmVydHMgdGhlIHtAbGluayBQcm92aWRlcn0gaW50byB7QGxpbmsgUmVzb2x2ZWRQcm92aWRlcn0uXG4gKlxuICoge0BsaW5rIEluamVjdG9yfSBpbnRlcm5hbGx5IG9ubHkgdXNlcyB7QGxpbmsgUmVzb2x2ZWRQcm92aWRlcn0sIHtAbGluayBQcm92aWRlcn0gY29udGFpbnNcbiAqIGNvbnZlbmllbmNlIHByb3ZpZGVyIHN5bnRheC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQcm92aWRlcihwcm92aWRlcjogUHJvdmlkZXIpOiBSZXNvbHZlZFByb3ZpZGVyIHtcbiAgcmV0dXJuIG5ldyBSZXNvbHZlZFByb3ZpZGVyXyhLZXkuZ2V0KHByb3ZpZGVyLnRva2VuKSwgW3Jlc29sdmVGYWN0b3J5KHByb3ZpZGVyKV0sIGZhbHNlKTtcbn1cblxuLyoqXG4gKiBSZXNvbHZlIGEgbGlzdCBvZiBQcm92aWRlcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlUHJvdmlkZXJzKHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUmVzb2x2ZWRQcm92aWRlcltdIHtcbiAgdmFyIG5vcm1hbGl6ZWQgPSBfY3JlYXRlTGlzdE9mUHJvdmlkZXJzKF9ub3JtYWxpemVQcm92aWRlcnMoXG4gICAgICBwcm92aWRlcnMsIG5ldyBNYXA8bnVtYmVyLCBfTm9ybWFsaXplZFByb3ZpZGVyIHwgX05vcm1hbGl6ZWRQcm92aWRlcltdPigpKSk7XG4gIHJldHVybiBub3JtYWxpemVkLm1hcChiID0+IHtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF9Ob3JtYWxpemVkUHJvdmlkZXIpIHtcbiAgICAgIHJldHVybiBuZXcgUmVzb2x2ZWRQcm92aWRlcl8oYi5rZXksIFtiLnJlc29sdmVkRmFjdG9yeV0sIGZhbHNlKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYXJyID0gPF9Ob3JtYWxpemVkUHJvdmlkZXJbXT5iO1xuICAgICAgcmV0dXJuIG5ldyBSZXNvbHZlZFByb3ZpZGVyXyhhcnJbMF0ua2V5LCBhcnIubWFwKF8gPT4gXy5yZXNvbHZlZEZhY3RvcnkpLCB0cnVlKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFRoZSBhbGdvcml0aG0gd29ya3MgYXMgZm9sbG93czpcbiAqXG4gKiBbUHJvdmlkZXJdIC0+IFtfTm9ybWFsaXplZFByb3ZpZGVyfFtfTm9ybWFsaXplZFByb3ZpZGVyXV0gLT4gW1Jlc29sdmVkUHJvdmlkZXJdXG4gKlxuICogX05vcm1hbGl6ZWRQcm92aWRlciBpcyBlc3NlbnRpYWxseSBhIHJlc29sdmVkIHByb3ZpZGVyIGJlZm9yZSBpdCB3YXMgZ3JvdXBlZCBieSBrZXkuXG4gKi9cbmNsYXNzIF9Ob3JtYWxpemVkUHJvdmlkZXIge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMga2V5OiBLZXksIHB1YmxpYyByZXNvbHZlZEZhY3Rvcnk6IFJlc29sdmVkRmFjdG9yeSkge31cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUxpc3RPZlByb3ZpZGVycyhmbGF0dGVuZWRQcm92aWRlcnM6IE1hcDxudW1iZXIsIGFueT4pOiBhbnlbXSB7XG4gIHJldHVybiBNYXBXcmFwcGVyLnZhbHVlcyhmbGF0dGVuZWRQcm92aWRlcnMpO1xufVxuXG5mdW5jdGlvbiBfbm9ybWFsaXplUHJvdmlkZXJzKHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgUHJvdmlkZXJCdWlsZGVyIHwgYW55W10+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXM6IE1hcDxudW1iZXIsIF9Ob3JtYWxpemVkUHJvdmlkZXIgfCBfTm9ybWFsaXplZFByb3ZpZGVyW10+KTpcbiAgICBNYXA8bnVtYmVyLCBfTm9ybWFsaXplZFByb3ZpZGVyIHwgX05vcm1hbGl6ZWRQcm92aWRlcltdPiB7XG4gIHByb3ZpZGVycy5mb3JFYWNoKGIgPT4ge1xuICAgIGlmIChiIGluc3RhbmNlb2YgVHlwZSkge1xuICAgICAgX25vcm1hbGl6ZVByb3ZpZGVyKHByb3ZpZGUoYiwge3VzZUNsYXNzOiBifSksIHJlcyk7XG5cbiAgICB9IGVsc2UgaWYgKGIgaW5zdGFuY2VvZiBQcm92aWRlcikge1xuICAgICAgX25vcm1hbGl6ZVByb3ZpZGVyKGIsIHJlcyk7XG5cbiAgICB9IGVsc2UgaWYgKGIgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgX25vcm1hbGl6ZVByb3ZpZGVycyhiLCByZXMpO1xuXG4gICAgfSBlbHNlIGlmIChiIGluc3RhbmNlb2YgUHJvdmlkZXJCdWlsZGVyKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFByb3ZpZGVyRXJyb3IoYi50b2tlbik7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQcm92aWRlckVycm9yKGIpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gX25vcm1hbGl6ZVByb3ZpZGVyKGI6IFByb3ZpZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlczogTWFwPG51bWJlciwgX05vcm1hbGl6ZWRQcm92aWRlciB8IF9Ob3JtYWxpemVkUHJvdmlkZXJbXT4pOiB2b2lkIHtcbiAgdmFyIGtleSA9IEtleS5nZXQoYi50b2tlbik7XG4gIHZhciBmYWN0b3J5ID0gcmVzb2x2ZUZhY3RvcnkoYik7XG4gIHZhciBub3JtYWxpemVkID0gbmV3IF9Ob3JtYWxpemVkUHJvdmlkZXIoa2V5LCBmYWN0b3J5KTtcblxuICBpZiAoYi5tdWx0aSkge1xuICAgIHZhciBleGlzdGluZ1Byb3ZpZGVyID0gcmVzLmdldChrZXkuaWQpO1xuXG4gICAgaWYgKGV4aXN0aW5nUHJvdmlkZXIgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgZXhpc3RpbmdQcm92aWRlci5wdXNoKG5vcm1hbGl6ZWQpO1xuXG4gICAgfSBlbHNlIGlmIChpc0JsYW5rKGV4aXN0aW5nUHJvdmlkZXIpKSB7XG4gICAgICByZXMuc2V0KGtleS5pZCwgW25vcm1hbGl6ZWRdKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgTWl4aW5nTXVsdGlQcm92aWRlcnNXaXRoUmVndWxhclByb3ZpZGVyc0Vycm9yKGV4aXN0aW5nUHJvdmlkZXIsIGIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciBleGlzdGluZ1Byb3ZpZGVyID0gcmVzLmdldChrZXkuaWQpO1xuXG4gICAgaWYgKGV4aXN0aW5nUHJvdmlkZXIgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgdGhyb3cgbmV3IE1peGluZ011bHRpUHJvdmlkZXJzV2l0aFJlZ3VsYXJQcm92aWRlcnNFcnJvcihleGlzdGluZ1Byb3ZpZGVyLCBiKTtcbiAgICB9XG5cbiAgICByZXMuc2V0KGtleS5pZCwgbm9ybWFsaXplZCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NvbnN0cnVjdERlcGVuZGVuY2llcyhmYWN0b3J5RnVuY3Rpb246IEZ1bmN0aW9uLCBkZXBlbmRlbmNpZXM6IGFueVtdKTogRGVwZW5kZW5jeVtdIHtcbiAgaWYgKGlzQmxhbmsoZGVwZW5kZW5jaWVzKSkge1xuICAgIHJldHVybiBfZGVwZW5kZW5jaWVzRm9yKGZhY3RvcnlGdW5jdGlvbik7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcmFtczogYW55W11bXSA9IGRlcGVuZGVuY2llcy5tYXAodCA9PiBbdF0pO1xuICAgIHJldHVybiBkZXBlbmRlbmNpZXMubWFwKHQgPT4gX2V4dHJhY3RUb2tlbihmYWN0b3J5RnVuY3Rpb24sIHQsIHBhcmFtcykpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9kZXBlbmRlbmNpZXNGb3IodHlwZU9yRnVuYyk6IERlcGVuZGVuY3lbXSB7XG4gIHZhciBwYXJhbXMgPSByZWZsZWN0b3IucGFyYW1ldGVycyh0eXBlT3JGdW5jKTtcbiAgaWYgKGlzQmxhbmsocGFyYW1zKSkgcmV0dXJuIFtdO1xuICBpZiAocGFyYW1zLnNvbWUoaXNCbGFuaykpIHtcbiAgICB0aHJvdyBuZXcgTm9Bbm5vdGF0aW9uRXJyb3IodHlwZU9yRnVuYywgcGFyYW1zKTtcbiAgfVxuICByZXR1cm4gcGFyYW1zLm1hcCgocDogYW55W10pID0+IF9leHRyYWN0VG9rZW4odHlwZU9yRnVuYywgcCwgcGFyYW1zKSk7XG59XG5cbmZ1bmN0aW9uIF9leHRyYWN0VG9rZW4odHlwZU9yRnVuYywgbWV0YWRhdGEgLyphbnlbXSB8IGFueSovLCBwYXJhbXM6IGFueVtdW10pOiBEZXBlbmRlbmN5IHtcbiAgdmFyIGRlcFByb3BzID0gW107XG4gIHZhciB0b2tlbiA9IG51bGw7XG4gIHZhciBvcHRpb25hbCA9IGZhbHNlO1xuXG4gIGlmICghaXNBcnJheShtZXRhZGF0YSkpIHtcbiAgICBpZiAobWV0YWRhdGEgaW5zdGFuY2VvZiBJbmplY3RNZXRhZGF0YSkge1xuICAgICAgcmV0dXJuIF9jcmVhdGVEZXBlbmRlbmN5KG1ldGFkYXRhLnRva2VuLCBvcHRpb25hbCwgbnVsbCwgbnVsbCwgZGVwUHJvcHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gX2NyZWF0ZURlcGVuZGVuY3kobWV0YWRhdGEsIG9wdGlvbmFsLCBudWxsLCBudWxsLCBkZXBQcm9wcyk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGxvd2VyQm91bmRWaXNpYmlsaXR5ID0gbnVsbDtcbiAgdmFyIHVwcGVyQm91bmRWaXNpYmlsaXR5ID0gbnVsbDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1ldGFkYXRhLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHBhcmFtTWV0YWRhdGEgPSBtZXRhZGF0YVtpXTtcblxuICAgIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgVHlwZSkge1xuICAgICAgdG9rZW4gPSBwYXJhbU1ldGFkYXRhO1xuXG4gICAgfSBlbHNlIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgSW5qZWN0TWV0YWRhdGEpIHtcbiAgICAgIHRva2VuID0gcGFyYW1NZXRhZGF0YS50b2tlbjtcblxuICAgIH0gZWxzZSBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIE9wdGlvbmFsTWV0YWRhdGEpIHtcbiAgICAgIG9wdGlvbmFsID0gdHJ1ZTtcblxuICAgIH0gZWxzZSBpZiAocGFyYW1NZXRhZGF0YSBpbnN0YW5jZW9mIFNlbGZNZXRhZGF0YSkge1xuICAgICAgdXBwZXJCb3VuZFZpc2liaWxpdHkgPSBwYXJhbU1ldGFkYXRhO1xuXG4gICAgfSBlbHNlIGlmIChwYXJhbU1ldGFkYXRhIGluc3RhbmNlb2YgSG9zdE1ldGFkYXRhKSB7XG4gICAgICB1cHBlckJvdW5kVmlzaWJpbGl0eSA9IHBhcmFtTWV0YWRhdGE7XG5cbiAgICB9IGVsc2UgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBTa2lwU2VsZk1ldGFkYXRhKSB7XG4gICAgICBsb3dlckJvdW5kVmlzaWJpbGl0eSA9IHBhcmFtTWV0YWRhdGE7XG5cbiAgICB9IGVsc2UgaWYgKHBhcmFtTWV0YWRhdGEgaW5zdGFuY2VvZiBEZXBlbmRlbmN5TWV0YWRhdGEpIHtcbiAgICAgIGlmIChpc1ByZXNlbnQocGFyYW1NZXRhZGF0YS50b2tlbikpIHtcbiAgICAgICAgdG9rZW4gPSBwYXJhbU1ldGFkYXRhLnRva2VuO1xuICAgICAgfVxuICAgICAgZGVwUHJvcHMucHVzaChwYXJhbU1ldGFkYXRhKTtcbiAgICB9XG4gIH1cblxuICB0b2tlbiA9IHJlc29sdmVGb3J3YXJkUmVmKHRva2VuKTtcblxuICBpZiAoaXNQcmVzZW50KHRva2VuKSkge1xuICAgIHJldHVybiBfY3JlYXRlRGVwZW5kZW5jeSh0b2tlbiwgb3B0aW9uYWwsIGxvd2VyQm91bmRWaXNpYmlsaXR5LCB1cHBlckJvdW5kVmlzaWJpbGl0eSwgZGVwUHJvcHMpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBOb0Fubm90YXRpb25FcnJvcih0eXBlT3JGdW5jLCBwYXJhbXMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVEZXBlbmRlbmN5KHRva2VuLCBvcHRpb25hbCwgbG93ZXJCb3VuZFZpc2liaWxpdHksIHVwcGVyQm91bmRWaXNpYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwUHJvcHMpOiBEZXBlbmRlbmN5IHtcbiAgcmV0dXJuIG5ldyBEZXBlbmRlbmN5KEtleS5nZXQodG9rZW4pLCBvcHRpb25hbCwgbG93ZXJCb3VuZFZpc2liaWxpdHksIHVwcGVyQm91bmRWaXNpYmlsaXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwUHJvcHMpO1xufVxuIl19