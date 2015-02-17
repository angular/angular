var _global = typeof window === 'undefined' ? global : window;
export {_global as global};

export var Type = Function;
export var Math = _global.Math;

var assertionsEnabled_ = typeof assert !== 'undefined';

var int;
// global assert support, as Dart has it...
// TODO: `assert` calls need to be removed in production code!
if (assertionsEnabled_) {
  _global.assert = assert;
  // `int` is not a valid JS type
  int = assert.define('int', function(value) {
    return typeof value === 'number' && value%1 === 0;
  });
} else {
  int = {};
  _global.assert = function() {};
}
export {int};

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

export function isString(obj):boolean {
  return typeof obj === "string";
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
  static fromCharCode(code:int):string {
    return String.fromCharCode(code);
  }

  static charCodeAt(s:string, index:int) {
    return s.charCodeAt(index);
  }

  static split(s:string, regExp:RegExp) {
    return s.split(regExp.multiple);
  }

  static equals(s:string, s2:string):boolean {
    return s === s2;
  }

  static replaceAll(s:string, from:RegExp, replace:string):string {
    return s.replace(from.multiple, replace);
  }

  static startsWith(s:string, start:string) {
    return s.startsWith(start);
  }

  static substring(s:string, start:int, end:int = null) {
    return s.substring(start, end === null ? undefined: end);
  }

  static replaceAllMapped(s:string, from:RegExp, cb:Function): string {
    return s.replace(from.multiple, function(...matches) {
      return cb(matches);
    });
  }

  static contains(s:string, substr:string): boolean {
    return s.indexOf(substr) != -1;
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
    super();
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

  static get NaN():number {
    return NaN;
  }

  static isNaN(value):boolean {
    return isNaN(value);
  }

  static isInteger(value):boolean {
    return Number.isInteger(value);
  }
}

var RegExp;
if (assertionsEnabled_) {
  RegExp = assert.define('RegExp', function(obj) {
    assert(obj).is(assert.structure({
      single: _global.RegExp,
      multiple: _global.RegExp
    }));
  });
} else {
  RegExp = {};
}

export class RegExpWrapper {
  static create(regExpStr, flags:string = ''):RegExp {
    flags = flags.replace(/g/g, '');
    return {
      multiple: new _global.RegExp(regExpStr, flags + 'g'),
      single: new _global.RegExp(regExpStr, flags)
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

export function isJsObject(o):boolean {
  return o !== null && (typeof o === "function" || typeof o === "object");
}

export function assertionsEnabled():boolean {
  return assertionsEnabled_;
}

export function print(obj) {
  if (obj instanceof Error) {
    console.log(obj.stack);
  } else {
    console.log(obj);
  }
}

// Can't be all uppercase as our transpiler would think it is a special directive...
export var Json = _global.JSON;
