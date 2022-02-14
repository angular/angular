/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵRuntimeError as RuntimeError} from '@angular/core';

import {RuntimeErrorCode} from './errors';

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || !!ngDevMode;
const LINE_START = '\n - ';

export function invalidTimingValue(exp: string|number): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_TIMING_VALUE,
      NG_DEV_MODE && `The provided timing value "${exp}" is invalid.`);
}

export function negativeStepValue(): Error {
  return new RuntimeError(
      RuntimeErrorCode.NEGATIVE_STEP_VALUE,
      NG_DEV_MODE && 'Duration values below 0 are not allowed for this animation step.');
}

export function negativeDelayValue(): Error {
  return new RuntimeError(
      RuntimeErrorCode.NEGATIVE_DELAY_VALUE,
      NG_DEV_MODE && 'Delay values below 0 are not allowed for this animation step.');
}

export function invalidStyleParams(varName: string): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_STYLE_PARAMS,
      NG_DEV_MODE &&
          `Unable to resolve the local animation param ${varName} in the given list of values`);
}

export function invalidParamValue(varName: string): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_PARAM_VALUE,
      NG_DEV_MODE && `Please provide a value for the animation param ${varName}`);
}

export function invalidNodeType(nodeType: string): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_NODE_TYPE,
      NG_DEV_MODE && `Unable to resolve animation metadata node #${nodeType}`);
}

export function invalidCssUnitValue(userProvidedProperty: string, value: string): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_CSS_UNIT_VALUE,
      NG_DEV_MODE && `Please provide a CSS unit value for ${userProvidedProperty}:${value}`);
}

export function invalidTrigger(): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_TRIGGER,
      NG_DEV_MODE &&
          'animation triggers cannot be prefixed with an `@` sign (e.g. trigger(\'@foo\', [...]))');
}

export function invalidDefinition(): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_DEFINITION,
      NG_DEV_MODE && 'only state() and transition() definitions can sit inside of a trigger()');
}

export function invalidState(metadataName: string, missingSubs: string[]): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_STATE,
      NG_DEV_MODE &&
          `state("${
              metadataName}", ...) must define default values for all the following style substitutions: ${
              missingSubs.join(', ')}`);
}

export function invalidStyleValue(value: string): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_STYLE_VALUE,
      NG_DEV_MODE && `The provided style string value ${value} is not allowed.`);
}

export function invalidProperty(prop: string): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_PROPERTY,
      NG_DEV_MODE &&
          `The provided animation property "${
              prop}" is not a supported CSS property for animations`);
}

export function invalidParallelAnimation(
    prop: string, firstStart: number, firstEnd: number, secondStart: number,
    secondEnd: number): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_PARALLEL_ANIMATION,
      NG_DEV_MODE &&
          `The CSS property "${prop}" that exists between the times of "${firstStart}ms" and "${
              firstEnd}ms" is also being animated in a parallel animation between the times of "${
              secondStart}ms" and "${secondEnd}ms"`);
}

export function invalidKeyframes(): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_KEYFRAMES,
      NG_DEV_MODE && `keyframes() must be placed inside of a call to animate()`);
}

export function invalidOffset(): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_OFFSET,
      NG_DEV_MODE && `Please ensure that all keyframe offsets are between 0 and 1`);
}

export function keyframeOffsetsOutOfOrder(): Error {
  return new RuntimeError(
      RuntimeErrorCode.KEYFRAME_OFFSETS_OUT_OF_ORDER,
      NG_DEV_MODE && `Please ensure that all keyframe offsets are in order`);
}

export function keyframesMissingOffsets(): Error {
  return new RuntimeError(
      RuntimeErrorCode.KEYFRAMES_MISSING_OFFSETS,
      NG_DEV_MODE && `Not all style() steps within the declared keyframes() contain offsets`);
}

export function invalidStagger(): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_STAGGER,
      NG_DEV_MODE && `stagger() can only be used inside of query()`);
}

export function invalidQuery(selector: string): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_QUERY,
      NG_DEV_MODE &&
          `\`query("${selector}")\` returned zero elements. (Use \`query("${
              selector}", { optional: true })\` if you wish to allow this.)`);
}

export function invalidExpression(expr: string): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_EXPRESSION,
      NG_DEV_MODE && `The provided transition expression "${expr}" is not supported`);
}

export function invalidTransitionAlias(alias: string): Error {
  return new RuntimeError(
      RuntimeErrorCode.INVALID_TRANSITION_ALIAS,
      NG_DEV_MODE && `The transition alias value "${alias}" is not supported`);
}

