/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
      while (_uncaughtPromiseErrors.length) {
        const uncaughtPromiseError: UncaughtPromiseError = _uncaughtPromiseErrors.shift()!;
        try {
          uncaughtPromiseError.zone.runGuarded(() => {
            throw uncaughtPromiseError;
          });
        } catch (error) {
          handleUnhandledRejection(error);
        }
      }
    }
  };

  const UNHANDLED_PROMISE_REJECTION_HANDLER_SYMBOL = __symbol__('unhandledPromiseRejectionHandler');

  function handleUnhandledRejection(e: any) {
    api.onUnhandledError(e);
    try {
      const handler = (Zone as any)[UNHANDLED_PROMISE_REJECTION_HANDLER_SYMBOL];
      if (handler && typeof handler === 'function') {
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
    return (v) => {
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
        clearRejectedNoCatch(<Promise<any>>value as any);
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
          try {
            // try to print more readable error log
            throw new Error(
                'Uncaught (in promise): ' + readableObjectToString(value) +
                (value && value.stack ? '\n' + value.stack : ''));
          } catch (err) {
            const error: UncaughtPromiseError = err;
            error.rejection = value;
            error.promise = promise;
            error.zone = Zone.current;
            error.task = Zone.currentTask!;
            _uncaughtPromiseErrors.push(error);
            api.scheduleMicroTask();  // to make sure that it is running
          }
        }
      }
    }
    // Resolving an already resolved promise is a noop.
    return promise;
  }

  const REJECTION_HANDLED_HANDLER = __symbol__('rejectionHandledHandler');
  function clearRejectedNoCatch(promise: ZoneAwarePromise<any>): void {
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
      promise: ZoneAwarePromise<any>, zone: AmbientZone, chainPromise: ZoneAwarePromise<any>,
      onFulfilled?: ((value: R) => U1)|null|undefined,
      onRejected?: ((error: any) => U2)|null|undefined): void {
    clearRejectedNoCatch(promise);
    const promiseState = (promise as any)[symbolState];
    const delegate = promiseState ?
        (typeof onFulfilled === 'function') ? onFulfilled : forwardResolution :
        (typeof onRejected === 'function') ? onRejected : forwardRejection;
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
        value.then((value: any) => {
          resolvedValues[curValueIndex] = value;
          unresolvedCount--;
          if (unresolvedCount === 0) {
            resolve!(resolvedValues);
          }
        }, reject!);

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
        executor && executor(makeResolver(promise, RESOLVED), makeResolver(promise, REJECTED));
      } catch (error) {
        resolvePromise(promise, false, error);
      }
    }

    get[Symbol.toStringTag]() {
      return 'Promise' as any;
    }

    then<TResult1 = R, TResult2 = never>(
        onFulfilled?: ((value: R) => TResult1 | PromiseLike<TResult1>)|undefined|null,
        onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)|undefined|
        null): Promise<TResult1|TResult2> {
      const chainPromise: Promise<TResult1|TResult2> =
          new (this.constructor as typeof ZoneAwarePromise)(null as any);
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
      const chainPromise: Promise<R|never> =
          new (this.constructor as typeof ZoneAwarePromise)(null as any);
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
  const ZONE_AWARE_PROMISE = Zone.__symbol__('ZoneAwarePromise');

  let desc = ObjectGetOwnPropertyDescriptor(global, 'Promise');
  if (!desc || desc.configurable) {
    desc && delete desc.writable;
    desc && delete desc.value;
    if (!desc) {
      desc = {configurable: true, enumerable: true};
    }
    desc.get = function() {
      // if we already set ZoneAwarePromise, use patched one
      // otherwise return native one.
      return global[ZONE_AWARE_PROMISE] ? global[ZONE_AWARE_PROMISE] : global[symbolPromise];
    };
    desc.set = function(NewNativePromise) {
      if (NewNativePromise === ZoneAwarePromise) {
        // if the NewNativePromise is ZoneAwarePromise
        // save to global
        global[ZONE_AWARE_PROMISE] = NewNativePromise;
      } else {
        // if the NewNativePromise is not ZoneAwarePromise
        // for example: after load zone.js, some library just
        // set es6-promise to global, if we set it to global
        // directly, assertZonePatched will fail and angular
        // will not loaded, so we just set the NewNativePromise
        // to global[symbolPromise], so the result is just like
        // we load ES6 Promise before zone.js
        global[symbolPromise] = NewNativePromise;
        if (!NewNativePromise.prototype[symbolThen]) {
          patchThen(NewNativePromise);
        }
        api.setNativePromise(NewNativePromise);
      }
    };

    ObjectDefineProperty(global, 'Promise', desc);
  }

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
    return function() {
      let resultPromise = fn.apply(this, arguments);
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
    const fetch = global['fetch'];
    if (typeof fetch == 'function') {
      global[api.symbol('fetch')] = fetch;
      global['fetch'] = zoneify(fetch);
    }
  }

  // This is not part of public API, but it is useful for tests, so we expose it.
  (Promise as any)[Zone.__symbol__('uncaughtPromiseErrors')] = _uncaughtPromiseErrors;
  return ZoneAwarePromise;
});
