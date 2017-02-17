/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationPlayer, ɵNoOpAnimationPlayer} from '@angular/core';
import {StyleData} from '../common/style_data';

/**
 * @experimental
 */
export class NoOpAnimationDriver implements AnimationDriver {
  animate(
      element: any, keyframes: StyleData[], duration: number, delay: number, easing: string,
      previousPlayers: AnimationPlayer[] = []): AnimationPlayer {
    return new ɵNoOpAnimationPlayer();
  }
}

/**
 * @experimental
 */
export abstract class AnimationDriver {
  static NOOP: AnimationDriver = new NoOpAnimationDriver();
  abstract animate(
      element: any, keyframes: StyleData[], duration: number, delay: number, easing: string,
      previousPlayers?: AnimationPlayer[]): AnimationPlayer;
}
