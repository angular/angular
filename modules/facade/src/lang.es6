export var Future = Promise;
export var Type = Function;

export class FIELD {
  constructor(definition) {
    this.definition = definition;
  }
}

export class CONST {}
export class ABSTRACT {}
export class IMPLEMENTS {}


export class StringWrapper {
  static fromCharCode(code:number/*int*/) {
    return String.fromCharCode(code);
  }

  static charCodeAt(s:string, index:number/*int*/) {
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
  static parseIntAutoRadix(text:string):number/*int*/ {
    var result:number/*int*/ = parseInt(text);
    if (isNaN(result)) {
      throw new Error("Invalid integer literal when parsing " + text);
    }
    return result;
  }

  static parseInt(text:string, radix:number/*int*/):number/*int*/ {
    var result:number/*int*/ = parseInt(text, radix);
    if (isNaN(result)) {
      throw new Error("Invalid integer literal when parsing " + text + " in base " + radix);
    }
    return result;
  }

  // TODO: NaN is a valid literal but is returned by parseFloat to indicate an error.
  static parseFloat(text:string):number/*int*/ {
    return parseFloat(text);
  }
}
