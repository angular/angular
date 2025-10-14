/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Provider } from './di/interface/provider';
import { EnvironmentInjector } from './di/r3_injector';
import { OnDestroy } from './interface/lifecycle_hooks';
/**
 * A service used by the framework to create and cache injector instances.
 *
 * This service is used to create a single injector instance for each defer
 * block definition, to avoid creating an injector for each defer block instance
 * of a certain type.
 */
export declare class CachedInjectorService implements OnDestroy {
    private cachedInjectors;
    getOrCreateInjector(key: unknown, parentInjector: EnvironmentInjector, providers: Provider[], debugName?: string): EnvironmentInjector;
    ngOnDestroy(): void;
    /** @nocollapse */
    static ɵprov: unknown;
}
