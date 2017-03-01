/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, ɵStyleData} from '@angular/animations';

import {AnimationDriver} from '../animation_driver';

import {WebAnimationsPlayer} from './web_animations_player';

export class WebAnimationsDriver implements AnimationDriver {
  animate(
      element: any, keyframes: ɵStyleData[], duration: number, delay: number, easing: string,
      previousPlayers: AnimationPlayer[] = []): WebAnimationsPlayer {
    const playerOptions: {[key: string]: string |
                              number} = {'duration': duration, 'delay': delay, 'fill': 'forwards'};

    // we check for this to avoid having a null|undefined value be present
    // for the easing (which results in an error for certain browsers #9752)
    if (easing) {
      playerOptions['easing'] = easing;
    }

    const previousWebAnimationPlayers = <WebAnimationsPlayer[]>previousPlayers.filter(
        player => { return player instanceof WebAnimationsPlayer; });
    return new WebAnimationsPlayer(element, keyframes, playerOptions, previousWebAnimationPlayers);
  }
}

export function supportsWebAnimations() {
  return typeof Element !== 'undefined' && typeof(<any>Element).prototype['animate'] === 'function';
}
