/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, NgModule, NgZone, Testability} from '@angular/core';

import * as angular from '../angular_js';
import {controllerKey} from '../util';

import {angular1Providers, setTempInjectorRef} from './angular1_providers';
import {$$TESTABILITY, $DELEGATE, $INJECTOR, $PROVIDE, $ROOT_SCOPE, INJECTOR_KEY, UPGRADE_MODULE_NAME} from './constants';



/**
 * The Ng1Module contains providers for the Ng1Adapter and all the core Angular 1 services;
 * and also holds the `bootstrapNg1()` method fo bootstrapping an upgraded Angular 1 app.
 * @experimental
 */
@NgModule({providers: angular1Providers})
export class UpgradeModule {
  public $injector: any /*angular.IInjectorService*/;

  constructor(public injector: Injector, public ngZone: NgZone) {}

  /**
   * Bootstrap an Angular 1 application from this NgModule
   * @param element the element on which to bootstrap the Angular 1 application
   * @param [modules] the Angular 1 modules to bootstrap for this application
   * @param [config] optional extra Angular 1 bootstrap configuration
   */
  bootstrap(
      element: Element, modules: string[] = [], config?: any /*angular.IAngularBootstrapConfig*/) {
    // Create an ng1 module to bootstrap
    const upgradeModule =
        angular
            .module(UPGRADE_MODULE_NAME, modules)

            .value(INJECTOR_KEY, this.injector)

            .config([
              $PROVIDE, $INJECTOR,
              ($provide: angular.IProvideService, $injector: angular.IInjectorService) => {
                if ($injector.has($$TESTABILITY)) {
                  $provide.decorator($$TESTABILITY, [
                    $DELEGATE,
                    (testabilityDelegate: angular.ITestabilityService) => {
                      const originalWhenStable: Function = testabilityDelegate.whenStable;
                      const injector = this.injector;
                      // Cannot use arrow function below because we need to grab the context
                      const newWhenStable = function(callback: Function) {
                        const whenStableContext: any = this;
                        originalWhenStable.call(this, function() {
                          const ng2Testability: Testability = injector.get(Testability);
                          if (ng2Testability.isStable()) {
                            callback.apply(this, arguments);
                          } else {
                            ng2Testability.whenStable(
                                newWhenStable.bind(whenStableContext, callback));
                          }
                        });
                      };

                      testabilityDelegate.whenStable = newWhenStable;
                      return testabilityDelegate;
                    }
                  ]);
                }
              }
            ])

            .run([
              $INJECTOR,
              ($injector: angular.IInjectorService) => {
                this.$injector = $injector;

                // Initialize the ng1 $injector provider
                setTempInjectorRef($injector);
                this.injector.get($INJECTOR);

                // Put the injector on the DOM, so that it can be "required"
                angular.element(element).data(controllerKey(INJECTOR_KEY), this.injector);

                // Wire up the ng1 rootScope to run a digest cycle whenever the zone settles
                const $rootScope = $injector.get('$rootScope');
                this.ngZone.onMicrotaskEmpty.subscribe(
                    () => this.ngZone.runOutsideAngular(() => $rootScope.$evalAsync()));
              }
            ]);

    // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
    const windowAngular = (window as any /** TODO #???? */)['angular'];
    windowAngular.resumeBootstrap = undefined;

    // Bootstrap the angular 1 application inside our zone
    this.ngZone.run(() => { angular.bootstrap(element, [upgradeModule.name], config); });

    // Patch resumeBootstrap() to run inside the ngZone
    if (windowAngular.resumeBootstrap) {
      const originalResumeBootstrap: () => void = windowAngular.resumeBootstrap;
      const ngZone = this.ngZone;
      windowAngular.resumeBootstrap = function() {
        let args = arguments;
        windowAngular.resumeBootstrap = originalResumeBootstrap;
        ngZone.run(() => { windowAngular.resumeBootstrap.apply(this, args); });
      };
    }
  }
}
