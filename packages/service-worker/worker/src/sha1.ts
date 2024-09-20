/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Compute the SHA1 of the given string
 *
 * see https://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 *
 * WARNING: this function has not been designed not tested with security in mind.
 *          DO NOT USE IT IN A SECURITY SENSITIVE CONTEXT.
 *
 * Borrowed from @angular/compiler/src/i18n/digest.ts
 */

export function sha1(str: string): string {
  const utf8 = str;
  const words32 = stringToWords32(utf8, Endian.Big);
  return _sha1(words32, utf8.length * 8);
}

export function sha1Binary(buffer: ArrayBuffer): string {
  const words32 = arrayBufferToWords32(buffer, Endian.Big);
  return _sha1(words32, buffer.byteLength * 8);
}

function _sha1(words32: number[], len: number): string {
  const w: number[] = [];
  let [a, b, c, d, e]: number[] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

  words32[len >> 5] |= 0x80 << (24 - (len % 32));
  words32[(((len + 64) >> 9) << 4) + 15] = len;

  for (let i = 0; i < words32.length; i += 16) {
    const [h0, h1, h2, h3, h4]: number[] = [a, b, c, d, e];

    for (let j = 0; j < 80; j++) {
      if (j < 16) {
        w[j] = words32[i + j];
      } else {
        w[j] = rol32(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
      }

      const [f, k] = fk(j, b, c, d);
      const temp = [rol32(a, 5), f, e, k, w[j]].reduce(add32);
      [e, d, c, b, a] = [d, c, rol32(b, 30), a, temp];
    }

    [a, b, c, d, e] = [add32(a, h0), add32(b, h1), add32(c, h2), add32(d, h3), add32(e, h4)];
  }

  return byteStringToHexString(words32ToByteString([a, b, c, d, e]));
}

function add32(a: number, b: number): number {
  return add32to64(a, b)[1];
}

function add32to64(a: number, b: number): [number, number] {
  const low = (a & 0xffff) + (b & 0xffff);
  const high = (a >>> 16) + (b >>> 16) + (low >>> 16);
  return [high >>> 16, (high << 16) | (low & 0xffff)];
}

function add64([ah, al]: [number, number], [bh, bl]: [number, number]): [number, number] {
  const [carry, l] = add32to64(al, bl);
  const h = add32(add32(ah, bh), carry);
  return [h, l];
}

function sub32(a: number, b: number): number {
  const low = (a & 0xffff) - (b & 0xffff);
  const high = (a >> 16) - (b >> 16) + (low >> 16);
  return (high << 16) | (low & 0xffff);
}

// Rotate a 32b number left `count` position
function rol32(a: number, count: number): number {
  return (a << count) | (a >>> (32 - count));
}

// Rotate a 64b number left `count` position
function rol64([hi, lo]: [number, number], count: number): [number, number] {
  const h = (hi << count) | (lo >>> (32 - count));
  const l = (lo << count) | (hi >>> (32 - count));
  return [h, l];
}

enum Endian {
  Little,
  Big,
}

function fk(index: number, b: number, c: number, d: number): [number, number] {
  if (index < 20) {
    return [(b & c) | (~b & d), 0x5a827999];
  }

  if (index < 40) {
    return [b ^ c ^ d, 0x6ed9eba1];
  }

  if (index < 60) {
    return [(b & c) | (b & d) | (c & d), 0x8f1bbcdc];
  }

  return [b ^ c ^ d, 0xca62c1d6];
}

function stringToWords32(str: string, endian: Endian): number[] {
  const size = (str.length + 3) >>> 2;
  const words32 = [];

  for (let i = 0; i < size; i++) {
    words32[i] = wordAt(str, i * 4, endian);
  }

  return words32;
}

function arrayBufferToWords32(buffer: ArrayBuffer, endian: Endian): number[] {
  const size = (buffer.byteLength + 3) >>> 2;
  const words32: number[] = [];
  const view = new Uint8Array(buffer);
  for (let i = 0; i < size; i++) {
    words32[i] = wordAt(view, i * 4, endian);
  }
  return words32;
}

function byteAt(str: string | Uint8Array, index: number): number {
  if (typeof str === 'string') {
    return index >= str.length ? 0 : str.charCodeAt(index) & 0xff;
  } else {
    return index >= str.byteLength ? 0 : str[index] & 0xff;
  }
}

function wordAt(str: string | Uint8Array, index: number, endian: Endian): number {
  let word = 0;
  if (endian === Endian.Big) {
    for (let i = 0; i < 4; i++) {
      word += byteAt(str, index + i) << (24 - 8 * i);
    }
  } else {
    for (let i = 0; i < 4; i++) {
      word += byteAt(str, index + i) << (8 * i);
    }
  }
  return word;
}

function words32ToByteString(words32: number[]): string {
  return words32.reduce((str, word) => str + word32ToByteString(word), '');
}

function word32ToByteString(word: number): string {
  let str = '';
  for (let i = 0; i < 4; i++) {
    str += String.fromCharCode((word >>> (8 * (3 - i))) & 0xff);
  }
  return str;
}

function byteStringToHexString(str: string): string {
  let hex: string = '';
  for (let i = 0; i < str.length; i++) {
    const b = byteAt(str, i);
    hex += (b >>> 4).toString(16) + (b & 0x0f).toString(16);
  }
  return hex.toLowerCase();
}

// based on https://www.danvk.org/hex2dec.html (JS can not handle more than 56b)
function byteStringToDecString(str: string): string {
  let decimal = '';
  let toThePower = '1';

  for (let i = str.length - 1; i >= 0; i--) {
    decimal = addBigInt(decimal, numberTimesBigInt(byteAt(str, i), toThePower));
    toThePower = numberTimesBigInt(256, toThePower);
  }

  return decimal.split('').reverse().join('');
}

// x and y decimal, lowest significant digit first
function addBigInt(x: string, y: string): string {
  let sum = '';
  const len = Math.max(x.length, y.length);
  for (let i = 0, carry = 0; i < len || carry; i++) {
    const tmpSum = carry + +(x[i] || 0) + +(y[i] || 0);
    if (tmpSum >= 10) {
      carry = 1;
      sum += tmpSum - 10;
    } else {
      carry = 0;
      sum += tmpSum;
    }
  }

  return sum;
}

function numberTimesBigInt(num: number, b: string): string {
  let product = '';
  let bToThePower = b;
  for (; num !== 0; num = num >>> 1) {
    if (num & 1) product = addBigInt(product, bToThePower);
    bToThePower = addBigInt(bToThePower, bToThePower);
  }
  return product;
}
