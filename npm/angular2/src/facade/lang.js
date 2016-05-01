'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
function scheduleMicroTask(fn) {
    Zone.current.scheduleMicroTask('scheduleMicrotask', fn);
}
exports.scheduleMicroTask = scheduleMicroTask;
exports.IS_DART = false;
// Need to declare a new variable for global here since TypeScript
// exports the original value of the symbol.
var _global = globalScope;
exports.global = _global;
exports.Type = Function;
function getTypeNameForDebugging(type) {
    if (type['name']) {
        return type['name'];
    }
    return typeof type;
}
exports.getTypeNameForDebugging = getTypeNameForDebugging;
exports.Math = _global.Math;
exports.Date = _global.Date;
var _devMode = true;
var _modeLocked = false;
function lockMode() {
    _modeLocked = true;
}
exports.lockMode = lockMode;
/**
 * Disable Angular's development mode, which turns off assertions and other
 * checks within the framework.
 *
 * One important assertion this disables verifies that a change detection pass
 * does not result in additional changes to any bindings (also known as
 * unidirectional data flow).
 */
function enableProdMode() {
    if (_modeLocked) {
        // Cannot use BaseException as that ends up importing from facade/lang.
        throw 'Cannot enable prod mode after platform setup.';
    }
    _devMode = false;
}
exports.enableProdMode = enableProdMode;
function assertionsEnabled() {
    return _devMode;
}
exports.assertionsEnabled = assertionsEnabled;
// TODO: remove calls to assert in production environment
// Note: Can't just export this and import in in other files
// as `assert` is a reserved keyword in Dart
_global.assert = function assert(condition) {
    // TODO: to be fixed properly via #2830, noop for now
};
function isPresent(obj) {
    return obj !== undefined && obj !== null;
}
exports.isPresent = isPresent;
function isBlank(obj) {
    return obj === undefined || obj === null;
}
exports.isBlank = isBlank;
function isBoolean(obj) {
    return typeof obj === "boolean";
}
exports.isBoolean = isBoolean;
function isNumber(obj) {
    return typeof obj === "number";
}
exports.isNumber = isNumber;
function isString(obj) {
    return typeof obj === "string";
}
exports.isString = isString;
function isFunction(obj) {
    return typeof obj === "function";
}
exports.isFunction = isFunction;
function isType(obj) {
    return isFunction(obj);
}
exports.isType = isType;
function isStringMap(obj) {
    return typeof obj === 'object' && obj !== null;
}
exports.isStringMap = isStringMap;
var STRING_MAP_PROTO = Object.getPrototypeOf({});
function isStrictStringMap(obj) {
    return isStringMap(obj) && Object.getPrototypeOf(obj) === STRING_MAP_PROTO;
}
exports.isStrictStringMap = isStrictStringMap;
function isPromise(obj) {
    return obj instanceof _global.Promise;
}
exports.isPromise = isPromise;
function isArray(obj) {
    return Array.isArray(obj);
}
exports.isArray = isArray;
function isDate(obj) {
    return obj instanceof exports.Date && !isNaN(obj.valueOf());
}
exports.isDate = isDate;
function noop() { }
exports.noop = noop;
function stringify(token) {
    if (typeof token === 'string') {
        return token;
    }
    if (token === undefined || token === null) {
        return '' + token;
    }
    if (token.name) {
        return token.name;
    }
    if (token.overriddenName) {
        return token.overriddenName;
    }
    var res = token.toString();
    var newLineIndex = res.indexOf("\n");
    return (newLineIndex === -1) ? res : res.substring(0, newLineIndex);
}
exports.stringify = stringify;
// serialize / deserialize enum exist only for consistency with dart API
// enums in typescript don't need to be serialized
function serializeEnum(val) {
    return val;
}
exports.serializeEnum = serializeEnum;
function deserializeEnum(val, values) {
    return val;
}
exports.deserializeEnum = deserializeEnum;
function resolveEnumToken(enumValue, val) {
    return enumValue[val];
}
exports.resolveEnumToken = resolveEnumToken;
var StringWrapper = (function () {
    function StringWrapper() {
    }
    StringWrapper.fromCharCode = function (code) { return String.fromCharCode(code); };
    StringWrapper.charCodeAt = function (s, index) { return s.charCodeAt(index); };
    StringWrapper.split = function (s, regExp) { return s.split(regExp); };
    StringWrapper.equals = function (s, s2) { return s === s2; };
    StringWrapper.stripLeft = function (s, charVal) {
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
    };
    StringWrapper.stripRight = function (s, charVal) {
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
    };
    StringWrapper.replace = function (s, from, replace) {
        return s.replace(from, replace);
    };
    StringWrapper.replaceAll = function (s, from, replace) {
        return s.replace(from, replace);
    };
    StringWrapper.slice = function (s, from, to) {
        if (from === void 0) { from = 0; }
        if (to === void 0) { to = null; }
        return s.slice(from, to === null ? undefined : to);
    };
    StringWrapper.replaceAllMapped = function (s, from, cb) {
        return s.replace(from, function () {
            var matches = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                matches[_i - 0] = arguments[_i];
            }
            // Remove offset & string from the result array
            matches.splice(-2, 2);
            // The callback receives match, p1, ..., pn
            return cb(matches);
        });
    };
    StringWrapper.contains = function (s, substr) { return s.indexOf(substr) != -1; };
    StringWrapper.compare = function (a, b) {
        if (a < b) {
            return -1;
        }
        else if (a > b) {
            return 1;
        }
        else {
            return 0;
        }
    };
    return StringWrapper;
}());
exports.StringWrapper = StringWrapper;
var StringJoiner = (function () {
    function StringJoiner(parts) {
        if (parts === void 0) { parts = []; }
        this.parts = parts;
    }
    StringJoiner.prototype.add = function (part) { this.parts.push(part); };
    StringJoiner.prototype.toString = function () { return this.parts.join(""); };
    return StringJoiner;
}());
exports.StringJoiner = StringJoiner;
var NumberParseError = (function (_super) {
    __extends(NumberParseError, _super);
    function NumberParseError(message) {
        _super.call(this);
        this.message = message;
    }
    NumberParseError.prototype.toString = function () { return this.message; };
    return NumberParseError;
}(Error));
exports.NumberParseError = NumberParseError;
var NumberWrapper = (function () {
    function NumberWrapper() {
    }
    NumberWrapper.toFixed = function (n, fractionDigits) { return n.toFixed(fractionDigits); };
    NumberWrapper.equal = function (a, b) { return a === b; };
    NumberWrapper.parseIntAutoRadix = function (text) {
        var result = parseInt(text);
        if (isNaN(result)) {
            throw new NumberParseError("Invalid integer literal when parsing " + text);
        }
        return result;
    };
    NumberWrapper.parseInt = function (text, radix) {
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
    };
    // TODO: NaN is a valid literal but is returned by parseFloat to indicate an error.
    NumberWrapper.parseFloat = function (text) { return parseFloat(text); };
    Object.defineProperty(NumberWrapper, "NaN", {
        get: function () { return NaN; },
        enumerable: true,
        configurable: true
    });
    NumberWrapper.isNaN = function (value) { return isNaN(value); };
    NumberWrapper.isInteger = function (value) { return Number.isInteger(value); };
    return NumberWrapper;
}());
exports.NumberWrapper = NumberWrapper;
exports.RegExp = _global.RegExp;
var RegExpWrapper = (function () {
    function RegExpWrapper() {
    }
    RegExpWrapper.create = function (regExpStr, flags) {
        if (flags === void 0) { flags = ''; }
        flags = flags.replace(/g/g, '');
        return new _global.RegExp(regExpStr, flags + 'g');
    };
    RegExpWrapper.firstMatch = function (regExp, input) {
        // Reset multimatch regex state
        regExp.lastIndex = 0;
        return regExp.exec(input);
    };
    RegExpWrapper.test = function (regExp, input) {
        regExp.lastIndex = 0;
        return regExp.test(input);
    };
    RegExpWrapper.matcher = function (regExp, input) {
        // Reset regex state for the case
        // someone did not loop over all matches
        // last time.
        regExp.lastIndex = 0;
        return { re: regExp, input: input };
    };
    RegExpWrapper.replaceAll = function (regExp, input, replace) {
        var c = regExp.exec(input);
        var res = '';
        regExp.lastIndex = 0;
        var prev = 0;
        while (c) {
            res += input.substring(prev, c.index);
            res += replace(c);
            prev = c.index + c[0].length;
            regExp.lastIndex = prev;
            c = regExp.exec(input);
        }
        res += input.substring(prev);
        return res;
    };
    return RegExpWrapper;
}());
exports.RegExpWrapper = RegExpWrapper;
var RegExpMatcherWrapper = (function () {
    function RegExpMatcherWrapper() {
    }
    RegExpMatcherWrapper.next = function (matcher) {
        return matcher.re.exec(matcher.input);
    };
    return RegExpMatcherWrapper;
}());
exports.RegExpMatcherWrapper = RegExpMatcherWrapper;
var FunctionWrapper = (function () {
    function FunctionWrapper() {
    }
    FunctionWrapper.apply = function (fn, posArgs) { return fn.apply(null, posArgs); };
    return FunctionWrapper;
}());
exports.FunctionWrapper = FunctionWrapper;
// JS has NaN !== NaN
function looseIdentical(a, b) {
    return a === b || typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b);
}
exports.looseIdentical = looseIdentical;
// JS considers NaN is the same as NaN for map Key (while NaN !== NaN otherwise)
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
function getMapKey(value) {
    return value;
}
exports.getMapKey = getMapKey;
function normalizeBlank(obj) {
    return isBlank(obj) ? null : obj;
}
exports.normalizeBlank = normalizeBlank;
function normalizeBool(obj) {
    return isBlank(obj) ? false : obj;
}
exports.normalizeBool = normalizeBool;
function isJsObject(o) {
    return o !== null && (typeof o === "function" || typeof o === "object");
}
exports.isJsObject = isJsObject;
function print(obj) {
    console.log(obj);
}
exports.print = print;
function warn(obj) {
    console.warn(obj);
}
exports.warn = warn;
// Can't be all uppercase as our transpiler would think it is a special directive...
var Json = (function () {
    function Json() {
    }
    Json.parse = function (s) { return _global.JSON.parse(s); };
    Json.stringify = function (data) {
        // Dart doesn't take 3 arguments
        return _global.JSON.stringify(data, null, 2);
    };
    return Json;
}());
exports.Json = Json;
var DateWrapper = (function () {
    function DateWrapper() {
    }
    DateWrapper.create = function (year, month, day, hour, minutes, seconds, milliseconds) {
        if (month === void 0) { month = 1; }
        if (day === void 0) { day = 1; }
        if (hour === void 0) { hour = 0; }
        if (minutes === void 0) { minutes = 0; }
        if (seconds === void 0) { seconds = 0; }
        if (milliseconds === void 0) { milliseconds = 0; }
        return new exports.Date(year, month - 1, day, hour, minutes, seconds, milliseconds);
    };
    DateWrapper.fromISOString = function (str) { return new exports.Date(str); };
    DateWrapper.fromMillis = function (ms) { return new exports.Date(ms); };
    DateWrapper.toMillis = function (date) { return date.getTime(); };
    DateWrapper.now = function () { return new exports.Date(); };
    DateWrapper.toJson = function (date) { return date.toJSON(); };
    return DateWrapper;
}());
exports.DateWrapper = DateWrapper;
function setValueOnPath(global, path, value) {
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
exports.setValueOnPath = setValueOnPath;
var _symbolIterator = null;
function getSymbolIterator() {
    if (isBlank(_symbolIterator)) {
        if (isPresent(globalScope.Symbol) && isPresent(Symbol.iterator)) {
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
exports.getSymbolIterator = getSymbolIterator;
function evalExpression(sourceUrl, expr, declarations, vars) {
    var fnBody = declarations + "\nreturn " + expr + "\n//# sourceURL=" + sourceUrl;
    var fnArgNames = [];
    var fnArgValues = [];
    for (var argName in vars) {
        fnArgNames.push(argName);
        fnArgValues.push(vars[argName]);
    }
    return new (Function.bind.apply(Function, [void 0].concat(fnArgNames.concat(fnBody))))().apply(void 0, fnArgValues);
}
exports.evalExpression = evalExpression;
function isPrimitive(obj) {
    return !isJsObject(obj);
}
exports.isPrimitive = isPrimitive;
function hasConstructor(value, type) {
    return value.constructor === type;
}
exports.hasConstructor = hasConstructor;
function bitWiseOr(values) {
    return values.reduce(function (a, b) { return a | b; });
}
exports.bitWiseOr = bitWiseOr;
function bitWiseAnd(values) {
    return values.reduce(function (a, b) { return a & b; });
}
exports.bitWiseAnd = bitWiseAnd;
function escape(s) {
    return _global.encodeURI(s);
}
exports.escape = escape;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUF3QkEsSUFBSSxXQUE4QixDQUFDO0FBQ25DLEVBQUUsQ0FBQyxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDbEMsRUFBRSxDQUFDLENBQUMsT0FBTyxpQkFBaUIsS0FBSyxXQUFXLElBQUksSUFBSSxZQUFZLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUNsRix5RUFBeUU7UUFDekUsV0FBVyxHQUFRLElBQUksQ0FBQztJQUMxQixDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixXQUFXLEdBQVEsTUFBTSxDQUFDO0lBQzVCLENBQUM7QUFDSCxDQUFDO0FBQUMsSUFBSSxDQUFDLENBQUM7SUFDTixXQUFXLEdBQVEsTUFBTSxDQUFDO0FBQzVCLENBQUM7QUFFRCwyQkFBa0MsRUFBWTtJQUM1QyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzFELENBQUM7QUFGZSx5QkFBaUIsb0JBRWhDLENBQUE7QUFFWSxlQUFPLEdBQUcsS0FBSyxDQUFDO0FBRTdCLGtFQUFrRTtBQUNsRSw0Q0FBNEM7QUFDNUMsSUFBSSxPQUFPLEdBQXNCLFdBQVc7QUFFekIsY0FBTSxXQUZvQjtBQUlsQyxZQUFJLEdBQUcsUUFBUSxDQUFDO0FBZTNCLGlDQUF3QyxJQUFVO0lBQ2hELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBQ0QsTUFBTSxDQUFDLE9BQU8sSUFBSSxDQUFDO0FBQ3JCLENBQUM7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RmUsa0JBQVUsYUFFekIsQ0FBQTtBQUVELGdCQUF1QixDQUFTO0lBQzlCLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLENBQUM7QUFGZSxjQUFNLFNBRXJCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIEJyb3dzZXJOb2RlR2xvYmFsIHtcbiAgT2JqZWN0OiB0eXBlb2YgT2JqZWN0O1xuICBBcnJheTogdHlwZW9mIEFycmF5O1xuICBNYXA6IHR5cGVvZiBNYXA7XG4gIFNldDogdHlwZW9mIFNldDtcbiAgRGF0ZTogRGF0ZUNvbnN0cnVjdG9yO1xuICBSZWdFeHA6IFJlZ0V4cENvbnN0cnVjdG9yO1xuICBKU09OOiB0eXBlb2YgSlNPTjtcbiAgTWF0aDogYW55OyAgLy8gdHlwZW9mIE1hdGg7XG4gIGFzc2VydChjb25kaXRpb246IGFueSk6IHZvaWQ7XG4gIFJlZmxlY3Q6IGFueTtcbiAgZ2V0QW5ndWxhclRlc3RhYmlsaXR5OiBGdW5jdGlvbjtcbiAgZ2V0QWxsQW5ndWxhclRlc3RhYmlsaXRpZXM6IEZ1bmN0aW9uO1xuICBnZXRBbGxBbmd1bGFyUm9vdEVsZW1lbnRzOiBGdW5jdGlvbjtcbiAgZnJhbWV3b3JrU3RhYmlsaXplcnM6IEFycmF5PEZ1bmN0aW9uPjtcbiAgc2V0VGltZW91dDogRnVuY3Rpb247XG4gIGNsZWFyVGltZW91dDogRnVuY3Rpb247XG4gIHNldEludGVydmFsOiBGdW5jdGlvbjtcbiAgY2xlYXJJbnRlcnZhbDogRnVuY3Rpb247XG4gIGVuY29kZVVSSTogRnVuY3Rpb247XG59XG5cbi8vIFRPRE8oanRlcGxpdHo2MDIpOiBMb2FkIFdvcmtlckdsb2JhbFNjb3BlIGZyb20gbGliLndlYndvcmtlci5kLnRzIGZpbGUgIzM0OTJcbmRlY2xhcmUgdmFyIFdvcmtlckdsb2JhbFNjb3BlO1xudmFyIGdsb2JhbFNjb3BlOiBCcm93c2VyTm9kZUdsb2JhbDtcbmlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICBpZiAodHlwZW9mIFdvcmtlckdsb2JhbFNjb3BlICE9PSAndW5kZWZpbmVkJyAmJiBzZWxmIGluc3RhbmNlb2YgV29ya2VyR2xvYmFsU2NvcGUpIHtcbiAgICAvLyBUT0RPOiBSZXBsYWNlIGFueSB3aXRoIFdvcmtlckdsb2JhbFNjb3BlIGZyb20gbGliLndlYndvcmtlci5kLnRzICMzNDkyXG4gICAgZ2xvYmFsU2NvcGUgPSA8YW55PnNlbGY7XG4gIH0gZWxzZSB7XG4gICAgZ2xvYmFsU2NvcGUgPSA8YW55Pmdsb2JhbDtcbiAgfVxufSBlbHNlIHtcbiAgZ2xvYmFsU2NvcGUgPSA8YW55PndpbmRvdztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNjaGVkdWxlTWljcm9UYXNrKGZuOiBGdW5jdGlvbikge1xuICBab25lLmN1cnJlbnQuc2NoZWR1bGVNaWNyb1Rhc2soJ3NjaGVkdWxlTWljcm90YXNrJywgZm4pO1xufVxuXG5leHBvcnQgY29uc3QgSVNfREFSVCA9IGZhbHNlO1xuXG4vLyBOZWVkIHRvIGRlY2xhcmUgYSBuZXcgdmFyaWFibGUgZm9yIGdsb2JhbCBoZXJlIHNpbmNlIFR5cGVTY3JpcHRcbi8vIGV4cG9ydHMgdGhlIG9yaWdpbmFsIHZhbHVlIG9mIHRoZSBzeW1ib2wuXG52YXIgX2dsb2JhbDogQnJvd3Nlck5vZGVHbG9iYWwgPSBnbG9iYWxTY29wZTtcblxuZXhwb3J0IHtfZ2xvYmFsIGFzIGdsb2JhbH07XG5cbmV4cG9ydCB2YXIgVHlwZSA9IEZ1bmN0aW9uO1xuXG4vKipcbiAqIFJ1bnRpbWUgcmVwcmVzZW50YXRpb24gYSB0eXBlIHRoYXQgYSBDb21wb25lbnQgb3Igb3RoZXIgb2JqZWN0IGlzIGluc3RhbmNlcyBvZi5cbiAqXG4gKiBBbiBleGFtcGxlIG9mIGEgYFR5cGVgIGlzIGBNeUN1c3RvbUNvbXBvbmVudGAgY2xhc3MsIHdoaWNoIGluIEphdmFTY3JpcHQgaXMgYmUgcmVwcmVzZW50ZWQgYnlcbiAqIHRoZSBgTXlDdXN0b21Db21wb25lbnRgIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFR5cGUgZXh0ZW5kcyBGdW5jdGlvbiB7fVxuXG4vKipcbiAqIFJ1bnRpbWUgcmVwcmVzZW50YXRpb24gb2YgYSB0eXBlIHRoYXQgaXMgY29uc3RydWN0YWJsZSAobm9uLWFic3RyYWN0KS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb25jcmV0ZVR5cGUgZXh0ZW5kcyBUeXBlIHsgbmV3ICguLi5hcmdzKTogYW55OyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyh0eXBlOiBUeXBlKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVbJ25hbWUnXSkge1xuICAgIHJldHVybiB0eXBlWyduYW1lJ107XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiB0eXBlO1xufVxuXG5cbmV4cG9ydCB2YXIgTWF0aCA9IF9nbG9iYWwuTWF0aDtcbmV4cG9ydCB2YXIgRGF0ZSA9IF9nbG9iYWwuRGF0ZTtcblxudmFyIF9kZXZNb2RlOiBib29sZWFuID0gdHJ1ZTtcbnZhciBfbW9kZUxvY2tlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG5leHBvcnQgZnVuY3Rpb24gbG9ja01vZGUoKSB7XG4gIF9tb2RlTG9ja2VkID0gdHJ1ZTtcbn1cblxuLyoqXG4gKiBEaXNhYmxlIEFuZ3VsYXIncyBkZXZlbG9wbWVudCBtb2RlLCB3aGljaCB0dXJucyBvZmYgYXNzZXJ0aW9ucyBhbmQgb3RoZXJcbiAqIGNoZWNrcyB3aXRoaW4gdGhlIGZyYW1ld29yay5cbiAqXG4gKiBPbmUgaW1wb3J0YW50IGFzc2VydGlvbiB0aGlzIGRpc2FibGVzIHZlcmlmaWVzIHRoYXQgYSBjaGFuZ2UgZGV0ZWN0aW9uIHBhc3NcbiAqIGRvZXMgbm90IHJlc3VsdCBpbiBhZGRpdGlvbmFsIGNoYW5nZXMgdG8gYW55IGJpbmRpbmdzIChhbHNvIGtub3duIGFzXG4gKiB1bmlkaXJlY3Rpb25hbCBkYXRhIGZsb3cpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5hYmxlUHJvZE1vZGUoKSB7XG4gIGlmIChfbW9kZUxvY2tlZCkge1xuICAgIC8vIENhbm5vdCB1c2UgQmFzZUV4Y2VwdGlvbiBhcyB0aGF0IGVuZHMgdXAgaW1wb3J0aW5nIGZyb20gZmFjYWRlL2xhbmcuXG4gICAgdGhyb3cgJ0Nhbm5vdCBlbmFibGUgcHJvZCBtb2RlIGFmdGVyIHBsYXRmb3JtIHNldHVwLic7XG4gIH1cbiAgX2Rldk1vZGUgPSBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydGlvbnNFbmFibGVkKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gX2Rldk1vZGU7XG59XG5cbi8vIFRPRE86IHJlbW92ZSBjYWxscyB0byBhc3NlcnQgaW4gcHJvZHVjdGlvbiBlbnZpcm9ubWVudFxuLy8gTm90ZTogQ2FuJ3QganVzdCBleHBvcnQgdGhpcyBhbmQgaW1wb3J0IGluIGluIG90aGVyIGZpbGVzXG4vLyBhcyBgYXNzZXJ0YCBpcyBhIHJlc2VydmVkIGtleXdvcmQgaW4gRGFydFxuX2dsb2JhbC5hc3NlcnQgPSBmdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uKSB7XG4gIC8vIFRPRE86IHRvIGJlIGZpeGVkIHByb3Blcmx5IHZpYSAjMjgzMCwgbm9vcCBmb3Igbm93XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gaXNQcmVzZW50KG9iajogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBvYmogIT09IHVuZGVmaW5lZCAmJiBvYmogIT09IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0JsYW5rKG9iajogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Jvb2xlYW4ob2JqOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwiYm9vbGVhblwiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOdW1iZXIob2JqOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwibnVtYmVyXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N0cmluZyhvYmo6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gXCJzdHJpbmdcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24ob2JqOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwiZnVuY3Rpb25cIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVHlwZShvYmo6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNGdW5jdGlvbihvYmopO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTdHJpbmdNYXAob2JqOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIG9iaiAhPT0gbnVsbDtcbn1cblxuY29uc3QgU1RSSU5HX01BUF9QUk9UTyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih7fSk7XG5leHBvcnQgZnVuY3Rpb24gaXNTdHJpY3RTdHJpbmdNYXAob2JqOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzU3RyaW5nTWFwKG9iaikgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaikgPT09IFNUUklOR19NQVBfUFJPVE87XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2Uob2JqOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mICg8YW55Pl9nbG9iYWwpLlByb21pc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FycmF5KG9iajogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KG9iaik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RhdGUob2JqKTogYm9vbGVhbiB7XG4gIHJldHVybiBvYmogaW5zdGFuY2VvZiBEYXRlICYmICFpc05hTihvYmoudmFsdWVPZigpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5KHRva2VuKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiB0b2tlbiA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdG9rZW47XG4gIH1cblxuICBpZiAodG9rZW4gPT09IHVuZGVmaW5lZCB8fCB0b2tlbiA9PT0gbnVsbCkge1xuICAgIHJldHVybiAnJyArIHRva2VuO1xuICB9XG5cbiAgaWYgKHRva2VuLm5hbWUpIHtcbiAgICByZXR1cm4gdG9rZW4ubmFtZTtcbiAgfVxuICBpZiAodG9rZW4ub3ZlcnJpZGRlbk5hbWUpIHtcbiAgICByZXR1cm4gdG9rZW4ub3ZlcnJpZGRlbk5hbWU7XG4gIH1cblxuICB2YXIgcmVzID0gdG9rZW4udG9TdHJpbmcoKTtcbiAgdmFyIG5ld0xpbmVJbmRleCA9IHJlcy5pbmRleE9mKFwiXFxuXCIpO1xuICByZXR1cm4gKG5ld0xpbmVJbmRleCA9PT0gLTEpID8gcmVzIDogcmVzLnN1YnN0cmluZygwLCBuZXdMaW5lSW5kZXgpO1xufVxuXG4vLyBzZXJpYWxpemUgLyBkZXNlcmlhbGl6ZSBlbnVtIGV4aXN0IG9ubHkgZm9yIGNvbnNpc3RlbmN5IHdpdGggZGFydCBBUElcbi8vIGVudW1zIGluIHR5cGVzY3JpcHQgZG9uJ3QgbmVlZCB0byBiZSBzZXJpYWxpemVkXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVFbnVtKHZhbCk6IG51bWJlciB7XG4gIHJldHVybiB2YWw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXNlcmlhbGl6ZUVudW0odmFsLCB2YWx1ZXM6IE1hcDxudW1iZXIsIGFueT4pOiBhbnkge1xuICByZXR1cm4gdmFsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUVudW1Ub2tlbihlbnVtVmFsdWUsIHZhbCk6IHN0cmluZyB7XG4gIHJldHVybiBlbnVtVmFsdWVbdmFsXTtcbn1cblxuZXhwb3J0IGNsYXNzIFN0cmluZ1dyYXBwZXIge1xuICBzdGF0aWMgZnJvbUNoYXJDb2RlKGNvZGU6IG51bWJlcik6IHN0cmluZyB7IHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGNvZGUpOyB9XG5cbiAgc3RhdGljIGNoYXJDb2RlQXQoczogc3RyaW5nLCBpbmRleDogbnVtYmVyKTogbnVtYmVyIHsgcmV0dXJuIHMuY2hhckNvZGVBdChpbmRleCk7IH1cblxuICBzdGF0aWMgc3BsaXQoczogc3RyaW5nLCByZWdFeHA6IFJlZ0V4cCk6IHN0cmluZ1tdIHsgcmV0dXJuIHMuc3BsaXQocmVnRXhwKTsgfVxuXG4gIHN0YXRpYyBlcXVhbHMoczogc3RyaW5nLCBzMjogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiBzID09PSBzMjsgfVxuXG4gIHN0YXRpYyBzdHJpcExlZnQoczogc3RyaW5nLCBjaGFyVmFsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmIChzICYmIHMubGVuZ3RoKSB7XG4gICAgICB2YXIgcG9zID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc1tpXSAhPSBjaGFyVmFsKSBicmVhaztcbiAgICAgICAgcG9zKys7XG4gICAgICB9XG4gICAgICBzID0gcy5zdWJzdHJpbmcocG9zKTtcbiAgICB9XG4gICAgcmV0dXJuIHM7XG4gIH1cblxuICBzdGF0aWMgc3RyaXBSaWdodChzOiBzdHJpbmcsIGNoYXJWYWw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHMgJiYgcy5sZW5ndGgpIHtcbiAgICAgIHZhciBwb3MgPSBzLmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSBzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGlmIChzW2ldICE9IGNoYXJWYWwpIGJyZWFrO1xuICAgICAgICBwb3MtLTtcbiAgICAgIH1cbiAgICAgIHMgPSBzLnN1YnN0cmluZygwLCBwb3MpO1xuICAgIH1cbiAgICByZXR1cm4gcztcbiAgfVxuXG4gIHN0YXRpYyByZXBsYWNlKHM6IHN0cmluZywgZnJvbTogc3RyaW5nLCByZXBsYWNlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBzLnJlcGxhY2UoZnJvbSwgcmVwbGFjZSk7XG4gIH1cblxuICBzdGF0aWMgcmVwbGFjZUFsbChzOiBzdHJpbmcsIGZyb206IFJlZ0V4cCwgcmVwbGFjZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcy5yZXBsYWNlKGZyb20sIHJlcGxhY2UpO1xuICB9XG5cbiAgc3RhdGljIHNsaWNlPFQ+KHM6IHN0cmluZywgZnJvbTogbnVtYmVyID0gMCwgdG86IG51bWJlciA9IG51bGwpOiBzdHJpbmcge1xuICAgIHJldHVybiBzLnNsaWNlKGZyb20sIHRvID09PSBudWxsID8gdW5kZWZpbmVkIDogdG8pO1xuICB9XG5cbiAgc3RhdGljIHJlcGxhY2VBbGxNYXBwZWQoczogc3RyaW5nLCBmcm9tOiBSZWdFeHAsIGNiOiBGdW5jdGlvbik6IHN0cmluZyB7XG4gICAgcmV0dXJuIHMucmVwbGFjZShmcm9tLCBmdW5jdGlvbiguLi5tYXRjaGVzKSB7XG4gICAgICAvLyBSZW1vdmUgb2Zmc2V0ICYgc3RyaW5nIGZyb20gdGhlIHJlc3VsdCBhcnJheVxuICAgICAgbWF0Y2hlcy5zcGxpY2UoLTIsIDIpO1xuICAgICAgLy8gVGhlIGNhbGxiYWNrIHJlY2VpdmVzIG1hdGNoLCBwMSwgLi4uLCBwblxuICAgICAgcmV0dXJuIGNiKG1hdGNoZXMpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIGNvbnRhaW5zKHM6IHN0cmluZywgc3Vic3RyOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHMuaW5kZXhPZihzdWJzdHIpICE9IC0xOyB9XG5cbiAgc3RhdGljIGNvbXBhcmUoYTogc3RyaW5nLCBiOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGlmIChhIDwgYikge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH0gZWxzZSBpZiAoYSA+IGIpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFN0cmluZ0pvaW5lciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwYXJ0cyA9IFtdKSB7fVxuXG4gIGFkZChwYXJ0OiBzdHJpbmcpOiB2b2lkIHsgdGhpcy5wYXJ0cy5wdXNoKHBhcnQpOyB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMucGFydHMuam9pbihcIlwiKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgTnVtYmVyUGFyc2VFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgbmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBtZXNzYWdlOiBzdHJpbmcpIHsgc3VwZXIoKTsgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLm1lc3NhZ2U7IH1cbn1cblxuXG5leHBvcnQgY2xhc3MgTnVtYmVyV3JhcHBlciB7XG4gIHN0YXRpYyB0b0ZpeGVkKG46IG51bWJlciwgZnJhY3Rpb25EaWdpdHM6IG51bWJlcik6IHN0cmluZyB7IHJldHVybiBuLnRvRml4ZWQoZnJhY3Rpb25EaWdpdHMpOyB9XG5cbiAgc3RhdGljIGVxdWFsKGE6IG51bWJlciwgYjogbnVtYmVyKTogYm9vbGVhbiB7IHJldHVybiBhID09PSBiOyB9XG5cbiAgc3RhdGljIHBhcnNlSW50QXV0b1JhZGl4KHRleHQ6IHN0cmluZyk6IG51bWJlciB7XG4gICAgdmFyIHJlc3VsdDogbnVtYmVyID0gcGFyc2VJbnQodGV4dCk7XG4gICAgaWYgKGlzTmFOKHJlc3VsdCkpIHtcbiAgICAgIHRocm93IG5ldyBOdW1iZXJQYXJzZUVycm9yKFwiSW52YWxpZCBpbnRlZ2VyIGxpdGVyYWwgd2hlbiBwYXJzaW5nIFwiICsgdGV4dCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBzdGF0aWMgcGFyc2VJbnQodGV4dDogc3RyaW5nLCByYWRpeDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBpZiAocmFkaXggPT0gMTApIHtcbiAgICAgIGlmICgvXihcXC18XFwrKT9bMC05XSskLy50ZXN0KHRleHQpKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludCh0ZXh0LCByYWRpeCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChyYWRpeCA9PSAxNikge1xuICAgICAgaWYgKC9eKFxcLXxcXCspP1swLTlBQkNERUZhYmNkZWZdKyQvLnRlc3QodGV4dCkpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRleHQsIHJhZGl4KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHJlc3VsdDogbnVtYmVyID0gcGFyc2VJbnQodGV4dCwgcmFkaXgpO1xuICAgICAgaWYgKCFpc05hTihyZXN1bHQpKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBOdW1iZXJQYXJzZUVycm9yKFwiSW52YWxpZCBpbnRlZ2VyIGxpdGVyYWwgd2hlbiBwYXJzaW5nIFwiICsgdGV4dCArIFwiIGluIGJhc2UgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhZGl4KTtcbiAgfVxuXG4gIC8vIFRPRE86IE5hTiBpcyBhIHZhbGlkIGxpdGVyYWwgYnV0IGlzIHJldHVybmVkIGJ5IHBhcnNlRmxvYXQgdG8gaW5kaWNhdGUgYW4gZXJyb3IuXG4gIHN0YXRpYyBwYXJzZUZsb2F0KHRleHQ6IHN0cmluZyk6IG51bWJlciB7IHJldHVybiBwYXJzZUZsb2F0KHRleHQpOyB9XG5cbiAgc3RhdGljIGdldCBOYU4oKTogbnVtYmVyIHsgcmV0dXJuIE5hTjsgfVxuXG4gIHN0YXRpYyBpc05hTih2YWx1ZTogYW55KTogYm9vbGVhbiB7IHJldHVybiBpc05hTih2YWx1ZSk7IH1cblxuICBzdGF0aWMgaXNJbnRlZ2VyKHZhbHVlOiBhbnkpOiBib29sZWFuIHsgcmV0dXJuIE51bWJlci5pc0ludGVnZXIodmFsdWUpOyB9XG59XG5cbmV4cG9ydCB2YXIgUmVnRXhwID0gX2dsb2JhbC5SZWdFeHA7XG5cbmV4cG9ydCBjbGFzcyBSZWdFeHBXcmFwcGVyIHtcbiAgc3RhdGljIGNyZWF0ZShyZWdFeHBTdHI6IHN0cmluZywgZmxhZ3M6IHN0cmluZyA9ICcnKTogUmVnRXhwIHtcbiAgICBmbGFncyA9IGZsYWdzLnJlcGxhY2UoL2cvZywgJycpO1xuICAgIHJldHVybiBuZXcgX2dsb2JhbC5SZWdFeHAocmVnRXhwU3RyLCBmbGFncyArICdnJyk7XG4gIH1cbiAgc3RhdGljIGZpcnN0TWF0Y2gocmVnRXhwOiBSZWdFeHAsIGlucHV0OiBzdHJpbmcpOiBSZWdFeHBFeGVjQXJyYXkge1xuICAgIC8vIFJlc2V0IG11bHRpbWF0Y2ggcmVnZXggc3RhdGVcbiAgICByZWdFeHAubGFzdEluZGV4ID0gMDtcbiAgICByZXR1cm4gcmVnRXhwLmV4ZWMoaW5wdXQpO1xuICB9XG4gIHN0YXRpYyB0ZXN0KHJlZ0V4cDogUmVnRXhwLCBpbnB1dDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmVnRXhwLmxhc3RJbmRleCA9IDA7XG4gICAgcmV0dXJuIHJlZ0V4cC50ZXN0KGlucHV0KTtcbiAgfVxuICBzdGF0aWMgbWF0Y2hlcihyZWdFeHA6IFJlZ0V4cCwgaW5wdXQ6IHN0cmluZyk6IHtcbiAgICByZTogUmVnRXhwO1xuICAgIGlucHV0OiBzdHJpbmdcbiAgfVxuICB7XG4gICAgLy8gUmVzZXQgcmVnZXggc3RhdGUgZm9yIHRoZSBjYXNlXG4gICAgLy8gc29tZW9uZSBkaWQgbm90IGxvb3Agb3ZlciBhbGwgbWF0Y2hlc1xuICAgIC8vIGxhc3QgdGltZS5cbiAgICByZWdFeHAubGFzdEluZGV4ID0gMDtcbiAgICByZXR1cm4ge3JlOiByZWdFeHAsIGlucHV0OiBpbnB1dH07XG4gIH1cbiAgc3RhdGljIHJlcGxhY2VBbGwocmVnRXhwOiBSZWdFeHAsIGlucHV0OiBzdHJpbmcsIHJlcGxhY2U6IEZ1bmN0aW9uKTogc3RyaW5nIHtcbiAgICBsZXQgYyA9IHJlZ0V4cC5leGVjKGlucHV0KTtcbiAgICBsZXQgcmVzID0gJyc7XG4gICAgcmVnRXhwLmxhc3RJbmRleCA9IDA7XG4gICAgbGV0IHByZXYgPSAwO1xuICAgIHdoaWxlIChjKSB7XG4gICAgICByZXMgKz0gaW5wdXQuc3Vic3RyaW5nKHByZXYsIGMuaW5kZXgpO1xuICAgICAgcmVzICs9IHJlcGxhY2UoYyk7XG4gICAgICBwcmV2ID0gYy5pbmRleCArIGNbMF0ubGVuZ3RoO1xuICAgICAgcmVnRXhwLmxhc3RJbmRleCA9IHByZXY7XG4gICAgICBjID0gcmVnRXhwLmV4ZWMoaW5wdXQpO1xuICAgIH1cbiAgICByZXMgKz0gaW5wdXQuc3Vic3RyaW5nKHByZXYpO1xuICAgIHJldHVybiByZXM7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlZ0V4cE1hdGNoZXJXcmFwcGVyIHtcbiAgc3RhdGljIG5leHQobWF0Y2hlcjoge1xuICAgIHJlOiBSZWdFeHA7XG4gICAgaW5wdXQ6IHN0cmluZ1xuICB9KTogUmVnRXhwRXhlY0FycmF5IHtcbiAgICByZXR1cm4gbWF0Y2hlci5yZS5leGVjKG1hdGNoZXIuaW5wdXQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGdW5jdGlvbldyYXBwZXIge1xuICBzdGF0aWMgYXBwbHkoZm46IEZ1bmN0aW9uLCBwb3NBcmdzOiBhbnkpOiBhbnkgeyByZXR1cm4gZm4uYXBwbHkobnVsbCwgcG9zQXJncyk7IH1cbn1cblxuLy8gSlMgaGFzIE5hTiAhPT0gTmFOXG5leHBvcnQgZnVuY3Rpb24gbG9vc2VJZGVudGljYWwoYSwgYik6IGJvb2xlYW4ge1xuICByZXR1cm4gYSA9PT0gYiB8fCB0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiAmJiB0eXBlb2YgYiA9PT0gXCJudW1iZXJcIiAmJiBpc05hTihhKSAmJiBpc05hTihiKTtcbn1cblxuLy8gSlMgY29uc2lkZXJzIE5hTiBpcyB0aGUgc2FtZSBhcyBOYU4gZm9yIG1hcCBLZXkgKHdoaWxlIE5hTiAhPT0gTmFOIG90aGVyd2lzZSlcbi8vIHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9NYXBcbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXBLZXk8VD4odmFsdWU6IFQpOiBUIHtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplQmxhbmsob2JqOiBPYmplY3QpOiBhbnkge1xuICByZXR1cm4gaXNCbGFuayhvYmopID8gbnVsbCA6IG9iajtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUJvb2wob2JqOiBib29sZWFuKTogYm9vbGVhbiB7XG4gIHJldHVybiBpc0JsYW5rKG9iaikgPyBmYWxzZSA6IG9iajtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSnNPYmplY3QobzogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBvICE9PSBudWxsICYmICh0eXBlb2YgbyA9PT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiBvID09PSBcIm9iamVjdFwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByaW50KG9iajogRXJyb3IgfCBPYmplY3QpIHtcbiAgY29uc29sZS5sb2cob2JqKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhcm4ob2JqOiBFcnJvciB8IE9iamVjdCkge1xuICBjb25zb2xlLndhcm4ob2JqKTtcbn1cblxuLy8gQ2FuJ3QgYmUgYWxsIHVwcGVyY2FzZSBhcyBvdXIgdHJhbnNwaWxlciB3b3VsZCB0aGluayBpdCBpcyBhIHNwZWNpYWwgZGlyZWN0aXZlLi4uXG5leHBvcnQgY2xhc3MgSnNvbiB7XG4gIHN0YXRpYyBwYXJzZShzOiBzdHJpbmcpOiBPYmplY3QgeyByZXR1cm4gX2dsb2JhbC5KU09OLnBhcnNlKHMpOyB9XG4gIHN0YXRpYyBzdHJpbmdpZnkoZGF0YTogT2JqZWN0KTogc3RyaW5nIHtcbiAgICAvLyBEYXJ0IGRvZXNuJ3QgdGFrZSAzIGFyZ3VtZW50c1xuICAgIHJldHVybiBfZ2xvYmFsLkpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEYXRlV3JhcHBlciB7XG4gIHN0YXRpYyBjcmVhdGUoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyID0gMSwgZGF5OiBudW1iZXIgPSAxLCBob3VyOiBudW1iZXIgPSAwLFxuICAgICAgICAgICAgICAgIG1pbnV0ZXM6IG51bWJlciA9IDAsIHNlY29uZHM6IG51bWJlciA9IDAsIG1pbGxpc2Vjb25kczogbnVtYmVyID0gMCk6IERhdGUge1xuICAgIHJldHVybiBuZXcgRGF0ZSh5ZWFyLCBtb250aCAtIDEsIGRheSwgaG91ciwgbWludXRlcywgc2Vjb25kcywgbWlsbGlzZWNvbmRzKTtcbiAgfVxuICBzdGF0aWMgZnJvbUlTT1N0cmluZyhzdHI6IHN0cmluZyk6IERhdGUgeyByZXR1cm4gbmV3IERhdGUoc3RyKTsgfVxuICBzdGF0aWMgZnJvbU1pbGxpcyhtczogbnVtYmVyKTogRGF0ZSB7IHJldHVybiBuZXcgRGF0ZShtcyk7IH1cbiAgc3RhdGljIHRvTWlsbGlzKGRhdGU6IERhdGUpOiBudW1iZXIgeyByZXR1cm4gZGF0ZS5nZXRUaW1lKCk7IH1cbiAgc3RhdGljIG5vdygpOiBEYXRlIHsgcmV0dXJuIG5ldyBEYXRlKCk7IH1cbiAgc3RhdGljIHRvSnNvbihkYXRlOiBEYXRlKTogc3RyaW5nIHsgcmV0dXJuIGRhdGUudG9KU09OKCk7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFZhbHVlT25QYXRoKGdsb2JhbDogYW55LCBwYXRoOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgdmFyIHBhcnRzID0gcGF0aC5zcGxpdCgnLicpO1xuICB2YXIgb2JqOiBhbnkgPSBnbG9iYWw7XG4gIHdoaWxlIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgdmFyIG5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xuICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkobmFtZSkgJiYgaXNQcmVzZW50KG9ialtuYW1lXSkpIHtcbiAgICAgIG9iaiA9IG9ialtuYW1lXTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqID0gb2JqW25hbWVdID0ge307XG4gICAgfVxuICB9XG4gIGlmIChvYmogPT09IHVuZGVmaW5lZCB8fCBvYmogPT09IG51bGwpIHtcbiAgICBvYmogPSB7fTtcbiAgfVxuICBvYmpbcGFydHMuc2hpZnQoKV0gPSB2YWx1ZTtcbn1cblxuLy8gV2hlbiBTeW1ib2wuaXRlcmF0b3IgZG9lc24ndCBleGlzdCwgcmV0cmlldmVzIHRoZSBrZXkgdXNlZCBpbiBlczYtc2hpbVxuZGVjbGFyZSB2YXIgU3ltYm9sO1xudmFyIF9zeW1ib2xJdGVyYXRvciA9IG51bGw7XG5leHBvcnQgZnVuY3Rpb24gZ2V0U3ltYm9sSXRlcmF0b3IoKTogc3RyaW5nIHwgc3ltYm9sIHtcbiAgaWYgKGlzQmxhbmsoX3N5bWJvbEl0ZXJhdG9yKSkge1xuICAgIGlmIChpc1ByZXNlbnQoKDxhbnk+Z2xvYmFsU2NvcGUpLlN5bWJvbCkgJiYgaXNQcmVzZW50KFN5bWJvbC5pdGVyYXRvcikpIHtcbiAgICAgIF9zeW1ib2xJdGVyYXRvciA9IFN5bWJvbC5pdGVyYXRvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZXM2LXNoaW0gc3BlY2lmaWMgbG9naWNcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTWFwLnByb3RvdHlwZSk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICAgIGlmIChrZXkgIT09ICdlbnRyaWVzJyAmJiBrZXkgIT09ICdzaXplJyAmJlxuICAgICAgICAgICAgTWFwLnByb3RvdHlwZVtrZXldID09PSBNYXAucHJvdG90eXBlWydlbnRyaWVzJ10pIHtcbiAgICAgICAgICBfc3ltYm9sSXRlcmF0b3IgPSBrZXk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIF9zeW1ib2xJdGVyYXRvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV2YWxFeHByZXNzaW9uKHNvdXJjZVVybDogc3RyaW5nLCBleHByOiBzdHJpbmcsIGRlY2xhcmF0aW9uczogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhcnM6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogYW55IHtcbiAgdmFyIGZuQm9keSA9IGAke2RlY2xhcmF0aW9uc31cXG5yZXR1cm4gJHtleHByfVxcbi8vIyBzb3VyY2VVUkw9JHtzb3VyY2VVcmx9YDtcbiAgdmFyIGZuQXJnTmFtZXMgPSBbXTtcbiAgdmFyIGZuQXJnVmFsdWVzID0gW107XG4gIGZvciAodmFyIGFyZ05hbWUgaW4gdmFycykge1xuICAgIGZuQXJnTmFtZXMucHVzaChhcmdOYW1lKTtcbiAgICBmbkFyZ1ZhbHVlcy5wdXNoKHZhcnNbYXJnTmFtZV0pO1xuICB9XG4gIHJldHVybiBuZXcgRnVuY3Rpb24oLi4uZm5BcmdOYW1lcy5jb25jYXQoZm5Cb2R5KSkoLi4uZm5BcmdWYWx1ZXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQcmltaXRpdmUob2JqOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuICFpc0pzT2JqZWN0KG9iaik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNDb25zdHJ1Y3Rvcih2YWx1ZTogT2JqZWN0LCB0eXBlOiBUeXBlKTogYm9vbGVhbiB7XG4gIHJldHVybiB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gdHlwZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpdFdpc2VPcih2YWx1ZXM6IG51bWJlcltdKTogbnVtYmVyIHtcbiAgcmV0dXJuIHZhbHVlcy5yZWR1Y2UoKGEsIGIpID0+IHsgcmV0dXJuIGEgfCBiOyB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpdFdpc2VBbmQodmFsdWVzOiBudW1iZXJbXSk6IG51bWJlciB7XG4gIHJldHVybiB2YWx1ZXMucmVkdWNlKChhLCBiKSA9PiB7IHJldHVybiBhICYgYjsgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGUoczogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIF9nbG9iYWwuZW5jb2RlVVJJKHMpO1xufVxuIl19