/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

import {CompileAnimationAnimateMetadata, CompileAnimationEntryMetadata, CompileAnimationGroupMetadata, CompileAnimationKeyframesSequenceMetadata, CompileAnimationMetadata, CompileAnimationSequenceMetadata, CompileAnimationStateDeclarationMetadata, CompileAnimationStateTransitionMetadata, CompileAnimationStyleMetadata, CompileAnimationWithStepsMetadata, CompileDirectiveMetadata} from '../compile_metadata';
import {StringMapWrapper} from '../facade/collection';
import {isBlank, isPresent} from '../facade/lang';
import {ParseError} from '../parse_util';
import {ANY_STATE, FILL_STYLE_FLAG} from '../private_import_core';
import {ElementSchemaRegistry} from '../schema/element_schema_registry';

import {AnimationAst, AnimationEntryAst, AnimationGroupAst, AnimationKeyframeAst, AnimationSequenceAst, AnimationStateDeclarationAst, AnimationStateTransitionAst, AnimationStateTransitionExpression, AnimationStepAst, AnimationStylesAst, AnimationWithStepsAst} from './animation_ast';
import {StylesCollection} from './styles_collection';

const _INITIAL_KEYFRAME = 0;
const _TERMINAL_KEYFRAME = 1;
const _ONE_SECOND = 1000;

declare type Styles = {
  [key: string]: string | number
};

export class AnimationParseError extends ParseError {
  constructor(message: string) { super(null, message); }
  toString(): string { return `${this.msg}`; }
}

export class AnimationEntryParseResult {
  constructor(public ast: AnimationEntryAst, public errors: AnimationParseError[]) {}
}

@Injectable()
export class AnimationParser {
  constructor(private _schema: ElementSchemaRegistry) {}

  parseComponent(component: CompileDirectiveMetadata): AnimationEntryAst[] {
    const errors: string[] = [];
    const componentName = component.type.name;
    const animationTriggerNames = new Set<string>();
    const asts = component.template.animations.map(entry => {
      const result = this.parseEntry(entry);
      const ast = result.ast;
      const triggerName = ast.name;
      if (animationTriggerNames.has(triggerName)) {
        result.errors.push(new AnimationParseError(
            `The animation trigger "${triggerName}" has already been registered for the ${componentName} component`));
      } else {
        animationTriggerNames.add(triggerName);
      }
      if (result.errors.length > 0) {
        let errorMessage =
            `- Unable to parse the animation sequence for "${triggerName}" on the ${componentName} component due to the following errors:`;
        result.errors.forEach(
            (error: AnimationParseError) => { errorMessage += '\n-- ' + error.msg; });
        errors.push(errorMessage);
      }
      return ast;
    });

    if (errors.length > 0) {
      const errorString = errors.join('\n');
      throw new Error(`Animation parse errors:\n${errorString}`);
    }

    return asts;
  }

  parseEntry(entry: CompileAnimationEntryMetadata): AnimationEntryParseResult {
    var errors: AnimationParseError[] = [];
    var stateStyles: {[key: string]: AnimationStylesAst} = {};
    var transitions: CompileAnimationStateTransitionMetadata[] = [];

    var stateDeclarationAsts: AnimationStateDeclarationAst[] = [];
    entry.definitions.forEach(def => {
      if (def instanceof CompileAnimationStateDeclarationMetadata) {
        _parseAnimationDeclarationStates(def, this._schema, errors).forEach(ast => {
          stateDeclarationAsts.push(ast);
          stateStyles[ast.stateName] = ast.styles;
        });
      } else {
        transitions.push(<CompileAnimationStateTransitionMetadata>def);
      }
    });

    var stateTransitionAsts = transitions.map(
        transDef => _parseAnimationStateTransition(transDef, stateStyles, this._schema, errors));

    var ast = new AnimationEntryAst(entry.name, stateDeclarationAsts, stateTransitionAsts);
    return new AnimationEntryParseResult(ast, errors);
  }
}

