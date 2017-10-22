/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {TestBed, inject} from '@angular/core/testing';
import {DeprecatedI18NPipesModule} from '../src/common_module';
import {Plural} from '../src/i18n/locale_data_api';
import {DEPRECATED_PLURAL_FN, getPluralCase} from '../src/i18n/localization';

export function main() {
  describe('DeprecatedI18NPipesModule', () => {
    beforeEach(() => { TestBed.configureTestingModule({imports: [DeprecatedI18NPipesModule]}); });

    it('should define the token DEPRECATED_PLURAL_FN',
       inject(
           [DEPRECATED_PLURAL_FN],
           (injectedGetPluralCase?: (locale: string, value: number | string) => Plural) => {
             expect(injectedGetPluralCase).toEqual(getPluralCase);
           }));
  });
}
