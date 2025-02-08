/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  publishDefaultGlobalUtils,
  publishSignalConfiguration,
} from '../application/application_ref';
import {PLATFORM_INITIALIZER} from '../application/application_tokens';
import {
  EnvironmentProviders,
  InjectionToken,
  Injector,
  makeEnvironmentProviders,
  runInInjectionContext,
  StaticProvider,
} from '../di';
import {INJECTOR_SCOPE} from '../di/scope';
import {RuntimeError, RuntimeErrorCode} from '../errors';

import {PlatformRef} from './platform_ref';
import {PLATFORM_DESTROY_LISTENERS} from './platform_destroy_listeners';

let _platformInjector: Injector | null = null;

/**
 * Internal token to indicate whether having multiple bootstrapped platform should be allowed (only
 * one bootstrapped platform is allowed by default). This token helps to support SSR scenarios.
 */
export const ALLOW_MULTIPLE_PLATFORMS = new InjectionToken<boolean>(
  ngDevMode ? 'AllowMultipleToken' : '',
);

/**
 * Creates a platform.
 * Platforms must be created on launch using this function.
 *
 * @publicApi
 */
export function createPlatform(injector: Injector): PlatformRef {
  if (_platformInjector && !_platformInjector.get(ALLOW_MULTIPLE_PLATFORMS, false)) {
    throw new RuntimeError(
      RuntimeErrorCode.MULTIPLE_PLATFORMS,
      ngDevMode && 'There can be only one platform. Destroy the previous one to create a new one.',
    );
  }
  publishDefaultGlobalUtils();
  publishSignalConfiguration();
  _platformInjector = injector;
  const platform = injector.get(PlatformRef);
  runPlatformInitializers(injector);
  return platform;
}

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
export function createPlatformFactory(
  parentPlatformFactory: ((extraProviders?: StaticProvider[]) => PlatformRef) | null,
  name: string,
  providers: StaticProvider[] = [],
): (extraProviders?: StaticProvider[]) => PlatformRef {
  const desc = `Platform: ${name}`;
  const marker = new InjectionToken(desc);
  return (extraProviders: StaticProvider[] = []) => {
    let platform = getPlatform();
    if (!platform || platform.injector.get(ALLOW_MULTIPLE_PLATFORMS, false)) {
      const platformProviders: StaticProvider[] = [
        ...providers,
        ...extraProviders,
        {provide: marker, useValue: true},
      ];
      if (parentPlatformFactory) {
        parentPlatformFactory(platformProviders);
      } else {
        createPlatform(createPlatformInjector(platformProviders, desc));
      }
    }
    return assertPlatform(marker);
  };
}

/**
 * Helper function to create an instance of a platform injector (that maintains the 'platform'
 * scope).
 */
function createPlatformInjector(providers: StaticProvider[] = [], name?: string): Injector {
  return Injector.create({
    name,
    providers: [
      {provide: INJECTOR_SCOPE, useValue: 'platform'},
      {provide: PLATFORM_DESTROY_LISTENERS, useValue: new Set([() => (_platformInjector = null)])},
      ...providers,
    ],
  });
}

/**
 * Checks that there is currently a platform that contains the given token as a provider.
 *
 * @publicApi
 */
export function assertPlatform(requiredToken: any): PlatformRef {
  const platform = getPlatform();

  if (!platform) {
    throw new RuntimeError(RuntimeErrorCode.PLATFORM_NOT_FOUND, ngDevMode && 'No platform exists!');
  }

  if (
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
    !platform.injector.get(requiredToken, null)
  ) {
    throw new RuntimeError(
      RuntimeErrorCode.MULTIPLE_PLATFORMS,
      'A platform with a different configuration has been created. Please destroy it first.',
    );
  }

  return platform;
}

/**
 * Returns the current platform.
 *
 * @publicApi
 */
export function getPlatform(): PlatformRef | null {
  return _platformInjector?.get(PlatformRef) ?? null;
}

/**
 * Destroys the current Angular platform and all Angular applications on the page.
 * Destroys all modules and listeners registered with the platform.
 *
 * @publicApi
 */
export function destroyPlatform(): void {
  getPlatform()?.destroy();
}

/**
 * The goal of this function is to bootstrap a platform injector,
 * but avoid referencing `PlatformRef` class.
 * This function is needed for bootstrapping a Standalone Component.
 */
export function createOrReusePlatformInjector(providers: StaticProvider[] = []): Injector {
  // If a platform injector already exists, it means that the platform
  // is already bootstrapped and no additional actions are required.
  if (_platformInjector) return _platformInjector;

  publishDefaultGlobalUtils();
  // Otherwise, setup a new platform injector and run platform initializers.
  const injector = createPlatformInjector(providers);
  _platformInjector = injector;
  publishSignalConfiguration();
  runPlatformInitializers(injector);
  return injector;
}

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
export function providePlatformInitializer(initializerFn: () => void): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: PLATFORM_INITIALIZER,
      useValue: initializerFn,
      multi: true,
    },
  ]);
}

function runPlatformInitializers(injector: Injector): void {
  const inits = injector.get(PLATFORM_INITIALIZER, null);
  runInInjectionContext(injector, () => {
    inits?.forEach((init) => init());
  });
}
