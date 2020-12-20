/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵStyleData} from '@angular/animations';
import {AnimationEngineInstruction, AnimationTransitionInstructionType} from '../render/animation_engine_instruction';
import {AnimationTimelineInstruction} from './animation_timeline_instruction';

export interface AnimationTransitionInstruction extends AnimationEngineInstruction {
  element: any;
  triggerName: string;
  isRemovalTransition: boolean;
  fromState: string;
  fromStyles: ɵStyleData;
  toState: string;
  toStyles: ɵStyleData;
  timelines: AnimationTimelineInstruction[];
  queriedElements: any[];
  preStyleProps: Map<any, {[prop: string]: boolean}>;
  postStyleProps: Map<any, {[prop: string]: boolean}>;
  totalTime: number;
  errors?: any[];
}

export function createTransitionInstruction(
    element: any, triggerName: string, fromState: string, toState: string,
    isRemovalTransition: boolean, fromStyles: ɵStyleData, toStyles: ɵStyleData,
    timelines: AnimationTimelineInstruction[], queriedElements: any[],
    preStyleProps: Map<any, {[prop: string]: boolean}>,
    postStyleProps: Map<any, {[prop: string]: boolean}>, totalTime: number,
    errors?: any[]): AnimationTransitionInstruction {
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
    errors
  };
}
