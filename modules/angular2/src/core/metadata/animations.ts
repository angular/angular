import {isPresent, isArray, isString, isStringMap, NumberWrapper} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';

export const AUTO_STYLE = "*";
export const FINAL_STATE = "(final)";

export class AnimationEntryMetadata {
  constructor(public name: string, public definitions: AnimationStateMetadata[]) {}
}

export abstract class AnimationStateMetadata {}

export class AnimationStateDeclarationMetadata extends AnimationStateMetadata {
  constructor(public stateName: string, public styles: AnimationStyleMetadata) { super(); }
}

export class AnimationStateTransitionMetadata extends AnimationStateMetadata {
  constructor(public stateChangeExpr: string, public animation: AnimationMetadata) { super(); }
}

export abstract class AnimationMetadata {}

export class AnimationStyleMetadata extends AnimationMetadata {
  constructor(public styles: Array<string|{[key: string]: string | number}>, public offset: number = null) { super(); }
}

export class AnimationAnimateMetadata extends AnimationMetadata {
  constructor(public timings: string | number,
              public styles: AnimationStyleMetadata[]) {
    super();
  }
}

export abstract class AnimationWithStepsMetadata extends AnimationMetadata {
  constructor() { super(); }
  get steps(): AnimationMetadata[] { throw new BaseException('NOT IMPLEMENTED: Base Class'); }
}

export class AnimationSequenceMetadata extends AnimationWithStepsMetadata {
  constructor(private _steps: AnimationMetadata[]) { super(); }
  get steps(): AnimationMetadata[] { return this._steps; }
}

export class AnimationGroupMetadata extends AnimationWithStepsMetadata {
  constructor(private _steps: AnimationMetadata[]) { super(); }
  get steps(): AnimationMetadata[] { return this._steps; }
}

export function animate(timing: string | number, styles: AnimationStyleMetadata|AnimationStyleMetadata[] = null): AnimationAnimateMetadata {
  var styleEntries;
  if (isPresent(styles)) {
    styleEntries = isArray(styles) ? <AnimationStyleMetadata[]>styles : [<AnimationStyleMetadata>styles];
  } else {
    styleEntries = [style(":" + FINAL_STATE)];
  }
  return new AnimationAnimateMetadata(timing, styleEntries);
}

export function group(steps: AnimationMetadata[]): AnimationGroupMetadata {
  return new AnimationGroupMetadata(steps);
}

export function sequence(steps: AnimationMetadata[]): AnimationSequenceMetadata {
  return new AnimationSequenceMetadata(steps);
}

export function style(tokens: string|{[key: string]: string | number}|Array<{[key: string]: string | number}>): AnimationStyleMetadata {
  var input: Array<{[key: string]: string | number}|string>;
  var offset: number = null;
  if (isString(tokens)) {
    input = [<string>tokens];
  } else {
    if (isArray(tokens)) {
      input = <Array<{[key: string]: string | number}>>tokens;
    } else {
      input = [<{[key: string]: string | number}>tokens];
    }
    input.forEach(entry => {
      var entryOffset = entry['offset'];
      if (isPresent(entryOffset)) {
        offset = offset == null ? NumberWrapper.parseFloat(entryOffset) : offset;
      }
    });
  }
  return new AnimationStyleMetadata(input, offset);
}

export function state(stateName: string, styles: AnimationStyleMetadata): AnimationStateDeclarationMetadata {
  return new AnimationStateDeclarationMetadata(stateName, styles);
}

export function transition(stateChangeExpr: string, animationData: AnimationMetadata|AnimationMetadata[]): AnimationStateTransitionMetadata {
  var animation = isArray(animationData)
      ? new AnimationSequenceMetadata(<AnimationMetadata[]>animationData)
      : <AnimationMetadata>animationData;
  return new AnimationStateTransitionMetadata(stateChangeExpr, animation);
}

export function animation(name: string, animation: AnimationMetadata|AnimationMetadata[]): AnimationEntryMetadata {
  var entry = isArray(animation)
    ? <AnimationMetadata[]>animation
    : [<AnimationMetadata>animation];
  return new AnimationEntryMetadata(name, entry);
}
