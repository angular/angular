/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵExternalCoreGlobalUtils} from '@angular/core';
import {getDirectiveCdStrategy} from './directive';
import {ChangeDetectionStrategy, Framework} from '../core-enums';

type Ng = ɵExternalCoreGlobalUtils;

describe('directive utils', () => {
  afterEach(() => {
    delete (globalThis as any).ng;
  });

  describe('getDirectiveCdStrategy', () => {
    it('returns change detection strategy when passed valid component', () => {
      const ng: Partial<Ng> = {
        getDirectiveMetadata: jasmine.createSpy('getDirectiveMetadata').and.returnValue({
          framework: Framework.Angular,
          changeDetection: ChangeDetectionStrategy.OnPush,
        } as any),
      };
      (globalThis as any).ng = ng;

      const result = getDirectiveCdStrategy({
        instance: {},
        name: 'Foo',
        isElement: false,
      });
      expect(result).toBe('ng-on-push');
    });
  });
});
