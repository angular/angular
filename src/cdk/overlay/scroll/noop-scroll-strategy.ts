/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ScrollStrategy} from './scroll-strategy';

/**
 * Scroll strategy that doesn't do anything.
 */
export class NoopScrollStrategy implements ScrollStrategy {
  enable() { }
  disable() { }
  attach() { }
}
