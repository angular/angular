/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, NgModule, NgZone, PlatformRef, Testability} from '@angular/core';

import {bootstrap, element as angularElement, IInjectorService, IIntervalService, IProvideService, ITestabilityService, module_ as angularModule} from '../../src/common/src/angular1';
import {$$TESTABILITY, $DELEGATE, $INJECTOR, $INTERVAL, $PROVIDE, INJECTOR_KEY, LAZY_MODULE_REF, UPGRADE_APP_TYPE_KEY, UPGRADE_MODULE_NAME} from '../../src/common/src/constants';
import {controllerKey, destroyApp, LazyModuleRef, UpgradeAppType} from '../../src/common/src/util';

import {angular1Providers, setTempInjectorRef} from './angular1_providers';
import {NgAdapterInjector} from './util';



/**
 * @description
 *
 * An `NgModule`, which you import to provide AngularJS core services,
 * and has an instance method used to bootstrap the hybrid upgrade application.
 *
 * *Part of the [upgrade/static](api?query=upgrade/static)
 * library for hybrid upgrade apps that support AOT compilation*
 *
 * The `upgrade/static` package contains helpers that allow AngularJS and Angular components
 * to be used together inside a hybrid upgrade application, which supports AOT compilation.
 *
 * Specifically, the classes and functions in the `upgrade/static` module allow the following:
 *
 * 1. Creation of an Angular directive that wraps and exposes an AngularJS component so
 *    that it can be used in an Angular template. See `UpgradeComponent`.
 * 2. Creation of an AngularJS directive that wraps and exposes an Angular component so
 *    that it can be used in an AngularJS template. See `downgradeComponent`.
 * 3. Creation of an Angular root injector provider that wraps and exposes an AngularJS
 *    service so that it can be injected into an Angular context. See
 *    {@link UpgradeModule#upgrading-an-angular-1-service Upgrading an AngularJS service} below.
 * 4. Creation of an AngularJS service that wraps and exposes an Angular injectable
 *    so that it can be injected into an AngularJS context. See `downgradeInjectable`.
 * 3. Bootstrapping of a hybrid Angular application which contains both of the frameworks
 *    coexisting in a single application.
 *
 * @usageNotes
 *
 * ```ts
 * import {UpgradeModule} from '@angular/upgrade/static';
 * ```
 *
 * See also the {@link UpgradeModule#examples examples} below.
 *
 * ### Mental Model
 *
 * When reasoning about how a hybrid application works it is useful to have a mental model which
 * describes what is happening and explains what is happening at the lowest level.
 *
 * 1. There are two independent frameworks running in a single application, each framework treats
 *    the other as a black box.
 * 2. Each DOM element on the page is owned exactly by one framework. Whichever framework
 *    instantiated the element is the owner. Each framework only updates/interacts with its own
 *    DOM elements and ignores others.
 * 3. AngularJS directives always execute inside the AngularJS framework codebase regardless of
 *    where they are instantiated.
 * 4. Angular components always execute inside the Angular framework codebase regardless of
 *    where they are instantiated.
 * 5. An AngularJS component can be "upgraded"" to an Angular component. This is achieved by
 *    defining an Angular directive, which bootstraps the AngularJS component at its location
 *    in the DOM. See `UpgradeComponent`.
 * 6. An Angular component can be "downgraded" to an AngularJS component. This is achieved by
 *    defining an AngularJS directive, which bootstraps the Angular component at its location
 *    in the DOM. See `downgradeComponent`.
 * 7. Whenever an "upgraded"/"downgraded" component is instantiated the host element is owned by
 *    the framework doing the instantiation. The other framework then instantiates and owns the
 *    view for that component.
 *    1. This implies that the component bindings will always follow the semantics of the
 *       instantiation framework.
 *    2. The DOM attributes are parsed by the framework that owns the current template. So
 *       attributes in AngularJS templates must use kebab-case, while AngularJS templates must use
 *       camelCase.
 *    3. However the template binding syntax will always use the Angular style, e.g. square
 *       brackets (`[...]`) for property binding.
 * 8. Angular is bootstrapped first; AngularJS is bootstrapped second. AngularJS always owns the
 *    root component of the application.
 * 9. The new application is running in an Angular zone, and therefore it no longer needs calls to
 *    `$apply()`.
 *
 * ### The `UpgradeModule` class
 *
 * This class is an `NgModule`, which you import to provide AngularJS core services,
 * and has an instance method used to bootstrap the hybrid upgrade application.
 *
 * * Core AngularJS services<br />
 *   Importing this `NgModule` will add providers for the core
 *   [AngularJS services](https://docs.angularjs.org/api/ng/service) to the root injector.
 *
 * * Bootstrap<br />
 *   The runtime instance of this class contains a {@link UpgradeModule#bootstrap `bootstrap()`}
 *   method, which you use to bootstrap the top level AngularJS module onto an element in the
 *   DOM for the hybrid upgrade app.
 *
 *   It also contains properties to access the {@link UpgradeModule#injector root injector}, the
 *   bootstrap `NgZone` and the
 *   [AngularJS $injector](https://docs.angularjs.org/api/auto/service/$injector).
 *
 * ### Examples
 *
 * Import the `UpgradeModule` into your top level {@link NgModule Angular `NgModule`}.
 *
 * {@example upgrade/static/ts/full/module.ts region='ng2-module'}
 *
 * Then inject `UpgradeModule` into your Angular `NgModule` and use it to bootstrap the top level
 * [AngularJS module](https://docs.angularjs.org/api/ng/type/angular.Module) in the
 * `ngDoBootstrap()` method.
 *
 * {@example upgrade/static/ts/full/module.ts region='bootstrap-ng1'}
 *
 * Finally, kick off the whole process, by bootstrapping your top level Angular `NgModule`.
 *
 * {@example upgrade/static/ts/full/module.ts region='bootstrap-ng2'}
 *
 * {@a upgrading-an-angular-1-service}
 * ### Upgrading an AngularJS service
 *
 * There is no specific API for upgrading an AngularJS service. Instead you should just follow the
 * following recipe:
 *
 * Let's say you have an AngularJS service:
 *
 * {@example upgrade/static/ts/full/module.ts region="ng1-text-formatter-service"}
 *
 * Then you should define an Angular provider to be included in your `NgModule` `providers`
 * property.
 *
 * {@example upgrade/static/ts/full/module.ts region="upgrade-ng1-service"}
 *
 * Then you can use the "upgraded" AngularJS service by injecting it into an Angular component
 * or service.
 *
 * {@example upgrade/static/ts/full/module.ts region="use-ng1-upgraded-service"}
 *
 * @publicApi
 */
