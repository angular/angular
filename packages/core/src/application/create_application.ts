/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subscription} from 'rxjs';

import {internalProvideZoneChangeDetection} from '../change_detection/scheduling/ng_zone_scheduling';
import {EnvironmentProviders, Provider, StaticProvider} from '../di/interface/provider';
import {EnvironmentInjector} from '../di/r3_injector';
import {ErrorHandler} from '../error_handler';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {DEFAULT_LOCALE_ID} from '../i18n/localization';
import {LOCALE_ID} from '../i18n/tokens';
import {ImagePerformanceWarning} from '../image_performance_warning';
import {Type} from '../interface/type';
import {createOrReusePlatformInjector} from '../platform/platform';
import {PLATFORM_DESTROY_LISTENERS} from '../platform/platform_ref';
import {assertStandaloneComponentType} from '../render3/errors';
import {setLocaleId} from '../render3/i18n/i18n_locale_id';
import {EnvironmentNgModuleRefAdapter} from '../render3/ng_module_ref';
import {NgZone} from '../zone/ng_zone';

import {ApplicationInitStatus} from './application_init';
import {_callAndReportToErrorHandler, ApplicationRef} from './application_ref';

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

export function internalCreateApplication(config: {
  rootComponent?: Type<unknown>;
  appProviders?: Array<Provider | EnvironmentProviders>;
  platformProviders?: Provider[];
}): Promise<ApplicationRef> {
  try {
    const {rootComponent, appProviders, platformProviders} = config;

    if ((typeof ngDevMode === 'undefined' || ngDevMode) && rootComponent !== undefined) {
      assertStandaloneComponentType(rootComponent);
    }

    const platformInjector = createOrReusePlatformInjector(platformProviders as StaticProvider[]);

    // Create root application injector based on a set of providers configured at the platform
    // bootstrap level as well as providers passed to the bootstrap call by a user.
    const allAppProviders = [internalProvideZoneChangeDetection({}), ...(appProviders || [])];
    const adapter = new EnvironmentNgModuleRefAdapter({
      providers: allAppProviders,
      parent: platformInjector as EnvironmentInjector,
      debugName: typeof ngDevMode === 'undefined' || ngDevMode ? 'Environment Injector' : '',
      // We skip environment initializers because we need to run them inside the NgZone, which
      // happens after we get the NgZone instance from the Injector.
      runEnvironmentInitializers: false,
    });
    const envInjector = adapter.injector;
    const ngZone = envInjector.get(NgZone);

    return ngZone.run(() => {
      envInjector.resolveInjectorInitializers();
      const exceptionHandler: ErrorHandler | null = envInjector.get(ErrorHandler, null);
      if ((typeof ngDevMode === 'undefined' || ngDevMode) && !exceptionHandler) {
        throw new RuntimeError(
          RuntimeErrorCode.MISSING_REQUIRED_INJECTABLE_IN_BOOTSTRAP,
          'No `ErrorHandler` found in the Dependency Injection tree.',
        );
      }

      let onErrorSubscription: Subscription;
      ngZone.runOutsideAngular(() => {
        onErrorSubscription = ngZone.onError.subscribe({
          next: (error: any) => {
            exceptionHandler!.handleError(error);
          },
        });
      });

      // If the whole platform is destroyed, invoke the `destroy` method
      // for all bootstrapped applications as well.
      const destroyListener = () => envInjector.destroy();
      const onPlatformDestroyListeners = platformInjector.get(PLATFORM_DESTROY_LISTENERS);
      onPlatformDestroyListeners.add(destroyListener);

      envInjector.onDestroy(() => {
        onErrorSubscription.unsubscribe();
        onPlatformDestroyListeners.delete(destroyListener);
      });

      return _callAndReportToErrorHandler(exceptionHandler!, ngZone, () => {
        const initStatus = envInjector.get(ApplicationInitStatus);
        initStatus.runInitializers();

        return initStatus.donePromise.then(() => {
          const localeId = envInjector.get(LOCALE_ID, DEFAULT_LOCALE_ID);
          setLocaleId(localeId || DEFAULT_LOCALE_ID);

          const appRef = envInjector.get(ApplicationRef);
          if (rootComponent !== undefined) {
            appRef.bootstrap(rootComponent);
          }
          if (typeof ngDevMode === 'undefined' || ngDevMode) {
            const imagePerformanceService = envInjector.get(ImagePerformanceWarning);
            imagePerformanceService.start();
          }
          return appRef;
        });
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
}
