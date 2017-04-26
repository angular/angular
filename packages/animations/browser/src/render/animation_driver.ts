/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵStyleData} from '@angular/animations';
import {AnimationPlayer, NoopAnimationPlayer} from '@angular/animations';



/**
 * @experimental
 */
export class NoopAnimationDriver implements AnimationDriver {
  computeStyle(element: any, prop: string, defaultValue?: string): string {
    return defaultValue || '';
  }

  animate(
      element: any, keyframes: {[key: string]: string | number}[], duration: number, delay: number,
      easing: string, previousPlayers: any[] = []): AnimationPlayer {
    return new NoopAnimationPlayer();
  }
}

/**
 * @experimental
 */
export abstract class AnimationDriver {
  static NOOP: AnimationDriver = new NoopAnimationDriver();

  abstract computeStyle(element: any, prop: string, defaultValue?: string): string;

  abstract animate(
      element: any, keyframes: {[key: string]: string | number}[], duration: number, delay: number,
      easing?: string|null, previousPlayers?: any[]): any;
}
