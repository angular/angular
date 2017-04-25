/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * Entry point for all animation APIs of the animation package.
 */
export {AnimationBuilder, AnimationFactory} from './animation_builder';
export {AnimationEvent} from './animation_event';
export {AUTO_STYLE, AnimateChildOptions, AnimateTimings, AnimationAnimateChildMetadata, AnimationAnimateMetadata, AnimationAnimateRefMetadata, AnimationGroupMetadata, AnimationKeyframesSequenceMetadata, AnimationMetadata, AnimationMetadataType, AnimationOptions, AnimationQueryMetadata, AnimationQueryOptions, AnimationReferenceMetadata, AnimationSequenceMetadata, AnimationStaggerMetadata, AnimationStateMetadata, AnimationStyleMetadata, AnimationTransitionMetadata, AnimationTriggerMetadata, animate, animateChild, animation, group, keyframes, query, sequence, stagger, state, style, transition, trigger, useAnimation, ɵStyleData} from './animation_metadata';
export {AnimationPlayer, NoopAnimationPlayer} from './players/animation_player';

export * from './private_export';
