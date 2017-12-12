/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationMetadata, AnimationMetadataType, AnimationOptions, AnimationStyleMetadata, ɵStyleData} from '@angular/animations';

import {buildAnimationAst} from '../dsl/animation_ast_builder';
import {AnimationDriver} from '../render/animation_driver';
import {getOrSetAsInMap, optimizeGroupPlayer} from '../render/shared';
import {copyObj, interpolateParams, iteratorToArray, mergeAnimationOptions} from '../util';

import {AnimateAst, Ast as AnimationAst, SequenceAst, StyleAst, TransitionAst} from './animation_ast';
import {AstBasedTransitionState, TransitionState} from './animation_state';
import {buildAnimationTimelines} from './animation_timeline_builder';
import {TransitionMatcherFn} from './animation_transition_expr';
import {AnimationTransitionInstruction, createTransitionInstruction} from './animation_transition_instruction';
import {ElementInstructionMap} from './element_instruction_map';

const EMPTY_OBJECT = {};

export interface AnimationTransitionFactory {
  depCount: number;
  match(currentState: TransitionState, nextState: TransitionState): boolean;
  buildStyles(state: TransitionState, params: {[key: string]: any}, errors: any[]): ɵStyleData;
  build(
      driver: AnimationDriver, element: any, triggerName: string, currentState: TransitionState,
      nextState: TransitionState, enterClassName: string, leaveClassName: string,
      subInstructions?: ElementInstructionMap): AnimationTransitionInstruction;
}

export class _AnimationTransitionFactory implements AnimationTransitionFactory {
  public depCount: number;

  constructor(
      public ast: TransitionAst,
      private _stateStyles: {[stateName: string]: AnimationStateStyles}) {
    this.depCount = ast.depCount;
  }

  match(currentState: TransitionState, nextState: TransitionState): boolean {
    return oneOrMoreTransitionsMatch(
        this.ast.matchers, currentState.getValue(), nextState.getValue());
  }

  buildStyles(state: TransitionState, params: {[key: string]: any}, errors: any[]) {
    const value = state.getValue();
    const backupStateStyler = this._stateStyles['*'];
    const stateStyler = this._stateStyles[value];
    const backupStyles = backupStateStyler ? backupStateStyler.buildStyles(params, errors) : {};
    return stateStyler ? stateStyler.buildStyles(params, errors) : backupStyles;
  }

  build(
      driver: AnimationDriver, element: any, triggerName: string, previousState: TransitionState,
      nextState: TransitionState, enterClassName: string, leaveClassName: string,
      subInstructions?: ElementInstructionMap): AnimationTransitionInstruction {
    const errors: any[] = [];

    const transitionParams = this.ast.options && this.ast.options.params || EMPTY_OBJECT;
    const previousParams = previousState.getParams();
    const previousStyles = this.buildStyles(previousState, previousParams, errors);
    const nextParams = nextState.getParams();
    const nextStyles = this.buildStyles(nextState, nextParams, errors);

    const queriedElements = new Set<any>();
    const preStyleMap = new Map<any, {[prop: string]: boolean}>();
    const postStyleMap = new Map<any, {[prop: string]: boolean}>();
    const isRemoval = nextState.getValue() === 'void';

    const animationOptions = {params: {...transitionParams, ...nextParams}};

    const timelines = buildAnimationTimelines(
        driver, element, this.ast.animation, enterClassName, leaveClassName, previousStyles,
        nextStyles, animationOptions, subInstructions, errors);

    if (errors.length) {
      return createTransitionInstruction(
          element, triggerName, previousState.getValue(), nextState.getValue(), isRemoval,
          previousStyles, nextStyles, [], [], preStyleMap, postStyleMap, errors);
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
        element, triggerName, previousState.getValue(), nextState.getValue(), isRemoval,
        previousStyles, nextStyles, timelines, queriedElementsList, preStyleMap, postStyleMap);
  }
}

export class _ImplicitAnimationFactory implements AnimationTransitionFactory {
  public depCount: number = 0;

  match(currentState: any, nextState: any): boolean { return true; }

  buildStyles(state: AstBasedTransitionState, params: {[key: string]: any}, errors: any[]):
      ɵStyleData {
    const finalStyleAst = getFinalStyleInstruction(state.getAst());
    return finalStyleAst ? flattenStyles(finalStyleAst !.styles) : {};
  }

  build(
      driver: AnimationDriver, element: any, triggerName: string,
      previousState: AstBasedTransitionState, nextState: AstBasedTransitionState,
      enterClassName: string, leaveClassName: string,
      subInstructions?: ElementInstructionMap): AnimationTransitionInstruction {
    const errors: any[] = [];
    const nextAst = nextState.getAst();
    const transitionAnimationParams = nextAst.options && nextAst.options.params || EMPTY_OBJECT;
    const previousStyles = this.buildStyles(previousState, EMPTY_OBJECT, errors);
    const finalStyles = this.buildStyles(nextState, EMPTY_OBJECT, errors);

    if (errors.length) {
      throw new Error(
          `The animation trigger @@"${triggerName}" has failed to build due to the following errors:\n - ${errors.join("\n - ")}`);
    }

    const preStyleMap = new Map<any, {[prop: string]: boolean}>();
    const postStyleMap = new Map<any, {[prop: string]: boolean}>();
    const queriedElements = new Set<any>();
    const animationOptions = {params: {...transitionAnimationParams, ...nextState.getParams()}};
    const timelines = buildAnimationTimelines(
        driver, element, nextAst, enterClassName, leaveClassName, previousStyles, finalStyles,
        animationOptions, subInstructions, errors);

    if (errors.length) {
      return createTransitionInstruction(
          element, triggerName, previousState.getValue(), nextState.getValue(), false,
          previousStyles, finalStyles, [], [], preStyleMap, postStyleMap, errors);
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
        element, triggerName, previousState.getValue(), nextState.getValue(), false, previousStyles,
        finalStyles, timelines, queriedElementsList, preStyleMap, postStyleMap);
  }
}

function oneOrMoreTransitionsMatch(
    matchFns: TransitionMatcherFn[], currentState: any, nextState: any): boolean {
  return matchFns.some(fn => fn(currentState, nextState));
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

function getFinalStyleInstruction(ast: AnimationAst<AnimationMetadataType>): StyleAst|null {
  let finalAst: AnimationAst<AnimationMetadataType>|null = ast;
  let finalStyle: AnimationStyleMetadata|null;
  if (finalAst.type == AnimationMetadataType.Sequence ||
      finalAst.type == AnimationMetadataType.Group) {
    const steps = (finalAst as SequenceAst).steps;
    finalAst = steps[steps.length - 1] || null;
  }

  if (finalAst && finalAst.type == AnimationMetadataType.Animate) {
    finalAst = (finalAst as AnimateAst).style;
  }

  return finalAst && finalAst.type == AnimationMetadataType.Style ? (finalAst as StyleAst) : null;
}

function flattenStyles(styles: (string | {[key: string]: string | number})[]):
    {[key: string]: string | number} {
  return styles.reduce((old, value) => {
    if (typeof value != 'string') {
      old = {...old as{}, ...value};
    }
    return old;
  }, {}) as{[key: string]: string | number};
}
