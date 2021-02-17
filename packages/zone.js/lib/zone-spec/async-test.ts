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
    if (!(this._pendingMicroTasks || this._pendingMacroTasks ||
          (this.supportWaitUnresolvedChainedPromise && this.isUnresolvedChainedPromisePending()))) {
      // We do this because we would like to catch unhandled rejected promises.
      this.runZone.run(() => {
        setTimeout(() => {
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
    let previousTaskCounts: any = null;
    try {
      this._isSync = true;
      return parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source);
    } finally {
      const afterTaskCounts: any = (parentZoneDelegate as any)._taskCounts;
      if (this._isSync) {
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
              // sill this one. Otherwise, assume
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
