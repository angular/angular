/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimateTimings, AnimationMetadataType, AnimationOptions, ɵStyleDataMap} from '@angular/animations';

const EMPTY_ANIMATION_OPTIONS: AnimationOptions = {};

export interface AstVisitor {
  visitTrigger(ast: TriggerAst, context: any): any;
  visitState(ast: StateAst, context: any): any;
  visitTransition(ast: TransitionAst, context: any): any;
  visitSequence(ast: SequenceAst, context: any): any;
  visitGroup(ast: GroupAst, context: any): any;
  visitAnimate(ast: AnimateAst, context: any): any;
  visitStyle(ast: StyleAst, context: any): any;
  visitKeyframes(ast: KeyframesAst, context: any): any;
  visitReference(ast: ReferenceAst, context: any): any;
  visitAnimateChild(ast: AnimateChildAst, context: any): any;
  visitAnimateRef(ast: AnimateRefAst, context: any): any;
  visitQuery(ast: QueryAst, context: any): any;
  visitStagger(ast: StaggerAst, context: any): any;
}

export interface Ast<T extends AnimationMetadataType> {
  type: T;
  options: AnimationOptions|null;
}

export interface TriggerAst extends Ast<AnimationMetadataType.Trigger> {
  type: AnimationMetadataType.Trigger;
  name: string;
  states: StateAst[];
  transitions: TransitionAst[];
  queryCount: number;
  depCount: number;
}

export interface StateAst extends Ast<AnimationMetadataType.State> {
  type: AnimationMetadataType.State;
  name: string;
  style: StyleAst;
}

export interface TransitionAst extends Ast<AnimationMetadataType.Transition> {
  matchers: Array<(
      (fromState: string, toState: string, element: any, params: {[key: string]: any}) => boolean)>;
  animation: Ast<AnimationMetadataType>;
  queryCount: number;
  depCount: number;
}

export interface SequenceAst extends Ast<AnimationMetadataType.Sequence> {
  steps: Ast<AnimationMetadataType>[];
}

export interface GroupAst extends Ast<AnimationMetadataType.Group> {
  steps: Ast<AnimationMetadataType>[];
}

export interface AnimateAst extends Ast<AnimationMetadataType.Animate> {
  timings: TimingAst;
  style: StyleAst|KeyframesAst;
}

export interface StyleAst extends Ast<AnimationMetadataType.Style> {
  styles: Array<(ɵStyleDataMap | string)>;
  easing: string|null;
  offset: number|null;
  containsDynamicStyles: boolean;
  isEmptyStep?: boolean;
}

export interface KeyframesAst extends Ast<AnimationMetadataType.Keyframes> {
  styles: StyleAst[];
}

export interface ReferenceAst extends Ast<AnimationMetadataType.Reference> {
  animation: Ast<AnimationMetadataType>;
}

export interface AnimateChildAst extends Ast<AnimationMetadataType.AnimateChild> {}

export interface AnimateRefAst extends Ast<AnimationMetadataType.AnimateRef> {
  animation: ReferenceAst;
}

export interface QueryAst extends Ast<AnimationMetadataType.Query> {
  selector: string;
  limit: number;
  optional: boolean;
  includeSelf: boolean;
  animation: Ast<AnimationMetadataType>;
  originalSelector: string;
}

export interface StaggerAst extends Ast<AnimationMetadataType.Stagger> {
  timings: AnimateTimings;
  animation: Ast<AnimationMetadataType>;
}

export interface TimingAst {
  duration: number;
  delay: number;
  easing: string|null;
  dynamic?: boolean;
}

export interface DynamicTimingAst extends TimingAst {
  strValue: string;
  dynamic: true;
}
