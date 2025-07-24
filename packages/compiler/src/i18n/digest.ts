/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Byte} from '../util';

import * as i18n from './i18n_ast';

/**
 * A lazily created TextEncoder instance for converting strings into UTF-8 bytes
 */
let textEncoder: TextEncoder | undefined;

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
  const parts = message.nodes.map((a) => a.visit(visitor, null));
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
    return `[${container.children.map((child) => child.visit(this)).join(', ')}]`;
  }

  visitIcu(icu: i18n.Icu, context: any): any {
    const strCases = Object.keys(icu.cases).map(
      (k: string) => `${k} {${icu.cases[k].visit(this)}}`,
    );
    return `{${icu.expression}, ${icu.type}, ${strCases.join(', ')}}`;
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder, context: any): any {
    return ph.isVoid
      ? `<ph tag name="${ph.startName}"/>`
      : `<ph tag name="${ph.startName}">${ph.children
          .map((child) => child.visit(this))
          .join(', ')}</ph name="${ph.closeName}">`;
  }

  visitPlaceholder(ph: i18n.Placeholder, context: any): any {
    return ph.value ? `<ph name="${ph.name}">${ph.value}</ph>` : `<ph name="${ph.name}"/>`;
  }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): any {
    return `<ph icu name="${ph.name}">${ph.value.visit(this)}</ph>`;
  }

  visitBlockPlaceholder(ph: i18n.BlockPlaceholder, context: any): any {
    return `<ph block name="${ph.startName}">${ph.children
      .map((child) => child.visit(this))
      .join(', ')}</ph name="${ph.closeName}">`;
  }
}

const serializerVisitor = new _SerializerVisitor();

export function serializeNodes(nodes: i18n.Node[]): string[] {
  return nodes.map((a) => a.visit(serializerVisitor, null));
}

/**
 * Serialize the i18n ast to something xml-like in order to generate an UID.
 *
 * Ignore the ICU expressions so that message IDs stays identical if only the expression changes.
 *
 * @internal
 */
class _SerializerIgnoreIcuExpVisitor extends _SerializerVisitor {
  override visitIcu(icu: i18n.Icu): string {
    let strCases = Object.keys(icu.cases).map((k: string) => `${k} {${icu.cases[k].visit(this)}}`);
    // Do not take the expression into account
    return `{${icu.type}, ${strCases.join(', ')}}`;
  }
}

/**
 * Compute the SHA1 of the given string
 *
 * see https://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 *
 * WARNING: this function has not been designed not tested with security in mind.
 *          DO NOT USE IT IN A SECURITY SENSITIVE CONTEXT.
 */
