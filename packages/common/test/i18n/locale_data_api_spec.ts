/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵregisterLocaleData, ɵunregisterLocaleData} from '@angular/core';

import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';
import localeZh from '@angular/common/locales/zh';
import localeEnAU from '@angular/common/locales/en-AU';
import {getCurrencySymbol, getLocaleDateFormat, FormatWidth, getNumberOfCurrencyDigits} from '../../src/i18n/locale_data_api';

{
  describe('locale data api', () => {
    beforeAll(() => {
      ɵregisterLocaleData(localeEn);
      ɵregisterLocaleData(localeFr);
      ɵregisterLocaleData(localeZh);
      ɵregisterLocaleData(localeEnAU);
    });

    afterAll(() => { ɵunregisterLocaleData(); });

    describe('getting currency symbol', () => {
      it('should return the correct symbol', () => {
        expect(getCurrencySymbol('USD', 'wide')).toEqual('$');
        expect(getCurrencySymbol('USD', 'narrow')).toEqual('$');
        expect(getCurrencySymbol('AUD', 'wide')).toEqual('A$');
        expect(getCurrencySymbol('AUD', 'narrow')).toEqual('$');
        expect(getCurrencySymbol('CRC', 'wide')).toEqual('CRC');
        expect(getCurrencySymbol('CRC', 'narrow')).toEqual('₡');
        expect(getCurrencySymbol('unexisting_ISO_code', 'wide')).toEqual('unexisting_ISO_code');
        expect(getCurrencySymbol('unexisting_ISO_code', 'narrow')).toEqual('unexisting_ISO_code');
        expect(getCurrencySymbol('USD', 'wide', 'en-AU')).toEqual('USD');
        expect(getCurrencySymbol('USD', 'narrow', 'en-AU')).toEqual('$');
        expect(getCurrencySymbol('AUD', 'wide', 'en-AU')).toEqual('$');
        expect(getCurrencySymbol('AUD', 'narrow', 'en-AU')).toEqual('$');
        expect(getCurrencySymbol('USD', 'wide', 'fr')).toEqual('$US');
      });
    });

    describe('getNbOfCurrencyDigits', () => {
      it('should return the correct value', () => {
        expect(getNumberOfCurrencyDigits('USD')).toEqual(2);
        expect(getNumberOfCurrencyDigits('IDR')).toEqual(0);
        expect(getNumberOfCurrencyDigits('BHD')).toEqual(3);
        expect(getNumberOfCurrencyDigits('unexisting_ISO_code')).toEqual(2);
      });
    });

    describe('getLastDefinedValue', () => {
      it('should find the last defined date format when format not defined',
         () => { expect(getLocaleDateFormat('zh', FormatWidth.Long)).toEqual('y年M月d日'); });
    });
  });
}
