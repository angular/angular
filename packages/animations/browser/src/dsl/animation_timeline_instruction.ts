/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵStyleDataMap} from '../../../src/animations';

import {
  AnimationEngineInstruction,
  AnimationTransitionInstructionType,
} from '../render/animation_engine_instruction';

export interface AnimationTimelineInstruction extends AnimationEngineInstruction {
  element: any;
  keyframes: Array<ɵStyleDataMap>;
  preStyleProps: string[];
  postStyleProps: string[];
  duration: number;
  delay: number;
  totalTime: number;
  easing: string | null;
  stretchStartingKeyframe?: boolean;
  subTimeline: boolean;
}

export function createTimelineInstruction(
  element: any,
  keyframes: Array<ɵStyleDataMap>,
  preStyleProps: string[],
  postStyleProps: string[],
  duration: number,
  delay: number,
  easing: string | null = null,
  subTimeline: boolean = false,
): AnimationTimelineInstruction {
  return {
    type: AnimationTransitionInstructionType.TimelineAnimation,
    element,
    keyframes,
    preStyleProps,
    postStyleProps,
    duration,
    delay,
    totalTime: duration + delay,
    easing,
    subTimeline,
  };
}
