/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {global} from './global';

declare global {
  const ngI18nClosureMode: boolean;
}

if (typeof global['ngI18nClosureMode'] === 'undefined') {
  // Make sure to refer to ngI18nClosureMode as ['ngI18nClosureMode'] for closure.
  global['ngI18nClosureMode'] =
      // TODO(FW-1250): validate that this actually, you know, works.
      typeof goog !== 'undefined' && typeof goog.getMsg === 'function';
}
