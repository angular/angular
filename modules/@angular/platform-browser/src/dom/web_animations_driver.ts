/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AUTO_STYLE} from '@angular/core';

import {StringMapWrapper} from '../facade/collection';
import {StringWrapper, isNumber, isPresent} from '../facade/lang';
import {AnimationKeyframe, AnimationStyles} from '../private_import_core';

import {AnimationDriver} from './animation_driver';
import {dashCaseToCamelCase} from './util';
import {WebAnimationsPlayer} from './web_animations_player';

export class WebAnimationsDriver implements AnimationDriver {
  animate(
      element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[],
      duration: number, delay: number, easing: string): WebAnimationsPlayer {
    var formattedSteps: {[key: string]: string | number}[] = [];
    var startingStyleLookup: {[key: string]: string | number} = {};
    if (isPresent(startingStyles) && startingStyles.styles.length > 0) {
      startingStyleLookup = _populateStyles(element, startingStyles, {});
      startingStyleLookup['offset'] = 0;
      formattedSteps.push(startingStyleLookup);
    }

    keyframes.forEach((keyframe: AnimationKeyframe) => {
      let data = _populateStyles(element, keyframe.styles, startingStyleLookup);
      data['offset'] = keyframe.offset;
      formattedSteps.push(data);
    });

    // this is a special case when only styles are applied as an
    // animation. When this occurs we want to animate from start to
    // end with the same values. Removing the offset and having only
    // start/end values is suitable enough for the web-animations API
    if (formattedSteps.length == 1) {
      var start = formattedSteps[0];
      start['offset'] = null;
      formattedSteps = [start, start];
    }

    var playerOptions: {[key: string]: string | number} = {
      'duration': duration,
      'delay': delay,
      'fill': 'both'  // we use `both` because it allows for styling at 0% to work with `delay`
    };

    // we check for this to avoid having a null|undefined value be present
    // for the easing (which results in an error for certain browsers #9752)
    if (easing) {
      playerOptions['easing'] = easing;
    }

    return new WebAnimationsPlayer(element, formattedSteps, playerOptions);
  }
}

function _populateStyles(
    element: any, styles: AnimationStyles,
    defaultStyles: {[key: string]: string | number}): {[key: string]: string | number} {
  var data: {[key: string]: string | number} = {};
  styles.styles.forEach((entry) => {
    StringMapWrapper.forEach(entry, (val: any, prop: string) => {
      var formattedProp = dashCaseToCamelCase(prop);
      data[formattedProp] =
          val == AUTO_STYLE ? val : val.toString() + _resolveStyleUnit(val, prop, formattedProp);
    });
  });
  StringMapWrapper.forEach(defaultStyles, (value: string, prop: string) => {
    if (!isPresent(data[prop])) {
      data[prop] = value;
    }
  });
  return data;
}

function _resolveStyleUnit(
    val: string | number, userProvidedProp: string, formattedProp: string): string {
  var unit = '';
  if (_isPixelDimensionStyle(formattedProp) && val != 0 && val != '0') {
    if (isNumber(val)) {
      unit = 'px';
    } else if (_findDimensionalSuffix(val.toString()).length == 0) {
      throw new Error('Please provide a CSS unit value for ' + userProvidedProp + ':' + val);
    }
  }
  return unit;
}

const _$0 = 48;
const _$9 = 57;
const _$PERIOD = 46;

function _findDimensionalSuffix(value: string): string {
  for (var i = 0; i < value.length; i++) {
    var c = StringWrapper.charCodeAt(value, i);
    if ((c >= _$0 && c <= _$9) || c == _$PERIOD) continue;
    return value.substring(i, value.length);
  }
  return '';
}

function _isPixelDimensionStyle(prop: string): boolean {
  switch (prop) {
    case 'width':
    case 'height':
    case 'minWidth':
    case 'minHeight':
    case 'maxWidth':
    case 'maxHeight':
    case 'left':
    case 'top':
    case 'bottom':
    case 'right':
    case 'fontSize':
    case 'outlineWidth':
    case 'outlineOffset':
    case 'paddingTop':
    case 'paddingLeft':
    case 'paddingBottom':
    case 'paddingRight':
    case 'marginTop':
    case 'marginLeft':
    case 'marginBottom':
    case 'marginRight':
    case 'borderRadius':
    case 'borderWidth':
    case 'borderTopWidth':
    case 'borderLeftWidth':
    case 'borderRightWidth':
    case 'borderBottomWidth':
    case 'textIndent':
      return true;

    default:
      return false;
  }
}
