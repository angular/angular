/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimateTimings, AnimationMetadata, AnimationOptions, sequence, ɵStyleData} from '@angular/animations';

export const ONE_SECOND = 1000;

export const ENTER_CLASSNAME = 'ng-enter';
export const LEAVE_CLASSNAME = 'ng-leave';
export const ENTER_SELECTOR = '.ng-enter';
export const LEAVE_SELECTOR = '.ng-leave';
export const NG_TRIGGER_CLASSNAME = 'ng-trigger';
export const NG_TRIGGER_SELECTOR = '.ng-trigger';
export const NG_ANIMATING_CLASSNAME = 'ng-animating';
export const NG_ANIMATING_SELECTOR = '.ng-animating';

export function resolveTimingValue(value: string | number) {
  if (typeof value == 'number') return value;

  const matches = (value as string).match(/^(-?[\.\d]+)(m?s)/);
  if (!matches || matches.length < 2) return 0;

  return _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
}

function _convertTimeValueToMS(value: number, unit: string): number {
  switch (unit) {
    case 's':
      return value * ONE_SECOND;
    default:  // ms or something else
      return value;
  }
}

export function resolveTiming(
    timings: string | number | AnimateTimings, errors: any[], allowNegativeValues?: boolean) {
  return timings.hasOwnProperty('duration') ?
      <AnimateTimings>timings :
      parseTimeExpression(<string|number>timings, errors, allowNegativeValues);
}

function parseTimeExpression(
    exp: string | number, errors: string[], allowNegativeValues?: boolean): AnimateTimings {
  const regex = /^(-?[\.\d]+)(m?s)(?:\s+(-?[\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?$/i;
  let duration: number;
  let delay: number = 0;
  let easing: string = '';
  if (typeof exp === 'string') {
    const matches = exp.match(regex);
    if (matches === null) {
      errors.push(`The provided timing value "${exp}" is invalid.`);
      return {duration: 0, delay: 0, easing: ''};
    }

    duration = _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);

    const delayMatch = matches[3];
    if (delayMatch != null) {
      delay = _convertTimeValueToMS(Math.floor(parseFloat(delayMatch)), matches[4]);
    }

    const easingVal = matches[5];
    if (easingVal) {
      easing = easingVal;
    }
  } else {
    duration = <number>exp;
  }

  if (!allowNegativeValues) {
    let containsErrors = false;
    let startIndex = errors.length;
    if (duration < 0) {
      errors.push(`Duration values below 0 are not allowed for this animation step.`);
      containsErrors = true;
    }
    if (delay < 0) {
      errors.push(`Delay values below 0 are not allowed for this animation step.`);
      containsErrors = true;
    }
    if (containsErrors) {
      errors.splice(startIndex, 0, `The provided timing value "${exp}" is invalid.`);
    }
  }

  return {duration, delay, easing};
}

export function copyObj(
    obj: {[key: string]: any}, destination: {[key: string]: any} = {}): {[key: string]: any} {
  Object.keys(obj).forEach(prop => { destination[prop] = obj[prop]; });
  return destination;
}

export function normalizeStyles(styles: ɵStyleData | ɵStyleData[]): ɵStyleData {
  const normalizedStyles: ɵStyleData = {};
  if (Array.isArray(styles)) {
    styles.forEach(data => copyStyles(data, false, normalizedStyles));
  } else {
    copyStyles(styles, false, normalizedStyles);
  }
  return normalizedStyles;
}

export function copyStyles(
    styles: ɵStyleData, readPrototype: boolean, destination: ɵStyleData = {}): ɵStyleData {
  if (readPrototype) {
    // we make use of a for-in loop so that the
    // prototypically inherited properties are
    // revealed from the backFill map
    for (let prop in styles) {
      destination[prop] = styles[prop];
    }
  } else {
    copyObj(styles, destination);
  }
  return destination;
}

export function setStyles(element: any, styles: ɵStyleData) {
  if (element['style']) {
    Object.keys(styles).forEach(prop => {
      const camelProp = dashCaseToCamelCase(prop);
      element.style[camelProp] = styles[prop];
    });
  }
}

export function eraseStyles(element: any, styles: ɵStyleData) {
  if (element['style']) {
    Object.keys(styles).forEach(prop => {
      const camelProp = dashCaseToCamelCase(prop);
      element.style[camelProp] = '';
    });
  }
}

export function normalizeAnimationEntry(steps: AnimationMetadata | AnimationMetadata[]):
    AnimationMetadata {
  if (Array.isArray(steps)) {
    if (steps.length == 1) return steps[0];
    return sequence(steps);
  }
  return steps as AnimationMetadata;
}

export function validateStyleParams(
    value: string | number, options: AnimationOptions, errors: any[]) {
  const params = options.params || {};
  if (typeof value !== 'string') return;

  const matches = value.toString().match(PARAM_REGEX);
  if (matches) {
    matches.forEach(varName => {
      if (!params.hasOwnProperty(varName)) {
        errors.push(
            `Unable to resolve the local animation param ${varName} in the given list of values`);
      }
    });
  }
}

const PARAM_REGEX = /\{\{\s*(.+?)\s*\}\}/g;
export function interpolateParams(
    value: string | number, params: {[name: string]: any}, errors: any[]): string|number {
  const original = value.toString();
  const str = original.replace(PARAM_REGEX, (_, varName) => {
    let localVal = params[varName];
    // this means that the value was never overidden by the data passed in by the user
    if (!params.hasOwnProperty(varName)) {
      errors.push(`Please provide a value for the animation param ${varName}`);
      localVal = '';
    }
    return localVal.toString();
  });

  // we do this to assert that numeric values stay as they are
  return str == original ? value : str;
}

export function iteratorToArray(iterator: any): any[] {
  const arr: any[] = [];
  let item = iterator.next();
  while (!item.done) {
    arr.push(item.value);
    item = iterator.next();
  }
  return arr;
}

export function mergeAnimationOptions(
    source: AnimationOptions, destination: AnimationOptions): AnimationOptions {
  if (source.params) {
    const p0 = source.params;
    if (!destination.params) {
      destination.params = {};
    }
    const p1 = destination.params;
    Object.keys(p0).forEach(param => {
      if (!p1.hasOwnProperty(param)) {
        p1[param] = p0[param];
      }
    });
  }
  return destination;
}

const DASH_CASE_REGEXP = /-+([a-z0-9])/g;
export function dashCaseToCamelCase(input: string): string {
  return input.replace(DASH_CASE_REGEXP, (...m: any[]) => m[1].toUpperCase());
}

export function allowPreviousPlayerStylesMerge(duration: number, delay: number) {
  return duration === 0 || delay === 0;
}
