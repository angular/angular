/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationOptions, ɵStyleData} from '@angular/animations';

import {AnimationDriver} from '../render/animation_driver';
import {getOrSetAsInMap} from '../render/shared';
import {iteratorToArray, mergeAnimationOptions} from '../util';

import {TransitionAst} from './animation_ast';
import {buildAnimationTimelines} from './animation_timeline_builder';
import {TransitionMatcherFn} from './animation_transition_expr';
import {AnimationTransitionInstruction, createTransitionInstruction} from './animation_transition_instruction';
import {ElementInstructionMap} from './element_instruction_map';

export class AnimationTransitionFactory {
  constructor(
      private _triggerName: string, public ast: TransitionAst,
      private _stateStyles: {[stateName: string]: ɵStyleData}) {}

  match(currentState: any, nextState: any): boolean {
    return oneOrMoreTransitionsMatch(this.ast.matchers, currentState, nextState);
  }

  build(
      driver: AnimationDriver, element: any, currentState: any, nextState: any,
      options?: AnimationOptions,
      subInstructions?: ElementInstructionMap): AnimationTransitionInstruction {
    const animationOptions = mergeAnimationOptions(this.ast.options || {}, options || {});

    const backupStateStyles = this._stateStyles['*'] || {};
    const currentStateStyles = this._stateStyles[currentState] || backupStateStyles;
    const nextStateStyles = this._stateStyles[nextState] || backupStateStyles;
    const queriedElements = new Set<any>();
    const preStyleMap = new Map<any, {[prop: string]: boolean}>();
    const postStyleMap = new Map<any, {[prop: string]: boolean}>();
    const isRemoval = nextState === 'void';

    const errors: any[] = [];
    const timelines = buildAnimationTimelines(
        driver, element, this.ast.animation, currentStateStyles, nextStateStyles, animationOptions,
        subInstructions, errors);

    if (errors.length) {
      return createTransitionInstruction(
          element, this._triggerName, currentState, nextState, isRemoval, currentStateStyles,
          nextStateStyles, [], [], preStyleMap, postStyleMap, errors);
    }

    timelines.forEach(tl => {
      const elm = tl.element;
      const preProps = getOrSetAsInMap(preStyleMap, elm, {});
      tl.preStyleProps.forEach(prop => preProps[prop] = true);

      const postProps = getOrSetAsInMap(postStyleMap, elm, {});
      tl.postStyleProps.forEach(prop => postProps[prop] = true);

      if (elm !== element) {
        queriedElements.add(elm);
      }
    });

    const queriedElementsList = iteratorToArray(queriedElements.values());
    return createTransitionInstruction(
        element, this._triggerName, currentState, nextState, isRemoval, currentStateStyles,
        nextStateStyles, timelines, queriedElementsList, preStyleMap, postStyleMap);
  }
}

function oneOrMoreTransitionsMatch(
    matchFns: TransitionMatcherFn[], currentState: any, nextState: any): boolean {
  return matchFns.some(fn => fn(currentState, nextState));
}
