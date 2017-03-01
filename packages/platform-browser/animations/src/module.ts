/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {BROWSER_ANIMATIONS_PROVIDERS, BROWSER_NOOP_ANIMATIONS_PROVIDERS} from './providers';

/**
 * @experimental Animation support is experimental.
 */
@NgModule({
  imports: [BrowserModule],
  providers: BROWSER_ANIMATIONS_PROVIDERS,
})
export class BrowserAnimationsModule {
}

/**
 * @experimental Animation support is experimental.
 */
@NgModule({
  imports: [BrowserModule],
  providers: BROWSER_NOOP_ANIMATIONS_PROVIDERS,
})
export class NoopAnimationsModule {
}