function _parseAnimationDeclarationStates(
    stateMetadata: CompileAnimationStateDeclarationMetadata, schema: ElementSchemaRegistry,
    errors: AnimationParseError[]): AnimationStateDeclarationAst[] {
  var normalizedStyles = _normalizeStyleMetadata(stateMetadata.styles, {}, schema, errors, false);
  var defStyles = new AnimationStylesAst(normalizedStyles);
  var states = stateMetadata.stateNameExpr.split(/\s*,\s*/);
  return states.map(state => new AnimationStateDeclarationAst(state, defStyles));
}

function _parseAnimationStateTransition(
    transitionStateMetadata: CompileAnimationStateTransitionMetadata,
    stateStyles: {[key: string]: AnimationStylesAst}, schema: ElementSchemaRegistry,
    errors: AnimationParseError[]): AnimationStateTransitionAst {
  var styles = new StylesCollection();
  var transitionExprs: AnimationStateTransitionExpression[] = [];
  var transitionStates = transitionStateMetadata.stateChangeExpr.split(/\s*,\s*/);
  transitionStates.forEach(
      expr => { transitionExprs.push(..._parseAnimationTransitionExpr(expr, errors)); });
  var entry = _normalizeAnimationEntry(transitionStateMetadata.steps);
  var animation = _normalizeStyleSteps(entry, stateStyles, schema, errors);
  var animationAst = _parseTransitionAnimation(animation, 0, styles, stateStyles, errors);
  if (errors.length == 0) {
    _fillAnimationAstStartingKeyframes(animationAst, styles, errors);
  }

  var stepsAst: AnimationWithStepsAst = (animationAst instanceof AnimationWithStepsAst) ?
      animationAst :
      new AnimationSequenceAst([animationAst]);

  return new AnimationStateTransitionAst(transitionExprs, stepsAst);
}

function _parseAnimationAlias(alias: string, errors: AnimationParseError[]): string {
  switch (alias) {
    case ':enter':
      return 'void => *';
    case ':leave':
      return '* => void';
    default:
      errors.push(
          new AnimationParseError(`the transition alias value "${alias}" is not supported`));
      return '* => *';
  }
}

function _parseAnimationTransitionExpr(
    eventStr: string, errors: AnimationParseError[]): AnimationStateTransitionExpression[] {
  var expressions: AnimationStateTransitionExpression[] = [];
  if (eventStr[0] == ':') {
    eventStr = _parseAnimationAlias(eventStr, errors);
  }
  var match = eventStr.match(/^(\*|[-\w]+)\s*(<?[=-]>)\s*(\*|[-\w]+)$/);
  if (!isPresent(match) || match.length < 4) {
    errors.push(new AnimationParseError(`the provided ${eventStr} is not of a supported format`));
    return expressions;
  }

  var fromState = match[1];
  var separator = match[2];
  var toState = match[3];
  expressions.push(new AnimationStateTransitionExpression(fromState, toState));

  var isFullAnyStateExpr = fromState == ANY_STATE && toState == ANY_STATE;
  if (separator[0] == '<' && !isFullAnyStateExpr) {
    expressions.push(new AnimationStateTransitionExpression(toState, fromState));
  }
  return expressions;
}

function _normalizeAnimationEntry(entry: CompileAnimationMetadata | CompileAnimationMetadata[]):
    CompileAnimationMetadata {
  return Array.isArray(entry) ? new CompileAnimationSequenceMetadata(entry) : entry;
}

