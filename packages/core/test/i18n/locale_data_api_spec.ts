/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {findLocaleData, getLocaleCurrencyCode, LocaleDataIndex, registerLocaleData, unregisterAllLocaleData} from '../../src/i18n/locale_data_api';
import {global} from '../../src/util/global';

{
  describe('locale data api', () => {
    const localeCaESVALENCIA: any[] = ['ca-ES-VALENCIA'];
    const localeDe: any[] = ['de'];
    const localeDeCH: any[] = ['de-CH'];
    const localeEn: any[] = ['en'];
    const localeFr: any[] = ['fr'];
    localeFr[LocaleDataIndex.CurrencyCode] = 'EUR';
    const localeFrCA: any[] = ['fr-CA'];
    const localeZh: any[] = ['zh'];
    const localeEnAU: any[] = ['en-AU'];
    const fakeGlobalFr: any[] = ['fr'];

    beforeAll(() => {
      // Sumulate manually registering some locale data
      registerLocaleData(localeCaESVALENCIA);
      registerLocaleData(localeEn);
      registerLocaleData(localeFr);
      registerLocaleData(localeFrCA);
      registerLocaleData(localeFr, 'fake-id');
      registerLocaleData(localeFrCA, 'fake_Id2');
      registerLocaleData(localeZh);
      registerLocaleData(localeEnAU);

      // Simulate some locale data existing on the global already
      global.ng = global.ng || {};
      global.ng.common = global.ng.common || {locales: {}};
      global.ng.common.locales = global.ng.common.locales || {};
      global.ng.common.locales['fr'] = fakeGlobalFr;
      global.ng.common.locales['de'] = localeDe;
      global.ng.common.locales['de-ch'] = localeDeCH;
    });

    afterAll(() => {
      unregisterAllLocaleData();
      global.ng.common.locales = undefined;
    });

    describe('findLocaleData', () => {
      it('should throw if the LOCALE_DATA for the chosen locale or its parent locale is not available',
         () => {
           expect(() => findLocaleData('pt-AO'))
               .toThrowError(/Missing locale data for the locale "pt-AO"/);
         });

      it('should return english data if the locale is en-US', () => {
        expect(findLocaleData('en-US')).toEqual(localeEn);
      });

      it('should return the exact LOCALE_DATA if it is available', () => {
        expect(findLocaleData('fr-CA')).toEqual(localeFrCA);
      });

      it('should return the parent LOCALE_DATA if it exists and exact locale is not available',
         () => {
           expect(findLocaleData('fr-BE')).toEqual(localeFr);
         });

      it(`should find the LOCALE_DATA even if the locale id is badly formatted`, () => {
        expect(findLocaleData('ca-ES-VALENCIA')).toEqual(localeCaESVALENCIA);
        expect(findLocaleData('CA_es_Valencia')).toEqual(localeCaESVALENCIA);
      });

      it(`should find the LOCALE_DATA if the locale id was registered`, () => {
        expect(findLocaleData('fake-id')).toEqual(localeFr);
        expect(findLocaleData('fake_iD')).toEqual(localeFr);
        expect(findLocaleData('fake-id2')).toEqual(localeFrCA);
      });

      it('should find the exact LOCALE_DATA if the locale is on the global object', () => {
        expect(findLocaleData('de-CH')).toEqual(localeDeCH);
      });

      it('should find the parent LOCALE_DATA if the exact locale is not available and the parent locale is on the global object',
         () => {
           expect(findLocaleData('de-BE')).toEqual(localeDe);
         });

      it('should find the registered LOCALE_DATA even if the same locale is on the global object',
         () => {
           expect(findLocaleData('fr')).not.toBe(fakeGlobalFr);
         });
    });

    describe('getLocaleCurrencyCode()', () => {
      it('should return `null` if the given locale does not provide a currency code', () => {
        expect(getLocaleCurrencyCode('de')).toBe(null);
      });

      it('should return the code at the `LocaleDataIndex.CurrencyCode` of the given locale`s data',
         () => {
           expect(getLocaleCurrencyCode('fr')).toEqual('EUR');
         });
    });
  });
}
