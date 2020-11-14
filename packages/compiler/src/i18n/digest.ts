/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {newArray, utf8Encode} from '../util';

import * as i18n from './i18n_ast';

/**
 * Return the message id or compute it using the XLIFF1 digest.
 */
export function digest(message: i18n.Message): string {
  return message.id || computeDigest(message);
}

/**
 * Compute the message id using the XLIFF1 digest.
 */
export function computeDigest(message: i18n.Message): string {
  return sha1(serializeNodes(message.nodes).join('') + `[${message.meaning}]`);
}

/**
 * Return the message id or compute it using the XLIFF2/XMB/$localize digest.
 */
export function decimalDigest(message: i18n.Message): string {
  return message.id || computeDecimalDigest(message);
}

/**
 * Compute the message id using the XLIFF2/XMB/$localize digest.
 */
export function computeDecimalDigest(message: i18n.Message): string {
  const visitor = new _SerializerIgnoreIcuExpVisitor();
  const parts = message.nodes.map(a => a.visit(visitor, null));
  return computeMsgId(parts.join(''), message.meaning);
}

/**
 * Serialize the i18n ast to something xml-like in order to generate an UID.
 *
 * The visitor is also used in the i18n parser tests
 *
 * @internal
 */
class _SerializerVisitor implements i18n.Visitor {
  visitText(text: i18n.Text, context: any): any {
    return text.value;
  }

  visitContainer(container: i18n.Container, context: any): any {
    return `[${container.children.map(child => child.visit(this)).join(', ')}]`;
  }

  visitIcu(icu: i18n.Icu, context: any): any {
    const strCases =
        Object.keys(icu.cases).map((k: string) => `${k} {${icu.cases[k].visit(this)}}`);
    return `{${icu.expression}, ${icu.type}, ${strCases.join(', ')}}`;
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder, context: any): any {
    return ph.isVoid ?
        `<ph tag name="${ph.startName}"/>` :
        `<ph tag name="${ph.startName}">${
            ph.children.map(child => child.visit(this)).join(', ')}</ph name="${ph.closeName}">`;
  }

  visitPlaceholder(ph: i18n.Placeholder, context: any): any {
    return ph.value ? `<ph name="${ph.name}">${ph.value}</ph>` : `<ph name="${ph.name}"/>`;
  }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): any {
    return `<ph icu name="${ph.name}">${ph.value.visit(this)}</ph>`;
  }
}

const serializerVisitor = new _SerializerVisitor();

export function serializeNodes(nodes: i18n.Node[]): string[] {
  return nodes.map(a => a.visit(serializerVisitor, null));
}

/**
 * Serialize the i18n ast to something xml-like in order to generate an UID.
 *
 * Ignore the ICU expressions so that message IDs stays identical if only the expression changes.
 *
 * @internal
 */
class _SerializerIgnoreIcuExpVisitor extends _SerializerVisitor {
  visitIcu(icu: i18n.Icu, context: any): any {
    let strCases = Object.keys(icu.cases).map((k: string) => `${k} {${icu.cases[k].visit(this)}}`);
    // Do not take the expression into account
    return `{${icu.type}, ${strCases.join(', ')}}`;
  }
}

/**
 * Compute the SHA1 of the given string
 *
 * see http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 *
 * WARNING: this function has not been designed not tested with security in mind.
 *          DO NOT USE IT IN A SECURITY SENSITIVE CONTEXT.
 */
