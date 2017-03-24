/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵStyleData} from '@angular/animations';
import {AnimationEngineInstruction, AnimationTransitionInstructionType} from '../render/animation_engine_instruction';

export interface AnimationTimelineInstruction extends AnimationEngineInstruction {
  keyframes: ɵStyleData[];
  duration: number;
  delay: number;
  totalTime: number;
  easing: string|null|undefined;
}

export function createTimelineInstruction(
    keyframes: ɵStyleData[], duration: number, delay: number,
    easing: string | null | undefined): AnimationTimelineInstruction {
  return {
    type: AnimationTransitionInstructionType.TimelineAnimation,
    keyframes,
    duration,
    delay,
    totalTime: duration + delay, easing
  };
}
