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
export {AnimationEvent} from './animation_event';
export {AUTO_STYLE, AnimateTimings, AnimationAnimateMetadata, AnimationGroupMetadata, AnimationKeyframesSequenceMetadata, AnimationMetadata, AnimationMetadataType, AnimationSequenceMetadata, AnimationStateMetadata, AnimationStyleMetadata, AnimationTransitionMetadata, AnimationTriggerMetadata, animate, group, keyframes, sequence, state, style, transition, trigger, ɵStyleData} from './animation_metadata';
export {AnimationPlayer, NoopAnimationPlayer} from './players/animation_player';

export * from './private_export';
