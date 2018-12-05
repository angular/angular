/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Timing} from './interfaces';
import {AUTO_STYLE} from './tokens';

export function computeStyle(element: HTMLElement, prop: string): string {
  if (!window || !window.getComputedStyle) return '';
  const gcs = window.getComputedStyle(element) as any;
  return readStyle(gcs, prop);
}

/**
 *
 * @param element
 * @param cb
 */
export function applyReflow(element: HTMLElement, cb?: ((reflow: number) => any) | null) {
  // TODO (matsko): make sure this doesn't get minified
  const w = element.clientWidth + 1;
  cb && requestAnimationFrame(() => cb(w));
}

export function now(): number {
  return Date.now();
}

const TIMING_REGEX = /^(-?[\.\d]+)(m?s)(?:\s+(-?[\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?$/i;
export function parseTimingExp(exp: string | number | Timing): Timing {
  let duration = 0;
  let delay = 0;
  let easing: string|null = null;
  if (typeof exp === 'string') {
    const matches = exp.match(TIMING_REGEX);
    if (matches === null) {
      return {duration: 0, delay: 0, easing: '', fill: null};
    }

    duration = _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);

    const delayMatch = matches[3];
    if (delayMatch != null) {
      delay = _convertTimeValueToMS(parseFloat(delayMatch), matches[4]);
    }

    const easingVal = matches[5];
    if (easingVal) {
      easing = easingVal;
    }
  } else if (typeof exp === 'number') {
    duration = exp;
  } else {
    const t = exp as Timing;
    duration = t.duration;
    delay = t.delay || 0;
    easing = t.easing || null;
  }

  return {duration, delay, easing, fill: null};
}

const ONE_SECOND = 1000;

function _convertTimeValueToMS(value: number, unit: string): number {
  // only seconds are treated in a special way ...
  // otherwise it's assumed that milliseconds are used
  return unit == 's' ? value * ONE_SECOND : value;
}

export function applyTransition(element: HTMLElement, value: string | null) {
  value ? element.style.setProperty('transition', value) :
          element.style.removeProperty('transition');
}

export function readStyle(element: HTMLElement | CSSStyleDeclaration, prop: string) {
  const styles = (element instanceof Element) ? element.style : element;
  return (styles as{[key: string]: any})[prop] || styles.getPropertyValue(prop);
}

export function hyphenateProp(prop: string): string {
  return prop.replace(/[a-z][A-Z]/g, value => `${value[0]}-${value[1].toLowerCase()}`);
}

export function applyClassChanges(
    element: HTMLElement, classes: {[key: string]: boolean}, revert?: boolean,
    store?: {[key: string]: any} | null) {
  Object.keys(classes).forEach(className => {
    const bool = classes[className];
    element.classList.toggle(className, revert ? !bool : bool);
    if (store) {
      store[className] = revert ? false : true;
    }
  });
}

export function applyStyleChanges(
    element: HTMLElement, styles: {[key: string]: any}, backupStyles?: {[key: string]: any} | null,
    revert?: boolean, preComputedStyles?: {[key: string]: any} | null,
    store?: {[key: string]: any} | null) {
  Object.keys(styles).forEach(prop => {
    let value = revert ? (backupStyles && backupStyles[prop]) : styles[prop];
    if (value && value === AUTO_STYLE) {
      value = preComputedStyles && preComputedStyles[prop] || '';
    }
    applyStyle(element, prop, value);
    if (store) {
      store[prop] = value || null;
    }
  });
}

export function applyStyle(element: HTMLElement, prop: string, value: string | null) {
  if (value) {
    element.style.setProperty(prop, value);
  } else {
    element.style.removeProperty(prop);
  }
}
