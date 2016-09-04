/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18n from './i18n_ast';

export function digestMessage(message: i18n.Message): string {
  return sha1(serializeNodes(message.nodes).join('') + `[${message.meaning}]`);
}

/**
 * Serialize the i18n ast to something xml-like in order to generate an UID.
 *
 * The visitor is also used in the i18n parser tests
 *
 * @internal
 */
class _SerializerVisitor implements i18n.Visitor {
  visitText(text: i18n.Text, context: any): any { return text.value; }

  visitContainer(container: i18n.Container, context: any): any {
    return `[${container.children.map(child => child.visit(this)).join(', ')}]`;
  }

  visitIcu(icu: i18n.Icu, context: any): any {
    let strCases = Object.keys(icu.cases).map((k: string) => `${k} {${icu.cases[k].visit(this)}}`);
    return `{${icu.expression}, ${icu.type}, ${strCases.join(', ')}}`;
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder, context: any): any {
    return ph.isVoid ?
        `<ph tag name="${ph.startName}"/>` :
        `<ph tag name="${ph.startName}">${ph.children.map(child => child.visit(this)).join(', ')}</ph name="${ph.closeName}">`;
  }

  visitPlaceholder(ph: i18n.Placeholder, context: any): any {
    return `<ph name="${ph.name}">${ph.value}</ph>`;
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
 * Compute the SHA1 of the given string
 *
 * see http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf
 *
 * WARNING: this function has not been designed not tested with security in mind.
 *          DO NOT USE IT IN A SECURITY SENSITIVE CONTEXT.
 */
export function sha1(str: string): string {
  const utf8 = utf8Encode(str);
  const words32 = stringToWords32(utf8);
  const len = utf8.length * 8;

  const w = new Array(80);
  let [a, b, c, d, e]: number[] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

  words32[len >> 5] |= 0x80 << (24 - len % 32);
  words32[((len + 64 >> 9) << 4) + 15] = len;

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

  const sha1 = words32ToString([a, b, c, d, e]);

  let hex: string = '';
  for (let i = 0; i < sha1.length; i++) {
    const b = sha1.charCodeAt(i);
    hex += (b >>> 4 & 0x0f).toString(16) + (b & 0x0f).toString(16);
  }

  return hex.toLowerCase();
}

function utf8Encode(str: string): string {
  let encoded: string = '';

  for (let index = 0; index < str.length; index++) {
    const codePoint = decodeSurrogatePairs(str, index);

    if (codePoint <= 0x7f) {
      encoded += String.fromCharCode(codePoint);
    } else if (codePoint <= 0x7ff) {
      encoded += String.fromCharCode(0xc0 | codePoint >>> 6, 0x80 | codePoint & 0x3f);
    } else if (codePoint <= 0xffff) {
      encoded += String.fromCharCode(
          0xe0 | codePoint >>> 12, 0x80 | codePoint >>> 6 & 0x3f, 0x80 | codePoint & 0x3f);
    } else if (codePoint <= 0x1fffff) {
      encoded += String.fromCharCode(
          0xf0 | codePoint >>> 18, 0x80 | codePoint >>> 12 & 0x3f, 0x80 | codePoint >>> 6 & 0x3f,
          0x80 | codePoint & 0x3f);
    }
  }

  return encoded;
}

// see https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
function decodeSurrogatePairs(str: string, index: number): number {
  if (index < 0 || index >= str.length) {
    throw new Error(`index=${index} is out of range in "${str}"`);
  }

  const high = str.charCodeAt(index);
  let low: number;

  if (high >= 0xd800 && high <= 0xdfff && str.length > index + 1) {
    low = str.charCodeAt(index + 1);
    if (low >= 0xdc00 && low <= 0xdfff) {
      return (high - 0xd800) * 0x400 + low - 0xdc00 + 0x10000;
    }
  }

  return high;
}

function stringToWords32(str: string): number[] {
  const words32 = Array(str.length >>> 2);

  for (let i = 0; i < words32.length; i++) {
    words32[i] = 0;
  }

  for (let i = 0; i < str.length; i++) {
    words32[i >>> 2] |= (str.charCodeAt(i) & 0xff) << 8 * (3 - i & 0x3);
  }

  return words32;
}

function words32ToString(words32: number[]): string {
  let str = '';
  for (let i = 0; i < words32.length * 4; i++) {
    str += String.fromCharCode((words32[i >>> 2] >>> 8 * (3 - i & 0x3)) & 0xff);
  }
  return str;
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

function add32(a: number, b: number): number {
  const low = (a & 0xffff) + (b & 0xffff);
  const high = (a >> 16) + (b >> 16) + (low >> 16);
  return (high << 16) | (low & 0xffff);
}

function rol32(a: number, count: number): number {
  return (a << count) | (a >>> (32 - count));
}