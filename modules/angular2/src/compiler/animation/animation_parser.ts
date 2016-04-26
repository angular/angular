import {StringMapWrapper} from 'angular2/src/facade/collection';
import {Math} from 'angular2/src/facade/math';
import {
  IS_DART,
  RegExpWrapper,
  isArray,
  isPresent,
  isBlank,
  isNumber,
  isString,
  isStringMap,
  NumberWrapper
} from 'angular2/src/facade/lang';

import {
  CompileAnimationMetadata,
  CompileAnimationWithStepsMetadata,
  CompileAnimationStyleMetadata,
  CompileAnimationAnimateMetadata,
  CompileAnimationGroupMetadata,
  CompileAnimationSequenceMetadata
} from 'angular2/src/compiler/compile_metadata';

import {
  AnimationAst,
  AnimationKeyframeAst,
  AnimationStylesAst,
  AnimationWithStepsAst,
  AnimationSequenceAst,
  AnimationGroupAst,
  AnimationStepAst
} from 'angular2/src/compiler/animation/animation_ast';

import {ANY_STATE, EMPTY_STATE, AnimationStateEvent} from 'angular2/src/core/animation/animation_state_event';

import {StylesCollection} from "angular2/src/compiler/animation/styles_collection";

import {ParseError} from "angular2/src/compiler/parse_util";

const _BASE_TEN = 10;
const _INITIAL_KEYFRAME = 0;
const _TERMINAL_KEYFRAME = 100;
const _ONE_SECOND = 1000;

export class AnimationParseError extends ParseError {
  constructor(message) { super(null, message); }
  toString(): string { return `${this.msg}`; }
}

export class ParsedAnimationResult {
  constructor(public ast: AnimationAst, public errors: AnimationParseError[]) {}
}

export class ParsedEventResult {
  constructor(public event: AnimationStateEvent, public errors: AnimationParseError[]) {}
}

export function parseAnimationMetadata(entry: CompileAnimationMetadata |
                                       CompileAnimationMetadata[]): ParsedAnimationResult {
  var styles = new StylesCollection();
  var errors: AnimationParseError[] = [];
  var metadata = _squashSiblingStyles(entry, errors);
  var ast = _parseAnimationMetadataEntry(metadata, 0, styles, errors);
  if (errors.length == 0) {
    _fillAnimationAstStartingKeyframes(ast, styles, errors);
  }
  return new ParsedAnimationResult(ast, errors);
}

var eventRegex = /^([-\w]+)\((.+?)\)$/g;
export function parseAnimationEvent(eventStr: string): ParsedEventResult {
  var errors: AnimationParseError[] = [];
  var matches = RegExpWrapper.firstMatch(eventRegex, eventStr);
  var key, from, to;
  if (!isPresent(matches)) {
    errors.push(new AnimationParseError(`the provided ${eventStr} is not of a supported format`));
    key = 'default';
    from = ANY_STATE;
    to = EMPTY_STATE;
  } else {
    key = matches[1];
    var stateTokens = matches[2].split(/\s*[=-]>\s*/g);
    if (stateTokens.length > 1) {
      from = stateTokens[0];
      to = stateTokens[1];
    } else {
      from = ANY_STATE;
      to = stateTokens[0];
    }
  }
  var animationEvent = new AnimationStateEvent(key, from, to);
  return new ParsedEventResult(animationEvent, errors);
}

function _squashSiblingStyles(entry: CompileAnimationMetadata | CompileAnimationMetadata[],
                              errors: AnimationParseError[]): CompileAnimationMetadata {
  var squashedEntries = _squashSiblingStylesEntry(entry, errors);
  return squashedEntries.length > 1 ? new CompileAnimationSequenceMetadata(squashedEntries) :
                                      squashedEntries[0];
}

