/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, ɵStyleData} from '@angular/animations';

import {allowPreviousPlayerStylesMerge, balancePreviousStylesIntoKeyframes, computeStyle} from '../../util';
import {AnimationDriver} from '../animation_driver';
import {containsElement, hypenatePropsObject, invokeQuery, matchesElement, validateStyleProperty} from '../shared';
import {packageNonAnimatableStyles} from '../special_cased_styles';

import {CssKeyframesPlayer} from './css_keyframes_player';
import {DirectStylePlayer} from './direct_style_player';

const KEYFRAMES_NAME_PREFIX = 'gen_css_kf_';
const TAB_SPACE = ' ';

export class CssKeyframesDriver implements AnimationDriver {
  private _count = 0;
  private readonly _head: any = document.querySelector('head');

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

  buildKeyframeElement(element: any, name: string, keyframes: {[key: string]: any}[]): any {
    keyframes = keyframes.map(kf => hypenatePropsObject(kf));
    let keyframeStr = `@keyframes ${name} {\n`;
    let tab = '';
    keyframes.forEach(kf => {
      tab = TAB_SPACE;
      const offset = parseFloat(kf['offset']);
      keyframeStr += `${tab}${offset * 100}% {\n`;
      tab += TAB_SPACE;
      Object.keys(kf).forEach(prop => {
        const value = kf[prop];
        switch (prop) {
          case 'offset':
            return;
          case 'easing':
            if (value) {
              keyframeStr += `${tab}animation-timing-function: ${value};\n`;
            }
            return;
          default:
            keyframeStr += `${tab}${prop}: ${value};\n`;
            return;
        }
      });
      keyframeStr += `${tab}}\n`;
    });
    keyframeStr += `}\n`;

    const kfElm = document.createElement('style');
    kfElm.textContent = keyframeStr;
    return kfElm;
  }

  animate(
      element: any, keyframes: ɵStyleData[], duration: number, delay: number, easing: string,
      previousPlayers: AnimationPlayer[] = [], scrubberAccessRequested?: boolean): AnimationPlayer {
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && scrubberAccessRequested) {
      notifyFaultyScrubber();
    }

    const previousCssKeyframePlayers = <CssKeyframesPlayer[]>previousPlayers.filter(
        player => player instanceof CssKeyframesPlayer);

    const previousStyles: {[key: string]: any} = {};

    if (allowPreviousPlayerStylesMerge(duration, delay)) {
      previousCssKeyframePlayers.forEach(player => {
        let styles = player.currentSnapshot;
        Object.keys(styles).forEach(prop => previousStyles[prop] = styles[prop]);
      });
    }

    keyframes = balancePreviousStylesIntoKeyframes(element, keyframes, previousStyles);
    const finalStyles = flattenKeyframesIntoStyles(keyframes);

    // if there is no animation then there is no point in applying
    // styles and waiting for an event to get fired. This causes lag.
    // It's better to just directly apply the styles to the element
    // via the direct styling animation player.
    if (duration == 0) {
      return new DirectStylePlayer(element, finalStyles);
    }

    const animationName = `${KEYFRAMES_NAME_PREFIX}${this._count++}`;
    const kfElm = this.buildKeyframeElement(element, animationName, keyframes);
    document.querySelector('head')!.appendChild(kfElm);

    const specialStyles = packageNonAnimatableStyles(element, keyframes);
    const player = new CssKeyframesPlayer(
        element, keyframes, animationName, duration, delay, easing, finalStyles, specialStyles);

    player.onDestroy(() => removeElement(kfElm));
    return player;
  }
}

function flattenKeyframesIntoStyles(keyframes: null|{[key: string]: any}|
                                    {[key: string]: any}[]): {[key: string]: any} {
  let flatKeyframes: {[key: string]: any} = {};
  if (keyframes) {
    const kfs = Array.isArray(keyframes) ? keyframes : [keyframes];
    kfs.forEach(kf => {
      Object.keys(kf).forEach(prop => {
        if (prop == 'offset' || prop == 'easing') return;
        flatKeyframes[prop] = kf[prop];
      });
    });
  }
  return flatKeyframes;
}

function removeElement(node: any) {
  node.parentNode.removeChild(node);
}

let warningIssued = false;
function notifyFaultyScrubber(): void {
  if (warningIssued) return;
  console.warn(
      '@angular/animations: please load the web-animations.js polyfill to allow programmatic access...\n',
      '  visit https://bit.ly/IWukam to learn more about using the web-animation-js polyfill.');
  warningIssued = true;
}