export function validationFailed(errors: Error[]): Error {
  return new RuntimeError(
      RuntimeErrorCode.VALIDATION_FAILED,
      NG_DEV_MODE && `animation validation failed:\n${errors.map(err => err.message).join('\n')}`);
}

export function buildingFailed(errors: Error[]): Error {
  return new RuntimeError(
      RuntimeErrorCode.BUILDING_FAILED,
      NG_DEV_MODE && `animation building failed:\n${errors.map(err => err.message).join('\n')}`);
}

export function triggerBuildFailed(name: string, errors: Error[]): Error {
  return new RuntimeError(
      RuntimeErrorCode.TRIGGER_BUILD_FAILED,
      NG_DEV_MODE &&
          `The animation trigger "${name}" has failed to build due to the following errors:\n - ${
              errors.map(err => err.message).join('\n - ')}`);
}

export function animationFailed(errors: Error[]): Error {
  return new RuntimeError(
      RuntimeErrorCode.ANIMATION_FAILED,
      NG_DEV_MODE &&
          `Unable to animate due to the following errors:${LINE_START}${
              errors.map(err => err.message).join(LINE_START)}`);
}

export function registerFailed(errors: Error[]): Error {
  return new RuntimeError(
      RuntimeErrorCode.REGISTRATION_FAILED,
      NG_DEV_MODE &&
          `Unable to build the animation due to the following errors: ${
              errors.map(err => err.message).join('\n')}`);
}

export function missingOrDestroyedAnimation(): Error {
  return new RuntimeError(
      RuntimeErrorCode.MISSING_OR_DESTROYED_ANIMATION,
      NG_DEV_MODE && 'The requested animation doesn\'t exist or has already been destroyed');
}

export function createAnimationFailed(errors: Error[]): Error {
  return new RuntimeError(
      RuntimeErrorCode.CREATE_ANIMATION_FAILED,
      NG_DEV_MODE &&
          `Unable to create the animation due to the following errors:${
              errors.map(err => err.message).join('\n')}`);
}

export function missingPlayer(id: string): Error {
  return new RuntimeError(
      RuntimeErrorCode.MISSING_PLAYER,
      NG_DEV_MODE && `Unable to find the timeline player referenced by ${id}`);
}

export function missingTrigger(phase: string, name: string): Error {
  return new RuntimeError(
      RuntimeErrorCode.MISSING_TRIGGER,
      NG_DEV_MODE &&
          `Unable to listen on the animation trigger event "${
              phase}" because the animation trigger "${name}" doesn\'t exist!`);
}

export function missingEvent(name: string): Error {
  return new RuntimeError(
      RuntimeErrorCode.MISSING_EVENT,
      NG_DEV_MODE &&
          `Unable to listen on the animation trigger "${
              name}" because the provided event is undefined!`);
}

export function unsupportedTriggerEvent(phase: string, name: string): Error {
  return new RuntimeError(
      RuntimeErrorCode.UNSUPPORTED_TRIGGER_EVENT,
      NG_DEV_MODE &&
          `The provided animation trigger event "${phase}" for the animation trigger "${
              name}" is not supported!`);
}

export function unregisteredTrigger(name: string): Error {
  return new RuntimeError(
      RuntimeErrorCode.UNREGISTERED_TRIGGER,
      NG_DEV_MODE && `The provided animation trigger "${name}" has not been registered!`);
}

export function triggerTransitionsFailed(errors: Error[]): Error {
  return new RuntimeError(
      RuntimeErrorCode.TRIGGER_TRANSITIONS_FAILED,
      NG_DEV_MODE &&
          `Unable to process animations due to the following failed trigger transitions\n ${
              errors.map(err => err.message).join('\n')}`);
}

export function triggerParsingFailed(name: string, errors: Error[]): Error {
  return new RuntimeError(
      RuntimeErrorCode.TRIGGER_PARSING_FAILED,
      NG_DEV_MODE &&
          `Animation parsing for the ${name} trigger have failed:${LINE_START}${
              errors.map(err => err.message).join(LINE_START)}`);
}

export function transitionFailed(name: string, errors: Error[]): Error {
  return new RuntimeError(
      RuntimeErrorCode.TRANSITION_FAILED,
      NG_DEV_MODE &&
          `@${name} has failed due to:\n ${errors.map(err => err.message).join('\n- ')}`);
}
