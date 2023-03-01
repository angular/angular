/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function(_global: any) {
class AsyncTestZoneSpec implements ZoneSpec {
  static symbolParentUnresolved = Zone.__symbol__('parentUnresolved');

  _pendingMicroTasks: boolean = false;
  _pendingMacroTasks: boolean = false;
  _alreadyErrored: boolean = false;
  _isSync: boolean = false;
  _existingFinishTimer: ReturnType<typeof setTimeout>|null = null;

  entryFunction: Function|null = null;
  runZone = Zone.current;
  unresolvedChainedPromiseCount = 0;

  supportWaitUnresolvedChainedPromise = false;

  constructor(
      private finishCallback: Function, private failCallback: Function, namePrefix: string) {
    this.name = 'asyncTestZone for ' + namePrefix;
    this.properties = {'AsyncTestZoneSpec': this};
    this.supportWaitUnresolvedChainedPromise =
        _global[Zone.__symbol__('supportWaitUnResolvedChainedPromise')] === true;
  }

  isUnresolvedChainedPromisePending() {
    return this.unresolvedChainedPromiseCount > 0;
  }

  _finishCallbackIfDone() {
    // NOTE: Technically the `onHasTask` could fire together with the initial synchronous
    // completion in `onInvoke`. `onHasTask` might call this method when it captured e.g.
    // microtasks in the proxy zone that now complete as part of this async zone run.
    // Consider the following scenario:
    //    1. A test `beforeEach` schedules a microtask in the ProxyZone.
    //    2. An actual empty `it` spec executes in the AsyncTestZone` (using e.g. `waitForAsync`).
    //    3. The `onInvoke` invokes `_finishCallbackIfDone` because the spec runs synchronously.
    //    4. We wait the scheduled timeout (see below) to account for unhandled promises.
    //    5. The microtask from (1) finishes and `onHasTask` is invoked.
    //    --> We register a second `_finishCallbackIfDone` even though we have scheduled a timeout.

    // If the finish timeout from below is already scheduled, terminate the existing scheduled
    // finish invocation, avoiding calling `jasmine` `done` multiple times. *Note* that we would
    // want to schedule a new finish callback in case the task state changes again.
    if (this._existingFinishTimer !== null) {
      clearTimeout(this._existingFinishTimer);
      this._existingFinishTimer = null;
    }

    if (!(this._pendingMicroTasks || this._pendingMacroTasks ||
          (this.supportWaitUnresolvedChainedPromise && this.isUnresolvedChainedPromisePending()))) {
      // We wait until the next tick because we would like to catch unhandled promises which could
      // cause test logic to be executed. In such cases we cannot finish with tasks pending then.
      this.runZone.run(() => {
        this._existingFinishTimer = setTimeout(() => {
          if (!this._alreadyErrored && !(this._pendingMicroTasks || this._pendingMacroTasks)) {
            this.finishCallback();
          }
        }, 0);
      });
    }
  }

  patchPromiseForTest() {
    if (!this.supportWaitUnresolvedChainedPromise) {
      return;
    }
    const patchPromiseForTest = (Promise as any)[Zone.__symbol__('patchPromiseForTest')];
    if (patchPromiseForTest) {
      patchPromiseForTest();
    }
  }

  unPatchPromiseForTest() {
    if (!this.supportWaitUnresolvedChainedPromise) {
      return;
    }
    const unPatchPromiseForTest = (Promise as any)[Zone.__symbol__('unPatchPromiseForTest')];
    if (unPatchPromiseForTest) {
      unPatchPromiseForTest();
    }
  }

  // ZoneSpec implementation below.

  name: string;

  properties: {[key: string]: any};

  onScheduleTask(delegate: ZoneDelegate, current: Zone, target: Zone, task: Task): Task {
    if (task.type !== 'eventTask') {
      this._isSync = false;
    }
    if (task.type === 'microTask' && task.data && task.data instanceof Promise) {
      // check whether the promise is a chained promise
      if ((task.data as any)[AsyncTestZoneSpec.symbolParentUnresolved] === true) {
        // chained promise is being scheduled
        this.unresolvedChainedPromiseCount--;
      }
    }
    return delegate.scheduleTask(target, task);
  }

  onInvokeTask(
      delegate: ZoneDelegate, current: Zone, target: Zone, task: Task, applyThis: any,
      applyArgs: any) {
    if (task.type !== 'eventTask') {
      this._isSync = false;
    }
    return delegate.invokeTask(target, task, applyThis, applyArgs);
  }

  onCancelTask(delegate: ZoneDelegate, current: Zone, target: Zone, task: Task) {
    if (task.type !== 'eventTask') {
      this._isSync = false;
    }
    return delegate.cancelTask(target, task);
  }

  // Note - we need to use onInvoke at the moment to call finish when a test is
  // fully synchronous. TODO(juliemr): remove this when the logic for
  // onHasTask changes and it calls whenever the task queues are dirty.
  // updated by(JiaLiPassion), only call finish callback when no task
  // was scheduled/invoked/canceled.
  onInvoke(
      parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, delegate: Function,
      applyThis: any, applyArgs?: any[], source?: string): any {
    if (!this.entryFunction) {
      this.entryFunction = delegate;
    }
    try {
      this._isSync = true;
      return parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source);
    } finally {
      // We need to check the delegate is the same as entryFunction or not.
      // Consider the following case.
      //
      // asyncTestZone.run(() => { // Here the delegate will be the entryFunction
      //   Zone.current.run(() => { // Here the delegate will not be the entryFunction
      //   });
      // });
      //
      // We only want to check whether there are async tasks scheduled
      // for the entry function.
      if (this._isSync && this.entryFunction === delegate) {
        this._finishCallbackIfDone();
      }
    }
  }

  onHandleError(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, error: any):
      boolean {
    // Let the parent try to handle the error.
    const result = parentZoneDelegate.handleError(targetZone, error);
    if (result) {
      this.failCallback(error);
      this._alreadyErrored = true;
    }
    return false;
  }

  onHasTask(delegate: ZoneDelegate, current: Zone, target: Zone, hasTaskState: HasTaskState) {
    delegate.hasTask(target, hasTaskState);
    // We should only trigger finishCallback when the target zone is the AsyncTestZone
    // Consider the following cases.
    //
    // const childZone = asyncTestZone.fork({
    //   name: 'child',
    //   onHasTask: ...
    // });
    //
    // So we have nested zones declared the onHasTask hook, in this case,
    // the onHasTask will be triggered twice, and cause the finishCallbackIfDone()
    // is also be invoked twice. So we need to only trigger the finishCallbackIfDone()
    // when the current zone is the same as the target zone.
    if (current !== target) {
      return;
    }
    if (hasTaskState.change == 'microTask') {
      this._pendingMicroTasks = hasTaskState.microTask;
      this._finishCallbackIfDone();
    } else if (hasTaskState.change == 'macroTask') {
      this._pendingMacroTasks = hasTaskState.macroTask;
      this._finishCallbackIfDone();
    }
  }
}