function _squashSiblingStylesEntry(entry: CompileAnimationMetadata | CompileAnimationAnimateMetadata[],
                                   errors: AnimationParseError[]): CompileAnimationMetadata[] {
  var steps: CompileAnimationMetadata[];
  if (isArray(entry)) {
    steps = <CompileAnimationMetadata[]>entry;
  } else if (entry instanceof CompileAnimationWithStepsMetadata) {
    steps = entry.steps;
  } else {
    // this handles a situation where an animation only has one step
    return [entry];
  }

  var newSteps: CompileAnimationMetadata[] = [];
  var combinedStyles: {[key: string]: string | number};
  steps.forEach(step => {
    if (step instanceof CompileAnimationStyleMetadata) {
      // this occurs when a style step is followed by a previous style step
      // or when the first style step is run. We want to concatenate all subsequent
      // style steps together into a single style step such that we have the correct
      // starting keyframe data to pass into the animation player.
      if (!isPresent(combinedStyles)) {
        combinedStyles = {};
      }
      var stepStyle = (<CompileAnimationStyleMetadata>step).styles;
      combinedStyles = StringMapWrapper.merge(combinedStyles, stepStyle);
    } else {
      // it is important that we create a metadata entry of the combined styles
      // before we go on an process the animate, sequence or group metadata steps.
      // This will ensure that the AST will have the previous styles painted on
      // screen before any further animations that use the styles take place.
      if (isPresent(combinedStyles)) {
        newSteps.push(new CompileAnimationStyleMetadata(combinedStyles));
        combinedStyles = null;
      }

      if (step instanceof CompileAnimationWithStepsMetadata) {
        let innerSteps = _squashSiblingStylesEntry(step, errors);
        step = step instanceof CompileAnimationGroupMetadata
            ? new CompileAnimationGroupMetadata(innerSteps)
            : new CompileAnimationSequenceMetadata(innerSteps);
      }
      newSteps.push(step);
    }
  });

  // this happens when only styles were animated within the sequence
  if (isPresent(combinedStyles)) {
    errors.push(new AnimationParseError('One or more pending style(...) animations remain'));
    newSteps.push(new CompileAnimationStyleMetadata(combinedStyles));
  }

  return newSteps;
}

class _AnimationTimings {
  constructor(public duration: number, public delay: number, public easing: string) {}
}

function _parseAnimationMetadataEntry(entry: CompileAnimationMetadata, currentTime: number,
                                      collectedStyles: StylesCollection,
                                      errors: AnimationParseError[]): AnimationAst {
  var ast;
  var playTime = 0;
  var startingTime = currentTime;
  if (entry instanceof CompileAnimationWithStepsMetadata) {
    var maxDuration = 0;
    var steps = [];
    var isGroup = entry instanceof CompileAnimationGroupMetadata;
    var previousStyles;
    entry.steps.forEach(entry => {
      // these will get picked up by the next step...
      var time = isGroup ? startingTime : currentTime;
      if (entry instanceof CompileAnimationStyleMetadata) {
        previousStyles = entry.styles;
        StringMapWrapper.forEach(previousStyles, (value, prop) => {
          collectedStyles.insertAtTime(prop, time, value);
        });
        return;
      }

      var innerAst = _parseAnimationMetadataEntry(entry, time, collectedStyles, errors);
      if (isPresent(previousStyles)) {
        var animationStyles = [new AnimationStylesAst(previousStyles)];
        if (entry instanceof CompileAnimationWithStepsMetadata) {
          steps.push(new AnimationStepAst(animationStyles, [], 0, 0, ''));
        } else {
          (<AnimationStepAst>innerAst).startingStyles = animationStyles;
        }
        previousStyles = null;
      }

      var astDuration = innerAst.playTime;
      currentTime += astDuration;
      playTime += astDuration;
      maxDuration = Math.max(astDuration, maxDuration);
      steps.push(innerAst);
    });
    if (isGroup) {
      ast = new AnimationGroupAst(steps);
      playTime = maxDuration;
      currentTime = startingTime + playTime;
    } else {
      ast = new AnimationSequenceAst(steps);
    }
  } else if (entry instanceof CompileAnimationAnimateMetadata) {
    var currentKeyframe = _parseStepMetadataIntoKeyframe(entry.styles, errors);
    var timings = _parseTimeExpression(entry.timings, errors);
    ast = new AnimationStepAst([], [currentKeyframe], timings.duration, timings.delay,
                                      timings.easing);
    playTime = timings.duration + timings.delay;
    currentTime += playTime;

    entry.styles.forEach((entry: {[key: string]: string | number}) => {
      if (isPresent(entry)) {
        StringMapWrapper.forEach(
            entry, (value, prop) => { collectedStyles.insertAtTime(prop, currentTime, value); });
      }
    });
  } else {
    // if the code reaches this stage then an error
    // has already been populated within the _squashSiblingStyles()
    // operation...
    ast = new AnimationStepAst([], [], 0, 0, '');
  }

  ast.playTime = playTime;
  ast.startTime = startingTime;
  return ast;
}

