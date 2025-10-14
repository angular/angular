import {PROVIDED_NG_ZONE} from '../change_detection/scheduling/ng_zone_scheduling';
import {INTERNAL_APPLICATION_ERROR_HANDLER} from '../error_handler';
import {formatRuntimeError, RuntimeError} from '../errors';
import {DEFAULT_LOCALE_ID} from '../i18n/localization';
import {LOCALE_ID} from '../i18n/tokens';
import {ImagePerformanceWarning} from '../image_performance_warning';
import {PLATFORM_DESTROY_LISTENERS} from './platform_destroy_listeners';
import {setLocaleId} from '../render3/i18n/i18n_locale_id';
import {NgZone} from '../zone/ng_zone';
import {ApplicationInitStatus} from '../application/application_init';
import {ApplicationRef, remove} from '../application/application_ref';
import {PROVIDED_ZONELESS} from '../change_detection/scheduling/zoneless_scheduling';
import {InjectionToken} from '../di';
import {stringify} from '../util/stringify';
import {isPromise} from '../util/lang';
import {PendingTasksInternal} from '../pending_tasks_internal';
const REQUIRE_ONE_CD_PROVIDER_CREATE_APPLICATION = false;
const REQUIRE_ONE_CD_PROVIDER_BOOTSTRAP_MODULE = false;
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
export const ENABLE_ROOT_COMPONENT_BOOTSTRAP = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'ENABLE_ROOT_COMPONENT_BOOTSTRAP' : '',
);
function isApplicationBootstrapConfig(config) {
  return !config.moduleRef;
}
export function bootstrap(config) {
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
        console.warn(
          formatRuntimeError(
            408 /* RuntimeErrorCode.PROVIDED_BOTH_ZONE_AND_ZONELESS */,
            'Both provideZoneChangeDetection and provideZonelessChangeDetection are provided. ' +
              'This is likely a mistake. Update the application providers to use only one of the two.',
          ),
        );
      }
      if (!envInjector.get(PROVIDED_ZONELESS) && !envInjector.get(PROVIDED_NG_ZONE)) {
        if (
          (REQUIRE_ONE_CD_PROVIDER_CREATE_APPLICATION && isApplicationBootstrapConfig(config)) ||
          (REQUIRE_ONE_CD_PROVIDER_BOOTSTRAP_MODULE && !isApplicationBootstrapConfig(config))
        ) {
          throw new Error(
            'Missing change detection configuration: ' +
              'please add either `provideZoneChangeDetection()` or `provideZonelessChangeDetection()` ' +
              "to the list of root providers in your application's bootstrap code.",
          );
        }
      }
    }
    let onErrorSubscription;
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
      return initStatus.donePromise
        .then(() => {
          // If the `LOCALE_ID` provider is defined at bootstrap then we set the value for ivy
          const localeId = envInjector.get(LOCALE_ID, DEFAULT_LOCALE_ID);
          setLocaleId(localeId || DEFAULT_LOCALE_ID);
          const enableRootComponentbootstrap = envInjector.get(
            ENABLE_ROOT_COMPONENT_BOOTSTRAP,
            true,
          );
          if (!enableRootComponentbootstrap) {
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
        })
        .finally(() => void pendingTasks.remove(taskId));
    });
  });
}
/**
 * Having a separate symbol for the module bootstrap implementation allows us to
 * tree shake the module based bootstrap implementation in standalone apps.
 */
let moduleBootstrapImpl;
/**
 * Set the implementation of the module based bootstrap.
 */
export function setModuleBootstrapImpl() {
  moduleBootstrapImpl = _moduleDoBootstrap;
}
function _moduleDoBootstrap(moduleRef, allPlatformModules) {
  const appRef = moduleRef.injector.get(ApplicationRef);
  if (moduleRef._bootstrapComponents.length > 0) {
    moduleRef._bootstrapComponents.forEach((f) => appRef.bootstrap(f));
  } else if (moduleRef.instance.ngDoBootstrap) {
    moduleRef.instance.ngDoBootstrap(appRef);
  } else {
    throw new RuntimeError(
      -403 /* RuntimeErrorCode.BOOTSTRAP_COMPONENTS_NOT_FOUND */,
      ngDevMode &&
        `The module ${stringify(moduleRef.instance.constructor)} was bootstrapped, ` +
          `but it does not declare "@NgModule.bootstrap" components nor a "ngDoBootstrap" method. ` +
          `Please define one of these.`,
    );
  }
  allPlatformModules.push(moduleRef);
}
function _callAndReportToErrorHandler(errorHandler, ngZone, callback) {
  try {
    const result = callback();
    if (isPromise(result)) {
      return result.catch((e) => {
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
//# sourceMappingURL=bootstrap.js.map
