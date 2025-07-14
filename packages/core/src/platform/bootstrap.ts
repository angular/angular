/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Subscription} from 'rxjs';

import {PROVIDED_NG_ZONE} from '../change_detection/scheduling/ng_zone_scheduling';
import {R3Injector} from '../di/r3_injector';
import {INTERNAL_APPLICATION_ERROR_HANDLER} from '../error_handler';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {DEFAULT_LOCALE_ID} from '../i18n/localization';
import {LOCALE_ID} from '../i18n/tokens';
import {ImagePerformanceWarning} from '../image_performance_warning';
import {Type} from '../interface/type';
import {PLATFORM_DESTROY_LISTENERS} from './platform_destroy_listeners';
import {setLocaleId} from '../render3/i18n/i18n_locale_id';
import {NgZone} from '../zone/ng_zone';

import {ApplicationInitStatus} from '../application/application_init';
import {ApplicationRef, remove} from '../application/application_ref';
import {PROVIDED_ZONELESS} from '../change_detection/scheduling/zoneless_scheduling';
import {InjectionToken, Injector} from '../di';
import {InternalNgModuleRef, NgModuleRef} from '../linker/ng_module_factory';
import {stringify} from '../util/stringify';
import {isPromise} from '../util/lang';
import {PendingTasksInternal} from '../pending_tasks';

/**
 * InjectionToken to control root component bootstrap behavior.
 *
 * This token is primarily used in Angular's server-side rendering (SSR) scenarios,
 * particularly by the `@angular/ssr` package, to manage whether the root component
 * should be bootstrapped during the application initialization process.
 *
 * ## Purpose:
 * During SSR route extraction, setting this token to `false` prevents Angular from
 * bootstrapping the root component. This avoids unnecessary component rendering,
 * enabling route extraction without requiring additional APIs or triggering
 * component logic.
 *
 * ## Behavior:
 * - **`false`**: Prevents the root component from being bootstrapped.
 * - **`true`** (default): Proceeds with the normal root component bootstrap process.
 *
 * This mechanism ensures SSR can efficiently separate route extraction logic
 * from component rendering.
 */
export const ENABLE_ROOT_COMPONENT_BOOTSTRAP = new InjectionToken<boolean>(
  ngDevMode ? 'ENABLE_ROOT_COMPONENT_BOOTSTRAP' : '',
);

export interface BootstrapConfig {
  platformInjector: Injector;
}

export interface ModuleBootstrapConfig<M> extends BootstrapConfig {
  moduleRef: InternalNgModuleRef<M>;
  allPlatformModules: NgModuleRef<unknown>[];
}

export interface ApplicationBootstrapConfig extends BootstrapConfig {
  r3Injector: R3Injector;
  rootComponent: Type<unknown> | undefined;
}

function isApplicationBootstrapConfig(
  config: ApplicationBootstrapConfig | ModuleBootstrapConfig<unknown>,
): config is ApplicationBootstrapConfig {
  return !(config as ModuleBootstrapConfig<unknown>).moduleRef;
}

