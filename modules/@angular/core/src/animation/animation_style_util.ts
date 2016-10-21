/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StringMapWrapper} from '../facade/collection';
import {isPresent} from '../facade/lang';

import {FILL_STYLE_FLAG} from './animation_constants';
import {AUTO_STYLE} from './metadata';

export function prepareFinalAnimationStyles(
    previousStyles: {[key: string]: string | number}, newStyles: {[key: string]: string | number},
    nullValue: string = null): {[key: string]: string} {
  var finalStyles: {[key: string]: string} = {};

  Object.keys(newStyles).forEach(prop => {
    const value = newStyles[prop];
    finalStyles[prop] = value == AUTO_STYLE ? nullValue : value.toString();
  });

  Object.keys(previousStyles).forEach(prop => {
    if (!isPresent(finalStyles[prop])) {
      finalStyles[prop] = nullValue;
    }
  });

  return finalStyles;
}

export function balanceAnimationKeyframes(
    collectedStyles: {[key: string]: string | number},
    finalStateStyles: {[key: string]: string | number}, keyframes: any[]): any[] {
  var limit = keyframes.length - 1;
  var firstKeyframe = keyframes[0];

  // phase 1: copy all the styles from the first keyframe into the lookup map
  var flatenedFirstKeyframeStyles = flattenStyles(firstKeyframe.styles.styles);

  var extraFirstKeyframeStyles: {[key: string]: string} = {};
  var hasExtraFirstStyles = false;
  Object.keys(collectedStyles).forEach(prop => {
    const value = collectedStyles[prop] as string;
    // if the style is already defined in the first keyframe then
    // we do not replace it.
    if (!flatenedFirstKeyframeStyles[prop]) {
      flatenedFirstKeyframeStyles[prop] = value;
      extraFirstKeyframeStyles[prop] = value;
      hasExtraFirstStyles = true;
    }
  });

  var keyframeCollectedStyles = StringMapWrapper.merge({}, flatenedFirstKeyframeStyles);

  // phase 2: normalize the final keyframe
  var finalKeyframe = keyframes[limit];
  finalKeyframe.styles.styles.unshift(finalStateStyles);

  var flatenedFinalKeyframeStyles = flattenStyles(finalKeyframe.styles.styles);
  var extraFinalKeyframeStyles: {[key: string]: string} = {};
  var hasExtraFinalStyles = false;
  Object.keys(keyframeCollectedStyles).forEach(prop => {
    if (!isPresent(flatenedFinalKeyframeStyles[prop])) {
      extraFinalKeyframeStyles[prop] = AUTO_STYLE;
      hasExtraFinalStyles = true;
    }
  });

  if (hasExtraFinalStyles) {
    finalKeyframe.styles.styles.push(extraFinalKeyframeStyles);
  }

  Object.keys(flatenedFinalKeyframeStyles).forEach(prop => {
    if (!isPresent(flatenedFirstKeyframeStyles[prop])) {
      extraFirstKeyframeStyles[prop] = AUTO_STYLE;
      hasExtraFirstStyles = true;
    }
  });

  if (hasExtraFirstStyles) {
    firstKeyframe.styles.styles.push(extraFirstKeyframeStyles);
  }

  return keyframes;
}

export function clearStyles(styles: {[key: string]: string | number}): {[key: string]: string} {
  var finalStyles: {[key: string]: string} = {};
  Object.keys(styles).forEach(key => { finalStyles[key] = null; });
  return finalStyles;
}

export function collectAndResolveStyles(
    collection: {[key: string]: string | number}, styles: {[key: string]: string | number}[]) {
  return styles.map(entry => {
    var stylesObj: {[key: string]: string | number} = {};
    Object.keys(entry).forEach(prop => {
      let value = entry[prop];
      if (value == FILL_STYLE_FLAG) {
        value = collection[prop];
        if (!isPresent(value)) {
          value = AUTO_STYLE;
        }
      }
      collection[prop] = value;
      stylesObj[prop] = value;
    });
    return stylesObj;
  });
}

export function renderStyles(
    element: any, renderer: any, styles: {[key: string]: string | number}): void {
  Object.keys(styles).forEach(prop => { renderer.setElementStyle(element, prop, styles[prop]); });
}

export function flattenStyles(styles: {[key: string]: string | number}[]): {[key: string]: string} {
  var finalStyles: {[key: string]: string} = {};
  styles.forEach(entry => {
    Object.keys(entry).forEach(prop => { finalStyles[prop] = entry[prop] as string; });
  });
  return finalStyles;
}
