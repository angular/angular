/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BigIntExponentiation} from './big_integer';

export function computeMsgId(msg: string, meaning: string = ''): string {
  let msgFingerprint = fingerprint(msg);

  if (meaning) {
    const meaningFingerprint = fingerprint(meaning);
    msgFingerprint = add64(rol64(msgFingerprint, 1), meaningFingerprint);
  }

  const hi = msgFingerprint[0];
  const lo = msgFingerprint[1];

  return wordsToDecimalString(hi & 0x7fffffff, lo);
}

/**
 * Compute the fingerprint of the given string
 *
 * The output is 64 bit number encoded as a decimal string
 *
 * based on:
 * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/GoogleJsMessageIdGenerator.java
 */
function fingerprint(str: string): [number, number] {
  const utf8 = utf8Encode(str);

  let hi = hash32(utf8, 0);
  let lo = hash32(utf8, 102072);

  if (hi == 0 && (lo == 0 || lo == 1)) {
    hi = hi ^ 0x130f9bef;
    lo = lo ^ -0x6b5f56d8;
  }

  return [hi, lo];
}

function hash32(bytes: Byte[], c: number): number {
  let a = 0x9e3779b9, b = 0x9e3779b9;
  let i: number;

  const len = bytes.length;

  for (i = 0; i + 12 <= len; i += 12) {
    a = add32(a, wordAt(bytes, i, Endian.Little));
    b = add32(b, wordAt(bytes, i + 4, Endian.Little));
    c = add32(c, wordAt(bytes, i + 8, Endian.Little));
    const res = mix(a, b, c);
    (a = res[0]), (b = res[1]), (c = res[2]);
  }

  a = add32(a, wordAt(bytes, i, Endian.Little));
  b = add32(b, wordAt(bytes, i + 4, Endian.Little));
  // the first byte of c is reserved for the length
  c = add32(c, len);
  c = add32(c, wordAt(bytes, i + 8, Endian.Little) << 8);

  return mix(a, b, c)[2];
}

// clang-format off
function mix(a: number, b: number, c: number): [number, number, number] {
  a = sub32(a, b);
  a = sub32(a, c);
  a ^= c >>> 13;
  b = sub32(b, c);
  b = sub32(b, a);
  b ^= a << 8;
  c = sub32(c, a);
  c = sub32(c, b);
  c ^= b >>> 13;
  a = sub32(a, b);
  a = sub32(a, c);
  a ^= c >>> 12;
  b = sub32(b, c);
  b = sub32(b, a);
  b ^= a << 16;
  c = sub32(c, a);
  c = sub32(c, b);
  c ^= b >>> 5;
  a = sub32(a, b);
  a = sub32(a, c);
  a ^= c >>> 3;
  b = sub32(b, c);
  b = sub32(b, a);
  b ^= a << 10;
  c = sub32(c, a);
  c = sub32(c, b);
  c ^= b >>> 15;
  return [a, b, c];
}
// clang-format on

// Utils

enum Endian {
  Little,
  Big,
}

function add32(a: number, b: number): number {
  return add32to64(a, b)[1];
}

function add32to64(a: number, b: number): [number, number] {
  const low = (a & 0xffff) + (b & 0xffff);
  const high = (a >>> 16) + (b >>> 16) + (low >>> 16);
  return [high >>> 16, (high << 16) | (low & 0xffff)];
}

function add64(a: [number, number], b: [number, number]): [number, number] {
  const ah = a[0], al = a[1];
  const bh = b[0], bl = b[1];
  const result = add32to64(al, bl);
  const carry = result[0];
  const l = result[1];
  const h = add32(add32(ah, bh), carry);
  return [h, l];
}

function sub32(a: number, b: number): number {
  const low = (a & 0xffff) - (b & 0xffff);
  const high = (a >> 16) - (b >> 16) + (low >> 16);
  return (high << 16) | (low & 0xffff);
}

// Rotate a 64b number left `count` position
function rol64(num: [number, number], count: number): [number, number] {
  const hi = num[0], lo = num[1];
  const h = (hi << count) | (lo >>> (32 - count));
  const l = (lo << count) | (hi >>> (32 - count));
  return [h, l];
}

function byteAt(bytes: Byte[], index: number): Byte {
  return index >= bytes.length ? 0 : bytes[index];
}

function wordAt(bytes: Byte[], index: number, endian: Endian): number {
  let word = 0;
  if (endian === Endian.Big) {
    for (let i = 0; i < 4; i++) {
      word += byteAt(bytes, index + i) << (24 - 8 * i);
    }
  } else {
    for (let i = 0; i < 4; i++) {
      word += byteAt(bytes, index + i) << (8 * i);
    }
  }
  return word;
}

/**
 * Create a shared exponentiation pool for base-256 computations. This shared pool provides memoized
 * power-of-256 results with memoized power-of-two computations for efficient multiplication.
 *
 * For our purposes, this can be safely stored as a global without memory concerns. The reason is
 * that we encode two words, so only need the 0th (for the low word) and 4th (for the high word)
 * exponent.
 */
const base256 = new BigIntExponentiation(256);

/**
 * Represents two 32-bit words as a single decimal number. This requires a big integer storage
 * model as JS numbers are not accurate enough to represent the 64-bit number.
 *
 * Based on https://www.danvk.org/hex2dec.html
 */
function wordsToDecimalString(hi: number, lo: number): string {
  // Encode the four bytes in lo in the lower digits of the decimal number.
  // Note: the multiplication results in lo itself but represented by a big integer using its
  // decimal digits.
  const decimal = base256.toThePowerOf(0).multiplyBy(lo);

  // Encode the four bytes in hi above the four lo bytes. lo is a maximum of (2^8)^4, which is why
  // this multiplication factor is applied.
  base256.toThePowerOf(4).multiplyByAndAddTo(hi, decimal);

  return decimal.toString();
}

export type Byte = number;

export function utf8Encode(str: string): Byte[] {
  let encoded: Byte[] = [];
  for (let index = 0; index < str.length; index++) {
    let codePoint = str.charCodeAt(index);

    // decode surrogate
    // see https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
    if (codePoint >= 0xd800 && codePoint <= 0xdbff && str.length > index + 1) {
      const low = str.charCodeAt(index + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        index++;
        codePoint = ((codePoint - 0xd800) << 10) + low - 0xdc00 + 0x10000;
      }
    }

    if (codePoint <= 0x7f) {
      encoded.push(codePoint);
    } else if (codePoint <= 0x7ff) {
      encoded.push(((codePoint >> 6) & 0x1f) | 0xc0, (codePoint & 0x3f) | 0x80);
    } else if (codePoint <= 0xffff) {
      encoded.push(
          (codePoint >> 12) | 0xe0, ((codePoint >> 6) & 0x3f) | 0x80, (codePoint & 0x3f) | 0x80);
    } else if (codePoint <= 0x1fffff) {
      encoded.push(
          ((codePoint >> 18) & 0x07) | 0xf0, ((codePoint >> 12) & 0x3f) | 0x80,
          ((codePoint >> 6) & 0x3f) | 0x80, (codePoint & 0x3f) | 0x80);
    }
  }

  return encoded;
}
