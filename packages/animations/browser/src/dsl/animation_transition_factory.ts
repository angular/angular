/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationOptions, ɵStyleData} from '@angular/animations';

import {AnimationDriver} from '../render/animation_driver';
import {getOrSetAsInMap} from '../render/shared';
import {copyObj, interpolateParams, iteratorToArray} from '../util';

import {StyleAst, TransitionAst} from './animation_ast';
import {buildAnimationTimelines} from './animation_timeline_builder';
import {TransitionMatcherFn} from './animation_transition_expr';
import {AnimationTransitionInstruction, createTransitionInstruction} from './animation_transition_instruction';
import {ElementInstructionMap} from './element_instruction_map';

const EMPTY_OBJECT = {};

export class AnimationTransitionFactory {
  constructor(
      private _triggerName: string, public ast: TransitionAst,
      private _stateStyles: {[stateName: string]: AnimationStateStyles}) {}

  match(currentState: any, nextState: any, element: any, params: {[key: string]: any}): boolean {
    return oneOrMoreTransitionsMatch(this.ast.matchers, currentState, nextState, element, params);
  }

  buildStyles(stateName: string, params: {[key: string]: any}, errors: any[]) {
    const backupStateStyler = this._stateStyles['*'];
    const stateStyler = this._stateStyles[stateName];
    const backupStyles = backupStateStyler ? backupStateStyler.buildStyles(params, errors) : {};
    return stateStyler ? stateStyler.buildStyles(params, errors) : backupStyles;
  }

  build(
      driver: AnimationDriver, element: any, currentState: any, nextState: any,
      enterClassName: string, leaveClassName: string, currentOptions?: AnimationOptions,
      nextOptions?: AnimationOptions, subInstructions?: ElementInstructionMap,
      skipAstBuild?: boolean): AnimationTransitionInstruction {
    const errors: any[] = [];

    const transitionAnimationParams = this.ast.options && this.ast.options.params || EMPTY_OBJECT;
    const currentAnimationParams = currentOptions && currentOptions.params || EMPTY_OBJECT;
    const currentStateStyles = this.buildStyles(currentState, currentAnimationParams, errors);
    const nextAnimationParams = nextOptions && nextOptions.params || EMPTY_OBJECT;
    const nextStateStyles = this.buildStyles(nextState, nextAnimationParams, errors);

    const queriedElements = new Set<any>();
    const preStyleMap = new Map<any, {[prop: string]: boolean}>();
    const postStyleMap = new Map<any, {[prop: string]: boolean}>();
    const isRemoval = nextState === 'void';

    const animationOptions = {params: {...transitionAnimationParams, ...nextAnimationParams}};

    const timelines = skipAstBuild ?
        [] :
        buildAnimationTimelines(
            driver, element, this.ast.animation, enterClassName, leaveClassName, currentStateStyles,
            nextStateStyles, animationOptions, subInstructions, errors);

    let totalTime = 0;
    timelines.forEach(tl => {
      totalTime = Math.max(tl.duration + tl.delay, totalTime);
    });

    if (errors.length) {
      return createTransitionInstruction(
          element, this._triggerName, currentState, nextState, isRemoval, currentStateStyles,
          nextStateStyles, [], [], preStyleMap, postStyleMap, totalTime, errors);
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
        nextStateStyles, timelines, queriedElementsList, preStyleMap, postStyleMap, totalTime);
  }
}

function oneOrMoreTransitionsMatch(
    matchFns: TransitionMatcherFn[], currentState: any, nextState: any, element: any,
    params: {[key: string]: any}): boolean {
  return matchFns.some(fn => fn(currentState, nextState, element, params));
}

export class AnimationStateStyles {
  constructor(private styles: StyleAst, private defaultParams: {[key: string]: any}) {}

  buildStyles(params: {[key: string]: any}, errors: string[]): ɵStyleData {
    const finalStyles: ɵStyleData = {};
    const combinedParams = copyObj(this.defaultParams);
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value != null) {
        combinedParams[key] = value;
      }
    });
    this.styles.styles.forEach(value => {
      if (typeof value !== 'string') {
        const styleObj = value as any;
        Object.keys(styleObj).forEach(prop => {
          let val = styleObj[prop];
          if (val.length > 1) {
            val = interpolateParams(val, combinedParams, errors);
          }
          finalStyles[prop] = val;
        });
      }
    });
    return finalStyles;
  }
}
