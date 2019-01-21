/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {DeprecatedI18NPipesModule, Plural} from '@angular/common';
import {DEPRECATED_PLURAL_FN, getPluralCase} from '@angular/common/src/i18n/localization';
import {TestBed, inject} from '@angular/core/testing';

describe('DeprecatedI18NPipesModule', () => {
  beforeEach(() => { TestBed.configureTestingModule({imports: [DeprecatedI18NPipesModule]}); });

  it('should define the token DEPRECATED_PLURAL_FN',
     inject(
         [DEPRECATED_PLURAL_FN],
         (injectedGetPluralCase?: (locale: string, value: number | string) => Plural) => {
           expect(injectedGetPluralCase).toEqual(getPluralCase);
         }));
});
