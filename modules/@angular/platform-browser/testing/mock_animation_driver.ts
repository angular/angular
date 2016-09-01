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

import {StringMapWrapper} from './facade/collection';
import {AnimationKeyframe, AnimationStyles} from './private_import_core';

export class MockAnimationDriver extends AnimationDriver {
  public log: {[key: string]: any}[] = [];
  animate(
      element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[],
      duration: number, delay: number, easing: string): AnimationPlayer {
    var player = new MockAnimationPlayer();
    this.log.push({
      'element': element,
      'startingStyles': _serializeStyles(startingStyles),
      'keyframes': keyframes,
      'keyframeLookup': _serializeKeyframes(keyframes),
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
  var flatStyles: {[key: string]: any} = {};
  styles.styles.forEach((entry: {[key: string]: string | number;}) => {
    StringMapWrapper.forEach(entry, (val: any, prop: string) => { flatStyles[prop] = val; });
  });
  return flatStyles;
}
