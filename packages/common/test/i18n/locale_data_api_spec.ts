/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import localeCaESVALENCIA from '../../i18n_data/locale_ca-ES-VALENCIA';
import localeEn from '../../i18n_data/locale_en';
import localeFr from '../../i18n_data/locale_fr';
import localeFrCA from '../../i18n_data/locale_fr-CA';
import {registerLocaleData, findLocaleData} from '../../src/i18n/locale_data_api';

export function main() {
  describe('locale data api', () => {
    beforeAll(() => {
      registerLocaleData(localeCaESVALENCIA);
      registerLocaleData(localeEn);
      registerLocaleData(localeFr);
      registerLocaleData(localeFrCA);
    });

    describe('findLocaleData', () => {
      it('should throw if the locale provided is not a valid LOCALE_ID', () => {
        expect(() => findLocaleData('invalid'))
            .toThrow(new Error(
                `"invalid" is not a valid LOCALE_ID value. See https://github.com/unicode-cldr/cldr-core/blob/master/availableLocales.json for a list of valid locales`));
      });

      it('should throw if the LOCALE_DATA for the chosen locale if not available', () => {
        expect(() => findLocaleData('fr-BE'))
            .toThrowError(/Missing locale data for the locale "fr-BE"/);
      });

      it('should return english data if the locale is en-US',
         () => { expect(findLocaleData('en-US')).toEqual(localeEn); });

      it('should return the exact LOCALE_DATA if it is available',
         () => { expect(findLocaleData('fr-CA')).toEqual(localeFrCA); });

      it('should return the parent LOCALE_DATA if it exists and exact locale is not available',
         () => { expect(findLocaleData('fr-FR')).toEqual(localeFr); });

      it(`should find the LOCALE_DATA even if the locale id is badly formatted`, () => {
        expect(findLocaleData('ca-ES-VALENCIA')).toEqual(localeCaESVALENCIA);
        expect(findLocaleData('CA_es_Valencia')).toEqual(localeCaESVALENCIA);
      });
    });
  });
}