function _fillAnimationAstStartingKeyframes(ast: AnimationAst, collectedStyles: StylesCollection,
                                            errors: AnimationParseError[]): void {
  // steps that only contain style will not be filled
  if ((ast instanceof AnimationStepAst) && ast.keyframes.length > 0) {
    var endKeyframe = ast.keyframes[0];
    var startKeyframe = _createStartKeyframeFromEndKeyframe(endKeyframe, ast.startTime,
                                                            ast.playTime, collectedStyles, errors);
    ast.keyframes = [startKeyframe, endKeyframe];
  } else if (ast instanceof AnimationWithStepsAst) {
    ast.steps.forEach(entry => _fillAnimationAstStartingKeyframes(entry, collectedStyles, errors));
  }
}

function _parseTimeExpression(exp: string | number,
                              errors: AnimationParseError[]): _AnimationTimings {
  var regex = /^([\.\d]+)(m?s)(?:\s+([\.\d]+)(m?s))?(?:\s+([-a-z]+))?/gi;
  var duration: number;
  var delay: number = 0;
  var easing: string = null;
  if (isString(exp)) {
    var matches = RegExpWrapper.firstMatch(regex, <string>exp);
    if (!isPresent(matches)) {
      errors.push(new AnimationParseError(`The provided timing value "${exp}" is invalid.`));
      return new _AnimationTimings(0, 0, null);
    }

    var durationMatch = NumberWrapper.parseFloat(matches[1]);
    var durationUnit = matches[2];
    if (durationUnit == 's') {
      durationMatch *= _ONE_SECOND;
    }
    duration = Math.floor(durationMatch);

    var delayMatch = matches[3];
    var delayUnit = matches[4];
    if (isPresent(delayMatch)) {
      var delayVal: number = NumberWrapper.parseFloat(delayMatch);
      if (isPresent(delayUnit) && delayUnit == 's') {
        delayVal *= _ONE_SECOND;
      }
      delay = Math.floor(delayVal);
    }

    var easingVal = matches[5];
    if (!isBlank(easingVal)) {
      easing = easingVal;
    }
  } else {
    duration = <number>exp;
  }

  return new _AnimationTimings(duration, delay, easing);
}

function _parseStepMetadataIntoKeyframe(styles: { [key: string]: string | number }[],
                                        errors: AnimationParseError[]): AnimationKeyframeAst {
  var normalizedStyles: {[key: string]: string} = {};
  styles.forEach((token: {[key: string]: string | number}) => {

    if (isStringMap(token)) {
      StringMapWrapper.forEach(token, (value, prop) => { normalizedStyles[prop] = value; });
    } else {
      errors.push(new AnimationParseError(`"${token}" is not a valid key/value style object`));
    }
  });

  return new AnimationKeyframeAst(_TERMINAL_KEYFRAME,
                                  [new AnimationStylesAst(normalizedStyles)]);
}

function _createStartKeyframeFromEndKeyframe(endKeyframe: AnimationKeyframeAst, startTime: number,
                                             duration: number, collectedStyles: StylesCollection,
                                             errors: AnimationParseError[]): AnimationKeyframeAst {
  var values: {[key: string]: string | number} = {};
  var endTime = startTime + duration;
  endKeyframe.styles.forEach((styleData: AnimationStylesAst) => {
    StringMapWrapper.forEach(styleData.styles, (val, prop) => {
      var resultIndex = collectedStyles.indexOfAtOrBeforeTime(prop, startTime);
      var resultEntry, nextEntry, value;
      if (!isPresent(resultIndex)) {
        errors.push(new AnimationParseError(
            `The CSS style:value entry "${prop}:${val}" cannot be animated because "${prop}" has not been styled within a previous style step`));
        value = null;
      } else {
        resultEntry = collectedStyles.getByIndex(prop, resultIndex);
        value = resultEntry.value;
        nextEntry = collectedStyles.getByIndex(prop, resultIndex + 1);
      }

      if (isPresent(nextEntry) && !nextEntry.matches(endTime, val)) {
        errors.push(new AnimationParseError(
            `The animated CSS property "${prop}" unexpectedly changes between steps "${resultEntry.time}ms" and "${endTime}ms" at "${nextEntry.time}ms"`));
      }

      values[prop] = value;
    });
  });
  return new AnimationKeyframeAst(_INITIAL_KEYFRAME, [new AnimationStylesAst(values)]);
}
