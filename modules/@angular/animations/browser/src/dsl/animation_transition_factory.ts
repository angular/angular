/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationMetadata, AnimationTransitionMetadata, sequence, ɵStyleData} from '@angular/animations';

import {normalizeAnimationEntry} from '../util';

import {buildAnimationKeyframes} from './animation_timeline_visitor';
import {TransitionMatcherFn} from './animation_transition_expr';
import {AnimationTransitionInstruction, createTransitionInstruction} from './animation_transition_instruction';

export class AnimationTransitionFactory {
  private _animationAst: AnimationMetadata;
  private _locals: {[varName: string]: string | number | boolean};

  constructor(
      private _triggerName: string, ast: AnimationTransitionMetadata,
      private matchFns: TransitionMatcherFn[],
      private _stateStyles: {[stateName: string]: ɵStyleData}) {
    this._animationAst = normalizeAnimationEntry(ast.animation);
    this._locals = ast.locals;
  }

  match(currentState: any, nextState: any, locals: {[varName: string]: string | number} = null):
      AnimationTransitionInstruction {
    if (!oneOrMoreTransitionsMatch(this.matchFns, currentState, nextState)) return;

    let animationLocals: {[varName: string]: string | number | boolean} = null;
    if (this._locals) {
      animationLocals = (locals || {}) as{[varName: string]: string | number | boolean};
      Object.keys(this._locals).forEach(prop => {
        if (!animationLocals.hasOwnProperty(prop)) {
          animationLocals[prop] = this._locals[prop];
        }
      });
    }

    const backupStateStyles = this._stateStyles['*'] || {};
    const currentStateStyles = this._stateStyles[currentState] || backupStateStyles;
    const nextStateStyles = this._stateStyles[nextState] || backupStateStyles;

    const errors: any[] = [];
    const timelines = buildAnimationKeyframes(
        this._animationAst, currentStateStyles, nextStateStyles, animationLocals, errors);

    if (errors.length) {
      const errorMessage = `animation building failed:\n${errors.join("\n")}`;
      throw new Error(errorMessage);
    }

    return createTransitionInstruction(
        this._triggerName, currentState, nextState, nextState === 'void', currentStateStyles,
        nextStateStyles, timelines);
  }
}

function oneOrMoreTransitionsMatch(
    matchFns: TransitionMatcherFn[], currentState: any, nextState: any): boolean {
  return matchFns.some(fn => fn(currentState, nextState));
}
