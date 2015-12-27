import {isBlank, isString, isNumber, isFunction} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {Injectable, PipeTransform, WrappedValue, Pipe} from 'angular2/core';
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
 *     expression | replace:pattern:replacement[:flags]
 *
 * All behavior is based on the expected behavior of the JavaScript API
 * String.prototype.replace() function.
 *
 * Where the input expression is a [String] or [Number] (to be treated as a string),
 * the `pattern` is a [String] or [RegExp],
 * the 'replacement' is a [String] or [Function],
 * and the optional 'flags' parameter is a [String] containing any combination of the
 * letters i (ignore case), g (search globally)  and m (multiline).
 *
 * --Note--: The 'pattern' parameter will be converted to a RegExp instance. Make sure to escape the string properly if you are matching for regular expression special characters like parenthesis, brackets etc.
 */

@Pipe({name: 'replace'})
@Injectable()
export class ReplacePipe implements PipeTransform {
  transform(value: any, args: any[]): any {
    if (isBlank(args) || args.length < 2) {
      throw new BaseException('ReplacePipe requires at least two arguments');
    }

    if (isBlank(value)) {
      return value;
    }

    if (!this.supportedInput(value)) {
      throw new InvalidPipeArgumentException(ReplacePipe, value);
    }

    var pattern = args[0];
    var replacement = args[1];
    var flags = isString(args[2]) ? args[2] : '';

    if (!this.supportedPattern(pattern)) {
      throw new InvalidPipeArgumentException(ReplacePipe, pattern);
    }
    if (!this.supportedReplacement(replacement)) {
      throw new InvalidPipeArgumentException(ReplacePipe, replacement);
    }
    // template fails with literal RegExp e.g /pattern/igm
    var rgx = pattern instanceof RegExp ? pattern : new RegExp(pattern, flags);

    return isString(value) ? (value as string).replace(rgx, replacement) :
                             value.toString().replace(rgx, replacement);
  }

  private supportedInput(input: any): boolean { return isString(input) || isNumber(input); }

  private supportedPattern(pattern: any): boolean {
    return isString(pattern) || pattern instanceof RegExp;
  }

  private supportedReplacement(replacement: any): boolean {
    return isString(replacement) || isFunction(replacement);
  }
}
