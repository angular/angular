/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import '../util/ng_dev_mode';
import { Type } from '../interface/type';
import type { Injector } from './injector';
import { InjectorType } from './interface/defs';
import { InjectOptions } from './interface/injector';
import { EnvironmentProviders, Provider } from './interface/provider';
import { SingleProvider } from './provider_collection';
import { ProviderToken } from './provider_token';
import { InjectorScope } from './scope';
import { Injector as PrimitivesInjector, InjectionToken as PrimitivesInjectionToken, NotFound } from '@angular/core/primitives/di';
export declare function getNullInjector(): Injector;
/**
 * An `Injector` that's part of the environment injector hierarchy, which exists outside of the
 * component tree.
 *
 * @publicApi
 */
export declare abstract class EnvironmentInjector implements Injector {
    /**
     * Retrieves an instance from the injector based on the provided token.
     * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
     * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
     */
    abstract get<T>(token: ProviderToken<T>, notFoundValue: undefined, options: InjectOptions & {
        optional?: false;
    }): T;
    /**
     * Retrieves an instance from the injector based on the provided token.
     * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
     * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
     */
    abstract get<T>(token: ProviderToken<T>, notFoundValue: null | undefined, options: InjectOptions): T | null;
    /**
     * Retrieves an instance from the injector based on the provided token.
     * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
     * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
     */
    abstract get<T>(token: ProviderToken<T>, notFoundValue?: T, options?: InjectOptions): T;
    /**
     * @deprecated from v4.0.0 use ProviderToken<T>
     * @suppress {duplicate}
     */
    abstract get<T>(token: string | ProviderToken<T>, notFoundValue?: any): any;
    /**
     * Runs the given function in the context of this `EnvironmentInjector`.
     *
     * Within the function's stack frame, [`inject`](api/core/inject) can be used to inject
     * dependencies from this injector. Note that `inject` is only usable synchronously, and cannot be
     * used in any asynchronous callbacks or after any `await` points.
     *
     * @param fn the closure to be run in the context of this injector
     * @returns the return value of the function, if any
     * @deprecated use the standalone function `runInInjectionContext` instead
     */
    abstract runInContext<ReturnT>(fn: () => ReturnT): ReturnT;
    abstract destroy(): void;
    /**
     * Indicates whether the instance has already been destroyed.
     */
    abstract get destroyed(): boolean;
    /**
     * @internal
     */
    abstract onDestroy(callback: () => void): () => void;
}
export declare class R3Injector extends EnvironmentInjector implements PrimitivesInjector {
    readonly parent: Injector;
    readonly source: string | null;
    readonly scopes: Set<InjectorScope>;
    /**
     * Map of tokens to records which contain the instances of those tokens.
     * - `null` value implies that we don't have the record. Used by tree-shakable injectors
     * to prevent further searches.
     */
    private records;
    /**
     * Set of values instantiated by this injector which contain `ngOnDestroy` lifecycle hooks.
     */
    private _ngOnDestroyHooks;
    private _onDestroyHooks;
    /**
     * Flag indicating that this injector was previously destroyed.
     */
    get destroyed(): boolean;
    private _destroyed;
    private injectorDefTypes;
    constructor(providers: Array<Provider | EnvironmentProviders>, parent: Injector, source: string | null, scopes: Set<InjectorScope>);
    retrieve<T>(token: PrimitivesInjectionToken<T>, options?: unknown): T | NotFound;
    /**
     * Destroy the injector and release references to every instance or provider associated with it.
     *
     * Also calls the `OnDestroy` lifecycle hooks of every instance that was created for which a
     * hook was found.
     */
    destroy(): void;
    onDestroy(callback: () => void): () => void;
    runInContext<ReturnT>(fn: () => ReturnT): ReturnT;
    get<T>(token: ProviderToken<T>, notFoundValue?: any, options?: InjectOptions): T;
    /** @internal */
    resolveInjectorInitializers(): void;
    toString(): string;
    /**
     * Process a `SingleProvider` and add it.
     */
    private processProvider;
    private hydrate;
    private injectableDefInScope;
    private removeOnDestroy;
}
/**
 * Converts a `SingleProvider` into a factory function.
 *
 * @param provider provider to convert to factory
 */
export declare function providerToFactory(provider: SingleProvider, ngModuleType?: InjectorType<any>, providers?: any[]): (type?: Type<unknown>, flags?: number) => any;
export declare function assertNotDestroyed(injector: R3Injector): void;
