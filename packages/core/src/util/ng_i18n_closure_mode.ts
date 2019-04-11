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
      typeof global['goog'] !== 'undefined' && typeof global['goog'].getMsg === 'function';
}
