/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {NgModule} from '../metadata';
/**
 * Re-exported by `BrowserModule`, which is included automatically in the root
 * `AppModule` when you create a new app with the CLI `new` command. Eagerly injects
 * `ApplicationRef` to instantiate it.
 *
 * @publicApi
 */
let ApplicationModule = class ApplicationModule {
  // Inject ApplicationRef to make it eager...
  constructor(appRef) {}
};
ApplicationModule = __decorate([NgModule()], ApplicationModule);
export {ApplicationModule};
//# sourceMappingURL=application_module.js.map
