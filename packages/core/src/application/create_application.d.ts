/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentProviders, Provider } from '../di/interface/provider';
import { Type } from '../interface/type';
import { ApplicationRef } from './application_ref';
import { PlatformRef } from '../platform/platform_ref';
/**
 * Internal create application API that implements the core application creation logic and optional
 * bootstrap logic.
 *
 * Platforms (such as `platform-browser`) may require different set of application and platform
 * providers for an application to function correctly. As a result, platforms may use this function
 * internally and supply the necessary providers during the bootstrap, while exposing
 * platform-specific APIs as a part of their public API.
 *
 * @returns A promise that returns an `ApplicationRef` instance once resolved.
 */
export declare function internalCreateApplication(config: {
    rootComponent?: Type<unknown>;
    appProviders?: Array<Provider | EnvironmentProviders>;
    platformProviders?: Provider[];
    platformRef?: PlatformRef;
}): Promise<ApplicationRef>;
