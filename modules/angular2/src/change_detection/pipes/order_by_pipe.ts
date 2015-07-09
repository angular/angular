import {
  StringWrapper,
  isBlank,
  isString,
  isArray,
  CONST,
  FunctionWrapper,
  compare,
  isDart
} from 'angular2/src/facade/lang';
import {isListLikeIterable, ListWrapper, CompareFn} from 'angular2/src/facade/collection';
import {Pipe, BasePipe, PipeFactory} from './pipe';
import {Parser} from 'angular2/src/change_detection/parser/parser';
import {Lexer} from 'angular2/src/change_detection/parser/lexer';
import {ChangeDetectorRef} from '../change_detector_ref';

function _nop(e) {
  return e;
}
var _parser = new Parser(new Lexer());

/**
 * (**Javascript only**) Orders the the elements of an [Iterable] using a predicate.
 *
 * # Usage
 *
 *      expression | orderBy:predicate[:descending]
 *
 * The input to orderBy must be an [Iterable] object. The predicate may be specified as:
 *
 * - **a string**: a string containing an expression, such as "user.lastName", used to order the
 * list.
 * - **a custom function**: a function that will be called to transform the element
 *   before a sort.
 * - **a List**: it may consist of either strings or functions. A list expression
 *   indicates a list of fallback expressions to use when a comparison results in the items being
 *   equal.
 *
 * If the expression is explicitly empty(`orderBy:''`), the elements are sorted in
 * ascending order, using the default comparator, `+`.
 *
 * A string expression in the predicate can be prefixed to indicate sort order:
 *
 * - `+`: sort the elements in ascending order. This is the default.
 * - `-`: sort the elements in descending order.
 *
 * Alternately, by appending `true`, you can set "descending order" to true, which has the same
 * effect as the `-` prefix.
 *
 * # Examples
 *
 * ## Example 1: Simple array and single/empty expression.
 *
 * Assume that you have an array on scope called `colors` and that it has a list
 * of these strings – `['red', 'blue', 'green']`.  You might sort these in
 * ascending order this way:
 *
 *     Colors: <ul>
 *       <li *ng-for="var color of colors | orderBy:''">{{color}}</li>
 *     </ul>
 *
 * That would result in:
 *
 *     <ul>
 *       <li>blue</li>
 *       <li>green</li>
 *       <li>red</li>
 *     <ul>
 *
 * The empty string expression, `''`, here signifies sorting in ascending order
 * using the default comparator.  Using `'+'` would also work, as the `+` prefix
 * is implied.
 *
 * To sort in descending order, you would use the `'-'` prefix.
 *
 *     Colors: <ul>
 *       <li *ng-for="var color of colors | orderBy:'-'">{{color}}</li>
 *     </ul>
 *
 * For this simple example, you could have also provided `true` as the addition
 * optional parameter which requests a reverse order sort to get the same
 * result.
 *
 *     <!-- Same result (descending order) as previous snippet. -->
 *     Colors: <ul>
 *       <li *ng-for="var color of colors | orderBy:'':true">{{color}}</li>
 *     </ul>
 *
 * ## Example 2: Complex objects, single expression.
 *
 * You may provide a more complex expression to sort non-primitive values or
 * if you want to sort on a decorated/transformed value.
 *
 * e.g. Support you have a list `users` that looks like this:
 *
 *     authors = [
 *       {firstName: 'Emily',   lastName: 'Bronte'},
 *       {firstName: 'Mark',    lastName: 'Twain'},
 *       {firstName: 'Jeffrey', lastName: 'Archer'},
 *       {firstName: 'Isaac',   lastName: 'Asimov'},
 *       {firstName: 'Oscar',   lastName: 'Wilde'},
 *     ];
 *
 * If you want to list the authors sorted by `lastName`, you would use
 *
 *     <li *ng-for="var author of authors | orderBy:'lastName'">
 *       {{author.lastName}}, {{author.firstName}}
 *     </li>
 *
 * The string expression, `'lastName'`, indicates that the sort should be on the
 * `lastName` property of each item.
 *
 * Using the lesson from the previous example, you may sort in reverse order of
 * lastName using either of the two methods.
 *
 *     <!-- reverse order of last names -->
 *     <li *ng-for="var author of authors | orderBy:'-lastName'">
 *     <!-- also does the same thing -->
 *     <li *ng-for="var author of authors | orderBy:'lastName':true">
 *
 * Note that, while we only discussed string expressions, such as `"lastName"`
 * or the empty string, you can also directly provide a custom function that
 * will be called to transform the element before a sort.
 *
 *     <li *ng-for="var author of authors | orderBy:getAuthorId">
 *
 * In the previous snippet, `getAuthorId` would evaluate to a callable when
 * evaluated.  That callable is called once for each element in the list
 * (i.e. each author object) and the sort order is determined by the sort order
 * of the value mapped by the callable.
 *
 * ## Example 3: List expressions
 *
 * Both a string expression and the callable expression are simple versions of
 * the more general list expression.  You may pass a list as the orderBy
 * expression and this list may consist of either of the string or functions
 * you saw in the previous examples.  A list expression indicates a list of
 * fallback expressions to use when a comparision results in the items being equal.
 *
 * For example, one might want to sort the authors list, first by last name and
 * then by first name when the last names are equal.  You would do that like
 * this:
 *
 *     <li *ng-for="var author of authors | orderBy:['lastName', 'firstName']">
 *
 * The items in such a list may either be string expressions or functions.
 */