function _normalizeStyleMetadata(
    entry: CompileAnimationStyleMetadata, stateStyles: {[key: string]: AnimationStylesAst},
    schema: ElementSchemaRegistry, errors: AnimationParseError[],
    permitStateReferences: boolean): {[key: string]: string | number}[] {
  var normalizedStyles: {[key: string]: string | number}[] = [];
  entry.styles.forEach(styleEntry => {
    if (typeof styleEntry === 'string') {
      if (permitStateReferences) {
        normalizedStyles.push(..._resolveStylesFromState(<string>styleEntry, stateStyles, errors));
      } else {
        errors.push(new AnimationParseError(
            `State based animations cannot contain references to other states`));
      }
    } else {
      var stylesObj = <Styles>styleEntry;
      var normalizedStylesObj: Styles = {};
      Object.keys(stylesObj).forEach(propName => {
        var normalizedProp = schema.normalizeAnimationStyleProperty(propName);
        var normalizedOutput =
            schema.normalizeAnimationStyleValue(normalizedProp, propName, stylesObj[propName]);
        var normalizationError = normalizedOutput['error'];
        if (normalizationError) {
          errors.push(new AnimationParseError(normalizationError));
        }
        normalizedStylesObj[normalizedProp] = normalizedOutput['value'];
      });
      normalizedStyles.push(normalizedStylesObj);
    }
  });
  return normalizedStyles;
}

function _normalizeStyleSteps(
    entry: CompileAnimationMetadata, stateStyles: {[key: string]: AnimationStylesAst},
    schema: ElementSchemaRegistry, errors: AnimationParseError[]): CompileAnimationMetadata {
  var steps = _normalizeStyleStepEntry(entry, stateStyles, schema, errors);
  return (entry instanceof CompileAnimationGroupMetadata) ?
      new CompileAnimationGroupMetadata(steps) :
      new CompileAnimationSequenceMetadata(steps);
}

function _mergeAnimationStyles(
    stylesList: any[], newItem: {[key: string]: string | number} | string) {
  if (typeof newItem === 'object' && newItem !== null && stylesList.length > 0) {
    var lastIndex = stylesList.length - 1;
    var lastItem = stylesList[lastIndex];
    if (typeof lastItem === 'object' && lastItem !== null) {
      stylesList[lastIndex] = StringMapWrapper.merge(
          <{[key: string]: string | number}>lastItem, <{[key: string]: string | number}>newItem);
      return;
    }
  }
  stylesList.push(newItem);
}

function _normalizeStyleStepEntry(
    entry: CompileAnimationMetadata, stateStyles: {[key: string]: AnimationStylesAst},
    schema: ElementSchemaRegistry, errors: AnimationParseError[]): CompileAnimationMetadata[] {
  var steps: CompileAnimationMetadata[];
  if (entry instanceof CompileAnimationWithStepsMetadata) {
    steps = entry.steps;
  } else {
    return [entry];
  }

  var newSteps: CompileAnimationMetadata[] = [];
  var combinedStyles: Styles[];
  steps.forEach(step => {
    if (step instanceof CompileAnimationStyleMetadata) {
      // this occurs when a style step is followed by a previous style step
      // or when the first style step is run. We want to concatenate all subsequent
      // style steps together into a single style step such that we have the correct
      // starting keyframe data to pass into the animation player.
      if (!isPresent(combinedStyles)) {
        combinedStyles = [];
      }
      _normalizeStyleMetadata(
          <CompileAnimationStyleMetadata>step, stateStyles, schema, errors, true)
          .forEach(entry => { _mergeAnimationStyles(combinedStyles, entry); });
    } else {
      // it is important that we create a metadata entry of the combined styles
      // before we go on an process the animate, sequence or group metadata steps.
      // This will ensure that the AST will have the previous styles painted on
      // screen before any further animations that use the styles take place.
      if (isPresent(combinedStyles)) {
        newSteps.push(new CompileAnimationStyleMetadata(0, combinedStyles));
        combinedStyles = null;
      }

      if (step instanceof CompileAnimationAnimateMetadata) {
        // we do not recurse into CompileAnimationAnimateMetadata since
        // those style steps are not going to be squashed
        var animateStyleValue = (<CompileAnimationAnimateMetadata>step).styles;
        if (animateStyleValue instanceof CompileAnimationStyleMetadata) {
          animateStyleValue.styles =
              _normalizeStyleMetadata(animateStyleValue, stateStyles, schema, errors, true);
        } else if (animateStyleValue instanceof CompileAnimationKeyframesSequenceMetadata) {
          animateStyleValue.steps.forEach(step => {
            step.styles = _normalizeStyleMetadata(step, stateStyles, schema, errors, true);
          });
        }
      } else if (step instanceof CompileAnimationWithStepsMetadata) {
        let innerSteps = _normalizeStyleStepEntry(step, stateStyles, schema, errors);
        step = step instanceof CompileAnimationGroupMetadata ?
            new CompileAnimationGroupMetadata(innerSteps) :
            new CompileAnimationSequenceMetadata(innerSteps);
      }

      newSteps.push(step);
    }
  });

  // this happens when only styles were animated within the sequence
  if (isPresent(combinedStyles)) {
    newSteps.push(new CompileAnimationStyleMetadata(0, combinedStyles));
  }

  return newSteps;
}


