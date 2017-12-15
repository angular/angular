/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Needed to run animation tests
require('zone.js/dist/zone-node.js');

if (typeof window == 'undefined') {
  const domino = require('domino');
  const createWindow = domino.createWindow;
  const window = createWindow('', 'http://localhost');
  (global as any).document = window.document;

  // Trick to avoid Event patching from
  // https://github.com/angular/angular/blob/7cf5e95ac9f0f2648beebf0d5bd9056b79946970/packages/platform-browser/src/dom/events/dom_events.ts#L112-L132
  // It fails with Domino with TypeError: Cannot assign to read only property
  // 'stopImmediatePropagation' of object '#<Event>'
  (global as any).Event = null;

  // For animation tests, see
  // https://github.com/angular/angular/blob/master/packages/animations/browser/src/render/shared.ts#L140
  (global as any).Element = domino.impl.Element;
}
