import { Type } from 'angular2/src/facade/lang';
import { ReflectiveKey } from './reflective_key';
import { Provider } from './provider';
/**
 * `Dependency` is used by the framework to extend DI.
 * This is internal to Angular and should not be used directly.
 */
export declare class ReflectiveDependency {
    key: ReflectiveKey;
    optional: boolean;
    lowerBoundVisibility: any;
    upperBoundVisibility: any;
    properties: any[];
    constructor(key: ReflectiveKey, optional: boolean, lowerBoundVisibility: any, upperBoundVisibility: any, properties: any[]);
    static fromKey(key: ReflectiveKey): ReflectiveDependency;
}
/**
 * An internal resolved representation of a {@link Provider} used by the {@link Injector}.
 *
 * It is usually created automatically by `Injector.resolveAndCreate`.
 *
 * It can be created manually, as follows:
 *
 * ### Example ([live demo](http://plnkr.co/edit/RfEnhh8kUEI0G3qsnIeT?p%3Dpreview&p=preview))
 *
 * ```typescript
 * var resolvedProviders = Injector.resolve([new Provider('message', {useValue: 'Hello'})]);
 * var injector = Injector.fromResolvedProviders(resolvedProviders);
 *
 * expect(injector.get('message')).toEqual('Hello');
 * ```
 */
export interface ResolvedReflectiveProvider {
    /**
     * A key, usually a `Type`.
     */
    key: ReflectiveKey;
    /**
     * Factory function which can return an instance of an object represented by a key.
     */
    resolvedFactories: ResolvedReflectiveFactory[];
    /**
     * Indicates if the provider is a multi-provider or a regular provider.
     */
    multiProvider: boolean;
}
/**
 * See {@link ResolvedProvider} instead.
 *
 * @deprecated
 */
export interface ResolvedReflectiveBinding extends ResolvedReflectiveProvider {
}
export declare class ResolvedReflectiveProvider_ implements ResolvedReflectiveBinding {
    key: ReflectiveKey;
    resolvedFactories: ResolvedReflectiveFactory[];
    multiProvider: boolean;
    constructor(key: ReflectiveKey, resolvedFactories: ResolvedReflectiveFactory[], multiProvider: boolean);
    resolvedFactory: ResolvedReflectiveFactory;
}
/**
 * An internal resolved representation of a factory function created by resolving {@link Provider}.
 */
export declare class ResolvedReflectiveFactory {
    /**
     * Factory function which can return an instance of an object represented by a key.
     */
    factory: Function;
    /**
     * Arguments (dependencies) to the `factory` function.
     */
    dependencies: ReflectiveDependency[];
    constructor(
        /**
         * Factory function which can return an instance of an object represented by a key.
         */
        factory: Function, 
        /**
         * Arguments (dependencies) to the `factory` function.
         */
        dependencies: ReflectiveDependency[]);
}
/**
 * Resolve a single provider.
 */
export declare function resolveReflectiveFactory(provider: Provider): ResolvedReflectiveFactory;
/**
 * Converts the {@link Provider} into {@link ResolvedProvider}.
 *
 * {@link Injector} internally only uses {@link ResolvedProvider}, {@link Provider} contains
 * convenience provider syntax.
 */
export declare function resolveReflectiveProvider(provider: Provider): ResolvedReflectiveProvider;
/**
 * Resolve a list of Providers.
 */
export declare function resolveReflectiveProviders(providers: Array<Type | Provider | {
    [k: string]: any;
} | any[]>): ResolvedReflectiveProvider[];
/**
 * Merges a list of ResolvedProviders into a list where
 * each key is contained exactly once and multi providers
 * have been merged.
 */
export declare function mergeResolvedReflectiveProviders(providers: ResolvedReflectiveProvider[], normalizedProvidersMap: Map<number, ResolvedReflectiveProvider>): Map<number, ResolvedReflectiveProvider>;
export declare function constructDependencies(typeOrFunc: any, dependencies: any[]): ReflectiveDependency[];