export function bootstrap<M>(
  moduleBootstrapConfig: ModuleBootstrapConfig<M>,
): Promise<NgModuleRef<M>>;
export function bootstrap(
  applicationBootstrapConfig: ApplicationBootstrapConfig,
): Promise<ApplicationRef>;
export function bootstrap<M>(
  config: ModuleBootstrapConfig<M> | ApplicationBootstrapConfig,
): Promise<ApplicationRef> | Promise<NgModuleRef<M>> {
  const envInjector = isApplicationBootstrapConfig(config)
    ? config.r3Injector
    : config.moduleRef.injector;
  const ngZone = envInjector.get(NgZone);
  return ngZone.run(() => {
    if (isApplicationBootstrapConfig(config)) {
      config.r3Injector.resolveInjectorInitializers();
    } else {
      config.moduleRef.resolveInjectorInitializers();
    }
    const exceptionHandler = envInjector.get(INTERNAL_APPLICATION_ERROR_HANDLER);
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (envInjector.get(PROVIDED_ZONELESS) && envInjector.get(PROVIDED_NG_ZONE)) {
        throw new RuntimeError(
          RuntimeErrorCode.PROVIDED_BOTH_ZONE_AND_ZONELESS,
          'Invalid change detection configuration: ' +
            'provideZoneChangeDetection and provideZonelessChangeDetection cannot be used together.',
        );
      }
    }

    let onErrorSubscription: Subscription;
    ngZone.runOutsideAngular(() => {
      onErrorSubscription = ngZone.onError.subscribe({
        next: exceptionHandler,
      });
    });

    // If the whole platform is destroyed, invoke the `destroy` method
    // for all bootstrapped applications as well.
    if (isApplicationBootstrapConfig(config)) {
      const destroyListener = () => envInjector.destroy();
      const onPlatformDestroyListeners = config.platformInjector.get(PLATFORM_DESTROY_LISTENERS);
      onPlatformDestroyListeners.add(destroyListener);

      envInjector.onDestroy(() => {
        onErrorSubscription.unsubscribe();
        onPlatformDestroyListeners.delete(destroyListener);
      });
    } else {
      const destroyListener = () => config.moduleRef.destroy();
      const onPlatformDestroyListeners = config.platformInjector.get(PLATFORM_DESTROY_LISTENERS);
      onPlatformDestroyListeners.add(destroyListener);

      config.moduleRef.onDestroy(() => {
        remove(config.allPlatformModules, config.moduleRef);
        onErrorSubscription.unsubscribe();
        onPlatformDestroyListeners.delete(destroyListener);
      });
    }

    return _callAndReportToErrorHandler(exceptionHandler, ngZone, () => {
      const pendingTasks = envInjector.get(PendingTasksInternal);
      const taskId = pendingTasks.add();
      const initStatus = envInjector.get(ApplicationInitStatus);
      initStatus.runInitializers();

      return initStatus.donePromise.then(() => {
        try {
          // If the `LOCALE_ID` provider is defined at bootstrap then we set the value for ivy
          const localeId = envInjector.get(LOCALE_ID, DEFAULT_LOCALE_ID);
          setLocaleId(localeId || DEFAULT_LOCALE_ID);

          const enableRootComponentBoostrap = envInjector.get(
            ENABLE_ROOT_COMPONENT_BOOTSTRAP,
            true,
          );
          if (!enableRootComponentBoostrap) {
            if (isApplicationBootstrapConfig(config)) {
              return envInjector.get(ApplicationRef);
            }

            config.allPlatformModules.push(config.moduleRef);
            return config.moduleRef;
          }

          if (typeof ngDevMode === 'undefined' || ngDevMode) {
            const imagePerformanceService = envInjector.get(ImagePerformanceWarning);
            imagePerformanceService.start();
          }

          if (isApplicationBootstrapConfig(config)) {
            const appRef = envInjector.get(ApplicationRef);
            if (config.rootComponent !== undefined) {
              appRef.bootstrap(config.rootComponent);
            }
            return appRef;
          } else {
            moduleBootstrapImpl?.(config.moduleRef, config.allPlatformModules);
            return config.moduleRef;
          }
        } finally {
          pendingTasks.remove(taskId);
        }
      });
    });
  });
}

/**
 * Having a separate symbol for the module boostrap implementation allows us to
 * tree shake the module based boostrap implementation in standalone apps.
 */
let moduleBootstrapImpl: undefined | typeof _moduleDoBootstrap;

/**
 * Set the implementation of the module based bootstrap.
 */
export function setModuleBootstrapImpl() {
  moduleBootstrapImpl = _moduleDoBootstrap;
}

function _moduleDoBootstrap(
  moduleRef: InternalNgModuleRef<any>,
  allPlatformModules: NgModuleRef<unknown>[],
): void {
  const appRef = moduleRef.injector.get(ApplicationRef);
  if (moduleRef._bootstrapComponents.length > 0) {
    moduleRef._bootstrapComponents.forEach((f) => appRef.bootstrap(f));
  } else if (moduleRef.instance.ngDoBootstrap) {
    moduleRef.instance.ngDoBootstrap(appRef);
  } else {
    throw new RuntimeError(
      RuntimeErrorCode.BOOTSTRAP_COMPONENTS_NOT_FOUND,
      ngDevMode &&
        `The module ${stringify(moduleRef.instance.constructor)} was bootstrapped, ` +
          `but it does not declare "@NgModule.bootstrap" components nor a "ngDoBootstrap" method. ` +
          `Please define one of these.`,
    );
  }
  allPlatformModules.push(moduleRef);
}

function _callAndReportToErrorHandler(
  errorHandler: (e: unknown) => void,
  ngZone: NgZone,
  callback: () => any,
): any {
  try {
    const result = callback();
    if (isPromise(result)) {
      return result.catch((e: any) => {
        ngZone.runOutsideAngular(() => errorHandler(e));
        // rethrow as the exception handler might not do it
        throw e;
      });
    }

    return result;
  } catch (e) {
    ngZone.runOutsideAngular(() => errorHandler(e));
    // rethrow as the exception handler might not do it
    throw e;
  }
}