export function sha1(str: string): string {
  textEncoder ??= new TextEncoder();
  const utf8 = [...textEncoder.encode(str)];
  const words32 = bytesToWords32(utf8, Endian.Big);
  const len = utf8.length * 8;

  const w = new Uint32Array(80);
  let a = 0x67452301,
    b = 0xefcdab89,
    c = 0x98badcfe,
    d = 0x10325476,
    e = 0xc3d2e1f0;

  words32[len >> 5] |= 0x80 << (24 - (len % 32));
  words32[(((len + 64) >> 9) << 4) + 15] = len;

  for (let i = 0; i < words32.length; i += 16) {
    const h0 = a,
      h1 = b,
      h2 = c,
      h3 = d,
      h4 = e;

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

  // Convert the output parts to a 160-bit hexadecimal string
  return toHexU32(a) + toHexU32(b) + toHexU32(c) + toHexU32(d) + toHexU32(e);
}

/**
 * Convert and format a number as a string representing a 32-bit unsigned hexadecimal number.
 * @param value The value to format as a string.
 * @returns A hexadecimal string representing the value.
 */
function toHexU32(value: number): string {
  // unsigned right shift of zero ensures an unsigned 32-bit number
  return (value >>> 0).toString(16).padStart(8, '0');
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
export function fingerprint(str: string): bigint {
  textEncoder ??= new TextEncoder();
  const utf8 = textEncoder.encode(str);
  const view = new DataView(utf8.buffer, utf8.byteOffset, utf8.byteLength);

  let hi = hash32(view, utf8.length, 0);
  let lo = hash32(view, utf8.length, 102072);

  if (hi == 0 && (lo == 0 || lo == 1)) {
    hi = hi ^ 0x130f9bef;
    lo = lo ^ -0x6b5f56d8;
  }

  return (BigInt.asUintN(32, BigInt(hi)) << BigInt(32)) | BigInt.asUintN(32, BigInt(lo));
}

export function computeMsgId(msg: string, meaning: string = ''): string {
  let msgFingerprint = fingerprint(msg);

  if (meaning) {
    // Rotate the 64-bit message fingerprint one bit to the left and then add the meaning
    // fingerprint.
    msgFingerprint =
      BigInt.asUintN(64, msgFingerprint << BigInt(1)) |
      ((msgFingerprint >> BigInt(63)) & BigInt(1));
    msgFingerprint += fingerprint(meaning);
  }

  return BigInt.asUintN(63, msgFingerprint).toString();
}

function hash32(view: DataView, length: number, c: number): number {
  let a = 0x9e3779b9,
    b = 0x9e3779b9;
  let index = 0;

  const end = length - 12;
  for (; index <= end; index += 12) {
    a += view.getUint32(index, true);
    b += view.getUint32(index + 4, true);
    c += view.getUint32(index + 8, true);
    const res = mix(a, b, c);
    (a = res[0]), (b = res[1]), (c = res[2]);
  }

  const remainder = length - index;

  // the first byte of c is reserved for the length
  c += length;

  if (remainder >= 4) {
    a += view.getUint32(index, true);
    index += 4;

    if (remainder >= 8) {
      b += view.getUint32(index, true);
      index += 4;

      // Partial 32-bit word for c
      if (remainder >= 9) {
        c += view.getUint8(index++) << 8;
      }
      if (remainder >= 10) {
        c += view.getUint8(index++) << 16;
      }
      if (remainder === 11) {
        c += view.getUint8(index++) << 24;
      }
    } else {
      // Partial 32-bit word for b
      if (remainder >= 5) {
        b += view.getUint8(index++);
      }
      if (remainder >= 6) {
        b += view.getUint8(index++) << 8;
      }
      if (remainder === 7) {
        b += view.getUint8(index++) << 16;
      }
    }
  } else {
    // Partial 32-bit word for a
    if (remainder >= 1) {
      a += view.getUint8(index++);
    }
    if (remainder >= 2) {
      a += view.getUint8(index++) << 8;
    }
    if (remainder === 3) {
      a += view.getUint8(index++) << 16;
    }
  }

  return mix(a, b, c)[2];
}

function mix(a: number, b: number, c: number): [number, number, number] {
  a -= b;
  a -= c;
  a ^= c >>> 13;
  b -= c;
  b -= a;
  b ^= a << 8;
  c -= a;
  c -= b;
  c ^= b >>> 13;
  a -= b;
  a -= c;
  a ^= c >>> 12;
  b -= c;
  b -= a;
  b ^= a << 16;
  c -= a;
  c -= b;
  c ^= b >>> 5;
  a -= b;
  a -= c;
  a ^= c >>> 3;
  b -= c;
  b -= a;
  b ^= a << 10;
  c -= a;
  c -= b;
  c ^= b >>> 15;
  return [a, b, c];
}

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

// Rotate a 32b number left `count` position
function rol32(a: number, count: number): number {
  return (a << count) | (a >>> (32 - count));
}

function bytesToWords32(bytes: Byte[], endian: Endian): number[] {
  const size = (bytes.length + 3) >>> 2;
  const words32 = [];

  for (let i = 0; i < size; i++) {
    words32[i] = wordAt(bytes, i * 4, endian);
  }

  return words32;
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
