import {
  isBlank,
  isString,
  isArray,
  StringWrapper,
  BaseException,
  CONST
} from 'angular2/src/core/facade/lang';
import {ListWrapper} from 'angular2/src/core/facade/collection';
import {Math} from 'angular2/src/core/facade/math';
import {Injectable} from 'angular2/di';

import {PipeTransform, WrappedValue} from 'angular2/change_detection';
import {InvalidPipeArgumentException} from './invalid_pipe_argument_exception';

import {Pipe} from '../metadata';

/**
 * Creates a new Array or String containing only a prefix/suffix of the
 * elements.
 *
 * The number of elements to return is specified by the `limitTo` parameter.
 *
 * # Usage
 *
 *     expression | limitTo:number
 *
 * Where the input expression is a [Array] or [String], and `limitTo` is:
 *
 * - **a positive integer**: return _number_ items from the beginning of the list or string
 * expression.
 * - **a negative integer**: return _number_ items from the end of the list or string expression.
 * - **`|limitTo|` greater than the size of the expression**: return the entire expression.
 *
 * When operating on a [Array], the returned list is always a copy even when all
 * the elements are being returned.
 *
 * # Examples
 *
 * ## Array Example
 *
 * Assuming `var collection = ['a', 'b', 'c']`, this `ng-for` directive:
 *
 *     <li *ng-for="var i in collection | limitTo:2">{{i}}</li>
 *
 * produces the following:
 *
 *     <li>a</li>
 *     <li>b</li>
 *
 * ## String Examples
 *
 *     {{ 'abcdefghij' | limitTo: 4 }}       // output is 'abcd'
 *     {{ 'abcdefghij' | limitTo: -4 }}      // output is 'ghij'
 *     {{ 'abcdefghij' | limitTo: -100 }}    // output is 'abcdefghij'
 */
@Pipe({name: 'limitTo'})
@Injectable()
export class LimitToPipe implements PipeTransform {
  supports(obj: any): boolean { return isString(obj) || isArray(obj); }

  transform(value: any, args: any[] = null): any {
    if (isBlank(args) || args.length == 0) {
      throw new BaseException('limitTo pipe requires one argument');
    }
    if (!this.supports(value)) {
      throw new InvalidPipeArgumentException(LimitToPipe, value);
    }
    if (isBlank(value)) return value;
    var limit: number = args[0];
    var left = 0, right = Math.min(limit, value.length);
    if (limit < 0) {
      left = Math.max(0, value.length + limit);
      right = value.length;
    }
    if (isString(value)) {
      return StringWrapper.substring(value, left, right);
    }
    return ListWrapper.slice(value, left, right);
  }
}
