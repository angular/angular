/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const DASH_CASE_REGEXP = /-+([a-z0-9])/g;

export function dashCaseToCamelCase(input: string): string {
  return input.replace(DASH_CASE_REGEXP, (...m: any[]) => m[1].toUpperCase());
}

export function splitAtColon(input: string, defaultValues: (string | null)[]): (string | null)[] {
  return _splitAt(input, ':', defaultValues);
}

export function splitAtPeriod(input: string, defaultValues: (string | null)[]): (string | null)[] {
  return _splitAt(input, '.', defaultValues);
}

function _splitAt(
  input: string,
  character: string,
  defaultValues: (string | null)[],
): (string | null)[] {
  const characterIndex = input.indexOf(character);
  if (characterIndex == -1) return defaultValues;
  return [input.slice(0, characterIndex).trim(), input.slice(characterIndex + 1).trim()];
}

export function noUndefined<T>(val: T | undefined): T {
  return val === undefined ? null! : val;
}

export function error(msg: string): never {
  throw new Error(`Internal Error: ${msg}`);
}

// Escape characters that have a special meaning in Regular Expressions
export function escapeRegExp(s: string): string {
  return s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
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
        (codePoint >> 12) | 0xe0,
        ((codePoint >> 6) & 0x3f) | 0x80,
        (codePoint & 0x3f) | 0x80,
      );
    } else if (codePoint <= 0x1fffff) {
      encoded.push(
        ((codePoint >> 18) & 0x07) | 0xf0,
        ((codePoint >> 12) & 0x3f) | 0x80,
        ((codePoint >> 6) & 0x3f) | 0x80,
        (codePoint & 0x3f) | 0x80,
      );
    }
  }

  return encoded;
}

export function stringify(token: any): string {
  if (typeof token === 'string') {
    return token;
  }

  if (Array.isArray(token)) {
    return `[${token.map(stringify).join(', ')}]`;
  }

  if (token == null) {
    return '' + token;
  }

  const name = token.overriddenName || token.name;
  if (name) {
    return `${name}`;
  }

  if (!token.toString) {
    return 'object';
  }

  // WARNING: do not try to `JSON.stringify(token)` here
  // see https://github.com/angular/angular/issues/23440
  const result = token.toString();

  if (result == null) {
    return '' + result;
  }

  const newLineIndex = result.indexOf('\n');
  return newLineIndex >= 0 ? result.slice(0, newLineIndex) : result;
}

export class Version {
  public readonly major: string;
  public readonly minor: string;
  public readonly patch: string;

  constructor(public full: string) {
    const splits = full.split('.');
    this.major = splits[0];
    this.minor = splits[1];
    this.patch = splits.slice(2).join('.');
  }
}

export interface Console {
  log(message: string): void;
  warn(message: string): void;
}

const _global: {[name: string]: any} = globalThis;
export {_global as global};

const V1_TO_18 = /^([1-9]|1[0-8])\./;

export function getJitStandaloneDefaultForVersion(version: string): boolean {
  if (version.startsWith('0.')) {
    // 0.0.0 is always "latest", default is true.
    return true;
  }
  if (V1_TO_18.test(version)) {
    // Angular v2 - v18 default is false.
    return false;
  }

  // All other Angular versions (v19+) default to true.
  return true;
}
