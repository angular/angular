import {
  StringWrapper,
  isBlank,
  isString,
  isNumber,
  isBoolean,
  isStringMap,
  isArray,
  isFunction,
  CONST,
  FunctionWrapper
} from 'angular2/src/facade/lang';
import {
  isListLikeIterable,
  ListWrapper,
  StringMapWrapper,
  Predicate
} from 'angular2/src/facade/collection';
import {Pipe, BasePipe, PipeFactory} from './pipe';
import {reflector} from 'angular2/src/reflection/reflection';
import {ChangeDetectorRef} from '../change_detector_ref';

export interface Comparator { (actual: any, expected: any): boolean; }

/**
 * Selects a subset of items from an iterable and returns it as a new array.
 *
 * # Usage
 *
 *     iterable | filter:expression[:comparator]
 *
 * where `expression` is the predicate to be used for selecting items from the iterable.
 *
 *   Can be one of:
 *
 *   - `string`: The string is used for matching against the contents of the iterable. All strings
 *     or objects with string properties in the iterable that match this string will be returned.
 *     This also applies to nested object properties.
 *     The predicate can be negated by prefixing the string with `!`.
 *
 *   - `map`: A pattern object can be used to filter specific properties on objects contained
 *     in iterable. For example `{name:"M", phone:"1"}` predicate will return an array of items
 *     which have property `name` containing "M" and property `phone` containing "1". A special
 *     property name `$` can be used (as in `{$:"text"}`) to accept a match against any
 *     property of a map or its nested map properties. That's equivalent to the simple
 *     substring match with a `string` as described above. The predicate can be negated by prefixing
 *     the string with `!`.
 *     For example `{name: "!M"}` predicate will return an array of items which have property `name`
 *     not containing "M".
 *
 *     Note that a named property will match properties on the same level only, while the special
 *     `$` property will match properties on the same level or deeper. E.g. an array item like
 *     `{name: {first: 'John', last: 'Doe'}}` will **not** be matched by `{name: 'John'}`, but
 *     **will** be matched by `{$: 'John'}`.
 *
 *   - `function(value)`: A predicate function can be used to write arbitrary filters.
 *     The function is called for each element of the iterable and should return `true`
 *     if that element should be included in the final result.
 *
 *  also `comparator` which is used in determining if the expected value (from the filter
 *  expression) and actual value (from the object in the array) should be considered a match.
 *
 *   Can be one of:
 *
 *   - `function(actual, expected)`: The function will be given the object value and the predicate
 *     value to compare and should return true if both values should be considered equal.
 *
 *   - `false|null`: Uses `==` operator for comparison. This is the default
 *
 *   - `true`: Like a `false` value, but for strings, checks whether the lowercase of expected is
 *      included in the lowercase of the actual.
 *
 * # Example
 *
 * Assuming:
 *
 *  ```
 *  friends = [{'name':'John',     'phone':'555-1276'},
 *             {'name':'Mary',     'phone':'800-BIG-MARY'},
 *             {'name':'Mike',     'phone':'555-4321'},
 *             {'name':'Adam',     'phone':'555-5678'},
 *             {'name':'Julie',    'phone':'555-8765'},
 *             {'name':'Juliette', 'phone':'555-5678'}];
 *  ```
 *
 * the following is a basic filtering of elements of a `friends` array:
 *
 *  ```
 *     Search: <input type="text" [(ng-model)]="searchText">
 *     <table>
 *       <tr><th>Name</th><th>Phone</th></tr>
 *       <tr *ng-for="#friend in friends | filter:searchText">
 *         <td>{{friend.name}}</td>
 *         <td>{{friend.phone}}</td>
 *       </tr>
 *     </table>
 * ```
 * where searching for 'm' will filter the list to Mary, Mike and Adam while searching
 * for '76' will pick John and Juliette because they have '76' in their phone numbers.
 *
 * Here is another example for filtering by specific field names:
 *
 *  ```
 *     Any: <input [(ng-model)]="search.$">
 *     Name only <input type="text" [(ng-model)]="search.name"><br>
 *     Phone only <input type="text" [(ng-model)]="search.phone"><br>
 *     Equality <input type="checkbox" [(ng-model)]="strict">
 *     <table>
 *       <tr><th>Name</th><th>Phone</th></tr>
 *       <tr *ng-for="#friend in friends | filter:search:strict">
 *         <td>{{friend.name}}</td>
 *         <td>{{friend.phone}}</td>
 *       </tr>
 *     </table>
 *  ```
 *
 * @exportedAs angular2/pipes
 */
@CONST()
export class FilterPipe extends BasePipe implements PipeFactory {
  supports(obj): boolean { return isListLikeIterable(obj); }

  static _defaultComparator(exactStringMatch: boolean = false): Comparator {
    return function(item, what) {
      if (isString(item) && isString(what) && !exactStringMatch) {
        item = StringWrapper.toLowerCase(item);
        what = StringWrapper.toLowerCase(what);
        return StringWrapper.contains(item, what);
      }
      return item == what;
    }
  }

  static _search(item, what, comparator: Comparator, deepPrimitiveMatch: boolean = true): boolean {
    if (isString(what) && StringWrapper.startsWith(what, '!')) {
      what = StringWrapper.substring(what, 1);
      return !FilterPipe._search(item, what, comparator, deepPrimitiveMatch);
    }
    if (isBlank(item)) return comparator(item, what);
    if (isArray(item)) {
      return ListWrapper.any(item,
                             (i) => FilterPipe._search(i, what, comparator, deepPrimitiveMatch));
    }
    if (isStringMap(what)) {
      if (isString(item) || isNumber(item) || isBoolean(what)) return false;
      return ListWrapper.every(StringMapWrapper.keys(what), (key) => {
        if (key == '$') {
          if (isStringMap(item)) {
            // Does not work with Dart objects, since enumerating properties is not trivial.
            return ListWrapper.any(
                StringMapWrapper.keys(item),
                (itemKey) => FilterPipe._search(item[itemKey], what[key], comparator));
          }
          return false;
        }
        var newItem =
            isStringMap(item) ? StringMapWrapper.get(item, key) : reflector.getter(key)(item);
        return FilterPipe._search(newItem, what[key], comparator, false);
      });
    }
    if (isStringMap(item) && deepPrimitiveMatch) {
      return ListWrapper.any(StringMapWrapper.keys(item),
                             (k) => FilterPipe._search(item[k], what, comparator));
    }
    return comparator(item, what);
  }

  static _buildPredFn(expression, comparator): Predicate<any> {
    if (!isFunction(comparator)) {
      comparator = FilterPipe._defaultComparator(comparator === true);
    }
    return isFunction(expression) ? expression :
                                    (item) => FilterPipe._search(item, expression, comparator);
  }

  transform(value, args: any[]): any[] {
    if (isBlank(args)) return value;
    var expression = args.length > 0 ? args[0] : null;
    var comparator: Comparator | boolean = args.length > 1 ? args[1] : null;
    var items: any[] = ListWrapper.from(value);
    if (isBlank(expression)) return items;
    return ListWrapper.filter(items, FilterPipe._buildPredFn(expression, comparator));
  }

  create(cdRef: ChangeDetectorRef): Pipe { return this }
}
