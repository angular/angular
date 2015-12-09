import { Promise } from 'angular2/src/facade/promise';
export { PromiseWrapper, Promise, PromiseCompleter } from 'angular2/src/facade/promise';
import { Subject } from 'rxjs/Subject';
import { Observable as RxObservable } from 'rxjs/Observable';
import { Operator } from 'rxjs/Operator';
export { Subject } from 'rxjs/Subject';
export declare namespace NodeJS {
    interface Timer {
    }
}
export declare class TimerWrapper {
    static setTimeout(fn: (...args: any[]) => void, millis: number): NodeJS.Timer;
    static clearTimeout(id: NodeJS.Timer): void;
    static setInterval(fn: (...args: any[]) => void, millis: number): NodeJS.Timer;
    static clearInterval(id: NodeJS.Timer): void;
}
export declare class ObservableWrapper {
    static subscribe<T>(emitter: any, onNext: (value: T) => void, onError?: (exception: any) => void, onComplete?: () => void): Object;
    static isObservable(obs: any): boolean;
    /**
     * Returns whether `obs` has any subscribers listening to events.
     */
    static hasSubscribers(obs: EventEmitter<any>): boolean;
    static dispose(subscription: any): void;
    /**
     * @deprecated - use callEmit() instead
     */
    static callNext(emitter: EventEmitter<any>, value: any): void;
    static callEmit(emitter: EventEmitter<any>, value: any): void;
    static callError(emitter: EventEmitter<any>, error: any): void;
    static callComplete(emitter: EventEmitter<any>): void;
    static fromPromise(promise: Promise<any>): Observable<any>;
    static toPromise(obj: Observable<any>): Promise<any>;
}
/**
 * Use by directives and components to emit custom Events.
 *
 * ### Examples
 *
 * In the following example, `Zippy` alternatively emits `open` and `close` events when its
 * title gets clicked:
 *
 * ```
 * @Component({
 *   selector: 'zippy',
 *   template: `
 *   <div class="zippy">
 *     <div (click)="toggle()">Toggle</div>
 *     <div [hidden]="!visible">
 *       <ng-content></ng-content>
 *     </div>
 *  </div>`})
 * export class Zippy {
 *   visible: boolean = true;
 *   @Output() open: EventEmitter<any> = new EventEmitter();
 *   @Output() close: EventEmitter<any> = new EventEmitter();
 *
 *   toggle() {
 *     this.visible = !this.visible;
 *     if (this.visible) {
 *       this.open.emit(null);
 *     } else {
 *       this.close.emit(null);
 *     }
 *   }
 * }
 * ```
 *
 * Use Rx.Observable but provides an adapter to make it work as specified here:
 * https://github.com/jhusain/observable-spec
 *
 * Once a reference implementation of the spec is available, switch to it.
 */
export declare class EventEmitter<T> extends Subject<T> {
    /**
     * Creates an instance of [EventEmitter], which depending on [isAsync],
     * delivers events synchronously or asynchronously.
     */
    constructor(isAsync?: boolean);
    emit(value: T): void;
    /**
     * @deprecated - use .emit(value) instead
     */
    next(value: any): void;
    subscribe(generatorOrNext?: any, error?: any, complete?: any): any;
}
/**
 * Allows publishing and subscribing to series of async values.
 *
 * The `Observable` class is an alias to the `Observable` returned from
 * {@link https://github.com/reactivex/rxjs}. `Observables` are a means of delivering
 * any number of values over any period of time. `Observables` can be thought of as a
 * mixture of `Promise` and `Array`. `Observables` are like `Arrays` in that they can have
 * chained combinators -- like `map`, `reduce`, and `filter` -- attached in order to
 * perform projections and transformations of data. And they are like `Promises`
 * in that they can asynchronously deliver values. But unlike a `Promise`, an
 * `Observable` can emit many values over time, and decides if/when it is completed.
 *
 * `Observable` is also being considered for inclusion in the
 * [ECMAScript spec](https://github.com/zenparsing/es-observable).
 *
 * ## Example
 *
 * A simple example of using an `Observable` is a timer `Observable`, which will
 * notify an `Observer` each time an interval has completed.
 *
 * {@example facade/ts/async/observable.ts region='Observable'}
 *
 * The `Observable` in Angular currently doesn't provide any combinators by default.
 * So it's necessary to explicitly import any combinators that an application requires.
 * There are two ways to import RxJS combinators: pure and patched. The "pure" approach
 * involves importing a combinator as a function every place that an application needs it,
 * then calling the function with the source observable as the context of the function.
 *
 * ## Example
 *
 * {@example facade/ts/async/observable_pure.ts region='Observable'}
 *
 * The "patched" approach to using combinators is to import a special module for
 * each combinator, which will automatically cause the combinator to be patched
 * to the `Observable` prototype, which will make it available to use anywhere in
 * an application after the combinator has been imported once.
 *
 * ## Example
 *
 * (Notice the extra "add" in the path to import `map`)
 *
 * {@example facade/ts/async/observable_patched.ts region='Observable'}
 *
 * Notice that the sequence of operations is now able to be expressed "left-to-right"
 * because `map` is on the `Observable` prototype. For a simple example like this one,
 * the left-to-right expression may seem insignificant. However, when several operators
 * are used in combination, the "callback tree" grows several levels deep, and becomes
 * difficult to read. For this reason, the "patched" approach is the recommended approach
 * to add new operators to `Observable`.
 *
 * For applications that are less sensitive about payload size, the set of core operators
 * can be patched onto the `Observable` prototype with a single import, by importing the
 * `rxjs` module.
 *
 * {@example facade/ts/async/observable_all.ts region='Observable'}
 *
 * Full documentation on RxJS `Observable` and available combinators can be found
 * in the RxJS [Observable docs](http://reactivex.io/RxJS/class/es6/Observable.js~Observable.html).
 *
 */
export declare class Observable<T> extends RxObservable<T> {
    lift<T, R>(operator: Operator<T, R>): Observable<T>;
}
