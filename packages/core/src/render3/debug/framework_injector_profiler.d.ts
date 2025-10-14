/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '../../di/injector';
import { Type } from '../../interface/type';
import { TNode } from '../interfaces/node';
import { LView } from '../interfaces/view';
import { EffectRef } from '../reactivity/effect';
import { InjectedService, ProviderRecord } from './injector_profiler';
/**
 * These are the data structures that our framework injector profiler will fill with data in order
 * to support DI debugging APIs.
 *
 * resolverToTokenToDependencies: Maps an injector to a Map of tokens to an Array of
 * dependencies. Injector -> Token -> Dependencies This is used to support the
 * getDependenciesFromInjectable API, which takes in an injector and a token and returns it's
 * dependencies.
 *
 * resolverToProviders: Maps a DI resolver (an Injector or a TNode) to the providers configured
 * within it This is used to support the getInjectorProviders API, which takes in an injector and
 * returns the providers that it was configured with. Note that for the element injector case we
 * use the TNode instead of the LView as the DI resolver. This is because the registration of
 * providers happens only once per type of TNode. If an injector is created with an identical TNode,
 * the providers for that injector will not be reconfigured.
 *
 * standaloneInjectorToComponent: Maps the injector of a standalone component to the standalone
 * component that it is associated with. Used in the getInjectorProviders API, specificially in the
 * discovery of import paths for each provider. This is necessary because the imports array of a
 * standalone component is processed and configured in its standalone injector, but exists within
 * the component's definition. Because getInjectorProviders takes in an injector, if that injector
 * is the injector of a standalone component, we need to be able to discover the place where the
 * imports array is located (the component) in order to flatten the imports array within it to
 * discover all of it's providers.
 *
 *
 * All of these data structures are instantiated with WeakMaps. This will ensure that the presence
 * of any object in the keys of these maps does not prevent the garbage collector from collecting
 * those objects. Because of this property of WeakMaps, these data structures will never be the
 * source of a memory leak.
 *
 * An example of this advantage: When components are destroyed, we don't need to do
 * any additional work to remove that component from our mappings.
 *
 */
declare class DIDebugData {
    resolverToTokenToDependencies: WeakMap<Injector | LView<unknown>, WeakMap<Type<unknown>, InjectedService[]>>;
    resolverToProviders: WeakMap<Injector | TNode, ProviderRecord[]>;
    resolverToEffects: WeakMap<Injector | LView<unknown>, EffectRef[]>;
    standaloneInjectorToComponent: WeakMap<Injector, Type<unknown>>;
    reset(): void;
}
export declare function getFrameworkDIDebugData(): DIDebugData;
/**
 * Initalize default handling of injector events. This handling parses events
 * as they are emitted and constructs the data structures necessary to support
 * some of debug APIs.
 *
 * See handleInjectEvent, handleCreateEvent and handleProviderConfiguredEvent
 * for descriptions of each handler
 *
 * Supported APIs:
 *               - getDependenciesFromInjectable
 *               - getInjectorProviders
 */
export declare function setupFrameworkInjectorProfiler(): void;
export {};
