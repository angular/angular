/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {StyleData} from '../common/style_data';
import {AnimationEngineInstruction, AnimationTransitionInstructionType} from '../engine/animation_engine_instruction';

export interface AnimationTimelineInstruction extends AnimationEngineInstruction {
  keyframes: StyleData[];
  duration: number;
  delay: number;
  easing: string;
}

export function createTimelineInstruction(
    keyframes: StyleData[], duration: number, delay: number,
    easing: string): AnimationTimelineInstruction {
  return {
    type: AnimationTransitionInstructionType.TimelineAnimation,
    keyframes,
    duration,
    delay,
    easing
  };
}
