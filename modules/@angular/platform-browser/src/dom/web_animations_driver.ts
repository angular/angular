/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationPlayer} from '@angular/core';
import {isPresent} from '../facade/lang';
import {AnimationKeyframe, AnimationStyles} from '../private_import_core';

import {AnimationDriver} from './animation_driver';
import {WebAnimationsPlayer} from './web_animations_player';

export class WebAnimationsDriver implements AnimationDriver {
  animate(
      element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[],
      duration: number, delay: number, easing: string,
      previousPlayers: AnimationPlayer[] = []): WebAnimationsPlayer {
    let formattedSteps: {[key: string]: string | number}[] = [];
    let startingStyleLookup: {[key: string]: string | number} = {};
    if (isPresent(startingStyles)) {
      startingStyleLookup = _populateStyles(startingStyles, {});
    }

    keyframes.forEach((keyframe: AnimationKeyframe) => {
      const data = _populateStyles(keyframe.styles, startingStyleLookup);
      data['offset'] = Math.max(0, Math.min(1, keyframe.offset));
      formattedSteps.push(data);
    });

    // Styling passed into element.animate() must always be balanced.
    // The special cases below can occur if only style() calls exist
    // within an animation or when a style() calls are used prior
    // to a group() animation being issued or if the renderer is
    // invoked by the user directly.
    if (formattedSteps.length == 0) {
      formattedSteps = [startingStyleLookup, startingStyleLookup];
    } else if (formattedSteps.length == 1) {
      const start = startingStyleLookup;
      const end = formattedSteps[0];
      end['offset'] = null;
      formattedSteps = [start, end];
    }

    const playerOptions: {[key: string]: string | number} = {
      'duration': duration,
      'delay': delay,
      'fill': 'both'  // we use `both` because it allows for styling at 0% to work with `delay`
    };

    // we check for this to avoid having a null|undefined value be present
    // for the easing (which results in an error for certain browsers #9752)
    if (easing) {
      playerOptions['easing'] = easing;
    }

    // there may be a chance a NoOp player is returned depending
    // on when the previous animation was cancelled
    previousPlayers = previousPlayers.filter(filterWebAnimationPlayerFn);
    return new WebAnimationsPlayer(
        element, formattedSteps, playerOptions, <WebAnimationsPlayer[]>previousPlayers);
  }
}

function _populateStyles(styles: AnimationStyles, defaultStyles: {[key: string]: string | number}):
    {[key: string]: string | number} {
  const data: {[key: string]: string | number} = {};
  styles.styles.forEach(
      (entry) => { Object.keys(entry).forEach(prop => { data[prop] = entry[prop]; }); });
  Object.keys(defaultStyles).forEach(prop => {
    if (!isPresent(data[prop])) {
      data[prop] = defaultStyles[prop];
    }
  });
  return data;
}

function filterWebAnimationPlayerFn(player: AnimationPlayer) {
  return player instanceof WebAnimationsPlayer;
}
