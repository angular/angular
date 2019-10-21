/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BehaviorSubject, Observable} from 'rxjs';
import {ProxyZone, ProxyZoneStatic} from './proxy-zone-types';
import {HasTaskState, Zone, ZoneDelegate} from './zone-types';

/** Current state of the intercepted zone. */
export interface TaskState {
  /** Whether the zone is stable (i.e. no microtasks and macrotasks). */
  stable: boolean;
}

/** Unique symbol that is used to patch a property to a proxy zone. */
const stateObservableSymbol = Symbol('ProxyZone_PATCHED#stateObservable');

/** Type that describes a potentially patched proxy zone instance. */
type PatchedProxyZone = ProxyZone & {
  [stateObservableSymbol]: undefined|Observable<TaskState>;
};

/**
 * Interceptor that can be set up in a `ProxyZone` instance. The interceptor
 * will keep track of the task state and emit whenever the state changes.
 *
 * This serves as a workaround for https://github.com/angular/angular/issues/32896.
 */
export class TaskStateZoneInterceptor {
  /** Subject that can be used to emit a new state change. */
  private _stateSubject: BehaviorSubject<TaskState> = new BehaviorSubject<TaskState>(
      this._lastState ? this._getTaskStateFromInternalZoneState(this._lastState) : {stable: true});

  /** Public observable that emits whenever the task state changes. */
  readonly state: Observable<TaskState> = this._stateSubject.asObservable();

  constructor(private _lastState: HasTaskState|null) {}

  /** This will be called whenever the task state changes in the intercepted zone. */
  onHasTask(delegate: ZoneDelegate, current: Zone, target: Zone, hasTaskState: HasTaskState) {
    if (current === target) {
      this._stateSubject.next(this._getTaskStateFromInternalZoneState(hasTaskState));
    }
  }

  /** Gets the task state from the internal ZoneJS task state. */
  private _getTaskStateFromInternalZoneState(state: HasTaskState): TaskState {
    return {stable: !state.macroTask && !state.microTask};
  }

  /**
   * Sets up the custom task state Zone interceptor in the  `ProxyZone`. Throws if
   * no `ProxyZone` could be found.
   * @returns an observable that emits whenever the task state changes.
   */
  static setup(): Observable<TaskState> {
    if (Zone === undefined) {
      throw Error('Could not find ZoneJS. For test harnesses running in TestBed, ' +
        'ZoneJS needs to be installed.');
    }

    // tslint:disable-next-line:variable-name
    const ProxyZoneSpec = (Zone as any)['ProxyZoneSpec'] as ProxyZoneStatic|undefined;

    // If there is no "ProxyZoneSpec" installed, we throw an error and recommend
    // setting up the proxy zone by pulling in the testing bundle.
    if (!ProxyZoneSpec) {
      throw Error(
        'ProxyZoneSpec is needed for the test harnesses but could not be found. ' +
        'Please make sure that your environment includes zone.js/dist/zone-testing.js');
    }

    // Ensure that there is a proxy zone instance set up, and get
    // a reference to the instance if present.
    const zoneSpec = ProxyZoneSpec.assertPresent() as PatchedProxyZone;

    // If there already is a delegate registered in the proxy zone, and it
    // is type of the custom task state interceptor, we just use that state
    // observable. This allows us to only intercept Zone once per test
    // (similar to how `fakeAsync` or `async` work).
    if (zoneSpec[stateObservableSymbol]) {
      return zoneSpec[stateObservableSymbol]!;
    }

    // Since we intercept on environment creation and the fixture has been
    // created before, we might have missed tasks scheduled before. Fortunately
    // the proxy zone keeps track of the previous task state, so we can just pass
    // this as initial state to the task zone interceptor.
    const interceptor = new TaskStateZoneInterceptor(zoneSpec.lastTaskState);
    const zoneSpecOnHasTask = zoneSpec.onHasTask;

    // We setup the task state interceptor in the `ProxyZone`. Note that we cannot register
    // the interceptor as a new proxy zone delegate because it would mean that other zone
    // delegates (e.g. `FakeAsyncTestZone` or `AsyncTestZone`) can accidentally overwrite/disable
    // our interceptor. Since we just intend to monitor the task state of the proxy zone, it is
    // sufficient to just patch the proxy zone. This also avoids that we interfere with the task
    // queue scheduling logic.
    zoneSpec.onHasTask = function() {
      zoneSpecOnHasTask.apply(zoneSpec, arguments);
      interceptor.onHasTask.apply(interceptor, arguments);
    };

    return zoneSpec[stateObservableSymbol] = interceptor.state;
  }
}
