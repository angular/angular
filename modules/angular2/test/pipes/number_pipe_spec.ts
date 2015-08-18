import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  supportsIntlApi
} from 'angular2/test_lib';

import {DecimalPipe, PercentPipe, CurrencyPipe} from 'angular2/pipes';

export function main() {
  // TODO(mlaval): enable tests when Intl API is no longer used, see
  // https://github.com/angular/angular/issues/3333
  if (supportsIntlApi()) {
    describe("DecimalPipe", () => {
      var pipe;

      beforeEach(() => { pipe = new DecimalPipe(); });

      describe("transform", () => {
        it('should return correct value for numbers', () => {
          expect(pipe.transform(12345, [])).toEqual('12,345');
          expect(pipe.transform(123, ['.2'])).toEqual('123.00');
          expect(pipe.transform(1, ['3.'])).toEqual('001');
          expect(pipe.transform(1.1, ['3.4-5'])).toEqual('001.1000');

          expect(pipe.transform(1.123456, ['3.4-5'])).toEqual('001.12346');
          expect(pipe.transform(1.1234, [])).toEqual('1.123');
        });

        it("should not support other objects",
           () => { expect(() => pipe.transform(new Object(), [])).toThrowError(); });
      });
    });

    describe("PercentPipe", () => {
      var pipe;

      beforeEach(() => { pipe = new PercentPipe(); });

      describe("transform", () => {
        it('should return correct value for numbers', () => {
          expect(pipe.transform(1.23, [])).toEqual('123%');
          expect(pipe.transform(1.2, ['.2'])).toEqual('120.00%');
        });

        it("should not support other objects",
           () => { expect(() => pipe.transform(new Object(), [])).toThrowError(); });
      });
    });

    describe("CurrencyPipe", () => {
      var pipe;

      beforeEach(() => { pipe = new CurrencyPipe(); });

      describe("transform", () => {
        it('should return correct value for numbers', () => {
          expect(pipe.transform(123, [])).toEqual('USD123');
          expect(pipe.transform(12, ['EUR', false, '.2'])).toEqual('EUR12.00');
        });

        it("should not support other objects",
           () => { expect(() => pipe.transform(new Object(), [])).toThrowError(); });
      });
    });
  }
}
