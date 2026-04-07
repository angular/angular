/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import localeFr from '../../locales/fr';
import localeRo from '../../locales/ro';
import localeSr from '../../locales/sr';
import localeZgh from '../../locales/zgh';
import {getPluralCategory, NgLocaleLocalization, NgLocalization} from '../../src/i18n/localization';
import {LOCALE_ID, ɵregisterLocaleData, ɵunregisterLocaleData} from '@angular/core';
import {inject, TestBed} from '@angular/core/testing';

describe('l10n', () => {
  beforeAll(() => {
    ɵregisterLocaleData(localeRo);
    ɵregisterLocaleData(localeSr);
    ɵregisterLocaleData(localeZgh);
    ɵregisterLocaleData(localeFr);
  });

  afterAll(() => ɵunregisterLocaleData());

  describe('NgLocalization', () => {
    function roTests() {
      it('should return plural cases for the provided locale', inject(
        [NgLocalization],
        (l10n: NgLocalization) => {
          expect(l10n.getPluralCategory(0)).toEqual('few');
          expect(l10n.getPluralCategory(1)).toEqual('one');
          expect(l10n.getPluralCategory(1212)).toEqual('few');
          expect(l10n.getPluralCategory(1223)).toEqual('other');
        },
      ));
    }

    describe('ro', () => {
      beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [{provide: LOCALE_ID, useValue: 'ro'}],
        });
      });

      roTests();
    });

    function srTests() {
      it('should return plural cases for the provided locale', inject(
        [NgLocalization],
        (l10n: NgLocalization) => {
          expect(l10n.getPluralCategory(1)).toEqual('one');
          expect(l10n.getPluralCategory(2.1)).toEqual('one');

          expect(l10n.getPluralCategory(3)).toEqual('few');
          expect(l10n.getPluralCategory(0.2)).toEqual('few');

          expect(l10n.getPluralCategory(2.11)).toEqual('other');
          expect(l10n.getPluralCategory(2.12)).toEqual('other');
        },
      ));
    }

    describe('sr', () => {
      beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [{provide: LOCALE_ID, useValue: 'sr'}],
        });
      });

      srTests();
    });
  });

  describe('NgLocaleLocalization', () => {
    it('should return the correct values for the "en" locale', () => {
      const l10n = new NgLocaleLocalization('en-US');

      expect(l10n.getPluralCategory(0)).toEqual('other');
      expect(l10n.getPluralCategory(1)).toEqual('one');
      expect(l10n.getPluralCategory(2)).toEqual('other');
    });

    it('should return the correct values for the "ro" locale', () => {
      const l10n = new NgLocaleLocalization('ro');

      expect(l10n.getPluralCategory(0)).toEqual('few');
      expect(l10n.getPluralCategory(1)).toEqual('one');
      expect(l10n.getPluralCategory(2)).toEqual('few');
      expect(l10n.getPluralCategory(12)).toEqual('few');
      expect(l10n.getPluralCategory(23)).toEqual('other');
      expect(l10n.getPluralCategory(1212)).toEqual('few');
      expect(l10n.getPluralCategory(1223)).toEqual('other');
    });

    it('should return the correct values for the "sr" locale', () => {
      const l10n = new NgLocaleLocalization('sr');

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
      const l10n = new NgLocaleLocalization('zgh');

      expect(l10n.getPluralCategory(0)).toEqual('other');
      expect(l10n.getPluralCategory(1)).toEqual('other');
      expect(l10n.getPluralCategory(3)).toEqual('other');
      expect(l10n.getPluralCategory(5)).toEqual('other');
      expect(l10n.getPluralCategory(10)).toEqual('other');
    });
  });

  describe('getPluralCategory', () => {
    it('should return plural category', () => {
      const l10n = new NgLocaleLocalization('fr');

      expect(getPluralCategory(0, ['one', 'other'], l10n)).toEqual('one');
      expect(getPluralCategory(1, ['one', 'other'], l10n)).toEqual('one');
      expect(getPluralCategory(5, ['one', 'other'], l10n)).toEqual('other');
    });

    it('should return discrete cases', () => {
      const l10n = new NgLocaleLocalization('fr');

      expect(getPluralCategory(0, ['one', 'other', '=0'], l10n)).toEqual('=0');
      expect(getPluralCategory(1, ['one', 'other'], l10n)).toEqual('one');
      expect(getPluralCategory(5, ['one', 'other', '=5'], l10n)).toEqual('=5');
      expect(getPluralCategory(6, ['one', 'other', '=5'], l10n)).toEqual('other');
    });

    it('should fallback to other when the case is not present', () => {
      const l10n = new NgLocaleLocalization('ro');
      expect(getPluralCategory(1, ['one', 'other'], l10n)).toEqual('one');
      // 2 -> 'few'
      expect(getPluralCategory(2, ['one', 'other'], l10n)).toEqual('other');
    });

    describe('errors', () => {
      it('should report an error when the "other" category is not present', () => {
        expect(() => {
          const l10n = new NgLocaleLocalization('ro');
          // 2 -> 'few'
          getPluralCategory(2, ['one'], l10n);
        }).toThrowError('NG02308: No plural message found for value "2"');
      });
    });
  });
});
