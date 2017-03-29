/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimateTimings, AnimationMetadataType, animate as _animate, group as _group, keyframes as _keyframes, sequence as _sequence, state as _state, style as _style, transition as _transition, trigger as _trigger} from './dsl';


/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export const AUTO_STYLE = '*';

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export interface AnimationMetadata { type: AnimationMetadataType; }

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export interface AnimationTriggerMetadata {
  name: string;
  definitions: AnimationMetadata[];
}

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export interface AnimationStateMetadata extends AnimationMetadata {
  name: string;
  styles: AnimationStyleMetadata;
}

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export interface AnimationTransitionMetadata extends AnimationMetadata {
  expr: string|((fromState: string, toState: string) => boolean);
  animation: AnimationMetadata|AnimationMetadata[];
}

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export interface AnimationKeyframesSequenceMetadata extends AnimationMetadata {
  steps: AnimationStyleMetadata[];
}

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export interface AnimationStyleMetadata extends AnimationMetadata {
  styles: {[key: string]: string | number}|{[key: string]: string | number}[];
  offset?: number;
}

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export interface AnimationAnimateMetadata extends AnimationMetadata {
  timings: string|number|AnimateTimings;
  styles: AnimationStyleMetadata|AnimationKeyframesSequenceMetadata|null;
}

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export interface AnimationSequenceMetadata extends AnimationMetadata { steps: AnimationMetadata[]; }

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export interface AnimationGroupMetadata extends AnimationMetadata { steps: AnimationMetadata[]; }

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export function trigger(name: string, definitions: AnimationMetadata[]): AnimationTriggerMetadata {
  return _trigger(name, definitions);
}

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export function animate(
    timings: string | number, styles?: AnimationStyleMetadata |
        AnimationKeyframesSequenceMetadata): AnimationAnimateMetadata {
  return _animate(timings, styles);
}

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export function group(steps: AnimationMetadata[]): AnimationGroupMetadata {
  return _group(steps);
}

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export function sequence(steps: AnimationMetadata[]): AnimationSequenceMetadata {
  return _sequence(steps);
}

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export function style(
    tokens: {[key: string]: string | number} |
    Array<{[key: string]: string | number}>): AnimationStyleMetadata {
  return _style(tokens);
}

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export function state(name: string, styles: AnimationStyleMetadata): AnimationStateMetadata {
  return _state(name, styles);
}

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export function keyframes(steps: AnimationStyleMetadata[]): AnimationKeyframesSequenceMetadata {
  return _keyframes(steps);
}

/**
 * @deprecated This symbol has moved. Please Import from @angular/animations instead!
 */
export function transition(
    stateChangeExpr: string | ((fromState: string, toState: string) => boolean),
    steps: AnimationMetadata | AnimationMetadata[]): AnimationTransitionMetadata {
  return _transition(stateChangeExpr, steps);
}

/**
 * @deprecated This has been renamed to `AnimationEvent`. Please import it from @angular/animations.
 */
export interface AnimationTransitionEvent {
  fromState: string;
  toState: string;
  totalTime: number;
  phaseName: string;
  element: any;
  triggerName: string;
}
