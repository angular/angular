/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parse5} from '@angular/cdk/schematics';

/**
 * List of known events which are supported by the "HammerGesturesPlugin" and by
 * the gesture config which was provided by Angular Material.
 */
const KNOWN_HAMMERJS_EVENTS = [
  // Events supported by the "HammerGesturesPlugin". See:
  // angular/angular/blob/0119f46d/packages/platform-browser/src/dom/events/hammer_gestures.ts#L19
  'pan', 'panstart', 'panmove', 'panend', 'pancancel', 'panleft', 'panright', 'panup', 'pandown',
  'pinch', 'pinchstart', 'pinchmove', 'pinchend', 'pinchcancel', 'pinchin', 'pinchout', 'press',
  'pressup', 'rotate', 'rotatestart', 'rotatemove', 'rotateend', 'rotatecancel', 'swipe',
  'swipeleft', 'swiperight', 'swipeup', 'swipedown', 'tap',

  // Events from the Angular Material gesture config.
  'longpress', 'slide', 'slidestart', 'slideend', 'slideright', 'slideleft'
];

/**
 * Parses the specified HTML and searches for elements with Angular outputs listening to
 * one of the known HammerJS events. This check naively assumes that the bindings never
 * match on a component output, but only on the Hammer plugin.
 */
export function isHammerJsUsedInTemplate(html: string): boolean {
  const document =
      parse5.parseFragment(html, {sourceCodeLocationInfo: true}) as parse5.DefaultTreeDocument;
  let result = false;
  const visitNodes = nodes => {
    nodes.forEach(node => {
      if (node.attrs &&
          node.attrs.some(attr => KNOWN_HAMMERJS_EVENTS.some(e => `(${e})` === attr.name))) {
        result = true;
      } else if (node.childNodes) {
        visitNodes(node.childNodes);
      }
    });
  };
  visitNodes(document.childNodes);
  return result;
}
