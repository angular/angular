/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentInjector, EnvironmentProviders, Type } from '@angular/core';
import { MonoTypeOperatorFunction } from 'rxjs';
import type { Route } from '../models';
import type { NavigationTransition } from '../navigation_transition';
import type { RouterConfigLoader } from '../router_config_loader';
import type { UrlSerializer } from '../url_tree';
/**
 * Provides a way to use the synchronous version of the recognize function using rxjs.
 */
export declare function provideSometimesSyncRecognize(): EnvironmentProviders;
export declare function recognize(injector: EnvironmentInjector, configLoader: RouterConfigLoader, rootComponentType: Type<any> | null, config: Route[], serializer: UrlSerializer, paramsInheritanceStrategy: 'emptyOnly' | 'always', abortSignal: AbortSignal): MonoTypeOperatorFunction<NavigationTransition>;
