export var SetterFn = Function;

export class FieldGetterFactory {
  getter(object, name:string) {
    return new Function('o', 'return o["' + name + '"]');
  }
}

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
