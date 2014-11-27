import {assert} from 'rtts_assert/rtts_assert';

export var Type = Function;
export var Math = window.Math;

// global assert support, as Dart has it...
// TODO: `assert` calls need to be removed in production code!
window.assert = assert;

export class FIELD {
  constructor(definition) {
    this.definition = definition;
  }
}

export class CONST {}
export class ABSTRACT {}
export class IMPLEMENTS {}


export function isPresent(obj):boolean {
  return obj !== undefined && obj !== null;
}

export function isBlank(obj):boolean {
  return obj === undefined || obj === null;
}

export function toBool(obj) {
  return !!obj;
}

export function autoConvertAdd(a, b) {
  return a + b;
}

export function stringify(token):string {
  if (typeof token === 'string') {
    return token;
  }

  if (token === undefined || token === null) {
    return '' + token;
  }

  if (token.name) {
    return token.name;
  }

  return token.toString();
}

export class StringWrapper {
  static fromCharCode(code:int) {
    return String.fromCharCode(code);
  }

  static charCodeAt(s:string, index:int) {
    return s.charCodeAt(index);
  }

  static split(s:string, regExp:RegExp) {
    return s.split(regExp.multiple);
  }

  static equals(s:string, s2:string) {
    return s === s2;
  }

  static replaceAll(s:string, from:RegExp, replace:string) {
    return s.replace(from.multiple, replace);
  }
}

export class StringJoiner {
  constructor() {
    this.parts = [];
  }

  add(part:string) {
    this.parts.push(part);
  }

  toString():string {
    return this.parts.join("");
  }
}

export class NumberParseError extends Error {
  constructor(message) {
    this.message = message;
  }

  toString() {
    return this.message;
  }
}


export class NumberWrapper {
  static parseIntAutoRadix(text:string):int {
    var result:int = parseInt(text);
    if (isNaN(result)) {
      throw new NumberParseError("Invalid integer literal when parsing " + text);
    }
    return result;
  }

  static parseInt(text:string, radix:int):int {
    if (radix == 10) {
      if (/^(\-|\+)?[0-9]+$/.test(text)) {
        return parseInt(text, radix);
      }
    } else if (radix == 16) {
      if (/^(\-|\+)?[0-9ABCDEFabcdef]+$/.test(text)) {
        return parseInt(text, radix);
      }
    } else {
      var result:int = parseInt(text, radix);
      if (!isNaN(result)) {
        return result;
      }
    }
    throw new NumberParseError("Invalid integer literal when parsing " + text + " in base " + radix);
  }

  // TODO: NaN is a valid literal but is returned by parseFloat to indicate an error.
  static parseFloat(text:string):number {
    return parseFloat(text);
  }

  static isNaN(value) {
    return isNaN(value);
  }

  static get NaN():number {
    return NaN;
  }
}

export function int() {};
int.assert = function(value) {
  return value == null || typeof value == 'number' && value === Math.floor(value);
}

export var RegExp = assert.define('RegExp', function(obj) {
  assert(obj).is(assert.structure({
    single: window.RegExp,
    multiple: window.RegExp
  }));
});

export class RegExpWrapper {
  static create(regExpStr):RegExp {
    return {
      multiple: new window.RegExp(regExpStr, 'g'),
      single: new window.RegExp(regExpStr)
    };
  }
  static firstMatch(regExp, input) {
    return input.match(regExp.single);
  }
  static matcher(regExp, input) {
    return {
      re: regExp.multiple,
      input: input
    };
  }
}

export class RegExpMatcherWrapper {
  static next(matcher) {
    return matcher.re.exec(matcher.input);
  }
}

export class FunctionWrapper {
  static apply(fn:Function, posArgs) {
    return fn.apply(null, posArgs);
  }
}

// No subclass so that we preserve error stack.
export var BaseException = Error;

// JS has NaN !== NaN
export function looseIdentical(a, b):boolean {
  return a === b ||
         typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b);
}

// JS considers NaN is the same as NaN for map Key (while NaN !== NaN otherwise)
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
export function getMapKey(value) {
  return value;
}

export function normalizeBlank(obj) {
  return isBlank(obj) ? null : obj;
}