var globalScope;
if (typeof window === 'undefined') {
    if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
        // TODO: Replace any with WorkerGlobalScope from lib.webworker.d.ts #3492
        globalScope = self;
    }
    else {
        globalScope = global;
    }
}
else {
    globalScope = window;
}
;
export const IS_DART = false;
// Need to declare a new variable for global here since TypeScript
// exports the original value of the symbol.
var _global = globalScope;
export { _global as global };
export var Type = Function;
export function getTypeNameForDebugging(type) {
    return type['name'];
}
export var Math = _global.Math;
export var Date = _global.Date;
var _devMode = true;
var _modeLocked = false;
export function lockMode() {
    _modeLocked = true;
}
/**
 * Disable Angular's development mode, which turns off assertions and other
 * checks within the framework.
 *
 * One important assertion this disables verifies that a change detection pass
 * does not result in additional changes to any bindings (also known as
 * unidirectional data flow).
 */
export function enableProdMode() {
    if (_modeLocked) {
        // Cannot use BaseException as that ends up importing from facade/lang.
        throw 'Cannot enable prod mode after platform setup.';
    }
    _devMode = false;
}
export function assertionsEnabled() {
    return _devMode;
}
// TODO: remove calls to assert in production environment
// Note: Can't just export this and import in in other files
// as `assert` is a reserved keyword in Dart
_global.assert = function assert(condition) {
    // TODO: to be fixed properly via #2830, noop for now
};
// This function is needed only to properly support Dart's const expressions
// see https://github.com/angular/ts2dart/pull/151 for more info
export function CONST_EXPR(expr) {
    return expr;
}
export function CONST() {
    return (target) => target;
}
export function isPresent(obj) {
    return obj !== undefined && obj !== null;
}
export function isBlank(obj) {
    return obj === undefined || obj === null;
}
export function isString(obj) {
    return typeof obj === "string";
}
export function isFunction(obj) {
    return typeof obj === "function";
}
export function isType(obj) {
    return isFunction(obj);
}
export function isStringMap(obj) {
    return typeof obj === 'object' && obj !== null;
}
export function isPromise(obj) {
    return obj instanceof _global.Promise;
}
export function isArray(obj) {
    return Array.isArray(obj);
}
export function isNumber(obj) {
    return typeof obj === 'number';
}
export function isDate(obj) {
    return obj instanceof Date && !isNaN(obj.valueOf());
}
export function noop() { }
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
    var res = token.toString();
    var newLineIndex = res.indexOf("\n");
    return (newLineIndex === -1) ? res : res.substring(0, newLineIndex);
}
// serialize / deserialize enum exist only for consistency with dart API
// enums in typescript don't need to be serialized
export function serializeEnum(val) {
    return val;
}
export function deserializeEnum(val, values) {
    return val;
}
export class StringWrapper {
    static fromCharCode(code) { return String.fromCharCode(code); }
    static charCodeAt(s, index) { return s.charCodeAt(index); }
    static split(s, regExp) { return s.split(regExp); }
    static equals(s, s2) { return s === s2; }
    static stripLeft(s, charVal) {
        if (s && s.length) {
            var pos = 0;
            for (var i = 0; i < s.length; i++) {
                if (s[i] != charVal)
                    break;
                pos++;
            }
            s = s.substring(pos);
        }
        return s;
    }
    static stripRight(s, charVal) {
        if (s && s.length) {
            var pos = s.length;
            for (var i = s.length - 1; i >= 0; i--) {
                if (s[i] != charVal)
                    break;
                pos--;
            }
            s = s.substring(0, pos);
        }
        return s;
    }
    static replace(s, from, replace) {
        return s.replace(from, replace);
    }
    static replaceAll(s, from, replace) {
        return s.replace(from, replace);
    }
    static slice(s, from = 0, to = null) {
        return s.slice(from, to === null ? undefined : to);
    }
    static replaceAllMapped(s, from, cb) {
        return s.replace(from, function (...matches) {
            // Remove offset & string from the result array
            matches.splice(-2, 2);
            // The callback receives match, p1, ..., pn
            return cb(matches);
        });
    }
    static contains(s, substr) { return s.indexOf(substr) != -1; }
    static compare(a, b) {
        if (a < b) {
            return -1;
        }
        else if (a > b) {
            return 1;
        }
        else {
            return 0;
        }
    }
}
export class StringJoiner {
    constructor(parts = []) {
        this.parts = parts;
    }
    add(part) { this.parts.push(part); }
    toString() { return this.parts.join(""); }
}
export class NumberParseError extends Error {
    constructor(message) {
        super();
        this.message = message;
    }
    toString() { return this.message; }
}
export class NumberWrapper {
    static toFixed(n, fractionDigits) { return n.toFixed(fractionDigits); }
    static equal(a, b) { return a === b; }
    static parseIntAutoRadix(text) {
        var result = parseInt(text);
        if (isNaN(result)) {
            throw new NumberParseError("Invalid integer literal when parsing " + text);
        }
        return result;
    }
    static parseInt(text, radix) {
        if (radix == 10) {
            if (/^(\-|\+)?[0-9]+$/.test(text)) {
                return parseInt(text, radix);
            }
        }
        else if (radix == 16) {
            if (/^(\-|\+)?[0-9ABCDEFabcdef]+$/.test(text)) {
                return parseInt(text, radix);
            }
        }
        else {
            var result = parseInt(text, radix);
            if (!isNaN(result)) {
                return result;
            }
        }
        throw new NumberParseError("Invalid integer literal when parsing " + text + " in base " +
            radix);
    }
    // TODO: NaN is a valid literal but is returned by parseFloat to indicate an error.
    static parseFloat(text) { return parseFloat(text); }
    static get NaN() { return NaN; }
    static isNaN(value) { return isNaN(value); }
    static isInteger(value) { return Number.isInteger(value); }
}
export var RegExp = _global.RegExp;
export class RegExpWrapper {
    static create(regExpStr, flags = '') {
        flags = flags.replace(/g/g, '');
        return new _global.RegExp(regExpStr, flags + 'g');
    }
    static firstMatch(regExp, input) {
        // Reset multimatch regex state
        regExp.lastIndex = 0;
        return regExp.exec(input);
    }
    static test(regExp, input) {
        regExp.lastIndex = 0;
        return regExp.test(input);
    }
    static matcher(regExp, input) {
        // Reset regex state for the case
        // someone did not loop over all matches
        // last time.
        regExp.lastIndex = 0;
        return { re: regExp, input: input };
    }
}
export class RegExpMatcherWrapper {
    static next(matcher) {
        return matcher.re.exec(matcher.input);
    }
}
export class FunctionWrapper {
    static apply(fn, posArgs) { return fn.apply(null, posArgs); }
}
// JS has NaN !== NaN
export function looseIdentical(a, b) {
    return a === b || typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b);
}
// JS considers NaN is the same as NaN for map Key (while NaN !== NaN otherwise)
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
export function getMapKey(value) {
    return value;
}
export function normalizeBlank(obj) {
    return isBlank(obj) ? null : obj;
}
export function normalizeBool(obj) {
    return isBlank(obj) ? false : obj;
}
export function isJsObject(o) {
    return o !== null && (typeof o === "function" || typeof o === "object");
}
export function print(obj) {
    console.log(obj);
}
// Can't be all uppercase as our transpiler would think it is a special directive...
export class Json {
    static parse(s) { return _global.JSON.parse(s); }
    static stringify(data) {
        // Dart doesn't take 3 arguments
        return _global.JSON.stringify(data, null, 2);
    }
}
export class DateWrapper {
    static create(year, month = 1, day = 1, hour = 0, minutes = 0, seconds = 0, milliseconds = 0) {
        return new Date(year, month - 1, day, hour, minutes, seconds, milliseconds);
    }
    static fromISOString(str) { return new Date(str); }
    static fromMillis(ms) { return new Date(ms); }
    static toMillis(date) { return date.getTime(); }
    static now() { return new Date(); }
    static toJson(date) { return date.toJSON(); }
}
export function setValueOnPath(global, path, value) {
    var parts = path.split('.');
    var obj = global;
    while (parts.length > 1) {
        var name = parts.shift();
        if (obj.hasOwnProperty(name) && isPresent(obj[name])) {
            obj = obj[name];
        }
        else {
            obj = obj[name] = {};
        }
    }
    if (obj === undefined || obj === null) {
        obj = {};
    }
    obj[parts.shift()] = value;
}
var _symbolIterator = null;
export function getSymbolIterator() {
    if (isBlank(_symbolIterator)) {
        if (isPresent(Symbol) && isPresent(Symbol.iterator)) {
            _symbolIterator = Symbol.iterator;
        }
        else {
            // es6-shim specific logic
            var keys = Object.getOwnPropertyNames(Map.prototype);
            for (var i = 0; i < keys.length; ++i) {
                var key = keys[i];
                if (key !== 'entries' && key !== 'size' &&
                    Map.prototype[key] === Map.prototype['entries']) {
                    _symbolIterator = key;
                }
            }
        }
    }
    return _symbolIterator;
}
