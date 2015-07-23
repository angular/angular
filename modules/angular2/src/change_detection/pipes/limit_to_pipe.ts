import {
  isBlank,
  isString,
  isArray,
  StringWrapper,
  BaseException,
  CONST
} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';
import {Math} from 'angular2/src/facade/math';
import {WrappedValue, Pipe, PipeFactory} from './pipe';
import {ChangeDetectorRef} from '../change_detector_ref';

/**
 * Creates a new List or String containing only a prefix/suffix of the
 * elements.
 *
 * The number of elements to return is specified by the `limitTo` parameter.
 *
 * # Usage
 *
 *     expression | limitTo:number
 *
 * Where the input expression is a [List] or [String], and `limitTo` is:
 *
 * - **a positive integer**: return _number_ items from the beginning of the list or string
 * expression.
 * - **a negative integer**: return _number_ items from the end of the list or string expression.
 * - **`|limitTo|` greater than the size of the expression**: return the entire expression.
 *
 * When operating on a [List], the returned list is always a copy even when all
 * the elements are being returned.
 *
 * # Examples
 *
 * ## List Example
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
export class LimitToPipe implements Pipe {
  static supportsObj(obj: any): boolean { return isString(obj) || isArray(obj); }

  supports(obj: any): boolean { return LimitToPipe.supportsObj(obj); }

  transform(value: any, args: List<any> = null): any {
    if (isBlank(args) || args.length == 0) {
      throw new BaseException('limitTo pipe requires one argument');
    }
    var limit: int = args[0];
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

  onDestroy(): void {}
}

@CONST()
export class LimitToPipeFactory implements PipeFactory {
  supports(obj: any): boolean { return LimitToPipe.supportsObj(obj); }

  create(cdRef: ChangeDetectorRef): Pipe { return new LimitToPipe(); }
}
