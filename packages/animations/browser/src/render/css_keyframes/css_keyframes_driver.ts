/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, ɵStyleDataMap} from '@angular/animations';

import {allowPreviousPlayerStylesMerge, balancePreviousStylesIntoKeyframes, normalizeKeyframes} from '../../util';
import {AnimationDriver} from '../animation_driver';
import {containsElement, hypenatePropsKeys, invokeQuery, validateStyleProperty} from '../shared';
import {packageNonAnimatableStyles} from '../special_cased_styles';

import {CssKeyframesPlayer} from './css_keyframes_player';
import {DirectStylePlayer} from './direct_style_player';

const KEYFRAMES_NAME_PREFIX = 'gen_css_kf_';
const TAB_SPACE = ' ';

export class CssKeyframesDriver implements AnimationDriver {
  private _count = 0;

  validateStyleProperty(prop: string): boolean {
    return validateStyleProperty(prop);
  }

  matchesElement(_element: any, _selector: string): boolean {
    // This method is deprecated and no longer in use so we return false.
    return false;
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

  buildKeyframeElement(element: any, name: string, keyframes: Array<ɵStyleDataMap>): any {
    keyframes = keyframes.map(kf => hypenatePropsKeys(kf));
    let keyframeStr = `@keyframes ${name} {\n`;
    let tab = '';
    keyframes.forEach(kf => {
      tab = TAB_SPACE;
      const offset = parseFloat(kf.get('offset') as string);
      keyframeStr += `${tab}${offset * 100}% {\n`;
      tab += TAB_SPACE;
      kf.forEach((value, prop) => {
        if (prop === 'offset') return;
        if (prop === 'easing') {
          if (value) {
            keyframeStr += `${tab}animation-timing-function: ${value};\n`;
          }
          return;
        }
        keyframeStr += `${tab}${prop}: ${value};\n`;
        return;
      });
      keyframeStr += `${tab}}\n`;
    });
    keyframeStr += `}\n`;

    const kfElm = document.createElement('style');
    kfElm.textContent = keyframeStr;
    return kfElm;
  }

  animate(
      element: any, keyframes: Array<Map<string, string|number>>, duration: number, delay: number,
      easing: string, previousPlayers: AnimationPlayer[] = [],
      scrubberAccessRequested?: boolean): AnimationPlayer {
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && scrubberAccessRequested) {
      notifyFaultyScrubber();
    }


    const previousCssKeyframePlayers = <CssKeyframesPlayer[]>previousPlayers.filter(
        player => player instanceof CssKeyframesPlayer);

    const previousStyles: ɵStyleDataMap = new Map();

    if (allowPreviousPlayerStylesMerge(duration, delay)) {
      previousCssKeyframePlayers.forEach(player => {
        player.currentSnapshot.forEach((val, prop) => previousStyles.set(prop, val));
      });
    }

    const _keyframes =
        balancePreviousStylesIntoKeyframes(element, normalizeKeyframes(keyframes), previousStyles);
    const finalStyles = flattenKeyframesIntoStyles(_keyframes);

    // if there is no animation then there is no point in applying
    // styles and waiting for an event to get fired. This causes lag.
    // It's better to just directly apply the styles to the element
    // via the direct styling animation player.
    if (duration == 0) {
      return new DirectStylePlayer(element, finalStyles);
    }

    const animationName = `${KEYFRAMES_NAME_PREFIX}${this._count++}`;
    const kfElm = this.buildKeyframeElement(element, animationName, _keyframes);
    const nodeToAppendKfElm = findNodeToAppendKeyframeElement(element);
    nodeToAppendKfElm.appendChild(kfElm);

    const specialStyles = packageNonAnimatableStyles(element, _keyframes);
    const player = new CssKeyframesPlayer(
        element, _keyframes, animationName, duration, delay, easing, finalStyles, specialStyles);

    player.onDestroy(() => removeElement(kfElm));
    return player;
  }
}

function findNodeToAppendKeyframeElement(element: any): Node {
  const rootNode = element.getRootNode?.();
  if (typeof ShadowRoot !== 'undefined' && rootNode instanceof ShadowRoot) {
    return rootNode;
  }
  return document.head;
}

function flattenKeyframesIntoStyles(keyframes: null|ɵStyleDataMap|
                                    Array<ɵStyleDataMap>): ɵStyleDataMap {
  let flatKeyframes: ɵStyleDataMap = new Map();
  if (keyframes) {
    const kfs = Array.isArray(keyframes) ? keyframes : [keyframes];
    kfs.forEach(kf => {
      kf.forEach((val, prop) => {
        if (prop === 'offset' || prop === 'easing') return;
        flatKeyframes.set(prop, val);
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
