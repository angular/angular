/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentProviders, Injector, StaticProvider } from '../di';
import { PlatformRef } from './platform_ref';
/**
 * Creates a platform.
 * Platforms must be created on launch using this function.
 *
 * @publicApi
 */
export declare function createPlatform(injector: Injector): PlatformRef;
/**
 * Creates a factory for a platform. Can be used to provide or override `Providers` specific to
 * your application's runtime needs, such as `PLATFORM_INITIALIZER` and `PLATFORM_ID`.
 * @param parentPlatformFactory Another platform factory to modify. Allows you to compose factories
 * to build up configurations that might be required by different libraries or parts of the
 * application.
 * @param name Identifies the new platform factory.
 * @param providers A set of dependency providers for platforms created with the new factory.
 *
 * @publicApi
 */
export declare function createPlatformFactory(parentPlatformFactory: ((extraProviders?: StaticProvider[]) => PlatformRef) | null, name: string, providers?: StaticProvider[]): (extraProviders?: StaticProvider[]) => PlatformRef;
/**
 * Checks that there is currently a platform that contains the given token as a provider.
 *
 * @publicApi
 */
export declare function assertPlatform(requiredToken: any): PlatformRef;
/**
 * Returns the current platform in the browser environment. In the server environment,
 * returns `null`. If you need access to the platform information, inject `PlatformRef` in your application.
 *
 * @publicApi
 */
export declare function getPlatform(): PlatformRef | null;
/**
 * Destroys the current Angular platform and all Angular applications on the page.
 * Destroys all modules and listeners registered with the platform.
 *
 * This function should not be used in a server environment, as it will be a no-op.
 *
 * @publicApi
 */
export declare function destroyPlatform(): void;
/**
 * The goal of this function is to bootstrap a platform injector,
 * but avoid referencing `PlatformRef` class.
 * This function is needed for bootstrapping a Standalone Component.
 */
export declare function createOrReusePlatformInjector(providers?: StaticProvider[]): Injector;
/**
 * @description
 * This function is used to provide initialization functions that will be executed upon
 * initialization of the platform injector.
 *
 * Note that the provided initializer is run in the injection context.
 *
 * Previously, this was achieved using the `PLATFORM_INITIALIZER` token which is now deprecated.
 *
 * @see {@link PLATFORM_INITIALIZER}
 *
 * @publicApi
 */
export declare function providePlatformInitializer(initializerFn: () => void): EnvironmentProviders;
