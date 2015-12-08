import { Observer } from './Observer';
import { Operator } from './Operator';
import { Scheduler } from './Scheduler';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { CoreOperators } from './CoreOperators';
import { GroupedObservable } from './operator/groupBy-support';
import { ConnectableObservable } from './observable/ConnectableObservable';
import { Subject } from './Subject';
import { Notification } from './Notification';
/**
 * A representation of any set of values over any amount of time. This the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
export declare class Observable<T> implements CoreOperators<T> {
    source: Observable<any>;
    operator: Operator<any, T>;
    _isScalar: boolean;
    /**
     * @constructor
     * @param {Function} subscribe the function that is
     * called when the Observable is initially subscribed to. This function is given a Subscriber, to which new values
     * can be `next`ed, or an `error` method can be called to raise an error, or `complete` can be called to notify
     * of a successful completion.
     */
    constructor(subscribe?: <R>(subscriber: Subscriber<R>) => Subscription<T> | Function | void);
    /**
     * @static
     * @method create
     * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
     * @returns {Observable} a new cold observable
     * @description creates a new cold Observable by calling the Observable constructor
     */
    static create: Function;
    /**
     * @method lift
     * @param {Operator} operator the operator defining the operation to take on the observable
     * @returns {Observable} a new observable with the Operator applied
     * @description creates a new Observable, with this Observable as the source, and the passed
     * operator defined as the new observable's operator.
     */
    lift<T, R>(operator: Operator<T, R>): Observable<T>;
    /**
     * @method subscribe
     * @param {Observer|Function} observerOrNext (optional) either an observer defining all functions to be called,
     *  or the first of three possible handlers, which is the handler for each value emitted from the observable.
     * @param {Function} error (optional) a handler for a terminal event resulting from an error. If no error handler is provided,
     *  the error will be thrown as unhandled
     * @param {Function} complete (optional) a handler for a terminal event resulting from successful completion.
     * @returns {Subscription} a subscription reference to the registered handlers
     * @description registers handlers for handling emitted values, error and completions from the observable, and
     *  executes the observable's subscriber function, which will take action to set up the underlying data stream
     */
    subscribe(observerOrNext?: Observer<T> | ((value: T) => void), error?: (error: T) => void, complete?: () => void): Subscription<T>;
    /**
     * @method forEach
     * @param {Function} next a handler for each value emitted by the observable
     * @param {any} [thisArg] a `this` context for the `next` handler function
     * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise
     * @returns {Promise} a promise that either resolves on observable completion or
     *  rejects with the handled error
     */
    forEach(next: (value: T) => void, thisArg: any, PromiseCtor?: PromiseConstructor): Promise<void>;
    _subscribe(subscriber: Subscriber<any>): Subscription<T> | Function | void;
    static bindCallback: <T>(callbackFunc: Function, selector?: Function, scheduler?: Scheduler) => Function;
    static combineLatest: <T>(...observables: Array<Observable<any> | Array<Observable<any>> | ((...values: Array<any>) => T) | Scheduler>) => Observable<T>;
    static concat: <T>(...observables: Array<Observable<any> | Scheduler>) => Observable<T>;
    static defer: <T>(observableFactory: () => Observable<T>) => Observable<T>;
    static empty: <T>(scheduler?: Scheduler) => Observable<T>;
    static forkJoin: (...sources: Array<Observable<any> | Array<Observable<any>> | Promise<any> | ((...values: Array<any>) => any)>) => Observable<any>;
    static from: <T>(iterable: any, scheduler?: Scheduler) => Observable<T>;
    static fromArray: <T>(array: T[], scheduler?: Scheduler) => Observable<T>;
    static fromEvent: <T>(element: any, eventName: string, selector?: (...args: Array<any>) => T) => Observable<T>;
    static fromEventPattern: <T>(addHandler: (handler: Function) => void, removeHandler: (handler: Function) => void, selector?: (...args: Array<any>) => T) => Observable<T>;
    static fromPromise: <T>(promise: Promise<T>, scheduler?: Scheduler) => Observable<T>;
    static interval: (interval: number, scheduler?: Scheduler) => Observable<number>;
    static merge: <T>(...observables: Array<Observable<any> | Scheduler | number>) => Observable<T>;
    static never: <T>() => Observable<T>;
    static of: <T>(...values: Array<T | Scheduler>) => Observable<T>;
    static range: (start: number, end: number, scheduler?: Scheduler) => Observable<number>;
    static throw: <T>(error: T) => Observable<T>;
    static timer: (dueTime?: number | Date, period?: number | Scheduler, scheduler?: Scheduler) => Observable<number>;
    static zip: <T>(...observables: Array<Observable<any> | ((...values: Array<any>) => T)>) => Observable<T>;
    buffer: (closingNotifier: Observable<any>) => Observable<T[]>;
    bufferCount: (bufferSize: number, startBufferEvery: number) => Observable<T[]>;
    bufferTime: (bufferTimeSpan: number, bufferCreationInterval?: number, scheduler?: Scheduler) => Observable<T[]>;
    bufferToggle: <O>(openings: Observable<O>, closingSelector?: (openValue: O) => Observable<any>) => Observable<T[]>;
    bufferWhen: (closingSelector: () => Observable<any>) => Observable<T[]>;
    catch: (selector: (err: any, source: Observable<T>, caught: Observable<any>) => Observable<any>) => Observable<T>;
    combineAll: <R>(project?: (...values: Array<any>) => R) => Observable<R>;
    combineLatest: <R>(...observables: Array<Observable<any> | Array<Observable<any>> | ((...values: Array<any>) => R)>) => Observable<R>;
    concat: <R>(...observables: (Observable<any> | Scheduler)[]) => Observable<R>;
    concatAll: () => Observable<any>;
    concatMap: <R>(project: ((x: T, ix: number) => Observable<any>), projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
    concatMapTo: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
    count: (predicate?: (value: T, index: number, source: Observable<T>) => boolean) => Observable<number>;
    dematerialize: () => Observable<any>;
    debounce: (durationSelector: (value: T) => Observable<any> | Promise<any>) => Observable<T>;
    debounceTime: <R>(dueTime: number, scheduler?: Scheduler) => Observable<R>;
    defaultIfEmpty: <R>(defaultValue?: T | R) => Observable<T> | Observable<R>;
    delay: (delay: number, scheduler?: Scheduler) => Observable<T>;
    distinctUntilChanged: (compare?: (x: T, y: T) => boolean) => Observable<T>;
    do: (next?: (x: T) => void, error?: (e: any) => void, complete?: () => void) => Observable<T>;
    expand: <R>(project: (x: T, ix: number) => Observable<R>, concurrent: number, scheduler: Scheduler) => Observable<R>;
    filter: (predicate: (x: T) => boolean, ix?: number, thisArg?: any) => Observable<T>;
    finally: (finallySelector: () => void) => Observable<T>;
    first: <R>(predicate?: (value: T, index: number, source: Observable<T>) => boolean, resultSelector?: (value: T, index: number) => R, thisArg?: any, defaultValue?: any) => Observable<T> | Observable<R>;
    flatMap: <R>(project: ((x: T, ix: number) => Observable<any>), projectResult?: (x: T, y: any, ix: number, iy: number) => R, concurrent?: number) => Observable<R>;
    flatMapTo: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R, concurrent?: number) => Observable<R>;
    groupBy: <R>(keySelector: (value: T) => string, elementSelector?: (value: T) => R, durationSelector?: (group: GroupedObservable<R>) => Observable<any>) => Observable<GroupedObservable<R>>;
    ignoreElements: () => Observable<T>;
    last: <R>(predicate?: (value: T, index: number) => boolean, resultSelector?: (value: T, index: number) => R, thisArg?: any, defaultValue?: any) => Observable<T> | Observable<R>;
    every: (predicate: (value: T, index: number) => boolean, thisArg?: any) => Observable<T>;
    map: <R>(project: (x: T, ix?: number) => R, thisArg?: any) => Observable<R>;
    mapTo: <R>(value: R) => Observable<R>;
    materialize: () => Observable<Notification<T>>;
    merge: (...observables: any[]) => Observable<any>;
    mergeAll: (concurrent?: any) => Observable<any>;
    mergeMap: <R>(project: ((x: T, ix: number) => Observable<any>), projectResult?: (x: T, y: any, ix: number, iy: number) => R, concurrent?: number) => Observable<R>;
    mergeMapTo: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R, concurrent?: number) => Observable<R>;
    multicast: (subjectOrSubjectFactory: Subject<T> | (() => Subject<T>)) => ConnectableObservable<T>;
    observeOn: (scheduler: Scheduler, delay?: number) => Observable<T>;
    partition: (predicate: (x: T) => boolean) => Observable<T>[];
    publish: () => ConnectableObservable<T>;
    publishBehavior: (value: any) => ConnectableObservable<T>;
    publishReplay: (bufferSize?: number, windowTime?: number, scheduler?: Scheduler) => ConnectableObservable<T>;
    publishLast: () => ConnectableObservable<T>;
    reduce: <R>(project: (acc: R, x: T) => R, seed?: R) => Observable<R>;
    repeat: (count?: number) => Observable<T>;
    retry: (count?: number) => Observable<T>;
    retryWhen: (notifier: (errors: Observable<any>) => Observable<any>) => Observable<T>;
    sample: (notifier: Observable<any>) => Observable<T>;
    sampleTime: (delay: number, scheduler?: Scheduler) => Observable<T>;
    scan: <R>(accumulator: (acc: R, x: T) => R, seed?: T | R) => Observable<R>;
    share: () => Observable<T>;
    single: (predicate?: (value: T, index: number) => boolean) => Observable<T>;
    skip: (count: number) => Observable<T>;
    skipUntil: (notifier: Observable<any>) => Observable<T>;
    skipWhile: (predicate: (x: T, index: number) => boolean, thisArg?: any) => Observable<T>;
    startWith: (x: T) => Observable<T>;
    subscribeOn: (scheduler: Scheduler, delay?: number) => Observable<T>;
    switch: <R>() => Observable<R>;
    switchFirst: <T>() => Observable<T>;
    switchMap: <R>(project: ((x: T, ix: number) => Observable<any>), projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
    switchFirstMap: <T, R, R2>(project: (x: T, ix: number) => Observable<R>, rSelector?: (x: T, y: R, ix: number, iy: number) => R2) => Observable<R>;
    switchMapTo: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
    take: (count: number) => Observable<T>;
    takeUntil: (notifier: Observable<any>) => Observable<T>;
    takeWhile: (predicate: (value: T, index: number) => boolean) => Observable<T>;
    throttle: (durationSelector: (value: T) => Observable<any> | Promise<any>) => Observable<T>;
    throttleTime: (delay: number, scheduler?: Scheduler) => Observable<T>;
    timeout: (due: number | Date, errorToSend?: any, scheduler?: Scheduler) => Observable<T>;
    timeoutWith: <R>(due: number | Date, withObservable: Observable<R>, scheduler?: Scheduler) => Observable<T> | Observable<R>;
    toArray: () => Observable<T[]>;
    toPromise: (PromiseCtor?: PromiseConstructor) => Promise<T>;
    window: (closingNotifier: Observable<any>) => Observable<Observable<T>>;
    windowCount: (windowSize: number, startWindowEvery: number) => Observable<Observable<T>>;
    windowTime: (windowTimeSpan: number, windowCreationInterval?: number, scheduler?: Scheduler) => Observable<Observable<T>>;
    windowToggle: <O>(openings: Observable<O>, closingSelector?: (openValue: O) => Observable<any>) => Observable<Observable<T>>;
    windowWhen: (closingSelector: () => Observable<any>) => Observable<Observable<T>>;
    withLatestFrom: <R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>) => Observable<R>;
    zip: <R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>) => Observable<R>;
    zipAll: <R>(project?: (...values: Array<any>) => R) => Observable<R>;
}
