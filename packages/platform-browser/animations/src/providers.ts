/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AnimationDriver,
  NoopAnimationDriver,
  ɵAnimationEngine as AnimationEngine,
  ɵAnimationRendererFactory as AnimationRendererFactory,
  ɵAnimationStyleNormalizer as AnimationStyleNormalizer,
  ɵWebAnimationsDriver as WebAnimationsDriver,
  ɵWebAnimationsStyleNormalizer as WebAnimationsStyleNormalizer,
} from '@angular/animations/browser';
import {DOCUMENT} from '@angular/common';
import {
  ANIMATION_MODULE_TYPE,
  inject,
  Inject,
  Injectable,
  NgZone,
  OnDestroy,
  Provider,
  RendererFactory2,
  ɵChangeDetectionScheduler as ChangeDetectionScheduler,
} from '@angular/core';
import {ɵDomRendererFactory2 as DomRendererFactory2} from '../../index';

@Injectable()
export class InjectableAnimationEngine extends AnimationEngine implements OnDestroy {
  // The `ApplicationRef` is injected here explicitly to force the dependency ordering.
  // Since the `ApplicationRef` should be created earlier before the `AnimationEngine`, they
  // both have `ngOnDestroy` hooks and `flush()` must be called after all views are destroyed.
  constructor(
    @Inject(DOCUMENT) doc: Document,
    driver: AnimationDriver,
    normalizer: AnimationStyleNormalizer,
  ) {
    super(doc, driver, normalizer);
  }

  ngOnDestroy(): void {
    this.flush();
  }
}

export function instantiateDefaultStyleNormalizer() {
  return new WebAnimationsStyleNormalizer();
}

export function instantiateRendererFactory(
  renderer: DomRendererFactory2,
  engine: AnimationEngine,
  zone: NgZone,
) {
  return new AnimationRendererFactory(renderer, engine, zone);
}

const SHARED_ANIMATION_PROVIDERS: Provider[] = [
  {provide: AnimationStyleNormalizer, useFactory: instantiateDefaultStyleNormalizer},
  {provide: AnimationEngine, useClass: InjectableAnimationEngine},
  {
    provide: RendererFactory2,
    useFactory: instantiateRendererFactory,
    deps: [DomRendererFactory2, AnimationEngine, NgZone],
  },
];

/**
 * Separate providers from the actual module so that we can do a local modification in Google3 to
 * include them in the BrowserTestingModule.
 */
export const BROWSER_NOOP_ANIMATIONS_PROVIDERS: Provider[] = [
  {provide: AnimationDriver, useClass: NoopAnimationDriver},
  {provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations'},
  ...SHARED_ANIMATION_PROVIDERS,
];

/**
 * Separate providers from the actual module so that we can do a local modification in Google3 to
 * include them in the BrowserModule.
 */
export const BROWSER_ANIMATIONS_PROVIDERS: Provider[] = [
  // Note: the `ngServerMode` happen inside factories to give the variable time to initialize.
  {
    provide: AnimationDriver,
    useFactory: () =>
      typeof ngServerMode !== 'undefined' && ngServerMode
        ? new NoopAnimationDriver()
        : new WebAnimationsDriver(),
  },
  {
    provide: ANIMATION_MODULE_TYPE,
    useFactory: () =>
      typeof ngServerMode !== 'undefined' && ngServerMode ? 'NoopAnimations' : 'BrowserAnimations',
  },
  ...SHARED_ANIMATION_PROVIDERS,
];
