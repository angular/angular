/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectionToken } from '../../di/injection_token';
import { Injector } from '../../di/injector';
import { Type } from '../../interface/type';
import { InjectedService, ProviderRecord } from '../debug/injector_profiler';
import { RElement } from '../interfaces/renderer_dom';
/**
 * Discovers the dependencies of an injectable instance. Provides DI information about each
 * dependency that the injectable was instantiated with, including where they were provided from.
 *
 * @param injector An injector instance
 * @param token a DI token that was constructed by the given injector instance
 * @returns an object that contains the created instance of token as well as all of the dependencies
 * that it was instantiated with OR undefined if the token was not created within the given
 * injector.
 */
export declare function getDependenciesFromInjectable<T>(injector: Injector, token: Type<T> | InjectionToken<T>): {
    instance: T;
    dependencies: Omit<InjectedService, 'injectedIn'>[];
} | undefined;
/**
 * Gets the providers configured on an injector.
 *
 * @param injector the injector to lookup the providers of
 * @returns ProviderRecord[] an array of objects representing the providers of the given injector
 */
export declare function getInjectorProviders(injector: Injector): ProviderRecord[];
/**
 *
 * Given an injector, this function will return
 * an object containing the type and source of the injector.
 *
 * |              | type        | source                                                      |
 * |--------------|-------------|-------------------------------------------------------------|
 * | NodeInjector | element     | DOM element that created this injector                      |
 * | R3Injector   | environment | `injector.source`                                           |
 * | NullInjector | null        | null                                                        |
 *
 * @param injector the Injector to get metadata for
 * @returns an object containing the type and source of the given injector. If the injector metadata
 *     cannot be determined, returns null.
 */
export declare function getInjectorMetadata(injector: Injector): {
    type: 'element';
    source: RElement;
} | {
    type: 'environment';
    source: string | null;
} | {
    type: 'null';
    source: null;
} | null;
export declare function getInjectorResolutionPath(injector: Injector): Injector[];
