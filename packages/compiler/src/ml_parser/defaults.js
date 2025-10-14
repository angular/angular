/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {assertInterpolationSymbols} from '../assertions';
export class InterpolationConfig {
  static fromArray(markers) {
    if (!markers) {
      return DEFAULT_INTERPOLATION_CONFIG;
    }
    assertInterpolationSymbols('interpolation', markers);
    return new InterpolationConfig(markers[0], markers[1]);
  }
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
}
export const DEFAULT_INTERPOLATION_CONFIG = new InterpolationConfig('{{', '}}');
export const DEFAULT_CONTAINER_BLOCKS = new Set(['switch']);
//# sourceMappingURL=defaults.js.map
