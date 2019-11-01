/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {findLocaleData, registerLocaleData, unregisterLocaleData} from '../../src/i18n/locale_data_api';

{
  describe('locale data api', () => {
    const localeCaESVALENCIA: any[] = ['ca-ES-VALENCIA'];
    const localeEn: any[] = ['en'];
    const localeFr: any[] = ['fr'];
    const localeFrCA: any[] = ['fr-CA'];
    const localeZh: any[] = ['zh'];
    const localeEnAU: any[] = ['en-AU'];

    beforeAll(() => {
      registerLocaleData(localeCaESVALENCIA);
      registerLocaleData(localeEn);
      registerLocaleData(localeFr);
      registerLocaleData(localeFrCA);
      registerLocaleData(localeFr, 'fake-id');
      registerLocaleData(localeFrCA, 'fake_Id2');
      registerLocaleData(localeZh);
      registerLocaleData(localeEnAU);
    });

    afterAll(() => unregisterLocaleData());

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
    });
  });
}
