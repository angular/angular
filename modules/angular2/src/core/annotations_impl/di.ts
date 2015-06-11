import {CONST, stringify, isPresent} from 'angular2/src/facade/lang';
import {DependencyAnnotation} from 'angular2/src/di/annotations_impl';
import {resolveForwardRef} from 'angular2/di';

/**
 * Specifies that a constant attribute value should be injected.
 *
 * The directive can inject constant string literals of host element attributes.
 *
 * ## Example
 *
 * Suppose we have an `<input>` element and want to know its `type`.
 *
 * ```html
 * <input type="text">
 * ```
 *
 * A decorator can inject string literal `text` like so:
 *
 * ```javascript
 * @Directive({
 *   selector: `input'
 * })
 * class InputDirective {
 *   constructor(@Attribute('type') type) {
 *     // type would be `text` in this example
 *   }
 * }
 * ```
 *
 * @exportedAs angular2/annotations
 */
@CONST()
export class Attribute extends DependencyAnnotation {
  constructor(public attributeName: string) { super(); }

  get token() {
    // Normally one would default a token to a type of an injected value but here
    // the type of a variable is "string" and we can't use primitive type as a return value
    // so we use instance of Attribute instead. This doesn't matter much in practice as arguments
    // with @Attribute annotation are injected by ElementInjector that doesn't take tokens into
    // account.
    return this;
  }
  toString() { return `@Attribute(${stringify(this.attributeName)})`; }
}

/**
 * Specifies that a {@link QueryList} should be injected.
 *
 * See {@link QueryList} for usage and example.
 *
 * @exportedAs angular2/annotations
 */
@CONST()
export class Query extends DependencyAnnotation {
  descendants: boolean;
  constructor(private _directive: any, {descendants = false}: {descendants?: boolean} = {}) {
    super();
    this.descendants = descendants;
  }

  get directive() { return resolveForwardRef(this._directive); }

  toString() { return `@Query(${stringify(this.directive)})`; }
}
