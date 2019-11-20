/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parse5} from '@angular/cdk/schematics';

/** List of known events which are supported by the "HammerGesturesPlugin". */
const STANDARD_HAMMERJS_EVENTS = [
  // Events supported by the "HammerGesturesPlugin". See:
  // angular/angular/blob/0119f46d/packages/platform-browser/src/dom/events/hammer_gestures.ts#L19
  'pan',       'panstart',    'panmove',    'panend',    'pancancel',    'panleft',
  'panright',  'panup',       'pandown',    'pinch',     'pinchstart',   'pinchmove',
  'pinchend',  'pinchcancel', 'pinchin',    'pinchout',  'press',        'pressup',
  'rotate',    'rotatestart', 'rotatemove', 'rotateend', 'rotatecancel', 'swipe',
  'swipeleft', 'swiperight',  'swipeup',    'swipedown', 'tap',
];

/** List of events which are provided by the deprecated Angular Material "GestureConfig". */
const CUSTOM_MATERIAL_HAMMERJS_EVENS =
    ['longpress', 'slide', 'slidestart', 'slideend', 'slideright', 'slideleft'];

/**
 * Parses the specified HTML and searches for elements with Angular outputs listening to
 * one of the known HammerJS events. This check naively assumes that the bindings never
 * match on a component output, but only on the Hammer plugin.
 */
export function isHammerJsUsedInTemplate(html: string):
    {standardEvents: boolean, customEvents: boolean} {
  const document =
      parse5.parseFragment(html, {sourceCodeLocationInfo: true}) as parse5.DefaultTreeDocument;
  let customEvents = false;
  let standardEvents = false;
  const visitNodes = nodes => {
    nodes.forEach((node: parse5.DefaultTreeElement) => {
      if (node.attrs) {
        for (let attr of node.attrs) {
          if (!customEvents && CUSTOM_MATERIAL_HAMMERJS_EVENS.some(e => `(${e})` === attr.name)) {
            customEvents = true;
          }
          if (!standardEvents && STANDARD_HAMMERJS_EVENTS.some(e => `(${e})` === attr.name)) {
            standardEvents = true;
          }
        }
      }

      // Do not continue traversing the AST if both type of HammerJS
      // usages have been detected already.
      if (node.childNodes && (!customEvents || !standardEvents)) {
        visitNodes(node.childNodes);
      }
    });
  };
  visitNodes(document.childNodes);
  return {customEvents, standardEvents};
}