// Export the class so that new instances can be created with proper
// constructor params.
(Zone as any)['AsyncTestZoneSpec'] = AsyncTestZoneSpec;
})(typeof window !== 'undefined' && window || typeof self !== 'undefined' && self || global);

Zone.__load_patch('asynctest', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  /**
   * Wraps a test function in an asynchronous test zone. The test will automatically
   * complete when all asynchronous calls within this zone are done.
   */
  (Zone as any)[api.symbol('asyncTest')] = function asyncTest(fn: Function): (done: any) => any {
    // If we're running using the Jasmine test framework, adapt to call the 'done'
    // function when asynchronous activity is finished.
    if (global.jasmine) {
      // Not using an arrow function to preserve context passed from call site
      return function(this: unknown, done: any) {
        if (!done) {
          // if we run beforeEach in @angular/core/testing/testing_internal then we get no done
          // fake it here and assume sync.
          done = function() {};
          done.fail = function(e: any) {
            throw e;
          };
        }
        runInTestZone(fn, this, done, (err: any) => {
          if (typeof err === 'string') {
            return done.fail(new Error(err));
          } else {
            done.fail(err);
          }
        });
      };
    }
    // Otherwise, return a promise which will resolve when asynchronous activity
    // is finished. This will be correctly consumed by the Mocha framework with
    // it('...', async(myFn)); or can be used in a custom framework.
    // Not using an arrow function to preserve context passed from call site
    return function(this: unknown) {
      return new Promise<void>((finishCallback, failCallback) => {
        runInTestZone(fn, this, finishCallback, failCallback);
      });
    };
  };

  function runInTestZone(
      fn: Function, context: any, finishCallback: Function, failCallback: Function) {
    const currentZone = Zone.current;
    const AsyncTestZoneSpec = (Zone as any)['AsyncTestZoneSpec'];
    if (AsyncTestZoneSpec === undefined) {
      throw new Error(
          'AsyncTestZoneSpec is needed for the async() test helper but could not be found. ' +
          'Please make sure that your environment includes zone.js/plugins/async-test');
    }
    const ProxyZoneSpec = (Zone as any)['ProxyZoneSpec'] as {
      get(): {setDelegate(spec: ZoneSpec): void; getDelegate(): ZoneSpec;};
      assertPresent: () => void;
    };
    if (!ProxyZoneSpec) {
      throw new Error(
          'ProxyZoneSpec is needed for the async() test helper but could not be found. ' +
          'Please make sure that your environment includes zone.js/plugins/proxy');
    }
    const proxyZoneSpec = ProxyZoneSpec.get();
    ProxyZoneSpec.assertPresent();
    // We need to create the AsyncTestZoneSpec outside the ProxyZone.
    // If we do it in ProxyZone then we will get to infinite recursion.
    const proxyZone = Zone.current.getZoneWith('ProxyZoneSpec');
    const previousDelegate = proxyZoneSpec.getDelegate();
    proxyZone!.parent!.run(() => {
      const testZoneSpec: ZoneSpec = new AsyncTestZoneSpec(
          () => {
            // Need to restore the original zone.
            if (proxyZoneSpec.getDelegate() == testZoneSpec) {
              // Only reset the zone spec if it's
              // still this one. Otherwise, assume
              // it's OK.
              proxyZoneSpec.setDelegate(previousDelegate);
            }
            (testZoneSpec as any).unPatchPromiseForTest();
            currentZone.run(() => {
              finishCallback();
            });
          },
          (error: any) => {
            // Need to restore the original zone.
            if (proxyZoneSpec.getDelegate() == testZoneSpec) {
              // Only reset the zone spec if it's sill this one. Otherwise, assume it's OK.
              proxyZoneSpec.setDelegate(previousDelegate);
            }
            (testZoneSpec as any).unPatchPromiseForTest();
            currentZone.run(() => {
              failCallback(error);
            });
          },
          'test');
      proxyZoneSpec.setDelegate(testZoneSpec);
      (testZoneSpec as any).patchPromiseForTest();
    });
    return Zone.current.runGuarded(fn, context);
  }
});
