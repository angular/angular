/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuntimeErrorCode} from '../../src/errors';
import {ɵRuntimeError as RuntimeError} from '@angular/core';

const LINE_START = '\n - ';

export function invalidTimingValue(exp: string | number): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_TIMING_VALUE,
    ngDevMode && `The provided timing value "${exp}" is invalid.`,
  );
}

export function negativeStepValue(): Error {
  return new RuntimeError(
    RuntimeErrorCode.NEGATIVE_STEP_VALUE,
    ngDevMode && 'Duration values below 0 are not allowed for this animation step.',
  );
}

export function negativeDelayValue(): Error {
  return new RuntimeError(
    RuntimeErrorCode.NEGATIVE_DELAY_VALUE,
    ngDevMode && 'Delay values below 0 are not allowed for this animation step.',
  );
}

export function invalidStyleParams(varName: string): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_STYLE_PARAMS,
    ngDevMode &&
      `Unable to resolve the local animation param ${varName} in the given list of values`,
  );
}

export function invalidParamValue(varName: string): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_PARAM_VALUE,
    ngDevMode && `Please provide a value for the animation param ${varName}`,
  );
}

export function invalidNodeType(nodeType: string): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_NODE_TYPE,
    ngDevMode && `Unable to resolve animation metadata node #${nodeType}`,
  );
}

export function invalidCssUnitValue(userProvidedProperty: string, value: string): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_CSS_UNIT_VALUE,
    ngDevMode && `Please provide a CSS unit value for ${userProvidedProperty}:${value}`,
  );
}

export function invalidTrigger(): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_TRIGGER,
    ngDevMode &&
      "animation triggers cannot be prefixed with an `@` sign (e.g. trigger('@foo', [...]))",
  );
}

export function invalidDefinition(): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_DEFINITION,
    ngDevMode && 'only state() and transition() definitions can sit inside of a trigger()',
  );
}

export function invalidState(metadataName: string, missingSubs: string[]): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_STATE,
    ngDevMode &&
      `state("${metadataName}", ...) must define default values for all the following style substitutions: ${missingSubs.join(
        ', ',
      )}`,
  );
}

export function invalidStyleValue(value: string): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_STYLE_VALUE,
    ngDevMode && `The provided style string value ${value} is not allowed.`,
  );
}

export function invalidProperty(prop: string): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_PROPERTY,
    ngDevMode &&
      `The provided animation property "${prop}" is not a supported CSS property for animations`,
  );
}

export function invalidParallelAnimation(
  prop: string,
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number,
): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_PARALLEL_ANIMATION,
    ngDevMode &&
      `The CSS property "${prop}" that exists between the times of "${firstStart}ms" and "${firstEnd}ms" is also being animated in a parallel animation between the times of "${secondStart}ms" and "${secondEnd}ms"`,
  );
}

export function invalidKeyframes(): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_KEYFRAMES,
    ngDevMode && `keyframes() must be placed inside of a call to animate()`,
  );
}

export function invalidOffset(): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_OFFSET,
    ngDevMode && `Please ensure that all keyframe offsets are between 0 and 1`,
  );
}

export function keyframeOffsetsOutOfOrder(): Error {
  return new RuntimeError(
    RuntimeErrorCode.KEYFRAME_OFFSETS_OUT_OF_ORDER,
    ngDevMode && `Please ensure that all keyframe offsets are in order`,
  );
}

export function keyframesMissingOffsets(): Error {
  return new RuntimeError(
    RuntimeErrorCode.KEYFRAMES_MISSING_OFFSETS,
    ngDevMode && `Not all style() steps within the declared keyframes() contain offsets`,
  );
}

export function invalidStagger(): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_STAGGER,
    ngDevMode && `stagger() can only be used inside of query()`,
  );
}

export function invalidQuery(selector: string): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_QUERY,
    ngDevMode &&
      `\`query("${selector}")\` returned zero elements. (Use \`query("${selector}", { optional: true })\` if you wish to allow this.)`,
  );
}

export function invalidExpression(expr: string): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_EXPRESSION,
    ngDevMode && `The provided transition expression "${expr}" is not supported`,
  );
}

export function invalidTransitionAlias(alias: string): Error {
  return new RuntimeError(
    RuntimeErrorCode.INVALID_TRANSITION_ALIAS,
    ngDevMode && `The transition alias value "${alias}" is not supported`,
  );
}

