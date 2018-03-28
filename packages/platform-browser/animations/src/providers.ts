/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationBuilder} from '@angular/animations';
import {AnimationDriver, ɵAnimationEngine as AnimationEngine, ɵAnimationStyleNormalizer as AnimationStyleNormalizer, ɵCssKeyframesDriver as CssKeyframesDriver, ɵNoopAnimationDriver as NoopAnimationDriver, ɵWebAnimationsDriver as WebAnimationsDriver, ɵWebAnimationsStyleNormalizer as WebAnimationsStyleNormalizer, ɵsupportsWebAnimations as supportsWebAnimations} from '@angular/animations/browser';
import {Injectable, NgZone, Provider, RendererFactory2} from '@angular/core';
import {ɵDomRendererFactory2 as DomRendererFactory2} from '@angular/platform-browser';

import {BrowserAnimationBuilder} from './animation_builder';
import {AnimationRendererFactory} from './animation_renderer';

@Injectable()
export class InjectableAnimationEngine extends AnimationEngine {
  constructor(driver: AnimationDriver, normalizer: AnimationStyleNormalizer) {
    super(driver, normalizer);
  }
}

export function instantiateSupportedAnimationDriver() {
  return supportsWebAnimations() ? new WebAnimationsDriver() : new CssKeyframesDriver();
}

export function instantiateDefaultStyleNormalizer() {
  return new WebAnimationsStyleNormalizer();
}

export function instantiateRendererFactory(
    renderer: DomRendererFactory2, engine: AnimationEngine, zone: NgZone) {
  return new AnimationRendererFactory(renderer, engine, zone);
}

const SHARED_ANIMATION_PROVIDERS: Provider[] = [
  {provide: AnimationBuilder, useClass: BrowserAnimationBuilder},
  {provide: AnimationStyleNormalizer, useFactory: instantiateDefaultStyleNormalizer},
  {provide: AnimationEngine, useClass: InjectableAnimationEngine}, {
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
  {provide: AnimationDriver, useFactory: instantiateSupportedAnimationDriver},
  ...SHARED_ANIMATION_PROVIDERS
];

/**
 * Separate providers from the actual module so that we can do a local modification in Google3 to
 * include them in the BrowserTestingModule.
 */
export const BROWSER_NOOP_ANIMATIONS_PROVIDERS: Provider[] =
    [{provide: AnimationDriver, useClass: NoopAnimationDriver}, ...SHARED_ANIMATION_PROVIDERS];
