/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgModule, ɵTransitionEngine} from '@angular/core';
import {AnimationStyleNormalizer} from './dsl/style_normalization/animation_style_normalizer';
import {WebAnimationsStyleNormalizer} from './dsl/style_normalization/web_animations_style_normalizer';
import {AnimationDriver, NoOpAnimationDriver} from './engine/animation_driver';
import {DomAnimationTransitionEngine} from './engine/dom_animation_transition_engine';
import {WebAnimationsDriver, supportsWebAnimations} from './engine/web_animations/web_animations_driver';

export function resolveDefaultAnimationDriver(): AnimationDriver {
  if (supportsWebAnimations()) {
    return new WebAnimationsDriver();
  }
  return new NoOpAnimationDriver();
}

/**
 * The module that includes all animation code such as `style()`, `animate()`, `trigger()`, etc...
 *
 * @experimental
 */
@NgModule({
  providers: [
    {provide: AnimationDriver, useFactory: resolveDefaultAnimationDriver},
    {provide: AnimationStyleNormalizer, useClass: WebAnimationsStyleNormalizer},
    {provide: ɵTransitionEngine, useClass: DomAnimationTransitionEngine}
  ]
})
export class AnimationModule {
}
