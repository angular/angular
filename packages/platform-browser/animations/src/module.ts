/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ModuleWithProviders, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {BROWSER_ANIMATIONS_PROVIDERS, BROWSER_NOOP_ANIMATIONS_PROVIDERS} from './providers';

/**
 * Object used to configure the behavior of {@link BrowserAnimationsModule}
 * @publicApi
 */
export interface BrowserAnimationsModuleConfig {
  /** Whether animations should be disabled. */
  disableAnimations?: boolean;
}

/**
 * Exports `BrowserModule` with additional [dependency-injection providers](guide/glossary#provider)
 * for use with animations. See [Animations](guide/animations).
 * @publicApi
 */
@NgModule({
  exports: [BrowserModule],
  providers: BROWSER_ANIMATIONS_PROVIDERS,
})
export class BrowserAnimationsModule {
  /**
   * Creates and configures a module based on the specified object.
   *
   * When registering the NgModule at the root, import as follows:
   *
   * ```
   * @NgModule({
   *   imports: [BrowserAnimationsModule.withConfig(config)]
   * })
   * class MyNgModule {}
   * ```
   *
   * @param config Object used to configure the behavior of the `BrowserAnimationsModule`.
   * @return The new `NgModule`.
   */
  static withConfig(config: BrowserAnimationsModuleConfig):
      ModuleWithProviders<BrowserAnimationsModule> {
    return {
      ngModule: BrowserAnimationsModule,
      providers: config.disableAnimations ? BROWSER_NOOP_ANIMATIONS_PROVIDERS :
                                            BROWSER_ANIMATIONS_PROVIDERS
    };
  }
}

/**
 * A null player that must be imported to allow disabling of animations.
 * @publicApi
 */
@NgModule({
  exports: [BrowserModule],
  providers: BROWSER_NOOP_ANIMATIONS_PROVIDERS,
})
export class NoopAnimationsModule {
}