function _resolveStylesFromState(
    stateName: string, stateStyles: {[key: string]: AnimationStylesAst},
    errors: AnimationParseError[]) {
  var styles: Styles[] = [];
  if (stateName[0] != ':') {
    errors.push(new AnimationParseError(`Animation states via styles must be prefixed with a ":"`));
  } else {
    var normalizedStateName = stateName.substring(1);
    var value = stateStyles[normalizedStateName];
    if (!isPresent(value)) {
      errors.push(new AnimationParseError(
          `Unable to apply styles due to missing a state: "${normalizedStateName}"`));
    } else {
      value.styles.forEach(stylesEntry => {
        if (typeof stylesEntry === 'object' && stylesEntry !== null) {
          styles.push(stylesEntry as Styles);
        }
      });
    }
  }
  return styles;
}

class _AnimationTimings {
  constructor(public duration: number, public delay: number, public easing: string) {}
}

function _parseAnimationKeyframes(
    keyframeSequence: CompileAnimationKeyframesSequenceMetadata, currentTime: number,
    collectedStyles: StylesCollection, stateStyles: {[key: string]: AnimationStylesAst},
    errors: AnimationParseError[]): AnimationKeyframeAst[] {
  var totalEntries = keyframeSequence.steps.length;
  var totalOffsets = 0;
  keyframeSequence.steps.forEach(step => totalOffsets += (isPresent(step.offset) ? 1 : 0));

  if (totalOffsets > 0 && totalOffsets < totalEntries) {
    errors.push(new AnimationParseError(
        `Not all style() entries contain an offset for the provided keyframe()`));
    totalOffsets = totalEntries;
  }

  var limit = totalEntries - 1;
  var margin = totalOffsets == 0 ? (1 / limit) : 0;
  var rawKeyframes: any[] /** TODO #9100 */ = [];
  var index = 0;
  var doSortKeyframes = false;
  var lastOffset = 0;
  keyframeSequence.steps.forEach(styleMetadata => {
    var offset = styleMetadata.offset;
    var keyframeStyles: Styles = {};
    styleMetadata.styles.forEach(entry => {
      Object.keys(entry).forEach(prop => {
        if (prop != 'offset') {
          keyframeStyles[prop] = (entry as Styles)[prop];
        }
      });
    });

    if (isPresent(offset)) {
      doSortKeyframes = doSortKeyframes || (offset < lastOffset);
    } else {
      offset = index == limit ? _TERMINAL_KEYFRAME : (margin * index);
    }

    rawKeyframes.push([offset, keyframeStyles]);
    lastOffset = offset;
    index++;
  });

  if (doSortKeyframes) {
    rawKeyframes.sort((a, b) => a[0] <= b[0] ? -1 : 1);
  }

  var firstKeyframe = rawKeyframes[0];
  if (firstKeyframe[0] != _INITIAL_KEYFRAME) {
    rawKeyframes.splice(0, 0, firstKeyframe = [_INITIAL_KEYFRAME, {}]);
  }

  var firstKeyframeStyles = firstKeyframe[1];
  limit = rawKeyframes.length - 1;
  var lastKeyframe = rawKeyframes[limit];
  if (lastKeyframe[0] != _TERMINAL_KEYFRAME) {
    rawKeyframes.push(lastKeyframe = [_TERMINAL_KEYFRAME, {}]);
    limit++;
  }

  var lastKeyframeStyles = lastKeyframe[1];
  for (let i = 1; i <= limit; i++) {
    let entry = rawKeyframes[i];
    let styles = entry[1];

    Object.keys(styles).forEach(prop => {
      if (!isPresent(firstKeyframeStyles[prop])) {
        firstKeyframeStyles[prop] = FILL_STYLE_FLAG;
      }
    });
  }

  for (let i = limit - 1; i >= 0; i--) {
    let entry = rawKeyframes[i];
    let styles = entry[1];

    Object.keys(styles).forEach(prop => {
      if (!isPresent(lastKeyframeStyles[prop])) {
        lastKeyframeStyles[prop] = styles[prop];
      }
    });
  }

  return rawKeyframes.map(
      entry => new AnimationKeyframeAst(entry[0], new AnimationStylesAst([entry[1]])));
}

