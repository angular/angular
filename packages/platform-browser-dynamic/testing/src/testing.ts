/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createPlatformFactory, NgModule, PlatformRef, StaticProvider} from '@angular/core';
import {platformBrowserDynamic} from '../../index';
import {BrowserTestingModule} from '@angular/platform-browser/testing';

/**
 * @deprecated Use the `platformBrowserTesting` function instead from `@angular/platform-browser/testing`.
 * In case you are not in a CLI app and rely on JIT compilation, you might also need to import `@angular/compiler`
 */
export const platformBrowserDynamicTesting: (extraProviders?: StaticProvider[]) => PlatformRef =
  createPlatformFactory(platformBrowserDynamic, 'browserDynamicTesting');

/**
 * NgModule for testing.
 *
 * @deprecated Use the `BrowserTestingModule` from `@angular/platform-browser/testing` instead.
 */
@NgModule({
  exports: [BrowserTestingModule],
})
export class BrowserDynamicTestingModule {}
