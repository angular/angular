import {ABSTRACT, BaseException, CONST, Type} from 'angular2/src/core/facade/lang';

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
export interface PipeTransform { transform(value: any, args: any[]): any; }

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
