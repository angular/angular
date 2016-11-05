/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isPresent} from '../facade/lang';
import {AnimationKeyframe, AnimationStyles} from '../private_import_core';

import {AnimationDriver} from './animation_driver';
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
  styles.styles.forEach(
      (entry) => { Object.keys(entry).forEach(prop => { data[prop] = entry[prop]; }); });
  Object.keys(defaultStyles).forEach(prop => {
    if (!isPresent(data[prop])) {
      data[prop] = defaultStyles[prop];
    }
  });
  return data;
}
