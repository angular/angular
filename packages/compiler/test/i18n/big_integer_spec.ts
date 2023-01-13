/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BigInteger, BigIntExponentiation, BigIntForMultiplication} from '../../src/i18n/big_integer';

describe('big integers', () => {
  describe('add', () => {
    it('should add two integers', () => {
      const a = createBigInteger(42);
      const b = createBigInteger(1337);

      expect(a.add(b).toString()).toEqual('1379');
    });

    it('should add two integers with a carry', () => {
      const a = createBigInteger(8);
      const b = createBigInteger(995);

      expect(a.add(b).toString()).toEqual('1003');
    });

    it('should add two integers beyond the maximum supported JS integer', () => {
      const b31 = createBigInteger(1 << 31);

      const b32 = b31.add(b31);
      const b33 = b32.add(b32);
      const b34 = b33.add(b33);
      const b35 = b34.add(b34);
      const b36 = b35.add(b35);
      const b37 = b36.add(b36);
      const b38 = b37.add(b37);
      const b39 = b38.add(b38);
      const b40 = b39.add(b39);
      const b41 = b40.add(b40);
      const b42 = b41.add(b41);
      const b43 = b42.add(b42);
      const b44 = b43.add(b43);
      const b45 = b44.add(b44);
      const b46 = b45.add(b45);
      const b47 = b46.add(b46);
      const b48 = b47.add(b47);
      const b49 = b48.add(b48);
      const b50 = b49.add(b49);
      const b51 = b50.add(b50);
      const b52 = b51.add(b51);
      const b53 = b52.add(b52);
      const b54 = b53.add(b53);
      const b55 = b54.add(b54);
      const b56 = b55.add(b55);
      const b57 = b56.add(b56);
      const b58 = b57.add(b57);
      const b59 = b58.add(b58);
      const b60 = b59.add(b59);
      const b61 = b60.add(b60);
      const b62 = b61.add(b61);
      const b63 = b62.add(b62);
      const b64 = b63.add(b63);
      const b65 = b64.add(b64);

      expect(b32.toString()).toEqual('4294967296');
      expect(b33.toString()).toEqual('8589934592');
      expect(b34.toString()).toEqual('17179869184');
      expect(b35.toString()).toEqual('34359738368');
      expect(b36.toString()).toEqual('68719476736');
      expect(b37.toString()).toEqual('137438953472');
      expect(b38.toString()).toEqual('274877906944');
      expect(b39.toString()).toEqual('549755813888');
      expect(b40.toString()).toEqual('1099511627776');
      expect(b41.toString()).toEqual('2199023255552');
      expect(b42.toString()).toEqual('4398046511104');
      expect(b43.toString()).toEqual('8796093022208');
      expect(b44.toString()).toEqual('17592186044416');
      expect(b45.toString()).toEqual('35184372088832');
      expect(b46.toString()).toEqual('70368744177664');
      expect(b47.toString()).toEqual('140737488355328');
      expect(b48.toString()).toEqual('281474976710656');
      expect(b49.toString()).toEqual('562949953421312');
      expect(b50.toString()).toEqual('1125899906842624');
      expect(b51.toString()).toEqual('2251799813685248');
      expect(b52.toString()).toEqual('4503599627370496');
      expect(b53.toString()).toEqual('9007199254740992');
      expect(b54.toString()).toEqual('18014398509481984');

      // From here onwards would the result be inaccurate with JavaScript numbers.
      expect(b55.toString()).toEqual('36028797018963968');
      expect(b56.toString()).toEqual('72057594037927936');
      expect(b57.toString()).toEqual('144115188075855872');
      expect(b58.toString()).toEqual('288230376151711744');
      expect(b59.toString()).toEqual('576460752303423488');
      expect(b60.toString()).toEqual('1152921504606846976');
      expect(b61.toString()).toEqual('2305843009213693952');
      expect(b62.toString()).toEqual('4611686018427387904');
      expect(b63.toString()).toEqual('9223372036854775808');
      expect(b64.toString()).toEqual('18446744073709551616');
      expect(b65.toString()).toEqual('36893488147419103232');
    });

    it('should not mutate the big integer instances', () => {
      const a = createBigInteger(42);
      const b = createBigInteger(1337);

      a.add(b);

      expect(a.toString()).toEqual('42');
      expect(b.toString()).toEqual('1337');
    });
  });

  describe('addToSelf', () => {
    it('should add two integers into the left operand', () => {
      const a = createBigInteger(42);
      const b = createBigInteger(1337);

      a.addToSelf(b);

      expect(a.toString()).toEqual('1379');
    });

    it('should not mutate the right operand', () => {
      const a = createBigInteger(42);
      const b = createBigInteger(1337);

      a.addToSelf(b);

      expect(a.toString()).toEqual('1379');
      expect(b.toString()).toEqual('1337');
    });
  });

  describe('multiplication', () => {
    it('should be correct for 0', () => {
      const a = new BigIntForMultiplication(createBigInteger(0));
      expect(a.multiplyBy(0).toString()).toEqual('0');
      expect(a.multiplyBy(1).toString()).toEqual('0');
      expect(a.multiplyBy(42).toString()).toEqual('0');
      expect(a.multiplyBy(1 << 31).toString()).toEqual('0');
      expect(a.multiplyBy((1 << 31) - 1).toString()).toEqual('0');
    });

    it('should be correct for 1337', () => {
      const a = new BigIntForMultiplication(createBigInteger(1337));
      expect(a.multiplyBy(0).toString()).toEqual('0');
      expect(a.multiplyBy(1).toString()).toEqual('1337');
      expect(a.multiplyBy(8).toString()).toEqual('10696');
      expect(a.multiplyBy(42).toString()).toEqual('56154');
      expect(a.multiplyBy(1 << 31).toString()).toEqual('2871185637376');
      expect(a.multiplyBy((1 << 31) - 1).toString()).toEqual('2871185636039');
    });

    it('should multiply and add to an existing big integer', () => {
      const a = new BigIntForMultiplication(createBigInteger(1337));
      const result = createBigInteger(1_000_000);
      a.multiplyByAndAddTo(42, result);
      expect(result.toString()).toEqual('1056154');
    });
  });

  describe('exponentiation', () => {
    it('should be correct for base-0', () => {
      const base32 = new BigIntExponentiation(0);
      expect(base32.toThePowerOf(0).getValue().toString()).toEqual('1');
      expect(base32.toThePowerOf(1).getValue().toString()).toEqual('0');
      expect(base32.toThePowerOf(2).getValue().toString()).toEqual('0');
      expect(base32.toThePowerOf(3).getValue().toString()).toEqual('0');
      expect(base32.toThePowerOf(8).getValue().toString()).toEqual('0');
      expect(base32.toThePowerOf(12).getValue().toString()).toEqual('0');
    });

    it('should be correct for base-1', () => {
      const base32 = new BigIntExponentiation(1);
      expect(base32.toThePowerOf(0).getValue().toString()).toEqual('1');
      expect(base32.toThePowerOf(1).getValue().toString()).toEqual('1');
      expect(base32.toThePowerOf(2).getValue().toString()).toEqual('1');
      expect(base32.toThePowerOf(3).getValue().toString()).toEqual('1');
      expect(base32.toThePowerOf(8).getValue().toString()).toEqual('1');
      expect(base32.toThePowerOf(12).getValue().toString()).toEqual('1');
    });

    it('should be correct for base-42', () => {
      const base32 = new BigIntExponentiation(42);
      expect(base32.toThePowerOf(0).getValue().toString()).toEqual('1');
      expect(base32.toThePowerOf(1).getValue().toString()).toEqual('42');
      expect(base32.toThePowerOf(2).getValue().toString()).toEqual('1764');
      expect(base32.toThePowerOf(3).getValue().toString()).toEqual('74088');
      expect(base32.toThePowerOf(8).getValue().toString()).toEqual('9682651996416');
      expect(base32.toThePowerOf(12).getValue().toString()).toEqual('30129469486639681536');
    });

    it('should cache the exponents', () => {
      const base32 = new BigIntExponentiation(32);

      const a = base32.toThePowerOf(4);
      const b = base32.toThePowerOf(4);

      expect(a).toBe(b);
    });
  });

  function createBigInteger(value: number): BigInteger {
    return new BigIntForMultiplication(BigInteger.one()).multiplyBy(value);
  }
});