export function sha1(str: string): string {
  const utf8 = utf8Encode(str);
  const words32 = stringToWords32(utf8, Endian.Big);
  const len = utf8.length * 8;

  const w = newArray(80);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476, e = 0xc3d2e1f0;

  words32[len >> 5] |= 0x80 << (24 - len % 32);
  words32[((len + 64 >> 9) << 4) + 15] = len;

  for (let i = 0; i < words32.length; i += 16) {
    const h0 = a, h1 = b, h2 = c, h3 = d, h4 = e;

    for (let j = 0; j < 80; j++) {
      if (j < 16) {
        w[j] = words32[i + j];
      } else {
        w[j] = rol32(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
      }

      const fkVal = fk(j, b, c, d);
      const f = fkVal[0];
      const k = fkVal[1];
      const temp = [rol32(a, 5), f, e, k, w[j]].reduce(add32);
      e = d;
      d = c;
      c = rol32(b, 30);
      b = a;
      a = temp;
    }
    a = add32(a, h0);
    b = add32(b, h1);
    c = add32(c, h2);
    d = add32(d, h3);
    e = add32(e, h4);
  }

  return byteStringToHexString(words32ToByteString([a, b, c, d, e]));
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

/**
 * Compute the fingerprint of the given string
 *
 * The output is 64 bit number encoded as a decimal string
 *
 * based on:
 * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/GoogleJsMessageIdGenerator.java
 */
export function fingerprint(str: string): [number, number] {
  const utf8 = utf8Encode(str);

  let hi = hash32(utf8, 0);
  let lo = hash32(utf8, 102072);

  if (hi == 0 && (lo == 0 || lo == 1)) {
    hi = hi ^ 0x130f9bef;
    lo = lo ^ -0x6b5f56d8;
  }

  return [hi, lo];
}

export function computeMsgId(msg: string, meaning: string = ''): string {
  let msgFingerprint = fingerprint(msg);

  if (meaning) {
    const meaningFingerprint = fingerprint(meaning);
    msgFingerprint = add64(rol64(msgFingerprint, 1), meaningFingerprint);
  }

  const hi = msgFingerprint[0];
  const lo = msgFingerprint[1];

  return byteStringToDecString(words32ToByteString([hi & 0x7fffffff, lo]));
}

function hash32(str: string, c: number): number {
  let a = 0x9e3779b9, b = 0x9e3779b9;
  let i: number;

  const len = str.length;

  for (i = 0; i + 12 <= len; i += 12) {
    a = add32(a, wordAt(str, i, Endian.Little));
    b = add32(b, wordAt(str, i + 4, Endian.Little));
    c = add32(c, wordAt(str, i + 8, Endian.Little));
    const res = mix(a, b, c);
    a = res[0], b = res[1], c = res[2];
  }

  a = add32(a, wordAt(str, i, Endian.Little));
  b = add32(b, wordAt(str, i + 4, Endian.Little));
  // the first byte of c is reserved for the length
  c = add32(c, len);
  c = add32(c, wordAt(str, i + 8, Endian.Little) << 8);

  return mix(a, b, c)[2];
}

// clang-format off
function mix(a: number, b: number, c: number): [number, number, number] {
  a = sub32(a, b); a = sub32(a, c); a ^= c >>> 13;
  b = sub32(b, c); b = sub32(b, a); b ^= a << 8;
  c = sub32(c, a); c = sub32(c, b); c ^= b >>> 13;
  a = sub32(a, b); a = sub32(a, c); a ^= c >>> 12;
  b = sub32(b, c); b = sub32(b, a); b ^= a << 16;
  c = sub32(c, a); c = sub32(c, b); c ^= b >>> 5;
  a = sub32(a, b); a = sub32(a, c); a ^= c >>> 3;
  b = sub32(b, c); b = sub32(b, a); b ^= a << 10;
  c = sub32(c, a); c = sub32(c, b); c ^= b >>> 15;
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

// Rotate a 32b number left `count` position
function rol32(a: number, count: number): number {
  return (a << count) | (a >>> (32 - count));
}

// Rotate a 64b number left `count` position
function rol64(num: [number, number], count: number): [number, number] {
  const hi = num[0], lo = num[1];
  const h = (hi << count) | (lo >>> (32 - count));
  const l = (lo << count) | (hi >>> (32 - count));
  return [h, l];
}

function stringToWords32(str: string, endian: Endian): number[] {
  const size = (str.length + 3) >>> 2;
  const words32 = [];

  for (let i = 0; i < size; i++) {
    words32[i] = wordAt(str, i * 4, endian);
  }

  return words32;
}

function byteAt(str: string, index: number): number {
  return index >= str.length ? 0 : str.charCodeAt(index) & 0xff;
}

function wordAt(str: string, index: number, endian: Endian): number {
  let word = 0;
  if (endian === Endian.Big) {
    for (let i = 0; i < 4; i++) {
      word += byteAt(str, index + i) << (24 - 8 * i);
    }
  } else {
    for (let i = 0; i < 4; i++) {
      word += byteAt(str, index + i) << 8 * i;
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
    str += String.fromCharCode((word >>> 8 * (3 - i)) & 0xff);
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

/**
 * Represents a big integer using a buffer of its individual digits, with the least significant
 * digit stored at the beginning of the array (little endian).
 *
 * For performance reasons, each instance is mutable. The addition operation can be done in-place
 * to reduce memory pressure of allocation for the digits array.
 */
class BigInteger {
  static zero(): BigInteger {
    return new BigInteger([0]);
  }

  static one(): BigInteger {
    return new BigInteger([1]);
  }

  /**
   * Creates a big integer using its individual digits in little endian storage.
   */
  private constructor(private readonly digits: number[]) {}

  /**
   * Creates a clone of this instance.
   */
  clone(): BigInteger {
    return new BigInteger(this.digits.slice());
  }

  /**
   * Returns a new big integer with the sum of `this` and `other` as its value. This does not mutate
   * `this` but instead returns a new instance, unlike `addToSelf`.
   */
  add(other: BigInteger): BigInteger {
    const result = this.clone();
    result.addToSelf(other);
    return result;
  }

  /**
   * Adds `other` to the instance itself, thereby mutating its value.
   */
  addToSelf(other: BigInteger): void {
    const maxNrOfDigits = Math.max(this.digits.length, other.digits.length);
    let carry = 0;
    for (let i = 0; i < maxNrOfDigits; i++) {
      let digitSum = carry;
      if (i < this.digits.length) {
        digitSum += this.digits[i];
      }
      if (i < other.digits.length) {
        digitSum += other.digits[i];
      }

      if (digitSum >= 10) {
        this.digits[i] = digitSum - 10;
        carry = 1;
      } else {
        this.digits[i] = digitSum;
        carry = 0;
      }
    }

    // Apply a remaining carry if needed.
    if (carry > 0) {
      this.digits[maxNrOfDigits] = 1;
    }
  }

  /**
   * Builds the decimal string representation of the big integer. As this is stored in
   * little endian, the digits are concatenated in reverse order.
   */
  toString(): string {
    let res = '';
    for (let i = this.digits.length - 1; i >= 0; i--) {
      res += this.digits[i];
    }
    return res;
  }
}

/**
 * Represents a big integer which is optimized for multiplication operations, as its power-of-twos
 * are memoized. See `numberTimesBigInt` for details on the multiplication algorithm.
 */
class BigIntForMultiplication {
  /**
   * Stores all memoized power-of-twos, where each index represents `this.number * 2^index`.
   */
  private readonly powerOfTwos: BigInteger[];

  constructor(value: BigInteger) {
    this.powerOfTwos = [value];
  }

  /**
   * Computes and memoizes the big integer value for `this.number * 2^exponent`.
   */
  getMultipliedByPowerOfTwo(exponent: number): BigInteger {
    // Compute the powers up until the requested exponent, where each value is computed from its
    // predecessor. This is simple as `this.number * 2^(exponent - 1)` only has to be doubled (i.e.
    // added to itself) to reach `this.number * 2^exponent`.
    for (let i = this.powerOfTwos.length; i <= exponent; i++) {
      const previousPower = this.powerOfTwos[i - 1];
      this.powerOfTwos[i] = previousPower.add(previousPower);
    }
    return this.powerOfTwos[exponent];
  }
}

/**
 * Represents an exponentiation operation for the provided base, of which exponents are computed and
 * memoized. The results are represented by a `BigIntForMultiplication` which is tailored for
 * multiplication operations by memoizing the power-of-twos. This effectively results in a matrix
 * representation that is lazily computed upon request.
 */
class BigIntExponentiation {
  private readonly exponents = [new BigIntForMultiplication(BigInteger.one())];

  constructor(private readonly base: number) {}

  /**
   * Compute the value for `this.base^exponent`, resulting in a big integer that is optimized for
   * further multiplication operations.
   */
  getExponent(exponent: number): BigIntForMultiplication {
    // Compute the results up until the requested exponent, where every value is computed from its
    // predecessor. This is because `this.base^(exponent - 1)` only has to be multiplied by `base`
    // to reach `this.base^exponent`.
    for (let i = this.exponents.length; i <= exponent; i++) {
      const value = numberTimesBigInt(this.base, this.exponents[i - 1]);
      this.exponents[i] = new BigIntForMultiplication(value);
    }
    return this.exponents[exponent];
  }
}

/**
 * Create a shared exponentiation pool for base-256 computations. This shared pool provides memoized
 * power-of-256 results with memoized power-of-two computations for efficient multiplication.
 *
 * For our purposes, this can be safely stored as a global without memory concerns. The reason is
 * that the maximum exponent is only 7, as the byte string only comprises 8 bytes.
 */
const base256 = new BigIntExponentiation(256);

// based on http://www.danvk.org/hex2dec.html (JS can not handle more than 56b)
function byteStringToDecString(str: string): string {
  const decimal = BigInteger.zero();

  for (let i = str.length - 1, exponent = 0; i >= 0; i--, exponent++) {
    decimal.addToSelf(numberTimesBigInt(byteAt(str, i), base256.getExponent(exponent)));
  }

  return decimal.toString();
}

/**
 * Computes the value for `num * b`, where `num` is a JS number and `b` is a big integer. The
 * value for `b` is represented by a storage model that is optimized for this computation.
 *
 * This operation is implemented in N(log2(num)) by continuous halving of the number, where the
 * least-significant bit (LSB) is tested in each iteration. If the bit is set, the bit's index is
 * used as exponent into the power-of-two multiplication of `b`.
 *
 * As an example, consider the multiplication num=42, b=1337. In binary 42 is 0b00101010 and the
 * algorithm unrolls into the following iterations:
 *
 *  Iteration | num        | LSB  | b * 2^iter | Add? | product
 * -----------|------------|------|------------|------|--------
 *  0         | 0b00101010 | 0    | 1337       | No   | 0
 *  1         | 0b00010101 | 1    | 2674       | Yes  | 2674
 *  2         | 0b00001010 | 0    | 5348       | No   | 2674
 *  3         | 0b00000101 | 1    | 10696      | Yes  | 13370
 *  4         | 0b00000010 | 0    | 21392      | No   | 13370
 *  5         | 0b00000001 | 1    | 42784      | Yes  | 56154
 *  6         | 0b00000000 | 0    | 85568      | No   | 56154
 *
 * The computed product of 56154 is indeed the correct result.
 *
 * The `BigIntForMultiplication` representation for a big integer provides memoized access to the
 * power-of-two values to reduce the workload in computing those values.
 */
function numberTimesBigInt(num: number, b: BigIntForMultiplication): BigInteger {
  const product = BigInteger.zero();
  for (let exponent = 0; num !== 0; num = num >>> 1, exponent++) {
    if (num & 1) {
      const value = b.getMultipliedByPowerOfTwo(exponent);
      product.addToSelf(value);
    }
  }
  return product;
}
