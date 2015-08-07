import {ABSTRACT, BaseException, CONST, Type} from 'angular2/src/facade/lang';

/**
 * An interface which all pipes must implement.
 *
 * #Example
 *
 * ```
 * class DoublePipe implements PipeTransform {
 *  onDestroy() {}
 *
 *  transform(value, args = []) {
 *    return `${value}${value}`;
 *  }
 * }
 * ```
 */
export interface PipeTransform {
  onDestroy(): void;

  transform(value: any, args: List<any>): any;
}

/**
 * Provides default implementation of the `onDestroy` method.
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
export class BasePipeTransform implements PipeTransform {
  onDestroy(): void {}
  transform(value: any, args: List<any>): any { return _abstract(); }
}

function _abstract() {
  throw new BaseException('This method is abstract');
}
