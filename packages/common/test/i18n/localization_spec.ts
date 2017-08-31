/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import localeRo from '../../locales/ro';
import localeSr from '../../locales/sr';
import localeZgh from '../../locales/zgh';
import localeFr from '../../locales/fr';
import {LOCALE_ID} from '@angular/core';
import {TestBed, inject} from '@angular/core/testing';
import {NgLocaleLocalization, NgLocalization, getPluralCategory, USE_V4_PLURALS} from '../../src/i18n/localization';
import {registerLocaleData} from '../../src/i18n/locale_data';

export function main() {
  describe('l10n', () => {
    beforeAll(() => {
      registerLocaleData(localeRo);
      registerLocaleData(localeSr);
      registerLocaleData(localeZgh);
      registerLocaleData(localeFr);
    });

    describe('NgLocalization', () => {
      function roTests() {
        it('should return plural cases for the provided locale',
           inject([NgLocalization], (l10n: NgLocalization) => {
             expect(l10n.getPluralCategory(0)).toEqual('few');
             expect(l10n.getPluralCategory(1)).toEqual('one');
             expect(l10n.getPluralCategory(1212)).toEqual('few');
             expect(l10n.getPluralCategory(1223)).toEqual('other');
           }));
      }

      describe('ro', () => {
        beforeEach(() => {
          TestBed.configureTestingModule({
            providers: [{provide: LOCALE_ID, useValue: 'ro'}],
          });
        });

        roTests();
      });

      describe('ro with v4 plurals', () => {
        beforeEach(() => {
          TestBed.configureTestingModule({
            providers:
                [{provide: LOCALE_ID, useValue: 'ro'}, {provide: USE_V4_PLURALS, useValue: true}],
          });
        });

        roTests();
      });

      function srTests() {
        it('should return plural cases for the provided locale',
           inject([NgLocalization], (l10n: NgLocalization) => {
             expect(l10n.getPluralCategory(1)).toEqual('one');
             expect(l10n.getPluralCategory(2.1)).toEqual('one');

             expect(l10n.getPluralCategory(3)).toEqual('few');
             expect(l10n.getPluralCategory(0.2)).toEqual('few');

             expect(l10n.getPluralCategory(2.11)).toEqual('other');
             expect(l10n.getPluralCategory(2.12)).toEqual('other');
           }));
      }

      describe('sr', () => {
        beforeEach(() => {
          TestBed.configureTestingModule({
            providers: [{provide: LOCALE_ID, useValue: 'sr'}],
          });
        });

        srTests();
      });

      describe('sr with v4 plurals', () => {
        beforeEach(() => {
          TestBed.configureTestingModule({
            providers:
                [{provide: LOCALE_ID, useValue: 'sr'}, {provide: USE_V4_PLURALS, useValue: true}],
          });
        });

        srTests();
      });
    });

    describe('NgLocaleLocalization', () => {
      function ngLocaleLocalizationTests(useV4Plurals: boolean) {
        it('should return the correct values for the "en" locale', () => {
          const l10n = new NgLocaleLocalization('en-US', useV4Plurals);

          expect(l10n.getPluralCategory(0)).toEqual('other');
          expect(l10n.getPluralCategory(1)).toEqual('one');
          expect(l10n.getPluralCategory(2)).toEqual('other');
        });

        it('should return the correct values for the "ro" locale', () => {
          const l10n = new NgLocaleLocalization('ro', useV4Plurals);

          expect(l10n.getPluralCategory(0)).toEqual('few');
          expect(l10n.getPluralCategory(1)).toEqual('one');
          expect(l10n.getPluralCategory(2)).toEqual('few');
          expect(l10n.getPluralCategory(12)).toEqual('few');
          expect(l10n.getPluralCategory(23)).toEqual('other');
          expect(l10n.getPluralCategory(1212)).toEqual('few');
          expect(l10n.getPluralCategory(1223)).toEqual('other');
        });

        it('should return the correct values for the "sr" locale', () => {
          const l10n = new NgLocaleLocalization('sr', useV4Plurals);

          expect(l10n.getPluralCategory(1)).toEqual('one');
          expect(l10n.getPluralCategory(31)).toEqual('one');
          expect(l10n.getPluralCategory(0.1)).toEqual('one');
          expect(l10n.getPluralCategory(1.1)).toEqual('one');
          expect(l10n.getPluralCategory(2.1)).toEqual('one');

          expect(l10n.getPluralCategory(3)).toEqual('few');
          expect(l10n.getPluralCategory(33)).toEqual('few');
          expect(l10n.getPluralCategory(0.2)).toEqual('few');
          expect(l10n.getPluralCategory(0.3)).toEqual('few');
          expect(l10n.getPluralCategory(0.4)).toEqual('few');
          expect(l10n.getPluralCategory(2.2)).toEqual('few');

          expect(l10n.getPluralCategory(2.11)).toEqual('other');
          expect(l10n.getPluralCategory(2.12)).toEqual('other');
          expect(l10n.getPluralCategory(2.13)).toEqual('other');
          expect(l10n.getPluralCategory(2.14)).toEqual('other');
          expect(l10n.getPluralCategory(2.15)).toEqual('other');

          expect(l10n.getPluralCategory(0)).toEqual('other');
          expect(l10n.getPluralCategory(5)).toEqual('other');
          expect(l10n.getPluralCategory(10)).toEqual('other');
          expect(l10n.getPluralCategory(35)).toEqual('other');
          expect(l10n.getPluralCategory(37)).toEqual('other');
          expect(l10n.getPluralCategory(40)).toEqual('other');
          expect(l10n.getPluralCategory(0.0)).toEqual('other');
          expect(l10n.getPluralCategory(0.5)).toEqual('other');
          expect(l10n.getPluralCategory(0.6)).toEqual('other');

          expect(l10n.getPluralCategory(2)).toEqual('few');
          expect(l10n.getPluralCategory(2.1)).toEqual('one');
          expect(l10n.getPluralCategory(2.2)).toEqual('few');
          expect(l10n.getPluralCategory(2.3)).toEqual('few');
          expect(l10n.getPluralCategory(2.4)).toEqual('few');
          expect(l10n.getPluralCategory(2.5)).toEqual('other');

          expect(l10n.getPluralCategory(20)).toEqual('other');
          expect(l10n.getPluralCategory(21)).toEqual('one');
          expect(l10n.getPluralCategory(22)).toEqual('few');
          expect(l10n.getPluralCategory(23)).toEqual('few');
          expect(l10n.getPluralCategory(24)).toEqual('few');
          expect(l10n.getPluralCategory(25)).toEqual('other');
        });

        it('should return the default value for a locale with no rule', () => {
          const l10n = new NgLocaleLocalization('zgh', useV4Plurals);

          expect(l10n.getPluralCategory(0)).toEqual('other');
          expect(l10n.getPluralCategory(1)).toEqual('other');
          expect(l10n.getPluralCategory(3)).toEqual('other');
          expect(l10n.getPluralCategory(5)).toEqual('other');
          expect(l10n.getPluralCategory(10)).toEqual('other');
        });
      }

      ngLocaleLocalizationTests(true);
      ngLocaleLocalizationTests(false);
    });

    function pluralCategoryTests(useV4Plurals: boolean) {
      it('should return plural category', () => {
        const l10n = new NgLocaleLocalization('fr', useV4Plurals);

        expect(getPluralCategory(0, ['one', 'other'], l10n)).toEqual('one');
        expect(getPluralCategory(1, ['one', 'other'], l10n)).toEqual('one');
        expect(getPluralCategory(5, ['one', 'other'], l10n)).toEqual('other');
      });

      it('should return discrete cases', () => {
        const l10n = new NgLocaleLocalization('fr', useV4Plurals);

        expect(getPluralCategory(0, ['one', 'other', '=0'], l10n)).toEqual('=0');
        expect(getPluralCategory(1, ['one', 'other'], l10n)).toEqual('one');
        expect(getPluralCategory(5, ['one', 'other', '=5'], l10n)).toEqual('=5');
        expect(getPluralCategory(6, ['one', 'other', '=5'], l10n)).toEqual('other');
      });

      it('should fallback to other when the case is not present', () => {
        const l10n = new NgLocaleLocalization('ro', useV4Plurals);
        expect(getPluralCategory(1, ['one', 'other'], l10n)).toEqual('one');
        // 2 -> 'few'
        expect(getPluralCategory(2, ['one', 'other'], l10n)).toEqual('other');
      });

      describe('errors', () => {
        it('should report an error when the "other" category is not present', () => {
          expect(() => {
            const l10n = new NgLocaleLocalization('ro', useV4Plurals);
            // 2 -> 'few'
            getPluralCategory(2, ['one'], l10n);
          }).toThrowError('No plural message found for value "2"');
        });
      });
    }

    describe('getPluralCategory', () => {
      pluralCategoryTests(false);
      pluralCategoryTests(true);
    });
  });
}
