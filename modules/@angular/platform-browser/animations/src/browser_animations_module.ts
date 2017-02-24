/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injectable, NgModule, NgZone, RendererFactoryV2} from '@angular/core';
import {BrowserModule, ɵDomRendererFactoryV2} from '@angular/platform-browser';

import {AnimationEngine} from './animation_engine';
import {AnimationStyleNormalizer} from './dsl/style_normalization/animation_style_normalizer';
import {WebAnimationsStyleNormalizer} from './dsl/style_normalization/web_animations_style_normalizer';
import {AnimationDriver, NoopAnimationDriver} from './render/animation_driver';
import {AnimationRendererFactory} from './render/animation_renderer';
import {DomAnimationEngine} from './render/dom_animation_engine';
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
 * @experimental Animation support is experimental.
 */
@NgModule({
  imports: [BrowserModule],
  providers: [
    {provide: AnimationDriver, useFactory: instantiateSupportedAnimationDriver},
    {provide: AnimationStyleNormalizer, useFactory: instantiateDefaultStyleNormalizer},
    {provide: AnimationEngine, useClass: InjectableAnimationEngine}, {
      provide: RendererFactoryV2,
      useFactory: instantiateRendererFactory,
      deps: [ɵDomRendererFactoryV2, AnimationEngine, NgZone]
    }
  ]
})
export class BrowserAnimationsModule {
}
