import {
  isBlank,
  isString,
  isNumber,
  isFunction,
  RegExpWrapper,
  StringWrapper
} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {Injectable, PipeTransform, Pipe} from 'angular2/core';
import {InvalidPipeArgumentException} from './invalid_pipe_argument_exception';

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

@Pipe({name: 'replace'})
@Injectable()
export class ReplacePipe implements PipeTransform {
  transform(value: any, args: any[]): any {
    if (isBlank(args) || args.length !== 2) {
      throw new BaseException('ReplacePipe requires two arguments');
    }

    if (isBlank(value)) {
      return value;
    }

    if (!this._supportedInput(value)) {
      throw new InvalidPipeArgumentException(ReplacePipe, value);
    }

    var input = value.toString();
    var pattern = args[0];
    var replacement = args[1];


    if (!this._supportedPattern(pattern)) {
      throw new InvalidPipeArgumentException(ReplacePipe, pattern);
    }
    if (!this._supportedReplacement(replacement)) {
      throw new InvalidPipeArgumentException(ReplacePipe, replacement);
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

  private _supportedInput(input: any): boolean { return isString(input) || isNumber(input); }

  private _supportedPattern(pattern: any): boolean {
    return isString(pattern) || pattern instanceof RegExp;
  }

  private _supportedReplacement(replacement: any): boolean {
    return isString(replacement) || isFunction(replacement);
  }
}
