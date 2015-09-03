import {ABSTRACT, BaseException, CONST, Type} from 'angular2/src/core/facade/lang';

/**
 * To create a Pipe, you must implement this interface.
 *
 * Angular invokes the `transform` method with the subject as the `value` argument and any
 * parameters in the `args` Array.
 *
 * ## Syntax
 *
 * `subject | pipeName[:arg0[:arg1...]]`
 *
 * ## Example
 *
 * The `RepeatPipe` below repeats the subject as many times as indicated by the first argument:
 *
 * ```
 * @Pipe({name: 'repeat'})
 * class RepeatPipe implements PipeTransform {
 *
 *  transform(value: any, args: any[] = []) {
 *    if (isBlank(args) || args.length == 0) {
 *      throw new BaseException('limitTo pipe requires one argument');
 *    }
 *
 *    let times: number = args[0];
 *
 *    return value.repeat(times);
 *  }
 * }
 * ```
 *
 * Invoking `{{ 'ok' | repeat:3 }}` in a template produces `okokok`.
 *
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
