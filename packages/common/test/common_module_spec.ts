/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {TestBed, inject} from '@angular/core/testing';
import {DeprecatedI18NPipesModule} from '../src/common_module';
import {USE_V4_PLURALS} from '../src/i18n/localization';

export function main() {
  describe('DeprecatedI18NPipesModule', () => {
    beforeEach(() => { TestBed.configureTestingModule({imports: [DeprecatedI18NPipesModule]}); });

    it('should define the token USE_V4_PLURALS to true',
       inject([USE_V4_PLURALS], (useV4Plurals: true) => { expect(useV4Plurals).toEqual(true); }));
  });
}
