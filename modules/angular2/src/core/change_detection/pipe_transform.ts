/**
 * To create a Pipe, you must implement this interface.
 *
 * Angular invokes the `transform` method with the value of a binding
 * as the first argument, and any parameters as the second argument in list form.
 *
 * ## Syntax
 *
 * `value | pipeName[:arg0[:arg1...]]`
 *
 * ## Example
 *
 * The `RepeatPipe` below repeats the value as many times as indicated by the first argument:
 *
 * ```
 * import {Pipe, PipeTransform} from 'angular2/angular2';
 *
 * @Pipe({name: 'repeat'})
 * export class RepeatPipe implements PipeTransform {
 *   transform(value: any, args: any[] = []) {
 *     if (args.length == 0) {
 *       throw new Error('repeat pipe requires one argument');
 *     }
 *     let times: number = args[0];
 *     return value.repeat(times);
 *   }
 * }
 * ```
 *
 * Invoking `{{ 'ok' | repeat:3 }}` in a template produces `okokok`.
 *
 * See full working example: http://plnkr.co/edit/f5oyIked9M2cKzvZNKHV?p=preview
 *
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
