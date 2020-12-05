/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationBuilder} from '@angular/animations';
import {AnimationDriver, ɵAnimationEngine as AnimationEngine, ɵAnimationStyleNormalizer as AnimationStyleNormalizer, ɵCssKeyframesDriver as CssKeyframesDriver, ɵNoopAnimationDriver as NoopAnimationDriver, ɵsupportsWebAnimations as supportsWebAnimations, ɵWebAnimationsDriver as WebAnimationsDriver, ɵWebAnimationsStyleNormalizer as WebAnimationsStyleNormalizer} from '@angular/animations/browser';
import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, InjectionToken, NgZone, OnDestroy, Provider, RendererFactory2} from '@angular/core';
import {ɵDomRendererFactory2 as DomRendererFactory2} from '@angular/platform-browser';

import {BrowserAnimationBuilder} from './animation_builder';
import {AnimationRendererFactory} from './animation_renderer';

@Injectable()
export class InjectableAnimationEngine extends AnimationEngine implements OnDestroy {
  constructor(
      @Inject(DOCUMENT) doc: any, driver: AnimationDriver, normalizer: AnimationStyleNormalizer) {
    super(doc.body, driver, normalizer);
  }

  ngOnDestroy(): void {
    this.flush();
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

/**
 * @publicApi
 */
export const ANIMATION_MODULE_TYPE =
    new InjectionToken<'NoopAnimations'|'BrowserAnimations'>('AnimationModuleType');

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
