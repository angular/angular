/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DEFAULT_CURRENCY_CODE, LOCALE_ID} from '@angular/core';
import {inject} from '@angular/core/testing';
import {ivyEnabled} from '@angular/private/testing';

import {getLocaleId} from '../src/render3';
import {global} from '../src/util/global';
import {TestBed} from '../testing';

{
  describe('Application module', () => {
    it('should set the default locale to "en-US"', inject([LOCALE_ID], (defaultLocale: string) => {
         expect(defaultLocale).toEqual('en-US');
       }));

    it('should set the default currency code to "USD"',
       inject([DEFAULT_CURRENCY_CODE], (defaultCurrencyCode: string) => {
         expect(defaultCurrencyCode).toEqual('USD');
       }));

    if (ivyEnabled) {
      it('should set the ivy locale with the configured LOCALE_ID', () => {
        TestBed.configureTestingModule({providers: [{provide: LOCALE_ID, useValue: 'fr'}]});
        const before = getLocaleId();
        const locale = TestBed.inject(LOCALE_ID);
        const after = getLocaleId();
        expect(before).toEqual('en-us');
        expect(locale).toEqual('fr');
        expect(after).toEqual('fr');
      });

      describe('$localize.locale', () => {
        beforeEach(() => initLocale('de'));
        afterEach(() => restoreLocale());

        it('should set the ivy locale to `$localize.locale` value if it is defined', () => {
          // Injecting `LOCALE_ID` should also initialize the ivy locale
          const locale = TestBed.inject(LOCALE_ID);
          expect(locale).toEqual('de');
          expect(getLocaleId()).toEqual('de');
        });

        it('should set the ivy locale to an application provided LOCALE_ID even if `$localize.locale` is defined',
           () => {
             TestBed.configureTestingModule({providers: [{provide: LOCALE_ID, useValue: 'fr'}]});
             const locale = TestBed.inject(LOCALE_ID);
             expect(locale).toEqual('fr');
             expect(getLocaleId()).toEqual('fr');
           });
      });
    }
  });
}

let hasGlobalLocalize: boolean;
let hasGlobalLocale: boolean;
let originalLocale: string;

function initLocale(locale: string) {
  hasGlobalLocalize = Object.getOwnPropertyNames(global).includes('$localize');
  if (!hasGlobalLocalize) {
    global.$localize = {};
  }
  hasGlobalLocale = Object.getOwnPropertyNames(global.$localize).includes('locale');
  originalLocale = global.$localize.locale;
  global.$localize.locale = locale;
}

function restoreLocale() {
  if (hasGlobalLocale) {
    global.$localize.locale = originalLocale;
  } else {
    delete global.$localize.locale;
  }

  if (!hasGlobalLocalize) {
    delete global.$localize;
  }
}
