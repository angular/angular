/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { Injector } from './injector';
import type { Provider, StaticProvider } from './interface/provider';
import { R3Injector } from './r3_injector';
import { InjectorScope } from './scope';
/**
 * Create a new `Injector` which is configured using a `defType` of `InjectorType<any>`s.
 */
export declare function createInjector(defType: any, parent?: Injector | null, additionalProviders?: Array<Provider | StaticProvider> | null, name?: string): Injector;
/**
 * Creates a new injector without eagerly resolving its injector types. Can be used in places
 * where resolving the injector types immediately can lead to an infinite loop. The injector types
 * should be resolved at a later point by calling `_resolveInjectorDefTypes`.
 */
export declare function createInjectorWithoutInjectorInstances(defType: any, parent?: Injector | null, additionalProviders?: Array<Provider | StaticProvider> | null, name?: string, scopes?: Set<InjectorScope>): R3Injector;
