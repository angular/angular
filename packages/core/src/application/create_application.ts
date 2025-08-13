/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {internalProvideZoneChangeDetection} from '../change_detection/scheduling/ng_zone_scheduling';
import {EnvironmentProviders, Provider, StaticProvider} from '../di/interface/provider';
import {EnvironmentInjector} from '../di/r3_injector';
import {Type} from '../interface/type';
import {createOrReusePlatformInjector} from '../platform/platform';
import {assertStandaloneComponentType} from '../render3/errors';
import {EnvironmentNgModuleRefAdapter} from '../render3/ng_module_ref';

import {ApplicationRef} from './application_ref';
import {ChangeDetectionScheduler} from '../change_detection/scheduling/zoneless_scheduling';
import {ChangeDetectionSchedulerImpl} from '../change_detection/scheduling/zoneless_scheduling_impl';
import {bootstrap} from '../platform/bootstrap';
import {profiler} from '../render3/profiler';
import {ProfilerEvent} from '../render3/profiler_types';
import {errorHandlerEnvironmentInitializer} from '../error_handler';

type Config = {
  rootComponent?: Type<unknown>;
  appProviders?: Array<Provider | EnvironmentProviders>;
  platformProviders?: Provider[];
};

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

export function internalCreateApplication(config: Config): Promise<ApplicationRef>;
export function internalCreateApplication(
  config: Config & {
    rejectAsyncInitializers: true;
  },
): ApplicationRef;
export function internalCreateApplication(config: {
  rootComponent?: Type<unknown>;
  appProviders?: Array<Provider | EnvironmentProviders>;
  platformProviders?: Provider[];
  rejectAsyncInitializers?: boolean;
}): Promise<ApplicationRef> | ApplicationRef {
  profiler(ProfilerEvent.BootstrapApplicationStart);
  try {
    const {rootComponent, appProviders, platformProviders} = config;

    if ((typeof ngDevMode === 'undefined' || ngDevMode) && rootComponent !== undefined) {
      assertStandaloneComponentType(rootComponent);
    }

    const platformInjector = createOrReusePlatformInjector(platformProviders as StaticProvider[]);

    // Create root application injector based on a set of providers configured at the platform
    // bootstrap level as well as providers passed to the bootstrap call by a user.
    const allAppProviders = [
      internalProvideZoneChangeDetection({}),
      {provide: ChangeDetectionScheduler, useExisting: ChangeDetectionSchedulerImpl},
      errorHandlerEnvironmentInitializer,
      ...(appProviders || []),
    ];
    const adapter = new EnvironmentNgModuleRefAdapter({
      providers: allAppProviders,
      parent: platformInjector as EnvironmentInjector,
      debugName: typeof ngDevMode === 'undefined' || ngDevMode ? 'Environment Injector' : '',
      // We skip environment initializers because we need to run them inside the NgZone, which
      // happens after we get the NgZone instance from the Injector.
      runEnvironmentInitializers: false,
    });

    return bootstrap({
      r3Injector: adapter.injector,
      platformInjector,
      rootComponent,
      rejectAsyncInitializers: config.rejectAsyncInitializers,
    });
  } catch (e) {
    if (config.rejectAsyncInitializers) {
      throw e;
    }

    return Promise.reject(e);
  } finally {
    profiler(ProfilerEvent.BootstrapApplicationEnd);
  }
}
