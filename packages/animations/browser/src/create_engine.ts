/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NoopAnimationStyleNormalizer} from './dsl/style_normalization/animation_style_normalizer';
import {WebAnimationsStyleNormalizer} from './dsl/style_normalization/web_animations_style_normalizer';
import {NoopAnimationDriver} from './render/animation_driver';
import {AnimationEngine} from './render/animation_engine_next';
import {WebAnimationsDriver} from './render/web_animations/web_animations_driver';

export function createEngine(type: 'animations' | 'noop', doc: Document): AnimationEngine {
  // TODO: find a way to make this tree shakable.
  if (type === 'noop') {
    return new AnimationEngine(doc, new NoopAnimationDriver(), new NoopAnimationStyleNormalizer());
  }

  return new AnimationEngine(doc, new WebAnimationsDriver(), new WebAnimationsStyleNormalizer());
}
