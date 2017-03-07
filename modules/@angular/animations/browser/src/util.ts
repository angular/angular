/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimateTimings, AnimationMetadata, sequence, ɵStyleData} from '@angular/animations';

export const ONE_SECOND = 1000;

export function resolveTimingValue(timings: string | number | AnimateTimings, errors: any[]) {
  return timings.hasOwnProperty('duration') ? <AnimateTimings>timings :
                                              parseTimeExpression(<string|number>timings, errors);
}

function parseTimeExpression(exp: string | number, errors: string[]): AnimateTimings {
  const regex = /^([\.\d]+)(m?s)(?:\s+([\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?$/i;
  let duration: number;
  let delay: number = 0;
  let easing: string = null;
  if (typeof exp === 'string') {
    const matches = exp.match(regex);
    if (matches === null) {
      errors.push(`The provided timing value "${exp}" is invalid.`);
      return {duration: 0, delay: 0, easing: null};
    }

    let durationMatch = parseFloat(matches[1]);
    const durationUnit = matches[2];
    if (durationUnit == 's') {
      durationMatch *= ONE_SECOND;
    }
    duration = Math.floor(durationMatch);

    const delayMatch = matches[3];
    const delayUnit = matches[4];
    if (delayMatch != null) {
      let delayVal: number = parseFloat(delayMatch);
      if (delayUnit != null && delayUnit == 's') {
        delayVal *= ONE_SECOND;
      }
      delay = Math.floor(delayVal);
    }

    const easingVal = matches[5];
    if (easingVal) {
      easing = easingVal;
    }
  } else {
    duration = <number>exp;
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
    Object.keys(styles).forEach(prop => element.style[prop] = styles[prop]);
  }
}

export function eraseStyles(element: any, styles: ɵStyleData) {
  if (element['style']) {
    Object.keys(styles).forEach(prop => {
      // IE requires '' instead of null
      // see https://github.com/angular/angular/issues/7916
      element.style[prop] = '';
    });
  }
}

export function normalizeAnimationEntry(steps: AnimationMetadata | AnimationMetadata[]):
    AnimationMetadata {
  return Array.isArray(steps) ? sequence(<AnimationMetadata[]>steps) : <AnimationMetadata>steps;
}

// this is a naive approach to search/replace
// TODO: check to see that transforms are not effected
const STYLE_INTERPOLATION_REGEX = /\$\w+/;

export function validateStyleLocals(
    value: string | number, locals: {[varName: string]: string | number | boolean},
    errors: any[] = null) {
  const matches = value.toString().match(STYLE_INTERPOLATION_REGEX);
  if (matches) {
    matches.forEach(varName => {
      varName = varName.substr(1);  // drop the $
      if (!locals.hasOwnProperty(varName)) {
        errors.push(
            `Unable to resolve the local animation variable $${varName} in the given list of values`);
      }
    });
  }
}

export function interpolateStyleLocals(
    value: string | number, locals: {[varName: string]: string | number | boolean},
    errors: any[]): string {
  return value.toString().replace(STYLE_INTERPOLATION_REGEX, varName => {
    varName = varName.substr(1);  // drop the $
    let localVal = locals[varName];
    // this means that the value was never overidden by the data passed in by the user
    if (localVal === true) {
      errors.push(`Please provide a value for the animation variable $${varName}`);
      localVal = '';
    }
    return localVal.toString();
  });
}
