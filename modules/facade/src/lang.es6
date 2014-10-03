export var Type = Function;

export class FIELD {
  constructor(definition) {
    this.definition = definition;
  }
}

export class CONST {}
export class ABSTRACT {}
export class IMPLEMENTS {}


export function isPresent(obj){
  return obj != undefined && obj != null;
}

export function isBlank(obj){
  return obj == undefined || obj == null;
}

export function stringify(token) {
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

export class NumberWrapper {
  static parseIntAutoRadix(text:string):int {
    var result:int = parseInt(text);
    if (isNaN(result)) {
      throw new Error("Invalid integer literal when parsing " + text);
    }
    return result;
  }

  static parseInt(text:string, radix:int):int {
    var result:int = parseInt(text, radix);
    if (isNaN(result)) {
      throw new Error("Invalid integer literal when parsing " + text + " in base " + radix);
    }
    return result;
  }

  // TODO: NaN is a valid literal but is returned by parseFloat to indicate an error.
  static parseFloat(text:string):number {
    return parseFloat(text);
  }
}

export function int() {};
int.assert = function(value) {
  return value == null || typeof value == 'number' && value === Math.floor(value);
}