function _parseTransitionAnimation(
    entry: CompileAnimationMetadata, currentTime: number, collectedStyles: StylesCollection,
    stateStyles: {[key: string]: AnimationStylesAst}, errors: AnimationParseError[]): AnimationAst {
  var ast: any /** TODO #9100 */;
  var playTime = 0;
  var startingTime = currentTime;
  if (entry instanceof CompileAnimationWithStepsMetadata) {
    var maxDuration = 0;
    var steps: any[] /** TODO #9100 */ = [];
    var isGroup = entry instanceof CompileAnimationGroupMetadata;
    var previousStyles: any /** TODO #9100 */;
    entry.steps.forEach(entry => {
      // these will get picked up by the next step...
      var time = isGroup ? startingTime : currentTime;
      if (entry instanceof CompileAnimationStyleMetadata) {
        entry.styles.forEach(stylesEntry => {
          // by this point we know that we only have stringmap values
          var map = stylesEntry as Styles;
          Object.keys(map).forEach(
              prop => { collectedStyles.insertAtTime(prop, time, map[prop]); });
        });
        previousStyles = entry.styles;
        return;
      }

      var innerAst = _parseTransitionAnimation(entry, time, collectedStyles, stateStyles, errors);
      if (isPresent(previousStyles)) {
        if (entry instanceof CompileAnimationWithStepsMetadata) {
          let startingStyles = new AnimationStylesAst(previousStyles);
          steps.push(new AnimationStepAst(startingStyles, [], 0, 0, ''));
        } else {
          var innerStep = <AnimationStepAst>innerAst;
          innerStep.startingStyles.styles.push(...previousStyles);
        }
        previousStyles = null;
      }

      var astDuration = innerAst.playTime;
      currentTime += astDuration;
      playTime += astDuration;
      maxDuration = Math.max(astDuration, maxDuration);
      steps.push(innerAst);
    });
    if (isPresent(previousStyles)) {
      let startingStyles = new AnimationStylesAst(previousStyles);
      steps.push(new AnimationStepAst(startingStyles, [], 0, 0, ''));
    }
    if (isGroup) {
      ast = new AnimationGroupAst(steps);
      playTime = maxDuration;
      currentTime = startingTime + playTime;
    } else {
      ast = new AnimationSequenceAst(steps);
    }
  } else if (entry instanceof CompileAnimationAnimateMetadata) {
    var timings = _parseTimeExpression(entry.timings, errors);
    var styles = entry.styles;

    var keyframes: any /** TODO #9100 */;
    if (styles instanceof CompileAnimationKeyframesSequenceMetadata) {
      keyframes =
          _parseAnimationKeyframes(styles, currentTime, collectedStyles, stateStyles, errors);
    } else {
      let styleData = <CompileAnimationStyleMetadata>styles;
      let offset = _TERMINAL_KEYFRAME;
      let styleAst = new AnimationStylesAst(styleData.styles as Styles[]);
      var keyframe = new AnimationKeyframeAst(offset, styleAst);
      keyframes = [keyframe];
    }

    ast = new AnimationStepAst(
        new AnimationStylesAst([]), keyframes, timings.duration, timings.delay, timings.easing);
    playTime = timings.duration + timings.delay;
    currentTime += playTime;

    keyframes.forEach(
        (keyframe: any /** TODO #9100 */) => keyframe.styles.styles.forEach(
            (entry: any /** TODO #9100 */) => Object.keys(entry).forEach(
                prop => { collectedStyles.insertAtTime(prop, currentTime, entry[prop]); })));
  } else {
    // if the code reaches this stage then an error
    // has already been populated within the _normalizeStyleSteps()
    // operation...
    ast = new AnimationStepAst(null, [], 0, 0, '');
  }

  ast.playTime = playTime;
  ast.startTime = startingTime;
  return ast;
}

