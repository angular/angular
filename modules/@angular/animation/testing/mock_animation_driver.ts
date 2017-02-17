/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, ɵNoOpAnimationPlayer} from '@angular/core';
import {StyleData} from '../src/common/style_data';
import {AnimationDriver} from '../src/engine/animation_driver';

export class MockAnimationDriver implements AnimationDriver {
  static log: AnimationPlayer[] = [];

  animate(
      element: any, keyframes: StyleData[], duration: number, delay: number, easing: string,
      previousPlayers: AnimationPlayer[] = []): AnimationPlayer {
    const player =
        new MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers);
    MockAnimationDriver.log.push(<AnimationPlayer>player);
    return <AnimationPlayer>player;
  }
}

export class MockAnimationPlayer extends ɵNoOpAnimationPlayer {
  constructor(
      public element: any, public keyframes: StyleData[], public duration: number,
      public delay: number, public easing: string, public previousPlayers: AnimationPlayer[]) {
    super();
  }
}
