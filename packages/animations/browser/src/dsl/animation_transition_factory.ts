/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationOptions, ɵStyleDataMap} from '@angular/animations';

import {AnimationDriver} from '../render/animation_driver';
import {getOrSetDefaultValue} from '../render/shared';
import {copyObj, interpolateParams, iteratorToArray} from '../util';

import {StyleAst, TransitionAst} from './animation_ast';
import {buildAnimationTimelines} from './animation_timeline_builder';
import {AnimationTimelineInstruction} from './animation_timeline_instruction';
import {TransitionMatcherFn} from './animation_transition_expr';
import {AnimationTransitionInstruction, createTransitionInstruction} from './animation_transition_instruction';
import {ElementInstructionMap} from './element_instruction_map';
import {AnimationStyleNormalizer} from './style_normalization/animation_style_normalizer';

const EMPTY_OBJECT = {};

export class AnimationTransitionFactory {
  constructor(
      private _triggerName: string, public ast: TransitionAst,
      private _stateStyles: Map<string, AnimationStateStyles>) {}

  match(currentState: any, nextState: any, element: any, params: {[key: string]: any}): boolean {
    return oneOrMoreTransitionsMatch(this.ast.matchers, currentState, nextState, element, params);
  }

  buildStyles(stateName: string|boolean|undefined, params: {[key: string]: any}, errors: Error[]):
      ɵStyleDataMap {
    let styler = this._stateStyles.get('*');
    if (stateName !== undefined) {
      styler = this._stateStyles.get(stateName?.toString()) || styler;
    }
    return styler ? styler.buildStyles(params, errors) : new Map();
  }

  build(
      driver: AnimationDriver, element: any, currentState: any, nextState: any,
      enterClassName: string, leaveClassName: string, currentOptions?: AnimationOptions,
      nextOptions?: AnimationOptions, subInstructions?: ElementInstructionMap,
      skipAstBuild?: boolean): AnimationTransitionInstruction {
    const errors: Error[] = [];

    const transitionAnimationParams = this.ast.options && this.ast.options.params || EMPTY_OBJECT;
    const currentAnimationParams = currentOptions && currentOptions.params || EMPTY_OBJECT;
    const currentStateStyles = this.buildStyles(currentState, currentAnimationParams, errors);
    const nextAnimationParams = nextOptions && nextOptions.params || EMPTY_OBJECT;
    const nextStateStyles = this.buildStyles(nextState, nextAnimationParams, errors);

    const queriedElements = new Set<any>();
    const preStyleMap = new Map<any, Set<string>>();
    const postStyleMap = new Map<any, Set<string>>();
    const isRemoval = nextState === 'void';

    const animationOptions: AnimationOptions = {
      params: applyParamDefaults(nextAnimationParams, transitionAnimationParams),
      delay: this.ast.options?.delay,
    };

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
      const preProps = getOrSetDefaultValue(preStyleMap, elm, new Set<string>());
      tl.preStyleProps.forEach(prop => preProps.add(prop));

      const postProps = getOrSetDefaultValue(postStyleMap, elm, new Set<string>());
      tl.postStyleProps.forEach(prop => postProps.add(prop));

      if (elm !== element) {
        queriedElements.add(elm);
      }
    });

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      checkNonAnimatableInTimelines(timelines, this._triggerName, driver);
    }

    const queriedElementsList = iteratorToArray(queriedElements.values());
    return createTransitionInstruction(
        element, this._triggerName, currentState, nextState, isRemoval, currentStateStyles,
        nextStateStyles, timelines, queriedElementsList, preStyleMap, postStyleMap, totalTime);
  }
}

/**
 * Checks inside a set of timelines if they try to animate a css property which is not considered
 * animatable, in that case it prints a warning on the console.
 * Besides that the function doesn't have any other effect.
 *
 * Note: this check is done here after the timelines are built instead of doing on a lower level so
 * that we can make sure that the warning appears only once per instruction (we can aggregate here
 * all the issues instead of finding them separately).
 *
 * @param timelines The built timelines for the current instruction.
 * @param triggerName The name of the trigger for the current instruction.
 * @param driver Animation driver used to perform the check.
 *
 */
function checkNonAnimatableInTimelines(
    timelines: AnimationTimelineInstruction[], triggerName: string, driver: AnimationDriver): void {
  if (!driver.validateAnimatableStyleProperty) {
    return;
  }

  const allowedNonAnimatableProps = new Set<string>([
    // 'easing' is a utility/synthetic prop we use to represent
    // easing functions, it represents a property of the animation
    // which is not animatable but different values can be used
    // in different steps
    'easing'
  ]);

  const invalidNonAnimatableProps = new Set<string>();

  timelines.forEach(({keyframes}) => {
    const nonAnimatablePropsInitialValues = new Map<string, string|number>();
    keyframes.forEach(keyframe => {
      const entriesToCheck =
          Array.from(keyframe.entries()).filter(([prop]) => !allowedNonAnimatableProps.has(prop));
      for (const [prop, value] of entriesToCheck) {
        if (!driver.validateAnimatableStyleProperty!(prop)) {
          if (nonAnimatablePropsInitialValues.has(prop) && !invalidNonAnimatableProps.has(prop)) {
            const propInitialValue = nonAnimatablePropsInitialValues.get(prop);
            if (propInitialValue !== value) {
              invalidNonAnimatableProps.add(prop);
            }
          } else {
            nonAnimatablePropsInitialValues.set(prop, value);
          }
        }
      }
    });
  });

  if (invalidNonAnimatableProps.size > 0) {
    console.warn(
        `Warning: The animation trigger "${triggerName}" is attempting to animate the following` +
        ' not animatable properties: ' + Array.from(invalidNonAnimatableProps).join(', ') + '\n' +
        '(to check the list of all animatable properties visit https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties)');
  }
}

function oneOrMoreTransitionsMatch(
    matchFns: TransitionMatcherFn[], currentState: any, nextState: any, element: any,
    params: {[key: string]: any}): boolean {
  return matchFns.some(fn => fn(currentState, nextState, element, params));
}

function applyParamDefaults(userParams: Record<string, any>, defaults: Record<string, any>) {
  const result: Record<string, any> = copyObj(defaults);

  for (const key in userParams) {
    if (userParams.hasOwnProperty(key) && userParams[key] != null) {
      result[key] = userParams[key];
    }
  }

  return result;
}

export class AnimationStateStyles {
  constructor(
      private styles: StyleAst, private defaultParams: {[key: string]: any},
      private normalizer: AnimationStyleNormalizer) {}

  buildStyles(params: {[key: string]: any}, errors: Error[]): ɵStyleDataMap {
    const finalStyles: ɵStyleDataMap = new Map();
    const combinedParams = copyObj(this.defaultParams);
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null) {
        combinedParams[key] = value;
      }
    });
    this.styles.styles.forEach(value => {
      if (typeof value !== 'string') {
        value.forEach((val, prop) => {
          if (val) {
            val = interpolateParams(val, combinedParams, errors);
          }
          const normalizedProp = this.normalizer.normalizePropertyName(prop, errors);
          val = this.normalizer.normalizeStyleValue(prop, normalizedProp, val, errors);
          finalStyles.set(prop, val);
        });
      }
    });
    return finalStyles;
  }
}
