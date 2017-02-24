/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgZone, Provider, RendererFactoryV2} from '@angular/core';
import {ɵDomRendererFactoryV2} from '@angular/platform-browser';

import {AnimationEngine} from './animation_engine';
import {AnimationStyleNormalizer} from './dsl/style_normalization/animation_style_normalizer';
import {WebAnimationsStyleNormalizer} from './dsl/style_normalization/web_animations_style_normalizer';
import {AnimationDriver, NoopAnimationDriver} from './render/animation_driver';
import {AnimationRendererFactory} from './render/animation_renderer';
import {DomAnimationEngine} from './render/dom_animation_engine';
import {NoopAnimationEngine} from './render/noop_animation_engine';
import {WebAnimationsDriver, supportsWebAnimations} from './render/web_animations/web_animations_driver';

@Injectable()
export class InjectableAnimationEngine extends DomAnimationEngine {
  constructor(driver: AnimationDriver, normalizer: AnimationStyleNormalizer) {
    super(driver, normalizer);
  }
}

export function instantiateSupportedAnimationDriver() {
  if (supportsWebAnimations()) {
    return new WebAnimationsDriver();
  }
  return new NoopAnimationDriver();
}

export function instantiateDefaultStyleNormalizer() {
  return new WebAnimationsStyleNormalizer();
}

export function instantiateRendererFactory(
    renderer: ɵDomRendererFactoryV2, engine: AnimationEngine, zone: NgZone) {
  return new AnimationRendererFactory(renderer, engine, zone);
}

/**
 * Separate providers from the actual module so that we can do a local modification in Google3 to
 * include them in the BrowserModule.
 */
export const BROWSER_ANIMATIONS_PROVIDERS: Provider[] = [
  {provide: AnimationDriver, useFactory: instantiateSupportedAnimationDriver},
  {provide: AnimationStyleNormalizer, useFactory: instantiateDefaultStyleNormalizer},
  {provide: AnimationEngine, useClass: InjectableAnimationEngine}, {
    provide: RendererFactoryV2,
    useFactory: instantiateRendererFactory,
    deps: [ɵDomRendererFactoryV2, AnimationEngine, NgZone]
  }
];

/**
 * Separate providers from the actual module so that we can do a local modification in Google3 to
 * include them in the BrowserTestingModule.
 */
export const BROWSER_NOOP_ANIMATIONS_PROVIDERS: Provider[] = [
  {provide: AnimationEngine, useClass: NoopAnimationEngine}, {
    provide: RendererFactoryV2,
    useFactory: instantiateRendererFactory,
    deps: [ɵDomRendererFactoryV2, AnimationEngine, NgZone]
  }
];