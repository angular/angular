/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CurrencyPipe, DecimalPipe, PercentPipe} from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import localeDa from '@angular/common/locales/da';
import localeDeAt from '@angular/common/locales/de-AT';
import localeEn from '@angular/common/locales/en';
import localeEsUS from '@angular/common/locales/es-US';
import localeFr from '@angular/common/locales/fr';
import {setUseIntl} from '@angular/common/src/i18n/intl';
import {Component, DEFAULT_CURRENCY_CODE, LOCALE_ID, ɵregisterLocaleData, ɵunregisterLocaleData,} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('Number pipes', () => {
  beforeAll(() => {
    ɵregisterLocaleData(localeEn);
    ɵregisterLocaleData(localeEsUS);
    ɵregisterLocaleData(localeFr);
    ɵregisterLocaleData(localeAr);
    ɵregisterLocaleData(localeDeAt);
    ɵregisterLocaleData(localeDa);
  });

  afterAll(() => ɵunregisterLocaleData());

  describe('DecimalPipe', () => {
    describe('transform', () => {
      let pipe: DecimalPipe;
      beforeEach(() => {
        TestBed.configureTestingModule({providers: [DecimalPipe]});
        pipe = TestBed.inject(DecimalPipe);
      });

      it('should return correct value for numbers', () => {
        expect(pipe.transform(12345)).toEqual('12,345');
        expect(pipe.transform(1.123456, '3.4-5')).toEqual('001.12346');
      });

      it('should support strings', () => {
        expect(pipe.transform('12345')).toEqual('12,345');
        expect(pipe.transform('123', '.2')).toEqual('123.00');
        expect(pipe.transform('1', '3.')).toEqual('001');
        expect(pipe.transform('1.1', '3.4-5')).toEqual('001.1000');
        expect(pipe.transform('1.123456', '3.4-5')).toEqual('001.12346');
        expect(pipe.transform('1.1234')).toEqual('1.123');
      });

      it('should return null for NaN', () => {
        expect(pipe.transform(Number.NaN)).toEqual(null);
      });

      it('should return null for null', () => {
        expect(pipe.transform(null)).toEqual(null);
      });

      it('should return null for undefined', () => {
        expect(pipe.transform(undefined)).toEqual(null);
      });

      it('should not support other objects', () => {
        expect(() => pipe.transform({} as any))
            .toThrowError(
                `NG02100: InvalidPipeArgument: '[object Object] is not a number' for pipe 'DecimalPipe'`,
            );
        expect(() => pipe.transform('123abc'))
            .toThrowError(
                `NG02100: InvalidPipeArgument: '123abc is not a number' for pipe 'DecimalPipe'`,
            );
      });
    });

    describe('transform with custom locales', () => {
      it('should return the correct format for es-US', () => {
        TestBed.configureTestingModule({providers: [DecimalPipe]});
        const pipe = TestBed.inject(DecimalPipe);
        expect(pipe.transform('9999999.99', '1.2-2')).toEqual('9,999,999.99');
      });
    });

    it('should be available as a standalone pipe', () => {
      @Component({
        selector: 'test-component',
        imports: [DecimalPipe],
        template: '{{ value | number }}',
        standalone: true,
      })
      class TestComponent {
        value = 12345;
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toBe('12,345');
    });
  });

  describe('PercentPipe', () => {
    let pipe: PercentPipe;

    beforeEach(() => {
      TestBed.configureTestingModule({providers: [PercentPipe]});
      pipe = TestBed.inject(PercentPipe);
    });

    describe('transform', () => {
      it('should return correct value for numbers', () => {
        expect(pipe.transform(1.23)).toEqual('123%');
        expect(pipe.transform(1.234)).toEqual('123%');
        expect(pipe.transform(1.236)).toEqual('124%');
        expect(pipe.transform(12.3456, '0.0-10')).toEqual('1,234.56%');
      });

      it('should return null for NaN', () => {
        expect(pipe.transform(Number.NaN)).toEqual(null);
      });

      it('should return null for null', () => {
        expect(pipe.transform(null)).toEqual(null);
      });

      it('should return null for undefined', () => {
        expect(pipe.transform(undefined)).toEqual(null);
      });

      it('should not support other objects', () => {
        expect(() => pipe.transform({} as any))
            .toThrowError(
                `NG02100: InvalidPipeArgument: '[object Object] is not a number' for pipe 'PercentPipe'`,
            );
      });
    });

    it('should be available as a standalone pipe', () => {
      @Component({
        selector: 'test-component',
        imports: [PercentPipe],
        template: '{{ value | percent }}',
        standalone: true,
      })
      class TestComponent {
        value = 15;
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toBe('1,500%');
    });
  });

  describe('CurrencyPipe', () => {
    let pipe: CurrencyPipe;

    beforeEach(() => {
      TestBed.configureTestingModule({providers: [CurrencyPipe]});
      pipe = TestBed.inject(CurrencyPipe);
    });

    describe('transform', () => {
      // This test illustrastes the difference between the Intl implementation and the old one.
      [true, false].forEach((useIntl) => {
        it('should return correct value for numbers', () => {
          setUseIntl(useIntl);
          TestBed.resetTestingModule();
          TestBed.configureTestingModule({providers: [CurrencyPipe]});
          pipe = TestBed.inject(CurrencyPipe);

          expect(pipe.transform(123)).toEqual('$123.00');
          expect(pipe.transform(5.1234, 'USD', '')).toEqual('5.12');
          expect(pipe.transform(5.1234, 'USD', 'symbol')).toEqual('$5.12');
          expect(pipe.transform(5.1234, 'CAD', 'symbol')).toEqual('CA$5.12');
          expect(pipe.transform(5.1234, 'CAD', 'symbol-narrow')).toEqual('$5.12');
          expect(pipe.transform(5.1234, 'CAD', 'symbol-narrow', '5.2-2')).toEqual('$00,005.12');
          expect(pipe.transform(5.1234, 'CAD', 'symbol-narrow', '5.2-2', 'fr'))
              .toEqual(
                  '00\u202f005,12 $',
              );
          expect(pipe.transform(5, 'USD', 'symbol', '', 'fr')).toEqual('5,00 $US');
          expect(pipe.transform(123456789, 'EUR', 'symbol', '', 'de-at'))
              .toEqual(
                  '€ 123.456.789,00',
              );
          expect(pipe.transform(5.1234, 'EUR', '', '', 'de-at')).toEqual('5,12');
          expect(pipe.transform(5.1234, 'DKK', '', '', 'da')).toEqual('5,12');

          // CLP doesn't have a subdivision, so it should not display decimals unless explicitly
          // told so
          expect(pipe.transform(5.1234, 'CLP', '')).toEqual('5');
          expect(pipe.transform(5.1234, 'CLP', '', '2.0-3')).toEqual('05.123');

          // Cases where the Intl implementation and the old implementation differ.
          if (useIntl) {
            expect(pipe.transform(12, 'EUR', 'code', '.1')).toEqual('EUR 12.0');
            expect(pipe.transform(5.1234, 'USD', 'code', '.0-3')).toEqual('USD 5.123');
            expect(pipe.transform(5.1234, 'USD', 'code')).toEqual('USD 5.12');
          } else {
            expect(pipe.transform(12, 'EUR', 'code', '.1')).toEqual('EUR12.0');
            expect(pipe.transform(5.1234, 'USD', 'code', '.0-3')).toEqual('USD5.123');
            expect(pipe.transform(5.1234, 'USD', 'code')).toEqual('USD5.12');
          }
        });

        it('should support any currency code name', () => {
          setUseIntl(useIntl);
          TestBed.resetTestingModule();
          TestBed.configureTestingModule({
            providers: [CurrencyPipe],
          });
          pipe = TestBed.inject(CurrencyPipe);
          // currency code is unknown, default formatting options will be used
          expect(pipe.transform(5.1234, 'unexisting_ISO_code', 'symbol'))
              .toEqual(
                  'unexisting_ISO_code5.12',
              );
          // currency code is USD, the pipe will format based on USD but will display "Custom name"
          expect(pipe.transform(5.1234, 'USD', 'Custom name')).toEqual('Custom name5.12');

          // currency code is unknown, default formatting options will be used and will display
          // "Custom name"
          expect(pipe.transform(5.1234, 'unexisting_ISO_code', 'Custom name'))
              .toEqual(
                  'Custom name5.12',
              );
        });
      });

      it('should use the injected default currency code if none is provided', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            {provide: LOCALE_ID, useValue: 'en-US'},
            {provide: DEFAULT_CURRENCY_CODE, useValue: 'CLP'},
            CurrencyPipe,
          ],
        });
        const clpPipe = TestBed.inject(CurrencyPipe);

        expect(clpPipe.transform(1234)).toEqual('CLP1,234');
      });

      it('should return null for NaN', () => {
        expect(pipe.transform(Number.NaN)).toEqual(null);
      });

      it('should return null for null', () => {
        expect(pipe.transform(null)).toEqual(null);
      });

      it('should return null for undefined', () => {
        expect(pipe.transform(undefined)).toEqual(null);
      });

      it('should not support other objects', () => {
        expect(() => pipe.transform({} as any))
            .toThrowError(
                `NG02100: InvalidPipeArgument: '[object Object] is not a number' for pipe 'CurrencyPipe'`,
            );
      });

      it('should warn if you are using the v4 signature', () => {
        const warnSpy = spyOn(console, 'warn');
        pipe.transform(123, 'USD', true);
        expect(warnSpy).toHaveBeenCalledWith(
            `Warning: the currency pipe has been changed in Angular v5. The symbolDisplay option (third parameter) is now a string instead of a boolean. The accepted values are "code", "symbol" or "symbol-narrow".`,
        );
      });
    });

    it('should be available as a standalone pipe', () => {
      @Component({
        selector: 'test-component',
        imports: [CurrencyPipe],
        template: '{{ value | currency }}',
        standalone: true,
      })
      class TestComponent {
        value = 15;
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toBe('$15.00');
    });
  });
});
