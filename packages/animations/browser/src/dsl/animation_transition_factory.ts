/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationMetadata, AnimationTransitionMetadata, sequence, ɵStyleData} from '@angular/animations';

import {buildAnimationKeyframes} from './animation_timeline_visitor';
import {TransitionMatcherFn} from './animation_transition_expr';
import {AnimationTransitionInstruction, createTransitionInstruction} from './animation_transition_instruction';

export class AnimationTransitionFactory {
  private _animationAst: AnimationMetadata;

  constructor(
      private _triggerName: string, ast: AnimationTransitionMetadata,
      private matchFns: TransitionMatcherFn[],
      private _stateStyles: {[stateName: string]: ɵStyleData}) {
    const normalizedAst = Array.isArray(ast.animation) ?
        sequence(<AnimationMetadata[]>ast.animation) :
        <AnimationMetadata>ast.animation;
    this._animationAst = normalizedAst;
  }

  match(currentState: any, nextState: any): AnimationTransitionInstruction|undefined {
    if (!oneOrMoreTransitionsMatch(this.matchFns, currentState, nextState)) return;

    const backupStateStyles = this._stateStyles['*'] || {};
    const currentStateStyles = this._stateStyles[currentState] || backupStateStyles;
    const nextStateStyles = this._stateStyles[nextState] || backupStateStyles;

    const timelines =
        buildAnimationKeyframes(this._animationAst, currentStateStyles, nextStateStyles);

    return createTransitionInstruction(
        this._triggerName, currentState, nextState, nextState === 'void', currentStateStyles,
        nextStateStyles, timelines);
  }
}

function oneOrMoreTransitionsMatch(
    matchFns: TransitionMatcherFn[], currentState: any, nextState: any): boolean {
  return matchFns.some(fn => fn(currentState, nextState));
}