export function validationFailed(errors: Error[]): Error {
  return new RuntimeError(
    RuntimeErrorCode.VALIDATION_FAILED,
    ngDevMode && `animation validation failed:\n${errors.map((err) => err.message).join('\n')}`,
  );
}

export function buildingFailed(errors: Error[]): Error {
  return new RuntimeError(
    RuntimeErrorCode.BUILDING_FAILED,
    ngDevMode && `animation building failed:\n${errors.map((err) => err.message).join('\n')}`,
  );
}

export function triggerBuildFailed(name: string, errors: Error[]): Error {
  return new RuntimeError(
    RuntimeErrorCode.TRIGGER_BUILD_FAILED,
    ngDevMode &&
      `The animation trigger "${name}" has failed to build due to the following errors:\n - ${errors
        .map((err) => err.message)
        .join('\n - ')}`,
  );
}

export function animationFailed(errors: Error[]): Error {
  return new RuntimeError(
    RuntimeErrorCode.ANIMATION_FAILED,
    ngDevMode &&
      `Unable to animate due to the following errors:${LINE_START}${errors
        .map((err) => err.message)
        .join(LINE_START)}`,
  );
}

export function registerFailed(errors: Error[]): Error {
  return new RuntimeError(
    RuntimeErrorCode.REGISTRATION_FAILED,
    ngDevMode &&
      `Unable to build the animation due to the following errors: ${errors
        .map((err) => err.message)
        .join('\n')}`,
  );
}

export function missingOrDestroyedAnimation(): Error {
  return new RuntimeError(
    RuntimeErrorCode.MISSING_OR_DESTROYED_ANIMATION,
    ngDevMode && "The requested animation doesn't exist or has already been destroyed",
  );
}

export function createAnimationFailed(errors: Error[]): Error {
  return new RuntimeError(
    RuntimeErrorCode.CREATE_ANIMATION_FAILED,
    ngDevMode &&
      `Unable to create the animation due to the following errors:${errors
        .map((err) => err.message)
        .join('\n')}`,
  );
}

export function missingPlayer(id: string): Error {
  return new RuntimeError(
    RuntimeErrorCode.MISSING_PLAYER,
    ngDevMode && `Unable to find the timeline player referenced by ${id}`,
  );
}

export function missingTrigger(phase: string, name: string): Error {
  return new RuntimeError(
    RuntimeErrorCode.MISSING_TRIGGER,
    ngDevMode &&
      `Unable to listen on the animation trigger event "${phase}" because the animation trigger "${name}" doesn\'t exist!`,
  );
}

export function missingEvent(name: string): Error {
  return new RuntimeError(
    RuntimeErrorCode.MISSING_EVENT,
    ngDevMode &&
      `Unable to listen on the animation trigger "${name}" because the provided event is undefined!`,
  );
}

export function unsupportedTriggerEvent(phase: string, name: string): Error {
  return new RuntimeError(
    RuntimeErrorCode.UNSUPPORTED_TRIGGER_EVENT,
    ngDevMode &&
      `The provided animation trigger event "${phase}" for the animation trigger "${name}" is not supported!`,
  );
}

export function unregisteredTrigger(name: string): Error {
  return new RuntimeError(
    RuntimeErrorCode.UNREGISTERED_TRIGGER,
    ngDevMode && `The provided animation trigger "${name}" has not been registered!`,
  );
}

export function triggerTransitionsFailed(errors: Error[]): Error {
  return new RuntimeError(
    RuntimeErrorCode.TRIGGER_TRANSITIONS_FAILED,
    ngDevMode &&
      `Unable to process animations due to the following failed trigger transitions\n ${errors
        .map((err) => err.message)
        .join('\n')}`,
  );
}

export function triggerParsingFailed(name: string, errors: Error[]): Error {
  return new RuntimeError(
    RuntimeErrorCode.TRIGGER_PARSING_FAILED,
    ngDevMode &&
      `Animation parsing for the ${name} trigger have failed:${LINE_START}${errors
        .map((err) => err.message)
        .join(LINE_START)}`,
  );
}

export function transitionFailed(name: string, errors: Error[]): Error {
  return new RuntimeError(
    RuntimeErrorCode.TRANSITION_FAILED,
    ngDevMode && `@${name} has failed due to:\n ${errors.map((err) => err.message).join('\n- ')}`,
  );
}
