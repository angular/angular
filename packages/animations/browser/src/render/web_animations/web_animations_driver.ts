/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, ɵStyleData} from '@angular/animations';

import {AnimationDriver} from '../animation_driver';
import {containsElement, invokeQuery, matchesElement, validateStyleProperty} from '../shared';

import {WebAnimationsPlayer} from './web_animations_player';

export class WebAnimationsDriver implements AnimationDriver {
  validateStyleProperty(prop: string): boolean { return validateStyleProperty(prop); }

  matchesElement(element: any, selector: string): boolean {
    return matchesElement(element, selector);
  }

  containsElement(elm1: any, elm2: any): boolean { return containsElement(elm1, elm2); }

  query(element: any, selector: string, multi: boolean): any[] {
    return invokeQuery(element, selector, multi);
  }

  computeStyle(element: any, prop: string, defaultValue?: string): string {
    return (window.getComputedStyle(element) as any)[prop] as string;
  }

  animate(
      element: any, keyframes: ɵStyleData[], duration: number, delay: number, easing: string,
      previousPlayers: AnimationPlayer[] = []): WebAnimationsPlayer {
    const fill = delay == 0 ? 'both' : 'forwards';
    const playerOptions: {[key: string]: string | number} = {duration, delay, fill};

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
