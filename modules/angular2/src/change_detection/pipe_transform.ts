import {ABSTRACT, BaseException, CONST, Type} from 'angular2/src/facade/lang';

/**
 * An interface which all pipes must implement.
 *
 * #Example
 *
 * ```
 * class DoublePipe implements PipeTransform {
 *  transform(value, args = []) {
 *    return `${value}${value}`;
 *  }
 * }
 * ```
 */
export interface PipeTransform { transform(value: any, args: List<any>): any; }

/**
 * An interface that stateful pipes should implement.
 *
 * #Example
 *
 * ```
 * class StatefulPipe implements PipeTransform, PipeOnDestroy {
 *  connection;
 *
 *  onDestroy() {
 *    this.connection.release();
 *  }
 *
 *  transform(value, args = []) {
 *    this.connection = createConnection();
 *    // ...
 *    return someValue;
 *  }
 * }
 * ```
 */
export interface PipeOnDestroy { onDestroy(): void; }

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
export class BasePipeTransform implements PipeTransform, PipeOnDestroy {
  onDestroy(): void {}
  transform(value: any, args: List<any>): any { return _abstract(); }
}

function _abstract() {
  throw new BaseException('This method is abstract');
}
