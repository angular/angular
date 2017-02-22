/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationPlayer, NoOpAnimationPlayer} from '@angular/animations';



/**
 * @experimental
 */
export class NoOpAnimationDriver implements AnimationDriver {
  animate(
      element: any, keyframes: {[key: string]: string | number}[], duration: number, delay: number,
      easing: string, previousPlayers: any[] = []): AnimationPlayer {
    return new NoOpAnimationPlayer();
  }
}

/**
 * @experimental
 */
export abstract class AnimationDriver {
  static NOOP: AnimationDriver = new NoOpAnimationDriver();
  abstract animate(
      element: any, keyframes: {[key: string]: string | number}[], duration: number, delay: number,
      easing: string, previousPlayers?: any[]): any;
}
