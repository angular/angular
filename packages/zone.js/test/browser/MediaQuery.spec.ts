/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {zoneSymbol} from '../../lib/common/utils';
import {ifEnvSupports} from '../test-util';
declare const global: any;

function supportMediaQuery() {
  const _global =
    (typeof window === 'object' && window) || (typeof self === 'object' && self) || global;
  return _global['MediaQueryList'] && _global['matchMedia'];
}

describe(
  'test mediaQuery patch',
  ifEnvSupports(supportMediaQuery, () => {
    it('test whether addListener is patched', () => {
      const mqList = window.matchMedia('min-width:500px');
      if (mqList && mqList['addListener']) {
        expect((mqList as any)[zoneSymbol('addListener')]).toBeTruthy();
      }
    });
  }),
);