@NgModule({providers: [angular1Providers]})
export class UpgradeModule {
  /**
   * The AngularJS `$injector` for the upgrade application.
   */
  public $injector: any /*angular.IInjectorService*/;
  /** The Angular Injector **/
  public injector: Injector;

  constructor(
      /** The root `Injector` for the upgrade application. */
      injector: Injector,
      /** The bootstrap zone for the upgrade application */
      public ngZone: NgZone,
      /**
       * The owning `NgModuleRef`s `PlatformRef` instance.
       * This is used to tie the lifecycle of the bootstrapped AngularJS apps to that of the Angular
       * `PlatformRef`.
       */
      private platformRef: PlatformRef) {
    this.injector = new NgAdapterInjector(injector);
  }

  /**
   * Bootstrap an AngularJS application from this NgModule
   * @param element the element on which to bootstrap the AngularJS application
   * @param [modules] the AngularJS modules to bootstrap for this application
   * @param [config] optional extra AngularJS bootstrap configuration
   * @return The value returned by
   *     [angular.bootstrap()](https://docs.angularjs.org/api/ng/function/angular.bootstrap).
   */
  bootstrap(
      element: Element, modules: string[] = [], config?: any /*angular.IAngularBootstrapConfig*/):
      any /*ReturnType<typeof angular.bootstrap>*/ {
    const INIT_MODULE_NAME = UPGRADE_MODULE_NAME + '.init';

    // Create an ng1 module to bootstrap
    angularModule(INIT_MODULE_NAME, [])

        .constant(UPGRADE_APP_TYPE_KEY, UpgradeAppType.Static)

        .value(INJECTOR_KEY, this.injector)

        .factory(
            LAZY_MODULE_REF, [INJECTOR_KEY, (injector: Injector) => ({injector} as LazyModuleRef)])

        .config([
          $PROVIDE, $INJECTOR,
          ($provide: IProvideService, $injector: IInjectorService) => {
            if ($injector.has($$TESTABILITY)) {
              $provide.decorator($$TESTABILITY, [
                $DELEGATE,
                (testabilityDelegate: ITestabilityService) => {
                  const originalWhenStable: Function = testabilityDelegate.whenStable;
                  const injector = this.injector;
                  // Cannot use arrow function below because we need the context
                  const newWhenStable = function(callback: Function) {
                    originalWhenStable.call(testabilityDelegate, function() {
                      const ng2Testability: Testability = injector.get(Testability);
                      if (ng2Testability.isStable()) {
                        callback();
                      } else {
                        ng2Testability.whenStable(
                            newWhenStable.bind(testabilityDelegate, callback));
                      }
                    });
                  };

                  testabilityDelegate.whenStable = newWhenStable;
                  return testabilityDelegate;
                }
              ]);
            }

            if ($injector.has($INTERVAL)) {
              $provide.decorator($INTERVAL, [
                $DELEGATE,
                (intervalDelegate: IIntervalService) => {
                  // Wrap the $interval service so that setInterval is called outside NgZone,
                  // but the callback is still invoked within it. This is so that $interval
                  // won't block stability, which preserves the behavior from AngularJS.
                  let wrappedInterval =
                      (fn: Function, delay: number, count?: number, invokeApply?: boolean,
                       ...pass: any[]) => {
                        return this.ngZone.runOutsideAngular(() => {
                          return intervalDelegate((...args: any[]) => {
                            // Run callback in the next VM turn - $interval calls
                            // $rootScope.$apply, and running the callback in NgZone will
                            // cause a '$digest already in progress' error if it's in the
                            // same vm turn.
                            setTimeout(() => {
                              this.ngZone.run(() => fn(...args));
                            });
                          }, delay, count, invokeApply, ...pass);
                        });
                      };

                  (Object.keys(intervalDelegate) as (keyof IIntervalService)[])
                      .forEach(prop => (wrappedInterval as any)[prop] = intervalDelegate[prop]);

                  // the `flush` method will be present when ngMocks is used
                  if (intervalDelegate.hasOwnProperty('flush')) {
                    (wrappedInterval as any)['flush'] = () => {
                      (intervalDelegate as any)['flush']();
                      return wrappedInterval;
                    };
                  }

                  return wrappedInterval;
                }
              ]);
            }
          }
        ])

        .run([
          $INJECTOR,
          ($injector: IInjectorService) => {
            this.$injector = $injector;
            const $rootScope = $injector.get('$rootScope');

            // Initialize the ng1 $injector provider
            setTempInjectorRef($injector);
            this.injector.get($INJECTOR);

            // Put the injector on the DOM, so that it can be "required"
            angularElement(element).data!(controllerKey(INJECTOR_KEY), this.injector);

            // Destroy the AngularJS app once the Angular `PlatformRef` is destroyed.
            // This does not happen in a typical SPA scenario, but it might be useful for
            // other use-cases where disposing of an Angular/AngularJS app is necessary
            // (such as Hot Module Replacement (HMR)).
            // See https://github.com/angular/angular/issues/39935.
            this.platformRef.onDestroy(() => destroyApp($injector));

            // Wire up the ng1 rootScope to run a digest cycle whenever the zone settles
            // We need to do this in the next tick so that we don't prevent the bootup stabilizing
            setTimeout(() => {
              const subscription = this.ngZone.onMicrotaskEmpty.subscribe(() => {
                if ($rootScope.$$phase) {
                  if (typeof ngDevMode === 'undefined' || ngDevMode) {
                    console.warn(
                        'A digest was triggered while one was already in progress. This may mean that something is triggering digests outside the Angular zone.');
                  }

                  return $rootScope.$evalAsync();
                }

                return $rootScope.$digest();
              });
              $rootScope.$on('$destroy', () => {
                subscription.unsubscribe();
              });
            }, 0);
          }
        ]);

    const upgradeModule = angularModule(UPGRADE_MODULE_NAME, [INIT_MODULE_NAME].concat(modules));

    // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
    const windowAngular = (window as any)['angular'];
    windowAngular.resumeBootstrap = undefined;

    // Bootstrap the AngularJS application inside our zone
    const returnValue = this.ngZone.run(() => bootstrap(element, [upgradeModule.name], config));

    // Patch resumeBootstrap() to run inside the ngZone
    if (windowAngular.resumeBootstrap) {
      const originalResumeBootstrap: () => void = windowAngular.resumeBootstrap;
      const ngZone = this.ngZone;
      windowAngular.resumeBootstrap = function() {
        let args = arguments;
        windowAngular.resumeBootstrap = originalResumeBootstrap;
        return ngZone.run(() => windowAngular.resumeBootstrap.apply(this, args));
      };
    }

    return returnValue;
  }
}
