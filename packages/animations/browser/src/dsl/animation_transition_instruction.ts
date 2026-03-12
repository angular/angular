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

import {AnimationTimelineInstruction} from './animation_timeline_instruction';

export interface AnimationTransitionInstruction extends AnimationEngineInstruction {
  element: any;
  triggerName: string;
  isRemovalTransition: boolean;
  fromState: string;
  fromStyles: ɵStyleDataMap;
  toState: string;
  toStyles: ɵStyleDataMap;
  timelines: AnimationTimelineInstruction[];
  queriedElements: any[];
  preStyleProps: Map<any, Set<string>>;
  postStyleProps: Map<any, Set<string>>;
  totalTime: number;
  errors?: Error[];
}

export function createTransitionInstruction(
  element: any,
  triggerName: string,
  fromState: string,
  toState: string,
  isRemovalTransition: boolean,
  fromStyles: ɵStyleDataMap,
  toStyles: ɵStyleDataMap,
  timelines: AnimationTimelineInstruction[],
  queriedElements: any[],
  preStyleProps: Map<any, Set<string>>,
  postStyleProps: Map<any, Set<string>>,
  totalTime: number,
  errors?: Error[],
): AnimationTransitionInstruction {
  return {
    type: AnimationTransitionInstructionType.TransitionAnimation,
    element,
    triggerName,
    isRemovalTransition,
    fromState,
    fromStyles,
    toState,
    toStyles,
    timelines,
    queriedElements,
    preStyleProps,
    postStyleProps,
    totalTime,
    errors,
  };
}
