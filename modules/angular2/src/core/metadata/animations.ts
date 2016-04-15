import {isArray, isString, isStringMap} from 'angular2/src/facade/lang';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/exceptions';
import {CONST} from 'angular2/src/facade/lang';

@CONST()
export abstract class AnimationMetadata {}

@CONST()
export class AnimationEntryMetadata extends AnimationMetadata {
  public animation: AnimationMetadata;
  constructor(public name: string, animation: AnimationMetadata|AnimationMetadata[]) {
    super();
    if (isArray(animation)) {
      this.animation = new AnimationSequenceMetadata(<AnimationMetadata[]>animation);
    } else {
      this.animation = <AnimationMetadata>animation;
    }
  }
}

@CONST()
export class AnimationStyleMetadata extends AnimationMetadata {
  constructor(public styles: {[key: string]: string | number}) { super(); }
}

@CONST()
export class AnimationAnimateMetadata extends AnimationMetadata {
  constructor(public styles: { [key: string]: string | number }[],
              public timings: string | number) {
    super();
  }
}

@CONST()
export abstract class AnimationWithStepsMetadata extends AnimationMetadata {
  constructor() { super(); }
  get steps(): AnimationMetadata[] { throw new BaseException('NOT IMPLEMENTED: Base Class'); }
}

@CONST()
export class AnimationSequenceMetadata extends AnimationWithStepsMetadata {
  constructor(private _steps: AnimationMetadata[]) { super(); }
  get steps(): AnimationMetadata[] { return this._steps; }
}

@CONST()
export class AnimationGroupMetadata extends AnimationWithStepsMetadata {
  constructor(private _steps: AnimationMetadata[]) { super(); }
  get steps(): AnimationMetadata[] { return this._steps; }
}

export function animate(tokens: {[key: string]: string | number} | {
  [key: string]: string | number
}[], timing: string | number): AnimationAnimateMetadata {
  var tokenList: any[];
  if (isArray(tokens)) {
    tokenList = <Array<{[key: string]: string | number}>>tokens;
  } else {
    tokenList = [tokens];
  }
  return new AnimationAnimateMetadata(tokenList, timing);
}

export function group(steps: AnimationMetadata[]): AnimationGroupMetadata {
  return new AnimationGroupMetadata(steps);
}

export function sequence(steps: AnimationMetadata[]): AnimationSequenceMetadata {
  return new AnimationSequenceMetadata(steps);
}

export function style(token: {[key: string]: string | number}): AnimationStyleMetadata {
  return new AnimationStyleMetadata(token);
}

export function animation(name: string, animation: AnimationMetadata|AnimationMetadata[]): AnimationEntryMetadata {
  return new AnimationEntryMetadata(name, animation);
}
