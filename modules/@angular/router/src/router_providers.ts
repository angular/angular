/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformLocation} from '@angular/common';
import {BrowserPlatformLocation} from '@angular/platform-browser';

import {ExtraOptions, provideRouter as provideRouter_} from './common_router_providers';
import {RouterConfig} from './config';


/**
 * A list of {@link Provider}s. To use the router, you must add this to your application.
 *
 * ### Example
 *
 * ```
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * class AppCmp {
 *   // ...
 * }
 *
 * const router = [
 *   {path: 'home', component: Home}
 * ];
 *
 * bootstrap(AppCmp, [provideRouter(router, {enableTracing: true})]);
 * ```
 *
 * @experimental
 */
export function provideRouter(config: RouterConfig, opts: ExtraOptions = {}): any[] {
  return [
    {provide: PlatformLocation, useClass: BrowserPlatformLocation}, ...provideRouter_(config, opts)
  ];
}
