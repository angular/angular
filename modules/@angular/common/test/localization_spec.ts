/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncTestCompleter, afterEach, beforeEach, ddescribe, describe, iit, inject, it, xit} from '@angular/core/testing/testing_internal';
import {expect} from '@angular/platform-browser/testing/matchers';

import {NgLocaleLocalization, NgLocalization, getPluralCategory} from '../src/localization';


export function main() {
  describe('localization', () => {
    describe('NgLocaleLocalization', () => {
      it('should return the correct values for the "en" locale', () => {
        const localization = new NgLocaleLocalization('en_US');

        expect(localization.getPluralCategory(0)).toEqual('other');
        expect(localization.getPluralCategory(1)).toEqual('one');
        expect(localization.getPluralCategory(2)).toEqual('other');
      });

      it('should return the correct values for the "ro" locale', () => {
        const localization = new NgLocaleLocalization('ro');

        expect(localization.getPluralCategory(0)).toEqual('few');
        expect(localization.getPluralCategory(1)).toEqual('one');
        expect(localization.getPluralCategory(2)).toEqual('few');
        expect(localization.getPluralCategory(12)).toEqual('few');
        expect(localization.getPluralCategory(23)).toEqual('other');
        expect(localization.getPluralCategory(1212)).toEqual('few');
        expect(localization.getPluralCategory(1223)).toEqual('other');
      });

      it('should return the correct values for the "sr" locale', () => {
        const localization = new NgLocaleLocalization('sr');

        expect(localization.getPluralCategory(1)).toEqual('one');
        expect(localization.getPluralCategory(31)).toEqual('one');
        expect(localization.getPluralCategory(0.1)).toEqual('one');
        expect(localization.getPluralCategory(1.1)).toEqual('one');
        expect(localization.getPluralCategory(2.1)).toEqual('one');

        expect(localization.getPluralCategory(3)).toEqual('few');
        expect(localization.getPluralCategory(33)).toEqual('few');
        expect(localization.getPluralCategory(0.2)).toEqual('few');
        expect(localization.getPluralCategory(0.3)).toEqual('few');
        expect(localization.getPluralCategory(0.4)).toEqual('few');
        expect(localization.getPluralCategory(2.2)).toEqual('few');

        expect(localization.getPluralCategory(2.11)).toEqual('other');
        expect(localization.getPluralCategory(2.12)).toEqual('other');
        expect(localization.getPluralCategory(2.13)).toEqual('other');
        expect(localization.getPluralCategory(2.14)).toEqual('other');
        expect(localization.getPluralCategory(2.15)).toEqual('other');

        expect(localization.getPluralCategory(0)).toEqual('other');
        expect(localization.getPluralCategory(5)).toEqual('other');
        expect(localization.getPluralCategory(10)).toEqual('other');
        expect(localization.getPluralCategory(35)).toEqual('other');
        expect(localization.getPluralCategory(37)).toEqual('other');
        expect(localization.getPluralCategory(40)).toEqual('other');
        expect(localization.getPluralCategory(0.0)).toEqual('other');
        expect(localization.getPluralCategory(0.5)).toEqual('other');
        expect(localization.getPluralCategory(0.6)).toEqual('other');

        expect(localization.getPluralCategory(2)).toEqual('few');
        expect(localization.getPluralCategory(2.1)).toEqual('one');
        expect(localization.getPluralCategory(2.2)).toEqual('few');
        expect(localization.getPluralCategory(2.3)).toEqual('few');
        expect(localization.getPluralCategory(2.4)).toEqual('few');
        expect(localization.getPluralCategory(2.5)).toEqual('other');

        expect(localization.getPluralCategory(20)).toEqual('other');
        expect(localization.getPluralCategory(21)).toEqual('one');
        expect(localization.getPluralCategory(22)).toEqual('few');
        expect(localization.getPluralCategory(23)).toEqual('few');
        expect(localization.getPluralCategory(24)).toEqual('few');
        expect(localization.getPluralCategory(25)).toEqual('other');
      });
    });

    describe('getPluralCategory', () => {
      it('should return plural category', () => {
        const localization = new FrLocalization();

        expect(getPluralCategory(0, ['one', 'other'], localization)).toEqual('one');
        expect(getPluralCategory(1, ['one', 'other'], localization)).toEqual('one');
        expect(getPluralCategory(5, ['one', 'other'], localization)).toEqual('other');
      });

      it('should return discrete cases', () => {
        const localization = new FrLocalization();

        expect(getPluralCategory(0, ['one', 'other', '=0'], localization)).toEqual('=0');
        expect(getPluralCategory(1, ['one', 'other'], localization)).toEqual('one');
        expect(getPluralCategory(5, ['one', 'other', '=5'], localization)).toEqual('=5');
        expect(getPluralCategory(6, ['one', 'other', '=5'], localization)).toEqual('other');
      });
    });
  });
}

class FrLocalization extends NgLocalization {
  getPluralCategory(value: number): string {
    switch (value) {
      case 0:
      case 1:
        return 'one';
      default:
        return 'other';
    }
  }
}