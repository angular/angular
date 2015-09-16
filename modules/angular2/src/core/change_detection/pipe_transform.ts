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
 * ### Example ([live demo](http://plnkr.co/edit/f5oyIked9M2cKzvZNKHV?p=preview))
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
 */
export interface PipeTransform { transform(value: any, args: any[]): any; }

/**
 * To create a stateful Pipe, you should implement this interface.
 *
 * A stateful pipe may produce different output, given the same input. It is
 * likely that a stateful pipe may contain state that should be cleaned up when
 * a binding is destroyed. For example, a subscription to a stream of data may need to
 * be disposed, or an interval may need to be cleared.
 *
 * ### Example ([live demo](http://plnkr.co/edit/hlaejwQAmWayxwc5YXQE?p=preview))
 *
 * In this example, a pipe is created to countdown its input value, updating it every
 * 50ms. Because it maintains an internal interval, it automatically clears
 * the interval when the binding is destroyed or the countdown completes.
 *
 * ```
 * import {Pipe, PipeTransform} from 'angular2/angular2'
 * @Pipe({name: 'countdown'})
 * class CountDown implements PipeTransform, PipeOnDestroy {
 *   remainingTime:Number;
 *   interval:SetInterval;
 *   onDestroy() {
 *     if (this.interval) {
 *       clearInterval(this.interval);
 *     }
 *   }
 *   transform(value: any, args: any[] = []) {
 *     if (!parseInt(value, 10)) return null;
 *     if (typeof this.remainingTime !== 'number') {
 *       this.remainingTime = parseInt(value, 10);
 *     }
 *     if (!this.interval) {
 *       this.interval = setInterval(() => {
 *         this.remainingTime-=50;
 *         if (this.remainingTime <= 0) {
 *           this.remainingTime = 0;
 *           clearInterval(this.interval);
 *           delete this.interval;
 *         }
 *       }, 50);
 *     }
 *     return this.remainingTime;
 *   }
 * }
 * ```
 *
 * Invoking `{{ 10000 | countdown }}` would cause the value to be decremented by 50,
 * every 50ms, until it reaches 0.
 *
 */
export interface PipeOnDestroy { onDestroy(): void; }
