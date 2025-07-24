/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, NgModule, Type} from '@angular/core';
import {ɵangular1 as angular, ɵconstants} from '../../../static';

import {UpgradeAppType} from '../../../src/common/src/util';

let $injector: angular.IInjectorService | null = null;
let injector: Injector;

export function $injectorFactory() {
  return $injector;
}

@NgModule({providers: [{provide: ɵconstants.$INJECTOR, useFactory: $injectorFactory}]})
export class AngularTestingModule {
  constructor(i: Injector) {
    injector = i;
  }
}

/**
 * A helper function to use when unit testing Angular services that depend upon upgraded AngularJS
 * services.
 *
 * This function returns an `NgModule` decorated class that is configured to wire up the Angular
 * and AngularJS injectors without the need to actually bootstrap a hybrid application.
 * This makes it simpler and faster to unit test services.
 *
 * Use the returned class as an "import" when configuring the `TestBed`.
 *
 * In the following code snippet, we are configuring the TestBed with two imports.
 * The `Ng2AppModule` is the Angular part of our hybrid application and the `ng1AppModule` is the
 * AngularJS part.
 *
 * {@example upgrade/static/ts/full/module.spec.ts region='angular-setup'}
 *
 * Once this is done we can get hold of services via the Angular `Injector` as normal.
 * Services that are (or have dependencies on) an upgraded AngularJS service, will be instantiated
 * as needed by the AngularJS `$injector`.
 *
 * In the following code snippet, `HeroesService` is an Angular service that depends upon an
 * AngularJS service, `titleCase`.
 *
 * {@example upgrade/static/ts/full/module.spec.ts region='angular-spec'}
 *
 * <div class="docs-alert docs-alert-important">
 *
 * This helper is for testing services not Components.
 * For Component testing you must still bootstrap a hybrid app. See `UpgradeModule` or
 * `downgradeModule` for more information.
 *
 * </div>
 *
 * <div class="docs-alert docs-alert-important">
 *
 * The resulting configuration does not wire up AngularJS digests to Zone hooks. It is the
 * responsibility of the test writer to call `$rootScope.$apply`, as necessary, to trigger
 * AngularJS handlers of async events from Angular.
 *
 * </div>
 *
 * <div class="docs-alert docs-alert-important">
 *
 * The helper sets up global variables to hold the shared Angular and AngularJS injectors.
 *
 * * Only call this helper once per spec.
 * * Do not use `createAngularTestingModule` in the same spec as `createAngularJSTestingModule`.
 *
 * </div>
 *
 * Here is the example application and its unit tests that use `createAngularTestingModule`
 * and `createAngularJSTestingModule`.
 *
 * <code-tabs>
 *  <code-pane header="module.spec.ts" path="upgrade/static/ts/full/module.spec.ts"></code-pane>
 *  <code-pane header="module.ts" path="upgrade/static/ts/full/module.ts"></code-pane>
 * </code-tabs>
 *
 *
 * @param angularJSModules a collection of the names of AngularJS modules to include in the
 * configuration.
 * @param [strictDi] whether the AngularJS injector should have `strictDI` enabled.
 *
 * @publicApi
 */
export function createAngularTestingModule(
  angularJSModules: string[],
  strictDi?: boolean,
): Type<any> {
  angular
    .module_('$$angularJSTestingModule', angularJSModules)
    .constant(ɵconstants.UPGRADE_APP_TYPE_KEY, UpgradeAppType.Static)
    .factory(ɵconstants.INJECTOR_KEY, () => injector);
  $injector = angular.injector(['ng', '$$angularJSTestingModule'], strictDi);
  return AngularTestingModule;
}
