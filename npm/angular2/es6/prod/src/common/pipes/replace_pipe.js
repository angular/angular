var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isBlank, isString, isNumber, isFunction, RegExpWrapper, StringWrapper } from 'angular2/src/facade/lang';
import { Injectable, Pipe } from 'angular2/core';
import { InvalidPipeArgumentException } from './invalid_pipe_argument_exception';
/**
 * Creates a new String with some or all of the matches of a pattern replaced by
 * a replacement.
 *
 * The pattern to be matched is specified by the 'pattern' parameter.
 *
 * The replacement to be set is specified by the 'replacement' parameter.
 *
 * An optional 'flags' parameter can be set.
 *
 * ### Usage
 *
 *     expression | replace:pattern:replacement
 *
 * All behavior is based on the expected behavior of the JavaScript API
 * String.prototype.replace() function.
 *
 * Where the input expression is a [String] or [Number] (to be treated as a string),
 * the `pattern` is a [String] or [RegExp],
 * the 'replacement' is a [String] or [Function].
 *
 * --Note--: The 'pattern' parameter will be converted to a RegExp instance. Make sure to escape the
 * string properly if you are matching for regular expression special characters like parenthesis,
 * brackets etc.
 */
let ReplacePipe_1;
export let ReplacePipe = ReplacePipe_1 = class ReplacePipe {
    transform(value, pattern, replacement) {
        if (isBlank(value)) {
            return value;
        }
        if (!this._supportedInput(value)) {
            throw new InvalidPipeArgumentException(ReplacePipe_1, value);
        }
        var input = value.toString();
        if (!this._supportedPattern(pattern)) {
            throw new InvalidPipeArgumentException(ReplacePipe_1, pattern);
        }
        if (!this._supportedReplacement(replacement)) {
            throw new InvalidPipeArgumentException(ReplacePipe_1, replacement);
        }
        // template fails with literal RegExp e.g /pattern/igm
        // var rgx = pattern instanceof RegExp ? pattern : RegExpWrapper.create(pattern);
        if (isFunction(replacement)) {
            var rgxPattern = isString(pattern) ? RegExpWrapper.create(pattern) : pattern;
            return StringWrapper.replaceAllMapped(input, rgxPattern, replacement);
        }
        if (pattern instanceof RegExp) {
            // use the replaceAll variant
            return StringWrapper.replaceAll(input, pattern, replacement);
        }
        return StringWrapper.replace(input, pattern, replacement);
    }
    _supportedInput(input) { return isString(input) || isNumber(input); }
    _supportedPattern(pattern) {
        return isString(pattern) || pattern instanceof RegExp;
    }
    _supportedReplacement(replacement) {
        return isString(replacement) || isFunction(replacement);
    }
};
ReplacePipe = ReplacePipe_1 = __decorate([
    Pipe({ name: 'replace' }),
    Injectable(), 
    __metadata('design:paramtypes', [])
], ReplacePipe);
