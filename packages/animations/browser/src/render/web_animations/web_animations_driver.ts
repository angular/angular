/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, ɵStyleDataMap} from '@angular/animations';

import {allowPreviousPlayerStylesMerge, balancePreviousStylesIntoKeyframes, camelCaseToDashCase, copyStyles, normalizeKeyframes} from '../../util';
import {AnimationDriver} from '../animation_driver';
import {containsElement, getParentElement, invokeQuery, validateStyleProperty, validateWebAnimatableStyleProperty} from '../shared';
import {packageNonAnimatableStyles} from '../special_cased_styles';

import {WebAnimationsPlayer} from './web_animations_player';

export class WebAnimationsDriver implements AnimationDriver {
  validateStyleProperty(prop: string): boolean {
    // Perform actual validation in dev mode only, in prod mode this check is a noop.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      return validateStyleProperty(prop);
    }
    return true;
  }

  validateAnimatableStyleProperty(prop: string): boolean {
    // Perform actual validation in dev mode only, in prod mode this check is a noop.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      const cssProp = camelCaseToDashCase(prop);
      return validateWebAnimatableStyleProperty(cssProp);
    }
    return true;
  }

  matchesElement(_element: any, _selector: string): boolean {
    // This method is deprecated and no longer in use so we return false.
    return false;
  }

  containsElement(elm1: any, elm2: any): boolean {
    return containsElement(elm1, elm2);
  }

  getParentElement(element: unknown): unknown {
    return getParentElement(element);
  }

  query(element: any, selector: string, multi: boolean): any[] {
    return invokeQuery(element, selector, multi);
  }

  computeStyle(element: any, prop: string, defaultValue?: string): string {
    return (window.getComputedStyle(element) as any)[prop] as string;
  }

  animate(
      element: any, keyframes: Array<Map<string, string|number>>, duration: number, delay: number,
      easing: string, previousPlayers: AnimationPlayer[] = []): AnimationPlayer {
    const fill = delay == 0 ? 'both' : 'forwards';
    const playerOptions: {[key: string]: string|number} = {duration, delay, fill};
    // we check for this to avoid having a null|undefined value be present
    // for the easing (which results in an error for certain browsers #9752)
    if (easing) {
      playerOptions['easing'] = easing;
    }

    const previousStyles: ɵStyleDataMap = new Map();
    const previousWebAnimationPlayers = <WebAnimationsPlayer[]>previousPlayers.filter(
        player => player instanceof WebAnimationsPlayer);
    if (allowPreviousPlayerStylesMerge(duration, delay)) {
      previousWebAnimationPlayers.forEach(player => {
        player.currentSnapshot.forEach((val, prop) => previousStyles.set(prop, val));
      });
    }

    let _keyframes = normalizeKeyframes(keyframes).map(styles => copyStyles(styles));
    _keyframes = balancePreviousStylesIntoKeyframes(element, _keyframes, previousStyles);
    const specialStyles = packageNonAnimatableStyles(element, _keyframes);
    return new WebAnimationsPlayer(element, _keyframes, playerOptions, specialStyles);
  }
}
