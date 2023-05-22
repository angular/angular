/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationBuilder} from '@angular/animations';
import {AnimationDriver, ɵAnimationEngine as AnimationEngine, ɵAnimationStyleNormalizer as AnimationStyleNormalizer, ɵNoopAnimationDriver as NoopAnimationDriver, ɵNoopAnimationStyleNormalizer as NoopAnimationStyleNormalizer, ɵWebAnimationsDriver as WebAnimationsDriver, ɵWebAnimationsStyleNormalizer as WebAnimationsStyleNormalizer} from '@angular/animations/browser';
import {ANIMATION_MODULE_TYPE, NgZone, Provider, RendererFactory2} from '@angular/core';
import {ɵDomRendererFactory2 as DomRendererFactory2} from '@angular/platform-browser';

import {BrowserAnimationBuilder} from './animation_builder';
import {AnimationRendererFactory} from './animation_renderer';

export function instantiateRendererFactory(
    renderer: DomRendererFactory2, engine: AnimationEngine, zone: NgZone) {
  return new AnimationRendererFactory(renderer, engine, zone);
}

const SHARED_ANIMATION_PROVIDERS: Provider[] = [
  {provide: AnimationBuilder, useClass: BrowserAnimationBuilder}, {
    provide: RendererFactory2,
    useFactory: instantiateRendererFactory,
    deps: [DomRendererFactory2, AnimationEngine, NgZone]
  }
];

/**
 * Separate providers from the actual module so that we can do a local modification in Google3 to
 * include them in the BrowserModule.
 */
export const BROWSER_ANIMATIONS_PROVIDERS: Provider[] = [
  {provide: AnimationStyleNormalizer, useClass: WebAnimationsStyleNormalizer},
  {provide: AnimationDriver, useFactory: () => new WebAnimationsDriver()},
  {provide: ANIMATION_MODULE_TYPE, useValue: 'BrowserAnimations'}, ...SHARED_ANIMATION_PROVIDERS
];

/**
 * Separate providers from the actual module so that we can do a local modification in Google3 to
 * include them in the BrowserTestingModule.
 */
export const BROWSER_NOOP_ANIMATIONS_PROVIDERS: Provider[] = [
  {provide: AnimationDriver, useClass: NoopAnimationDriver},
  {provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations'}, ...SHARED_ANIMATION_PROVIDERS
];

/**
 * Same as BROWSER_ANIMATIONS_PROVIDERS but with lazy loaded modules and without AnimationBuilder
 *
 */
export const LAZY_LOADED_ANIMATIONS_PROVIDERS: Provider[] = [
  {
    provide: RendererFactory2,
    useFactory: instantiateRendererFactory,
    deps: [DomRendererFactory2, AnimationEngine, NgZone]
  },
  {provide: ANIMATION_MODULE_TYPE, useValue: 'BrowserAnimations'}
];

/**
 * Provider for the Browser AnimationBuilder
 */
export const BROWER_ANIMATION_BUILDER_PROVIDER: Provider = {
  provide: AnimationBuilder,
  useClass: BrowserAnimationBuilder
};
