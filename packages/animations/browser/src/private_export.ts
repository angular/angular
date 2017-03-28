/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export {AnimationEngine as ɵAnimationEngine} from './animation_engine';
export {Animation as ɵAnimation} from './dsl/animation';
export {AnimationStyleNormalizer as ɵAnimationStyleNormalizer, NoopAnimationStyleNormalizer as ɵNoopAnimationStyleNormalizer} from './dsl/style_normalization/animation_style_normalizer';
export {WebAnimationsStyleNormalizer as ɵWebAnimationsStyleNormalizer} from './dsl/style_normalization/web_animations_style_normalizer';
export {NoopAnimationDriver as ɵNoopAnimationDriver} from './render/animation_driver';
export {DomAnimationEngine as ɵDomAnimationEngine} from './render/dom_animation_engine';
export {NoopAnimationEngine as ɵNoopAnimationEngine} from './render/noop_animation_engine';
export {WebAnimationsDriver as ɵWebAnimationsDriver, supportsWebAnimations as ɵsupportsWebAnimations} from './render/web_animations/web_animations_driver';
export {WebAnimationsPlayer as ɵWebAnimationsPlayer} from './render/web_animations/web_animations_player';
