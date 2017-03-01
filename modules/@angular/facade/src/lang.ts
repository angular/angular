/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


export function getTypeNameForDebugging(type: any): string {
  return type['name'] || typeof type;
}

export function isPresent(obj: any): boolean {
  return obj != null;
}

export function isBlank(obj: any): boolean {
  return obj == null;
}

const STRING_MAP_PROTO = Object.getPrototypeOf({});
export function isStrictStringMap(obj: any): boolean {
  return typeof obj === 'object' && obj !== null && Object.getPrototypeOf(obj) === STRING_MAP_PROTO;
}

export function stringify(token: any): string {
  if (typeof token === 'string') {
    return token;
  }

  if (token == null) {
    return '' + token;
  }

  if (token.overriddenName) {
    return `${token.overriddenName}`;
  }

  if (token.name) {
    return `${token.name}`;
  }

  const res = token.toString();
  const newLineIndex = res.indexOf('\n');
  return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
}

export class NumberWrapper {
  static parseIntAutoRadix(text: string): number {
    const result: number = parseInt(text);
    if (isNaN(result)) {
      throw new Error('Invalid integer literal when parsing ' + text);
    }
    return result;
  }

  static isNumeric(value: any): boolean { return !isNaN(value - parseFloat(value)); }
}

// JS has NaN !== NaN
export function looseIdentical(a: any, b: any): boolean {
  return a === b || typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b);
}

export function isJsObject(o: any): boolean {
  return o !== null && (typeof o === 'function' || typeof o === 'object');
}

export function print(obj: Error | Object) {
  // tslint:disable-next-line:no-console
  console.log(obj);
}

export function warn(obj: Error | Object) {
  console.warn(obj);
}

export function setValueOnPath(global: any, path: string, value: any) {
  const parts = path.split('.');
  let obj: any = global;
  while (parts.length > 1) {
    const name = parts.shift();
    if (obj.hasOwnProperty(name) && obj[name] != null) {
      obj = obj[name];
    } else {
      obj = obj[name] = {};
    }
  }
  if (obj === undefined || obj === null) {
    obj = {};
  }
  obj[parts.shift()] = value;
}

export function isPrimitive(obj: any): boolean {
  return !isJsObject(obj);
}

export function escapeRegExp(s: string): string {
  return s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
}
