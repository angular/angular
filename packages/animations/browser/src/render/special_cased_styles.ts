/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {eraseStyles, setStyles} from '../util';

/**
 * Returns an instance of `SpecialCasedStyles` if and when any special (non animateable) styles are
 * detected.
 *
 * In CSS there exist properties that cannot be animated within a keyframe animation
 * (whether it be via CSS keyframes or web-animations) and the animation implementation
 * will ignore them. This function is designed to detect those special cased styles and
 * return a container that will be executed at the start and end of the animation.
 *
 * @returns an instance of `SpecialCasedStyles` if any special styles are detected otherwise `null`
 */
export function packageNonAnimatableStyles(
    element: any, styles: {[key: string]: any}|{[key: string]: any}[]): SpecialCasedStyles|null {
  let startStyles: {[key: string]: any}|null = null;
  let endStyles: {[key: string]: any}|null = null;
  if (Array.isArray(styles) && styles.length) {
    startStyles = filterNonAnimatableStyles(styles[0]);
    if (styles.length > 1) {
      endStyles = filterNonAnimatableStyles(styles[styles.length - 1]);
    }
  } else if (styles) {
    startStyles = filterNonAnimatableStyles(styles);
  }

  return (startStyles || endStyles) ? new SpecialCasedStyles(element, startStyles, endStyles) :
                                      null;
}

/**
 * Designed to be executed during a keyframe-based animation to apply any special-cased styles.
 *
 * When started (when the `start()` method is run) then the provided `startStyles`
 * will be applied. When finished (when the `finish()` method is called) the
 * `endStyles` will be applied as well any any starting styles. Finally when
 * `destroy()` is called then all styles will be removed.
 */
export class SpecialCasedStyles {
  static initialStylesByElement = new WeakMap<any, {[key: string]: any}>();

  private _state = SpecialCasedStylesState.Pending;
  private _initialStyles!: {[key: string]: any};

  constructor(
      private _element: any, private _startStyles: {[key: string]: any}|null,
      private _endStyles: {[key: string]: any}|null) {
    let initialStyles = SpecialCasedStyles.initialStylesByElement.get(_element);
    if (!initialStyles) {
      SpecialCasedStyles.initialStylesByElement.set(_element, initialStyles = {});
    }
    this._initialStyles = initialStyles;
  }

  start() {
    if (this._state < SpecialCasedStylesState.Started) {
      if (this._startStyles) {
        setStyles(this._element, this._startStyles, this._initialStyles);
      }
      this._state = SpecialCasedStylesState.Started;
    }
  }

  finish() {
    this.start();
    if (this._state < SpecialCasedStylesState.Finished) {
      setStyles(this._element, this._initialStyles);
      if (this._endStyles) {
        setStyles(this._element, this._endStyles);
        this._endStyles = null;
      }
      this._state = SpecialCasedStylesState.Started;
    }
  }

  destroy() {
    this.finish();
    if (this._state < SpecialCasedStylesState.Destroyed) {
      SpecialCasedStyles.initialStylesByElement.delete(this._element);
      if (this._startStyles) {
        eraseStyles(this._element, this._startStyles);
        this._endStyles = null;
      }
      if (this._endStyles) {
        eraseStyles(this._element, this._endStyles);
        this._endStyles = null;
      }
      setStyles(this._element, this._initialStyles);
      this._state = SpecialCasedStylesState.Destroyed;
    }
  }
}

/**
 * An enum of states reflective of what the status of `SpecialCasedStyles` is.
 *
 * Depending on how `SpecialCasedStyles` is interacted with, the start and end
 * styles may not be applied in the same way. This enum ensures that if and when
 * the ending styles are applied then the starting styles are applied. It is
 * also used to reflect what the current status of the special cased styles are
 * which helps prevent the starting/ending styles not be applied twice. It is
 * also used to cleanup the styles once `SpecialCasedStyles` is destroyed.
 */
const enum SpecialCasedStylesState {
  Pending = 0,
  Started = 1,
  Finished = 2,
  Destroyed = 3,
}

function filterNonAnimatableStyles(styles: {[key: string]: any}) {
  let result: {[key: string]: any}|null = null;
  const props = Object.keys(styles);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    if (isNonAnimatableStyle(prop)) {
      result = result || {};
      result[prop] = styles[prop];
    }
  }
  return result;
}

function isNonAnimatableStyle(prop: string) {
  return prop === 'display' || prop === 'position';
}
