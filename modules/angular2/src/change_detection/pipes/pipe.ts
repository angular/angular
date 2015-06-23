import {ABSTRACT, BaseException, CONST} from 'angular2/src/facade/lang';

/**
 * Indicates that the result of a {@link Pipe} transformation has changed even though the reference
 *has not changed.
 *
 * The wrapped value will be unwrapped by change detection, and the unwrapped value will be stored.
 *
 * @exportedAs angular2/pipes
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
 * An interface for extending the list of pipes known to Angular.
 *
 * If you are writing a custom {@link Pipe}, you must extend this interface.
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
 *  transform(value) {
 *    return `${value}${value}`;
 *  }
 * }
 * ```
 *
 * @exportedAs angular2/pipes
 */
export interface Pipe {
  supports(obj): boolean;
  onDestroy(): void;
  transform(value: any): any;
}

/**
 * Provides default implementation of supports and onDestroy.
 *
 * #Example
 *
 * ```
 * class DoublePipe extends BasePipe {*
 *  transform(value) {
 *    return `${value}${value}`;
 *  }
 * }
 * ```
 */
@CONST()
export class BasePipe implements Pipe {
  supports(obj): boolean { return true; }
  onDestroy(): void {}
  transform(value: any): any { return _abstract(); }
}

export interface PipeFactory {
  supports(obs): boolean;
  create(cdRef): Pipe;
}

function _abstract() {
  throw new BaseException('This method is abstract');
}
