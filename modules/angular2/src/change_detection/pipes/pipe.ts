import {ABSTRACT, BaseException, CONST, Type} from 'angular2/src/facade/lang';

/**
 * Indicates that the result of a {@link Pipe} transformation has changed even though the reference
 * has not changed.
 *
 * The wrapped value will be unwrapped by change detection, and the unwrapped value will be stored.
 */
export class WrappedValue {
  constructor(public wrapped: any) {}

  static wrap(value: any): WrappedValue {
    var w = _wrappedValues[_wrappedIndex++ % 5];
    w.wrapped = value;
    return w;
  }
}

var _wrappedValues = [
  new WrappedValue(null),
  new WrappedValue(null),
  new WrappedValue(null),
  new WrappedValue(null),
  new WrappedValue(null)
];

var _wrappedIndex = 0;

/**
 * An interface which all pipes must implement.
 *
 * #Example
 *
 * ```
 * class DoublePipe implements Pipe {
 *  supports(obj) {
 *    return true;
 *  }
 *
 *  onDestroy() {}
 *
 *  transform(value, args = []) {
 *    return `${value}${value}`;
 *  }
 * }
 * ```
 */
export interface Pipe {
  /**
   * Query if a pipe supports a particular object instance.
   */
  onDestroy(): void;

  transform(value: any, args: List<any>): any;
}

/**
 * Provides default implementation of `supports` and `onDestroy` method.
 *
 * #Example
 *
 * ```
 * class DoublePipe extends BasePipe {
 *  transform(value) {
 *    return `${value}${value}`;
 *  }
 * }
 * ```
 */
@CONST()
export class BasePipe implements Pipe {
  onDestroy(): void {}
  transform(value: any, args: List<any>): any { return _abstract(); }
}

export class InvalidPipeArgumentException extends BaseException {
  constructor(type: Type, value: Object) {
    super(`Invalid argument '${value}' for pipe '${type}'`);
  }
}

function _abstract() {
  throw new BaseException('This method is abstract');
}