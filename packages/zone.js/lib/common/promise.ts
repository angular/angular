/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {patchMethod} from './utils';

Zone.__load_patch('ZoneAwarePromise', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  const ObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  const ObjectDefineProperty = Object.defineProperty;

  function readableObjectToString(obj: any) {
    if (obj && obj.toString === Object.prototype.toString) {
      const className = obj.constructor && obj.constructor.name;
      return (className ? className : '') + ': ' + JSON.stringify(obj);
    }

    return obj ? obj.toString() : Object.prototype.toString.call(obj);
  }

  const __symbol__ = api.symbol;
  const _uncaughtPromiseErrors: UncaughtPromiseError[] = [];
  const isDisableWrappingUncaughtPromiseRejection =
      global[__symbol__('DISABLE_WRAPPING_UNCAUGHT_PROMISE_REJECTION')] === true;
  const symbolPromise = __symbol__('Promise');
  const symbolThen = __symbol__('then');
  const creationTrace = '__creationTrace__';

  api.onUnhandledError = (e: any) => {
    if (api.showUncaughtError()) {
      const rejection = e && e.rejection;
      if (rejection) {
        console.error(
            'Unhandled Promise rejection:',
            rejection instanceof Error ? rejection.message : rejection,
            '; Zone:', (<Zone>e.zone).name, '; Task:', e.task && (<Task>e.task).source,
            '; Value:', rejection, rejection instanceof Error ? rejection.stack : undefined);
      } else {
        console.error(e);
      }
    }
  };

  api.microtaskDrainDone = () => {
    while (_uncaughtPromiseErrors.length) {
      const uncaughtPromiseError: UncaughtPromiseError = _uncaughtPromiseErrors.shift()!;
      try {
        uncaughtPromiseError.zone.runGuarded(() => {
          if (uncaughtPromiseError.throwOriginal) {
            throw uncaughtPromiseError.rejection;
          }
          throw uncaughtPromiseError;
        });
      } catch (error) {
        handleUnhandledRejection(error);
      }
    }
  };

  const UNHANDLED_PROMISE_REJECTION_HANDLER_SYMBOL = __symbol__('unhandledPromiseRejectionHandler');

  function handleUnhandledRejection(this: unknown, e: any) {
    api.onUnhandledError(e);
    try {
      const handler = (Zone as any)[UNHANDLED_PROMISE_REJECTION_HANDLER_SYMBOL];
      if (typeof handler === 'function') {
        handler.call(this, e);
      }
    } catch (err) {
    }
  }

  function isThenable(value: any): boolean {
    return value && value.then;
  }

  function forwardResolution(value: any): any {
    return value;
  }

  function forwardRejection(rejection: any): any {
    return ZoneAwarePromise.reject(rejection);
  }

  const symbolState: string = __symbol__('state');
  const symbolValue: string = __symbol__('value');
  const symbolFinally: string = __symbol__('finally');
  const symbolParentPromiseValue: string = __symbol__('parentPromiseValue');
  const symbolParentPromiseState: string = __symbol__('parentPromiseState');
  const source: string = 'Promise.then';
  const UNRESOLVED: null = null;
  const RESOLVED = true;
  const REJECTED = false;
  const REJECTED_NO_CATCH = 0;

  function makeResolver(promise: ZoneAwarePromise<any>, state: boolean): (value: any) => void {
    return (v: any) => {
      try {
        resolvePromise(promise, state, v);
      } catch (err) {
        resolvePromise(promise, false, err);
      }
      // Do not return value or you will break the Promise spec.
    };
  }

  const once = function() {
    let wasCalled = false;

    return function wrapper(wrappedFunction: Function) {
      return function() {
        if (wasCalled) {
          return;
        }
        wasCalled = true;
        wrappedFunction.apply(null, arguments);
      };
    };
  };

  const TYPE_ERROR = 'Promise resolved with itself';
  const CURRENT_TASK_TRACE_SYMBOL = __symbol__('currentTaskTrace');

  // Promise Resolution
  function resolvePromise(
      promise: ZoneAwarePromise<any>, state: boolean, value: any): ZoneAwarePromise<any> {
    const onceWrapper = once();
    if (promise === value) {
      throw new TypeError(TYPE_ERROR);
    }
    if ((promise as any)[symbolState] === UNRESOLVED) {
      // should only get value.then once based on promise spec.
      let then: any = null;
      try {
        if (typeof value === 'object' || typeof value === 'function') {
          then = value && value.then;
        }
      } catch (err) {
        onceWrapper(() => {
          resolvePromise(promise, false, err);
        })();
        return promise;
      }
      // if (value instanceof ZoneAwarePromise) {
      if (state !== REJECTED && value instanceof ZoneAwarePromise &&
          value.hasOwnProperty(symbolState) && value.hasOwnProperty(symbolValue) &&
          (value as any)[symbolState] !== UNRESOLVED) {
        clearRejectedNoCatch(value);
        resolvePromise(promise, (value as any)[symbolState], (value as any)[symbolValue]);
      } else if (state !== REJECTED && typeof then === 'function') {
        try {
          then.call(
              value, onceWrapper(makeResolver(promise, state)),
              onceWrapper(makeResolver(promise, false)));
        } catch (err) {
          onceWrapper(() => {
            resolvePromise(promise, false, err);
          })();
        }
      } else {
        (promise as any)[symbolState] = state;
        const queue = (promise as any)[symbolValue];
        (promise as any)[symbolValue] = value;

        if ((promise as any)[symbolFinally] === symbolFinally) {
          // the promise is generated by Promise.prototype.finally
          if (state === RESOLVED) {
            // the state is resolved, should ignore the value
            // and use parent promise value
            (promise as any)[symbolState] = (promise as any)[symbolParentPromiseState];
            (promise as any)[symbolValue] = (promise as any)[symbolParentPromiseValue];
          }
        }

        // record task information in value when error occurs, so we can
        // do some additional work such as render longStackTrace
        if (state === REJECTED && value instanceof Error) {
          // check if longStackTraceZone is here
          const trace = Zone.currentTask && Zone.currentTask.data &&
              (Zone.currentTask.data as any)[creationTrace];
          if (trace) {
            // only keep the long stack trace into error when in longStackTraceZone
            ObjectDefineProperty(
                value, CURRENT_TASK_TRACE_SYMBOL,
                {configurable: true, enumerable: false, writable: true, value: trace});
          }
        }

        for (let i = 0; i < queue.length;) {
          scheduleResolveOrReject(promise, queue[i++], queue[i++], queue[i++], queue[i++]);
        }
        if (queue.length == 0 && state == REJECTED) {
          (promise as any)[symbolState] = REJECTED_NO_CATCH;
          let uncaughtPromiseError = value;
          try {
            // Here we throws a new Error to print more readable error log
            // and if the value is not an error, zone.js builds an `Error`
            // Object here to attach the stack information.
            throw new Error(
                'Uncaught (in promise): ' + readableObjectToString(value) +
                (value && value.stack ? '\n' + value.stack : ''));
          } catch (err) {
            uncaughtPromiseError = err;
          }
          if (isDisableWrappingUncaughtPromiseRejection) {
            // If disable wrapping uncaught promise reject
            // use the value instead of wrapping it.
            uncaughtPromiseError.throwOriginal = true;
          }
          uncaughtPromiseError.rejection = value;
          uncaughtPromiseError.promise = promise;
          uncaughtPromiseError.zone = Zone.current;
          uncaughtPromiseError.task = Zone.currentTask!;
          _uncaughtPromiseErrors.push(uncaughtPromiseError);
          api.scheduleMicroTask();  // to make sure that it is running
        }
      }
    }
    // Resolving an already resolved promise is a noop.
    return promise;
  }

  const REJECTION_HANDLED_HANDLER = __symbol__('rejectionHandledHandler');
  function clearRejectedNoCatch(this: unknown, promise: ZoneAwarePromise<any>): void {
    if ((promise as any)[symbolState] === REJECTED_NO_CATCH) {
      // if the promise is rejected no catch status
      // and queue.length > 0, means there is a error handler
      // here to handle the rejected promise, we should trigger
      // windows.rejectionhandled eventHandler or nodejs rejectionHandled
      // eventHandler
      try {
        const handler = (Zone as any)[REJECTION_HANDLED_HANDLER];
        if (handler && typeof handler === 'function') {
          handler.call(this, {rejection: (promise as any)[symbolValue], promise: promise});
        }
      } catch (err) {
      }
      (promise as any)[symbolState] = REJECTED;
      for (let i = 0; i < _uncaughtPromiseErrors.length; i++) {
        if (promise === _uncaughtPromiseErrors[i].promise) {
          _uncaughtPromiseErrors.splice(i, 1);
        }
      }
    }
  }

  function scheduleResolveOrReject<R, U1, U2>(
      promise: ZoneAwarePromise<any>, zone: Zone, chainPromise: ZoneAwarePromise<any>,
      onFulfilled?: ((value: R) => U1)|null|undefined,
      onRejected?: ((error: any) => U2)|null|undefined): void {
    clearRejectedNoCatch(promise);
    const promiseState = (promise as any)[symbolState];
    const delegate = promiseState ?
        (typeof onFulfilled === 'function') ? onFulfilled : forwardResolution :
        (typeof onRejected === 'function') ? onRejected :
                                             forwardRejection;
    zone.scheduleMicroTask(source, () => {
      try {
        const parentPromiseValue = (promise as any)[symbolValue];
        const isFinallyPromise =
            !!chainPromise && symbolFinally === (chainPromise as any)[symbolFinally];
        if (isFinallyPromise) {
          // if the promise is generated from finally call, keep parent promise's state and value
          (chainPromise as any)[symbolParentPromiseValue] = parentPromiseValue;
          (chainPromise as any)[symbolParentPromiseState] = promiseState;
        }
        // should not pass value to finally callback
        const value = zone.run(
            delegate, undefined,
            isFinallyPromise && delegate !== forwardRejection && delegate !== forwardResolution ?
                [] :
                [parentPromiseValue]);
        resolvePromise(chainPromise, true, value);
      } catch (error) {
        // if error occurs, should always return this error
        resolvePromise(chainPromise, false, error);
      }
    }, chainPromise as TaskData);
  }

  const ZONE_AWARE_PROMISE_TO_STRING = 'function ZoneAwarePromise() { [native code] }';

  const noop = function() {};

  const AggregateError = global.AggregateError;

  class ZoneAwarePromise<R> implements Promise<R> {
    static toString() {
      return ZONE_AWARE_PROMISE_TO_STRING;
    }

    static resolve<R>(value: R): Promise<R> {
      return resolvePromise(<ZoneAwarePromise<R>>new this(null as any), RESOLVED, value);
    }

    static reject<U>(error: U): Promise<U> {
      return resolvePromise(<ZoneAwarePromise<U>>new this(null as any), REJECTED, error);
    }

    static any<T>(values: Iterable<PromiseLike<T>>): Promise<T> {
      if (!values || typeof values[Symbol.iterator] !== 'function') {
        return Promise.reject(new AggregateError([], 'All promises were rejected'));
      }
      const promises: Promise<PromiseLike<T>>[] = [];
      let count = 0;
      try {
        for (let v of values) {
          count++;
          promises.push(ZoneAwarePromise.resolve(v));
        }
      } catch (err) {
        return Promise.reject(new AggregateError([], 'All promises were rejected'));
      }
      if (count === 0) {
        return Promise.reject(new AggregateError([], 'All promises were rejected'));
      }
      let finished = false;
      const errors: any[] = [];
      return new ZoneAwarePromise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
          promises[i].then(
              v => {
                if (finished) {
                  return;
                }
                finished = true;
                resolve(v);
              },
              err => {
                errors.push(err);
                count--;
                if (count === 0) {
                  finished = true;
                  reject(new AggregateError(errors, 'All promises were rejected'));
                }
              });
        }
      });
    };

    static race<R>(values: PromiseLike<any>[]): Promise<R> {
      let resolve: (v: any) => void;
      let reject: (v: any) => void;
      let promise: any = new this((res, rej) => {
        resolve = res;
        reject = rej;
      });
      function onResolve(value: any) {
        resolve(value);
      }
      function onReject(error: any) {
        reject(error);
      }

      for (let value of values) {
        if (!isThenable(value)) {
          value = this.resolve(value);
        }
        value.then(onResolve, onReject);
      }
      return promise;
    }

    static all<R>(values: any): Promise<R> {
      return ZoneAwarePromise.allWithCallback(values);
    }

    static allSettled<R>(values: any): Promise<R> {
      const P = this && this.prototype instanceof ZoneAwarePromise ? this : ZoneAwarePromise;
      return P.allWithCallback(values, {
        thenCallback: (value: any) => ({status: 'fulfilled', value}),
        errorCallback: (err: any) => ({status: 'rejected', reason: err})
      });
    }

    static allWithCallback<R>(values: any, callback?: {
      thenCallback: (value: any) => any,
      errorCallback: (err: any) => any
    }): Promise<R> {
      let resolve: (v: any) => void;
      let reject: (v: any) => void;
      let promise = new this<R>((res, rej) => {
        resolve = res;
        reject = rej;
      });

      // Start at 2 to prevent prematurely resolving if .then is called immediately.
      let unresolvedCount = 2;
      let valueIndex = 0;

      const resolvedValues: any[] = [];
      for (let value of values) {
        if (!isThenable(value)) {
          value = this.resolve(value);
        }

        const curValueIndex = valueIndex;
        try {
          value.then(
              (value: any) => {
                resolvedValues[curValueIndex] = callback ? callback.thenCallback(value) : value;
                unresolvedCount--;
                if (unresolvedCount === 0) {
                  resolve!(resolvedValues);
                }
              },
              (err: any) => {
                if (!callback) {
                  reject!(err);
                } else {
                  resolvedValues[curValueIndex] = callback.errorCallback(err);
                  unresolvedCount--;
                  if (unresolvedCount === 0) {
                    resolve!(resolvedValues);
                  }
                }
              });
        } catch (thenErr) {
          reject!(thenErr);
        }

        unresolvedCount++;
        valueIndex++;
      }

      // Make the unresolvedCount zero-based again.
      unresolvedCount -= 2;

      if (unresolvedCount === 0) {
        resolve!(resolvedValues);
      }

      return promise;
    }

    constructor(
        executor:
            (resolve: (value?: R|PromiseLike<R>) => void, reject: (error?: any) => void) => void) {
      const promise: ZoneAwarePromise<R> = this;
      if (!(promise instanceof ZoneAwarePromise)) {
        throw new Error('Must be an instanceof Promise.');
      }
      (promise as any)[symbolState] = UNRESOLVED;
      (promise as any)[symbolValue] = [];  // queue;
      try {
        const onceWrapper = once();
        executor &&
            executor(
                onceWrapper(makeResolver(promise, RESOLVED)),
                onceWrapper(makeResolver(promise, REJECTED)));
      } catch (error) {
        resolvePromise(promise, false, error);
      }
    }

    get[Symbol.toStringTag]() {
      return 'Promise' as any;
    }

    get[Symbol.species]() {
      return ZoneAwarePromise;
    }

    then<TResult1 = R, TResult2 = never>(
        onFulfilled?: ((value: R) => TResult1 | PromiseLike<TResult1>)|undefined|null,
        onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)|undefined|
        null): Promise<TResult1|TResult2> {
      // We must read `Symbol.species` safely because `this` may be anything. For instance, `this`
      // may be an object without a prototype (created through `Object.create(null)`); thus
      // `this.constructor` will be undefined. One of the use cases is SystemJS creating
      // prototype-less objects (modules) via `Object.create(null)`. The SystemJS creates an empty
      // object and copies promise properties into that object (within the `getOrCreateLoad`
      // function). The zone.js then checks if the resolved value has the `then` method and invokes
      // it with the `value` context. Otherwise, this will throw an error: `TypeError: Cannot read
      // properties of undefined (reading 'Symbol(Symbol.species)')`.
      let C = (this.constructor as any)?.[Symbol.species];
      if (!C || typeof C !== 'function') {
        C = this.constructor || ZoneAwarePromise;
      }
      const chainPromise: Promise<TResult1|TResult2> = new (C as typeof ZoneAwarePromise)(noop);
      const zone = Zone.current;
      if ((this as any)[symbolState] == UNRESOLVED) {
        (<any[]>(this as any)[symbolValue]).push(zone, chainPromise, onFulfilled, onRejected);
      } else {
        scheduleResolveOrReject(this, zone, chainPromise as any, onFulfilled, onRejected);
      }
      return chainPromise;
    }

    catch<TResult = never>(onRejected?: ((reason: any) => TResult | PromiseLike<TResult>)|undefined|
                           null): Promise<R|TResult> {
      return this.then(null, onRejected);
    }

    finally<U>(onFinally?: () => U | PromiseLike<U>): Promise<R> {
      // See comment on the call to `then` about why thee `Symbol.species` is safely accessed.
      let C = (this.constructor as any)?.[Symbol.species];
      if (!C || typeof C !== 'function') {
        C = ZoneAwarePromise;
      }
      const chainPromise: Promise<R|never> = new (C as typeof ZoneAwarePromise)(noop);
      (chainPromise as any)[symbolFinally] = symbolFinally;
      const zone = Zone.current;
      if ((this as any)[symbolState] == UNRESOLVED) {
        (<any[]>(this as any)[symbolValue]).push(zone, chainPromise, onFinally, onFinally);
      } else {
        scheduleResolveOrReject(this, zone, chainPromise as any, onFinally, onFinally);
      }
      return chainPromise;
    }
  }
  // Protect against aggressive optimizers dropping seemingly unused properties.
  // E.g. Closure Compiler in advanced mode.
  ZoneAwarePromise['resolve'] = ZoneAwarePromise.resolve;
  ZoneAwarePromise['reject'] = ZoneAwarePromise.reject;
  ZoneAwarePromise['race'] = ZoneAwarePromise.race;
  ZoneAwarePromise['all'] = ZoneAwarePromise.all;

  const NativePromise = global[symbolPromise] = global['Promise'];
  global['Promise'] = ZoneAwarePromise;

  const symbolThenPatched = __symbol__('thenPatched');

  function patchThen(Ctor: Function) {
    const proto = Ctor.prototype;

    const prop = ObjectGetOwnPropertyDescriptor(proto, 'then');
    if (prop && (prop.writable === false || !prop.configurable)) {
      // check Ctor.prototype.then propertyDescriptor is writable or not
      // in meteor env, writable is false, we should ignore such case
      return;
    }

    const originalThen = proto.then;
    // Keep a reference to the original method.
    proto[symbolThen] = originalThen;

    Ctor.prototype.then = function(onResolve: any, onReject: any) {
      const wrapped = new ZoneAwarePromise((resolve, reject) => {
        originalThen.call(this, resolve, reject);
      });
      return wrapped.then(onResolve, onReject);
    };
    (Ctor as any)[symbolThenPatched] = true;
  }

  api.patchThen = patchThen;

  function zoneify(fn: Function) {
    return function(self: any, args: any[]) {
      let resultPromise = fn.apply(self, args);
      if (resultPromise instanceof ZoneAwarePromise) {
        return resultPromise;
      }
      let ctor = resultPromise.constructor;
      if (!ctor[symbolThenPatched]) {
        patchThen(ctor);
      }
      return resultPromise;
    };
  }

  if (NativePromise) {
    patchThen(NativePromise);
    patchMethod(global, 'fetch', delegate => zoneify(delegate));
  }

  // This is not part of public API, but it is useful for tests, so we expose it.
  (Promise as any)[Zone.__symbol__('uncaughtPromiseErrors')] = _uncaughtPromiseErrors;
  return ZoneAwarePromise;
});
