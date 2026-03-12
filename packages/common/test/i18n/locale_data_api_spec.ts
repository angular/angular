/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import localeEn from '../../locales/en';
import localeEnAU from '../../locales/en-AU';
import localeFr from '../../locales/fr';
import localeHe from '../../locales/he';
import localeZh from '../../locales/zh';
import {ɵregisterLocaleData, ɵunregisterLocaleData} from '@angular/core';

import {
  FormatWidth,
  FormStyle,
  getCurrencySymbol,
  getLocaleDateFormat,
  getLocaleDayNames,
  getLocaleDirection,
  getLocaleMonthNames,
  getNumberOfCurrencyDigits,
  TranslationWidth,
} from '../..';

describe('locale data api', () => {
  beforeAll(() => {
    ɵregisterLocaleData(localeEn);
    ɵregisterLocaleData(localeFr);
    ɵregisterLocaleData(localeZh);
    ɵregisterLocaleData(localeEnAU);
    ɵregisterLocaleData(localeHe);
  });

  afterAll(() => {
    ɵunregisterLocaleData();
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
      expect(getNumberOfCurrencyDigits('GNF')).toEqual(0);
      expect(getNumberOfCurrencyDigits('BHD')).toEqual(3);
      expect(getNumberOfCurrencyDigits('unexisting_ISO_code')).toEqual(2);
    });
  });

  describe('getLastDefinedValue', () => {
    it('should find the last defined date format when format not defined', () => {
      expect(getLocaleDateFormat('zh', FormatWidth.Long)).toEqual('y年M月d日');
    });
  });

  describe('getDirectionality', () => {
    it('should have correct direction for rtl languages', () => {
      expect(getLocaleDirection('he')).toEqual('rtl');
    });

    it('should have correct direction for ltr languages', () => {
      expect(getLocaleDirection('en')).toEqual('ltr');
    });
  });

  describe('getLocaleDayNames', () => {
    it('should return english short list of days', () => {
      expect(getLocaleDayNames('en-US', FormStyle.Format, TranslationWidth.Short)).toEqual([
        'Su',
        'Mo',
        'Tu',
        'We',
        'Th',
        'Fr',
        'Sa',
      ]);
    });

    it('should return french short list of days', () => {
      expect(getLocaleDayNames('fr-CA', FormStyle.Format, TranslationWidth.Short)).toEqual([
        'di',
        'lu',
        'ma',
        'me',
        'je',
        've',
        'sa',
      ]);
    });

    it('should return english wide list of days', () => {
      expect(getLocaleDayNames('en-US', FormStyle.Format, TranslationWidth.Wide)).toEqual([
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ]);
    });

    it('should return french wide list of days', () => {
      expect(getLocaleDayNames('fr-CA', FormStyle.Format, TranslationWidth.Wide)).toEqual([
        'dimanche',
        'lundi',
        'mardi',
        'mercredi',
        'jeudi',
        'vendredi',
        'samedi',
      ]);
    });

    it('should return the full short list of days after manipulations', () => {
      const days = Array.from(getLocaleDayNames('en-US', FormStyle.Format, TranslationWidth.Short));

      days.splice(2);
      days.push('unexisting_day');

      const newDays = getLocaleDayNames('en-US', FormStyle.Format, TranslationWidth.Short);

      expect(newDays.length).toBe(7);

      expect(newDays).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
    });
  });

  describe('getLocaleMonthNames', () => {
    it('should return english abbreviated list of month', () => {
      expect(getLocaleMonthNames('en-US', FormStyle.Format, TranslationWidth.Abbreviated)).toEqual([
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ]);
    });

    it('should return french abbreviated list of month', () => {
      expect(getLocaleMonthNames('fr-CA', FormStyle.Format, TranslationWidth.Abbreviated)).toEqual([
        'janv.',
        'févr.',
        'mars',
        'avr.',
        'mai',
        'juin',
        'juil.',
        'août',
        'sept.',
        'oct.',
        'nov.',
        'déc.',
      ]);
    });

    it('should return english wide list of month', () => {
      expect(getLocaleMonthNames('en-US', FormStyle.Format, TranslationWidth.Wide)).toEqual([
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]);
    });

    it('should return french wide list of month', () => {
      expect(getLocaleMonthNames('fr-CA', FormStyle.Format, TranslationWidth.Wide)).toEqual([
        'janvier',
        'février',
        'mars',
        'avril',
        'mai',
        'juin',
        'juillet',
        'août',
        'septembre',
        'octobre',
        'novembre',
        'décembre',
      ]);
    });

    it('should return the full abbreviated list of month after manipulations', () => {
      const month = Array.from(
        getLocaleMonthNames('en-US', FormStyle.Format, TranslationWidth.Abbreviated),
      );
      month.splice(2);
      month.push('unexisting_month');

      const newMonth = getLocaleMonthNames('en-US', FormStyle.Format, TranslationWidth.Abbreviated);

      expect(newMonth.length).toBe(12);

      expect(newMonth).toEqual([
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ]);
    });
  });
});
