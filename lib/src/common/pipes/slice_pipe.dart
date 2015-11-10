library angular2.src.common.pipes.slice_pipe;

import "package:angular2/src/facade/lang.dart"
    show isBlank, isString, isArray, StringWrapper;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/core/change_detection.dart"
    show PipeTransform, WrappedValue;
import "invalid_pipe_argument_exception.dart" show InvalidPipeArgumentException;
import "package:angular2/src/core/metadata.dart" show Pipe;

/**
 * Creates a new List or String containing only a subset (slice) of the
 * elements.
 *
 * The starting index of the subset to return is specified by the `start` parameter.
 *
 * The ending index of the subset to return is specified by the optional `end` parameter.
 *
 *##Usage
 *
 *     expression | slice:start[:end]
 *
 * All behavior is based on the expected behavior of the JavaScript API
 * Array.prototype.slice() and String.prototype.slice()
 *
 * Where the input expression is a [List] or [String], and `start` is:
 *
 * - **a positive integer**: return the item at _start_ index and all items after
 * in the list or string expression.
 * - **a negative integer**: return the item at _start_ index from the end and all items after
 * in the list or string expression.
 * - **`|start|` greater than the size of the expression**: return an empty list or string.
 * - **`|start|` negative greater than the size of the expression**: return entire list or
 * string expression.
 *
 * and where `end` is:
 *
 * - **omitted**: return all items until the end of the input
 * - **a positive integer**: return all items before _end_ index of the list or string
 * expression.
 * - **a negative integer**: return all items before _end_ index from the end of the list
 * or string expression.
 *
 * When operating on a [List], the returned list is always a copy even when all
 * the elements are being returned.
 *
 * ### Examples
 *
 * ## List Example
 *
 * Assuming `var collection = ['a', 'b', 'c', 'd']`, this `ng-for` directive:
 *
 *     <li *ng-for="var i of collection | slice:1:3">{{i}}</li>
 *
 * produces the following:
 *
 *     <li>b</li>
 *     <li>c</li>
 *
 * ## String Examples
 *
 *     {{ 'abcdefghij' | slice:0:4 }}       // output is 'abcd'
 *     {{ 'abcdefghij' | slice:4:0 }}       // output is ''
 *     {{ 'abcdefghij' | slice:-4 }}      // output is 'ghij'
 *     {{ 'abcdefghij' | slice:-4,-2 }}      // output is 'gh'
 *     {{ 'abcdefghij' | slice: -100 }}    // output is 'abcdefghij'
 *     {{ 'abcdefghij' | slice: 100 }}    // output is ''
 */
@Pipe(name: "slice", pure: false)
@Injectable()
class SlicePipe implements PipeTransform {
  dynamic transform(dynamic value, [List<dynamic> args = null]) {
    if (isBlank(args) || args.length == 0) {
      throw new BaseException("Slice pipe requires one argument");
    }
    if (!this.supports(value)) {
      throw new InvalidPipeArgumentException(SlicePipe, value);
    }
    if (isBlank(value)) return value;
    num start = args[0];
    num end = args.length > 1 ? args[1] : null;
    if (isString(value)) {
      return StringWrapper.slice(value, start, end);
    }
    return ListWrapper.slice(value, start, end);
  }

  bool supports(dynamic obj) {
    return isString(obj) || isArray(obj);
  }
}
