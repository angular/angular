/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵLOCALE_DATA, ɵLocaleDataIndex, ɵfindLocaleData as findLocaleData, ɵglobal} from '@angular/core';
import localeCaESVALENCIA from '@angular/common/locales/ca-ES-VALENCIA';
import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';
import localeZh from '@angular/common/locales/zh';
import localeFrCA from '@angular/common/locales/fr-CA';
import localeEnAU from '@angular/common/locales/en-AU';
import localeDe from '@angular/common/locales/de';
import localeDeCH from '@angular/common/locales/de-CH';
import localeDeExtra from '@angular/common/locales/extra/de';
import {registerLocaleData} from '../../src/i18n/locale_data';
import {getCurrencySymbol, getLocaleDateFormat, FormatWidth, getNumberOfCurrencyDigits} from '../../src/i18n/locale_data_api';

{
  describe('locale data api', () => {
    const fakeGlobalFr: any[] = [];
    beforeAll(() => {
      registerLocaleData(localeCaESVALENCIA);
      registerLocaleData(localeEn);
      registerLocaleData(localeFr);
      registerLocaleData(localeFrCA);
      registerLocaleData(localeFr, 'fake-id');
      registerLocaleData(localeFrCA, 'fake_Id2');
      registerLocaleData(localeZh);
      registerLocaleData(localeEnAU);
      ɵglobal.ng = {common: {locale: {}}};
      ɵglobal.ng.common.locale['fr'] = fakeGlobalFr;
      ɵglobal.ng.common.locale['de'] = localeDe;
      ɵglobal.ng.common.locale['de-CH'] = localeDeCH;
      ɵglobal.ng.common.locale['extra/de'] = localeDeExtra;
    });

    afterAll(() => {
      // Clear out the loaded locales
      delete ɵglobal.ng.common.locale;
      for (const key in ɵLOCALE_DATA) {
        delete ɵLOCALE_DATA[key];
      }
    });

    describe('findLocaleData', () => {
      it('should throw if the LOCALE_DATA for the chosen locale or its parent locale is not available',
         () => {
           expect(() => findLocaleData('pt-AO'))
               .toThrowError(/Missing locale data for the locale "pt-AO"/);
         });

      it('should return english data if the locale is en-US',
         () => { expect(findLocaleData('en-US')).toEqual(localeEn); });

      it('should return the exact LOCALE_DATA if it is available',
         () => { expect(findLocaleData('fr-CA')).toEqual(localeFrCA); });

      it('should return the parent LOCALE_DATA if it exists and exact locale is not available',
         () => { expect(findLocaleData('fr-BE')).toEqual(localeFr); });

      it(`should find the LOCALE_DATA even if the locale id is badly formatted`, () => {
        expect(findLocaleData('ca-ES-VALENCIA')).toEqual(localeCaESVALENCIA);
        expect(findLocaleData('CA_es_Valencia')).toEqual(localeCaESVALENCIA);
      });

      it(`should find the LOCALE_DATA if the locale id was registered`, () => {
        expect(findLocaleData('fake-id')).toEqual(localeFr);
        expect(findLocaleData('fake_iD')).toEqual(localeFr);
        expect(findLocaleData('fake-id2')).toEqual(localeFrCA);
      });

      it('should find the exact LOCALE_DATA if the locale is on the global object',
         () => { expect(findLocaleData('de-CH')).toEqual(localeDeCH); });

      it('should find the parent LOCALE_DATA if the exact locale is not available and the parent locale is on the global object',
         () => { expect(findLocaleData('de-BE')).toEqual(localeDe); });

      it('should add the extra LOCALE_DATA if the locale and the extra locale are on the global object',
         () => {
           expect(findLocaleData('de')[ɵLocaleDataIndex.ExtraData]).toEqual(localeDeExtra);
         });

      it('should not add the parent extra LOCALE_DATA if the exact extra locale is not the global object',
         () => { expect(findLocaleData('de-CH')[ɵLocaleDataIndex.ExtraData]).toBeUndefined(); });

      it('should find the registered LOCALE_DATA even if the same locale is on the global object',
         () => { expect(findLocaleData('fr')).not.toBe(fakeGlobalFr); });
    });

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
