/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationPlayer} from '@angular/core';
import {MockAnimationPlayer} from '@angular/core/testing/testing_internal';
import {AnimationDriver} from '@angular/platform-browser';

import {ListWrapper} from './facade/collection';
import {AnimationKeyframe, AnimationStyles} from './private_import_core';

export class MockAnimationDriver extends AnimationDriver {
  public log: {[key: string]: any}[] = [];
  animate(
      element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[],
      duration: number, delay: number, easing: string,
      previousPlayers: AnimationPlayer[] = []): AnimationPlayer {
    const mockPlayers = <MockAnimationPlayer[]>previousPlayers.filter(
        player => player instanceof MockAnimationPlayer);
    const normalizedStartingStyles = _serializeStyles(startingStyles);
    const normalizedKeyframes = _serializeKeyframes(keyframes);
    const player =
        new MockAnimationPlayer(normalizedStartingStyles, normalizedKeyframes, previousPlayers);

    this.log.push({
      'element': element,
      'startingStyles': normalizedStartingStyles,
      'previousStyles': player.previousStyles,
      'keyframes': keyframes,
      'keyframeLookup': normalizedKeyframes,
      'duration': duration,
      'delay': delay,
      'easing': easing,
      'player': player
    });
    return player;
  }
}

function _serializeKeyframes(keyframes: AnimationKeyframe[]): any[] {
  return keyframes.map(keyframe => [keyframe.offset, _serializeStyles(keyframe.styles)]);
}

function _serializeStyles(styles: AnimationStyles): {[key: string]: any} {
  const flatStyles: {[key: string]: any} = {};
  styles.styles.forEach((entry: {[key: string]: string | number;}) => {
    Object.keys(entry).forEach(prop => { flatStyles[prop] = entry[prop]; });
  });
  return flatStyles;
}
