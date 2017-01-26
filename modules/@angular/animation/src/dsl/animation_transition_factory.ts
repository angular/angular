/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {TransitionFactory} from '@angular/core';
import {StyleData} from '../common/style_data';
import {AnimationMetadata, AnimationTransitionMetadata} from './animation_metadata';
import {buildAnimationKeyframes} from './animation_timeline_visitor';
import {TransitionMatcherFn} from './animation_transition_expr';
import {AnimationTransitionInstruction, createTransitionInstruction} from './animation_transition_instruction';

export class AnimationTransitionFactory implements TransitionFactory {
  private _animationAst: AnimationMetadata;

  constructor(
      private _triggerName: string, ast: AnimationTransitionMetadata,
      private matchFns: TransitionMatcherFn[],
      private _stateStyles: {[stateName: string]: StyleData}) {
    this._animationAst = ast.animation;
  }

  match(currentState: any, nextState: any): AnimationTransitionInstruction {
    if (!oneOrMoreTransitionsMatch(this.matchFns, currentState, nextState)) return;

    const backupStateStyles = this._stateStyles['*'] || {};
    const currentStateStyles = this._stateStyles[currentState] || backupStateStyles;
    const nextStateStyles = this._stateStyles[nextState] || backupStateStyles;

    const timelines =
        buildAnimationKeyframes(this._animationAst, currentStateStyles, nextStateStyles);

    return createTransitionInstruction(
        this._triggerName, nextState === 'void', currentStateStyles, nextStateStyles, timelines);
  }
}

function oneOrMoreTransitionsMatch(
    matchFns: TransitionMatcherFn[], currentState: any, nextState: any): boolean {
  return matchFns.some(fn => fn(currentState, nextState));
}
