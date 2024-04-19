/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Needed to run animation tests
import '@angular/compiler'; // For JIT mode. Must be in front of any other @angular/* imports.

import {ɵgetDOM as getDOM} from '@angular/common';
import {DominoAdapter} from '@angular/platform-server/src/domino_adapter';

if (typeof window == 'undefined') {
  const domino = require('../../../platform-server/src/bundled-domino');

  DominoAdapter.makeCurrent();
  (global as any).document = getDOM().getDefaultDocument();

  // For animation tests, see
  // https://github.com/angular/angular/blob/main/packages/animations/browser/src/render/shared.ts#L140
  (global as any).Element = domino.impl.Element;
  (global as any).isBrowser = false;
  (global as any).isNode = true;
  (global as any).Event = domino.impl.Event;
}
