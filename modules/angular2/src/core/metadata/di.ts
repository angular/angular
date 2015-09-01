import {
  CONST,
  Type,
  stringify,
  isPresent,
  StringWrapper,
  isString
} from 'angular2/src/core/facade/lang';
import {DependencyMetadata} from 'angular2/src/core/di/metadata';
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
 */
@CONST()
export class AttributeMetadata extends DependencyMetadata {
  constructor(public attributeName: string) { super(); }

  get token() {
    // Normally one would default a token to a type of an injected value but here
    // the type of a variable is "string" and we can't use primitive type as a return value
    // so we use instance of Attribute instead. This doesn't matter much in practice as arguments
    // with @Attribute annotation are injected by ElementInjector that doesn't take tokens into
    // account.
    return this;
  }
  toString(): string { return `@Attribute(${stringify(this.attributeName)})`; }
}

/**
 * Specifies that a {@link QueryList} should be injected.
 *
 * See {@link QueryList} for usage and example.
 */
@CONST()
export class QueryMetadata extends DependencyMetadata {
  descendants: boolean;
  constructor(private _selector: Type | string,
              {descendants = false}: {descendants?: boolean} = {}) {
    super();
    this.descendants = descendants;
  }

  get isViewQuery() { return false; }

  get selector() { return resolveForwardRef(this._selector); }

  get isVarBindingQuery(): boolean { return isString(this.selector); }

  get varBindings(): string[] { return StringWrapper.split(this.selector, new RegExp(",")); }

  toString(): string { return `@Query(${stringify(this.selector)})`; }
}

/**
 * Specifies that a {@link QueryList} should be injected.
 *
 * See {@link QueryList} for usage and example.
 */
@CONST()
export class ViewQueryMetadata extends QueryMetadata {
  constructor(_selector: Type | string, {descendants = false}: {descendants?: boolean} = {}) {
    super(_selector, {descendants: descendants});
  }

  get isViewQuery() { return true; }
  toString(): string { return `@ViewQuery(${stringify(this.selector)})`; }
}