function _fillAnimationAstStartingKeyframes(
    ast: AnimationAst, collectedStyles: StylesCollection, errors: AnimationParseError[]): void {
  // steps that only contain style will not be filled
  if ((ast instanceof AnimationStepAst) && ast.keyframes.length > 0) {
    var keyframes = ast.keyframes;
    if (keyframes.length == 1) {
      var endKeyframe = keyframes[0];
      var startKeyframe = _createStartKeyframeFromEndKeyframe(
          endKeyframe, ast.startTime, ast.playTime, collectedStyles, errors);
      ast.keyframes = [startKeyframe, endKeyframe];
    }
  } else if (ast instanceof AnimationWithStepsAst) {
    ast.steps.forEach(entry => _fillAnimationAstStartingKeyframes(entry, collectedStyles, errors));
  }
}

function _parseTimeExpression(
    exp: string | number, errors: AnimationParseError[]): _AnimationTimings {
  var regex = /^([\.\d]+)(m?s)(?:\s+([\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?/i;
  var duration: number;
  var delay: number = 0;
  var easing: string = null;
  if (typeof exp === 'string') {
    const matches = exp.match(regex);
    if (matches === null) {
      errors.push(new AnimationParseError(`The provided timing value "${exp}" is invalid.`));
      return new _AnimationTimings(0, 0, null);
    }

    var durationMatch = parseFloat(matches[1]);
    var durationUnit = matches[2];
    if (durationUnit == 's') {
      durationMatch *= _ONE_SECOND;
    }
    duration = Math.floor(durationMatch);

    var delayMatch = matches[3];
    var delayUnit = matches[4];
    if (isPresent(delayMatch)) {
      var delayVal: number = parseFloat(delayMatch);
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

function _createStartKeyframeFromEndKeyframe(
    endKeyframe: AnimationKeyframeAst, startTime: number, duration: number,
    collectedStyles: StylesCollection, errors: AnimationParseError[]): AnimationKeyframeAst {
  var values: Styles = {};
  var endTime = startTime + duration;
  endKeyframe.styles.styles.forEach((styleData: Styles) => {
    Object.keys(styleData).forEach(prop => {
      const val = styleData[prop];
      if (prop == 'offset') return;

      var resultIndex = collectedStyles.indexOfAtOrBeforeTime(prop, startTime);
      var resultEntry: any /** TODO #9100 */, nextEntry: any /** TODO #9100 */,
          value: any /** TODO #9100 */;
      if (isPresent(resultIndex)) {
        resultEntry = collectedStyles.getByIndex(prop, resultIndex);
        value = resultEntry.value;
        nextEntry = collectedStyles.getByIndex(prop, resultIndex + 1);
      } else {
        // this is a flag that the runtime code uses to pass
        // in a value either from the state declaration styles
        // or using the AUTO_STYLE value (e.g. getComputedStyle)
        value = FILL_STYLE_FLAG;
      }

      if (isPresent(nextEntry) && !nextEntry.matches(endTime, val)) {
        errors.push(new AnimationParseError(
            `The animated CSS property "${prop}" unexpectedly changes between steps "${resultEntry.time}ms" and "${endTime}ms" at "${nextEntry.time}ms"`));
      }

      values[prop] = value;
    });
  });

  return new AnimationKeyframeAst(_INITIAL_KEYFRAME, new AnimationStylesAst([values]));
}
