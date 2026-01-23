/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export {createEngine as ɵcreateEngine} from './create_engine';
export {Animation as ɵAnimation} from './dsl/animation';
export {
  AnimationStyleNormalizer as ɵAnimationStyleNormalizer,
  NoopAnimationStyleNormalizer as ɵNoopAnimationStyleNormalizer,
} from './dsl/style_normalization/animation_style_normalizer';
export {WebAnimationsStyleNormalizer as ɵWebAnimationsStyleNormalizer} from './dsl/style_normalization/web_animations_style_normalizer';
export {AnimationEngine as ɵAnimationEngine} from './render/animation_engine_next';
export {AnimationRendererFactory as ɵAnimationRendererFactory} from './render/animation_renderer';
export {
  AnimationRenderer as ɵAnimationRenderer,
  BaseAnimationRenderer as ɵBaseAnimationRenderer,
} from './render/renderer';
export {
  containsElement as ɵcontainsElement,
  getParentElement as ɵgetParentElement,
  invokeQuery as ɵinvokeQuery,
  validateStyleProperty as ɵvalidateStyleProperty,
  validateWebAnimatableStyleProperty as ɵvalidateWebAnimatableStyleProperty,
} from './render/shared';
export {WebAnimationsDriver as ɵWebAnimationsDriver} from './render/web_animations/web_animations_driver';
export {WebAnimationsPlayer as ɵWebAnimationsPlayer} from './render/web_animations/web_animations_player';
export {
  allowPreviousPlayerStylesMerge as ɵallowPreviousPlayerStylesMerge,
  camelCaseToDashCase as ɵcamelCaseToDashCase,
  normalizeKeyframes as ɵnormalizeKeyframes,
} from './util';
export {TransitionAnimationPlayer as ɵTransitionAnimationPlayer} from './render/transition_animation_engine';
export {ENTER_CLASSNAME as ɵENTER_CLASSNAME, LEAVE_CLASSNAME as ɵLEAVE_CLASSNAME} from './util';
