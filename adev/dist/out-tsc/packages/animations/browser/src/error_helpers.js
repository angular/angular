/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵRuntimeError as RuntimeError} from '@angular/core';
const LINE_START = '\n - ';
export function invalidTimingValue(exp) {
  return new RuntimeError(
    3000 /* RuntimeErrorCode.INVALID_TIMING_VALUE */,
    ngDevMode && `The provided timing value "${exp}" is invalid.`,
  );
}
export function negativeStepValue() {
  return new RuntimeError(
    3100 /* RuntimeErrorCode.NEGATIVE_STEP_VALUE */,
    ngDevMode && 'Duration values below 0 are not allowed for this animation step.',
  );
}
export function negativeDelayValue() {
  return new RuntimeError(
    3101 /* RuntimeErrorCode.NEGATIVE_DELAY_VALUE */,
    ngDevMode && 'Delay values below 0 are not allowed for this animation step.',
  );
}
export function invalidStyleParams(varName) {
  return new RuntimeError(
    3001 /* RuntimeErrorCode.INVALID_STYLE_PARAMS */,
    ngDevMode &&
      `Unable to resolve the local animation param ${varName} in the given list of values`,
  );
}
export function invalidParamValue(varName) {
  return new RuntimeError(
    3003 /* RuntimeErrorCode.INVALID_PARAM_VALUE */,
    ngDevMode && `Please provide a value for the animation param ${varName}`,
  );
}
export function invalidNodeType(nodeType) {
  return new RuntimeError(
    3004 /* RuntimeErrorCode.INVALID_NODE_TYPE */,
    ngDevMode && `Unable to resolve animation metadata node #${nodeType}`,
  );
}
export function invalidCssUnitValue(userProvidedProperty, value) {
  return new RuntimeError(
    3005 /* RuntimeErrorCode.INVALID_CSS_UNIT_VALUE */,
    ngDevMode && `Please provide a CSS unit value for ${userProvidedProperty}:${value}`,
  );
}
export function invalidTrigger() {
  return new RuntimeError(
    3006 /* RuntimeErrorCode.INVALID_TRIGGER */,
    ngDevMode &&
      "animation triggers cannot be prefixed with an `@` sign (e.g. trigger('@foo', [...]))",
  );
}
export function invalidDefinition() {
  return new RuntimeError(
    3007 /* RuntimeErrorCode.INVALID_DEFINITION */,
    ngDevMode && 'only state() and transition() definitions can sit inside of a trigger()',
  );
}
export function invalidState(metadataName, missingSubs) {
  return new RuntimeError(
    3008 /* RuntimeErrorCode.INVALID_STATE */,
    ngDevMode &&
      `state("${metadataName}", ...) must define default values for all the following style substitutions: ${missingSubs.join(', ')}`,
  );
}
export function invalidStyleValue(value) {
  return new RuntimeError(
    3002 /* RuntimeErrorCode.INVALID_STYLE_VALUE */,
    ngDevMode && `The provided style string value ${value} is not allowed.`,
  );
}
export function invalidProperty(prop) {
  return new RuntimeError(
    3009 /* RuntimeErrorCode.INVALID_PROPERTY */,
    ngDevMode &&
      `The provided animation property "${prop}" is not a supported CSS property for animations`,
  );
}
export function invalidParallelAnimation(prop, firstStart, firstEnd, secondStart, secondEnd) {
  return new RuntimeError(
    3010 /* RuntimeErrorCode.INVALID_PARALLEL_ANIMATION */,
    ngDevMode &&
      `The CSS property "${prop}" that exists between the times of "${firstStart}ms" and "${firstEnd}ms" is also being animated in a parallel animation between the times of "${secondStart}ms" and "${secondEnd}ms"`,
  );
}
export function invalidKeyframes() {
  return new RuntimeError(
    3011 /* RuntimeErrorCode.INVALID_KEYFRAMES */,
    ngDevMode && `keyframes() must be placed inside of a call to animate()`,
  );
}
export function invalidOffset() {
  return new RuntimeError(
    3012 /* RuntimeErrorCode.INVALID_OFFSET */,
    ngDevMode && `Please ensure that all keyframe offsets are between 0 and 1`,
  );
}
export function keyframeOffsetsOutOfOrder() {
  return new RuntimeError(
    3200 /* RuntimeErrorCode.KEYFRAME_OFFSETS_OUT_OF_ORDER */,
    ngDevMode && `Please ensure that all keyframe offsets are in order`,
  );
}
export function keyframesMissingOffsets() {
  return new RuntimeError(
    3202 /* RuntimeErrorCode.KEYFRAMES_MISSING_OFFSETS */,
    ngDevMode && `Not all style() steps within the declared keyframes() contain offsets`,
  );
}
export function invalidStagger() {
  return new RuntimeError(
    3013 /* RuntimeErrorCode.INVALID_STAGGER */,
    ngDevMode && `stagger() can only be used inside of query()`,
  );
}
export function invalidQuery(selector) {
  return new RuntimeError(
    3014 /* RuntimeErrorCode.INVALID_QUERY */,
    ngDevMode &&
      `\`query("${selector}")\` returned zero elements. (Use \`query("${selector}", { optional: true })\` if you wish to allow this.)`,
  );
}
export function invalidExpression(expr) {
  return new RuntimeError(
    3015 /* RuntimeErrorCode.INVALID_EXPRESSION */,
    ngDevMode && `The provided transition expression "${expr}" is not supported`,
  );
}
export function invalidTransitionAlias(alias) {
  return new RuntimeError(
    3016 /* RuntimeErrorCode.INVALID_TRANSITION_ALIAS */,
    ngDevMode && `The transition alias value "${alias}" is not supported`,
  );
}
export function validationFailed(errors) {
  return new RuntimeError(
    3500 /* RuntimeErrorCode.VALIDATION_FAILED */,
    ngDevMode && `animation validation failed:\n${errors.map((err) => err.message).join('\n')}`,
  );
}
export function buildingFailed(errors) {
  return new RuntimeError(
    3501 /* RuntimeErrorCode.BUILDING_FAILED */,
    ngDevMode && `animation building failed:\n${errors.map((err) => err.message).join('\n')}`,
  );
}
export function triggerBuildFailed(name, errors) {
  return new RuntimeError(
    3404 /* RuntimeErrorCode.TRIGGER_BUILD_FAILED */,
    ngDevMode &&
      `The animation trigger "${name}" has failed to build due to the following errors:\n - ${errors
        .map((err) => err.message)
        .join('\n - ')}`,
  );
}
export function animationFailed(errors) {
  return new RuntimeError(
    3502 /* RuntimeErrorCode.ANIMATION_FAILED */,
    ngDevMode &&
      `Unable to animate due to the following errors:${LINE_START}${errors
        .map((err) => err.message)
        .join(LINE_START)}`,
  );
}
export function registerFailed(errors) {
  return new RuntimeError(
    3503 /* RuntimeErrorCode.REGISTRATION_FAILED */,
    ngDevMode &&
      `Unable to build the animation due to the following errors: ${errors
        .map((err) => err.message)
        .join('\n')}`,
  );
}
export function missingOrDestroyedAnimation() {
  return new RuntimeError(
    3300 /* RuntimeErrorCode.MISSING_OR_DESTROYED_ANIMATION */,
    ngDevMode && "The requested animation doesn't exist or has already been destroyed",
  );
}
export function createAnimationFailed(errors) {
  return new RuntimeError(
    3504 /* RuntimeErrorCode.CREATE_ANIMATION_FAILED */,
    ngDevMode &&
      `Unable to create the animation due to the following errors:${errors
        .map((err) => err.message)
        .join('\n')}`,
  );
}
export function missingPlayer(id) {
  return new RuntimeError(
    3301 /* RuntimeErrorCode.MISSING_PLAYER */,
    ngDevMode && `Unable to find the timeline player referenced by ${id}`,
  );
}
export function missingTrigger(phase, name) {
  return new RuntimeError(
    3302 /* RuntimeErrorCode.MISSING_TRIGGER */,
    ngDevMode &&
      `Unable to listen on the animation trigger event "${phase}" because the animation trigger "${name}" doesn\'t exist!`,
  );
}
export function missingEvent(name) {
  return new RuntimeError(
    3303 /* RuntimeErrorCode.MISSING_EVENT */,
    ngDevMode &&
      `Unable to listen on the animation trigger "${name}" because the provided event is undefined!`,
  );
}
export function unsupportedTriggerEvent(phase, name) {
  return new RuntimeError(
    3400 /* RuntimeErrorCode.UNSUPPORTED_TRIGGER_EVENT */,
    ngDevMode &&
      `The provided animation trigger event "${phase}" for the animation trigger "${name}" is not supported!`,
  );
}
export function unregisteredTrigger(name) {
  return new RuntimeError(
    3401 /* RuntimeErrorCode.UNREGISTERED_TRIGGER */,
    ngDevMode && `The provided animation trigger "${name}" has not been registered!`,
  );
}
export function triggerTransitionsFailed(errors) {
  return new RuntimeError(
    3402 /* RuntimeErrorCode.TRIGGER_TRANSITIONS_FAILED */,
    ngDevMode &&
      `Unable to process animations due to the following failed trigger transitions\n ${errors
        .map((err) => err.message)
        .join('\n')}`,
  );
}
export function triggerParsingFailed(name, errors) {
  return new RuntimeError(
    3403 /* RuntimeErrorCode.TRIGGER_PARSING_FAILED */,
    ngDevMode &&
      `Animation parsing for the ${name} trigger have failed:${LINE_START}${errors
        .map((err) => err.message)
        .join(LINE_START)}`,
  );
}
export function transitionFailed(name, errors) {
  return new RuntimeError(
    3505 /* RuntimeErrorCode.TRANSITION_FAILED */,
    ngDevMode && `@${name} has failed due to:\n ${errors.map((err) => err.message).join('\n- ')}`,
  );
}
//# sourceMappingURL=error_helpers.js.map