export class OrderByPipe extends BasePipe {
  _lastCompareFn = null;
  _lastExpression = null;

  static supportsObj(obj: any): boolean { return isListLikeIterable(obj); }

  supports(obj: any): boolean { return OrderByPipe.supportsObj(obj); }

  static _createMapper(expression: string) {
    var ast = _parser.parseBinding(expression, '');
    return function(e) { return ast.eval(e, null); };
  }

  static _buildCompareFn(expressions: any[], descending: boolean = false): CompareFn<any> {
    var numExpressions: int = expressions.length;
    var mappers: Function[] = ListWrapper.createFixedSize(numExpressions);
    var cmpSign: int[] = ListWrapper.createFixedSize(numExpressions);
    for (var i = 0; i < numExpressions; i++) {
      var expression = expressions[i];
      cmpSign[i] = descending ? -1 : 1;
      if (isString(expression)) {
        var strExp: string = expression;
        if (StringWrapper.startsWith(strExp, '-') || StringWrapper.startsWith(strExp, '+')) {
          if (StringWrapper.startsWith(strExp, '-')) cmpSign[i] *= -1;
          strExp = StringWrapper.substring(strExp, 1);
        }
        if (strExp == '') {
          mappers[i] = _nop;
        } else {
          mappers[i] = OrderByPipe._createMapper(strExp);
        }
      } else {
        mappers[i] = expression;
      }
    }
    return function(a, b) {
      for (var i = 0; i < numExpressions; i++) {
        var result = compare(mappers[i](a), mappers[i](b));
        if (result != 0) return result * cmpSign[i];
      }
      return 0;
    };
  }

  transform(value: any, args: any[]): any[] {
    if (isBlank(args)) return value;
    var expression = args.length > 0 ? args[0] : null;
    var descending: boolean = args.length > 1 ? args[1] : false;

    value = ListWrapper.from(value);
    if (isBlank(expression)) return value;
    var compareFn: CompareFn<any>;
    if (!isArray(expression)) {
      if (expression !== this._lastExpression) {
        this._lastExpression = expression;
        this._lastCompareFn = OrderByPipe._buildCompareFn([expression], descending);
      }
      compareFn = this._lastCompareFn;
    } else {
      compareFn = OrderByPipe._buildCompareFn(expression, descending);
    }
    ListWrapper.sort(value, compareFn);
    return value;
  }
}

@CONST()
export class OrderByPipeFactory implements PipeFactory {
  supports(obj: any): boolean { return !isDart && OrderByPipe.supportsObj(obj); }

  create(cdRef: ChangeDetectorRef): Pipe { return new OrderByPipe(); }
}
