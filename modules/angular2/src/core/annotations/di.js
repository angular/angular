import {CONST} from 'angular2/src/facade/lang';
import {DependencyAnnotation} from 'angular2/di';

/**
 * Specifies that a function for setting host properties should be injected.
 *
 * NOTE: This is changing pre 1.0.
 *
 * The directive can inject a property setter that would allow setting this property on the host element.
 *
 * @exportedAs angular2/annotations
 */
export class PropertySetter extends DependencyAnnotation {
  propName: string;
  @CONST()
  constructor(propName) {
    super();
    this.propName = propName;
  }

  get token() {
    return Function;
  }
}

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
 * @Decorator({
 *   selector: `input'
 * })
 * class InputDecorator {
 *   constructor(@Attribute('type') type) {
 *     // type would be `text` in this example
 *   }
 * }
 * ```
 *
 * @exportedAs angular2/annotations
 */
export class Attribute extends DependencyAnnotation {
  attributeName: string;
  @CONST()
  constructor(attributeName) {
    super();
    this.attributeName = attributeName;
  }

  get token() {
    //Normally one would default a token to a type of an injected value but here
    //the type of a variable is "string" and we can't use primitive type as a return value
    //so we use instance of Attribute instead. This doesn't matter much in practice as arguments
    //with @Attribute annotation are injected by ElementInjector that doesn't take tokens into account.
    return this;
  }
}

/**
 * Specifies that a [QueryList] should be injected.
 *
 * See: [QueryList] for usage and example.
 *
 * @exportedAs angular2/annotations
 */
export class Query extends DependencyAnnotation {
  directive;
  @CONST()
  constructor(directive) {
    super();
    this.directive = directive;
  }
}
