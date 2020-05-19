/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, ɵStyleData} from '@angular/animations';

import {allowPreviousPlayerStylesMerge, balancePreviousStylesIntoKeyframes, copyStyles} from '../../util';
import {AnimationDriver} from '../animation_driver';
import {CssKeyframesDriver} from '../css_keyframes/css_keyframes_driver';
import {containsElement, invokeQuery, isBrowser, matchesElement, validateStyleProperty} from '../shared';
import {packageNonAnimatableStyles} from '../special_cased_styles';

import {WebAnimationsPlayer} from './web_animations_player';

export class WebAnimationsDriver implements AnimationDriver {
  private _isNativeImpl = /\{\s*\[native\s+code\]\s*\}/.test(getElementAnimateFn().toString());
  private _cssKeyframesDriver = new CssKeyframesDriver();

  validateStyleProperty(prop: string): boolean {
    return validateStyleProperty(prop);
  }

  matchesElement(element: any, selector: string): boolean {
    return matchesElement(element, selector);
  }

  containsElement(elm1: any, elm2: any): boolean {
    return containsElement(elm1, elm2);
  }

  query(element: any, selector: string, multi: boolean): any[] {
    return invokeQuery(element, selector, multi);
  }

  computeStyle(element: any, prop: string, defaultValue?: string): string {
    return (window.getComputedStyle(element) as any)[prop] as string;
  }

  overrideWebAnimationsSupport(supported: boolean) {
    this._isNativeImpl = supported;
  }

  animate(
      element: any, keyframes: ɵStyleData[], duration: number, delay: number, easing: string,
      previousPlayers: AnimationPlayer[] = [], scrubberAccessRequested?: boolean): AnimationPlayer {
    const useKeyframes = !scrubberAccessRequested && !this._isNativeImpl;
    if (useKeyframes) {
      return this._cssKeyframesDriver.animate(
          element, keyframes, duration, delay, easing, previousPlayers);
    }

    const fill = delay == 0 ? 'both' : 'forwards';
    const playerOptions: {[key: string]: string|number} = {duration, delay, fill};
    // we check for this to avoid having a null|undefined value be present
    // for the easing (which results in an error for certain browsers #9752)
    if (easing) {
      playerOptions['easing'] = easing;
    }

    const previousStyles: {[key: string]: any} = {};
    const previousWebAnimationPlayers = <WebAnimationsPlayer[]>previousPlayers.filter(
        player => player instanceof WebAnimationsPlayer);

    if (allowPreviousPlayerStylesMerge(duration, delay)) {
      previousWebAnimationPlayers.forEach(player => {
        let styles = player.currentSnapshot;
        Object.keys(styles).forEach(prop => previousStyles[prop] = styles[prop]);
      });
    }

    keyframes = keyframes.map(styles => copyStyles(styles, false));
    keyframes = balancePreviousStylesIntoKeyframes(element, keyframes, previousStyles);
    const specialStyles = packageNonAnimatableStyles(element, keyframes);
    return new WebAnimationsPlayer(element, keyframes, playerOptions, specialStyles);
  }
}

export function supportsWebAnimations() {
  return typeof getElementAnimateFn() === 'function';
}

function getElementAnimateFn(): any {
  return (isBrowser() && (<any>Element).prototype['animate']) || {};
}
