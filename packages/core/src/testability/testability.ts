/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '../di';
import {scheduleMicroTask} from '../util/microtask';
import {NgZone} from '../zone/ng_zone';

/**
 * Testability API.
 * `declare` keyword causes tsickle to generate externs, so these methods are
 * not renamed by Closure Compiler.
 * @publicApi
 */
export declare interface PublicTestability {
  isStable(): boolean;
  whenStable(callback: Function, timeout?: number, updateCallback?: Function): void;
  findProviders(using: any, provider: string, exactMatch: boolean): any[];
}

// Angular internal, not intended for public API.
export interface PendingMacrotask {
  source: string;
  creationLocation: Error;
  runCount?: number;
  data?: TaskData;
}

export interface TaskData {
  target?: XMLHttpRequest;
  delay?: number;
  isPeriodic?: boolean;
}

// Angular internal, not intended for public API.
export type DoneCallback = (didWork: boolean, tasks?: PendingMacrotask[]) => void;
export type UpdateCallback = (tasks: PendingMacrotask[]) => boolean;

interface WaitCallback {
  // Needs to be 'any' - setTimeout returns a number according to ES6, but
  // on NodeJS it returns a Timer.
  timeoutId: any;
  doneCb: DoneCallback;
  updateCb?: UpdateCallback;
}

/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 * @publicApi
 */
@Injectable()
export class Testability implements PublicTestability {
  private _pendingCount: number = 0;
  private _isZoneStable: boolean = true;
  /**
   * Whether any work was done since the last 'whenStable' callback. This is
   * useful to detect if this could have potentially destabilized another
   * component while it is stabilizing.
   * @internal
   */
  private _didWork: boolean = false;
  private _callbacks: WaitCallback[] = [];

  private taskTrackingZone: {macroTasks: Task[]}|null = null;

  constructor(private _ngZone: NgZone) {
    this._watchAngularEvents();
    _ngZone.run(() => {
      this.taskTrackingZone =
          typeof Zone == 'undefined' ? null : Zone.current.get('TaskTrackingZone');
    });
  }

  private _watchAngularEvents(): void {
    this._ngZone.onUnstable.subscribe({
      next: () => {
        this._didWork = true;
        this._isZoneStable = false;
      }
    });

    this._ngZone.runOutsideAngular(() => {
      this._ngZone.onStable.subscribe({
        next: () => {
          NgZone.assertNotInAngularZone();
          scheduleMicroTask(() => {
            this._isZoneStable = true;
            this._runCallbacksIfReady();
          });
        }
      });
    });
  }

  /**
   * Increases the number of pending request
   * @deprecated pending requests are now tracked with zones.
   */
  increasePendingRequestCount(): number {
    this._pendingCount += 1;
    this._didWork = true;
    return this._pendingCount;
  }

  /**
   * Decreases the number of pending request
   * @deprecated pending requests are now tracked with zones
   */
  decreasePendingRequestCount(): number {
    this._pendingCount -= 1;
    if (this._pendingCount < 0) {
      throw new Error('pending async requests below zero');
    }
    this._runCallbacksIfReady();
    return this._pendingCount;
  }

  /**
   * Whether an associated application is stable
   */
  isStable(): boolean {
    return this._isZoneStable && this._pendingCount === 0 && !this._ngZone.hasPendingMacrotasks;
  }

  private _runCallbacksIfReady(): void {
    if (this.isStable()) {
      // Schedules the call backs in a new frame so that it is always async.
      scheduleMicroTask(() => {
        while (this._callbacks.length !== 0) {
          let cb = this._callbacks.pop()!;
          clearTimeout(cb.timeoutId);
          cb.doneCb(this._didWork);
        }
        this._didWork = false;
      });
    } else {
      // Still not stable, send updates.
      let pending = this.getPendingTasks();
      this._callbacks = this._callbacks.filter((cb) => {
        if (cb.updateCb && cb.updateCb(pending)) {
          clearTimeout(cb.timeoutId);
          return false;
        }

        return true;
      });

      this._didWork = true;
    }
  }

  private getPendingTasks(): PendingMacrotask[] {
    if (!this.taskTrackingZone) {
      return [];
    }

    // Copy the tasks data so that we don't leak tasks.
    return this.taskTrackingZone.macroTasks.map((t: Task) => {
      return {
        source: t.source,
        // From TaskTrackingZone:
        // https://github.com/angular/zone.js/blob/master/lib/zone-spec/task-tracking.ts#L40
        creationLocation: (t as any).creationLocation as Error,
        data: t.data
      };
    });
  }

  private addCallback(cb: DoneCallback, timeout?: number, updateCb?: UpdateCallback) {
    let timeoutId: any = -1;
    if (timeout && timeout > 0) {
      timeoutId = setTimeout(() => {
        this._callbacks = this._callbacks.filter((cb) => cb.timeoutId !== timeoutId);
        cb(this._didWork, this.getPendingTasks());
      }, timeout);
    }
    this._callbacks.push(<WaitCallback>{doneCb: cb, timeoutId: timeoutId, updateCb: updateCb});
  }

  /**
   * Wait for the application to be stable with a timeout. If the timeout is reached before that
   * happens, the callback receives a list of the macro tasks that were pending, otherwise null.
   *
   * @param doneCb The callback to invoke when Angular is stable or the timeout expires
   *    whichever comes first.
   * @param timeout Optional. The maximum time to wait for Angular to become stable. If not
   *    specified, whenStable() will wait forever.
   * @param updateCb Optional. If specified, this callback will be invoked whenever the set of
   *    pending macrotasks changes. If this callback returns true doneCb will not be invoked
   *    and no further updates will be issued.
   */
  whenStable(doneCb: Function, timeout?: number, updateCb?: Function): void {
    if (updateCb && !this.taskTrackingZone) {
      throw new Error(
          'Task tracking zone is required when passing an update callback to ' +
          'whenStable(). Is "zone.js/plugins/task-tracking" loaded?');
    }
    // These arguments are 'Function' above to keep the public API simple.
    this.addCallback(doneCb as DoneCallback, timeout, updateCb as UpdateCallback);
    this._runCallbacksIfReady();
  }

  /**
   * Get the number of pending requests
   * @deprecated pending requests are now tracked with zones
   */
  getPendingRequestCount(): number {
    return this._pendingCount;
  }

  /**
   * Find providers by name
   * @param using The root element to search from
   * @param provider The name of binding variable
   * @param exactMatch Whether using exactMatch
   */
  findProviders(using: any, provider: string, exactMatch: boolean): any[] {
    // TODO(juliemr): implement.
    return [];
  }
}

/**
 * A global registry of {@link Testability} instances for specific elements.
 * @publicApi
 */
@Injectable()
export class TestabilityRegistry {
  /** @internal */
  _applications = new Map<any, Testability>();

  constructor() {
    _testabilityGetter.addToWindow(this);
  }

  /**
   * Registers an application with a testability hook so that it can be tracked
   * @param token token of application, root element
   * @param testability Testability hook
   */
  registerApplication(token: any, testability: Testability) {
    this._applications.set(token, testability);
  }

  /**
   * Unregisters an application.
   * @param token token of application, root element
   */
  unregisterApplication(token: any) {
    this._applications.delete(token);
  }

  /**
   * Unregisters all applications
   */
  unregisterAllApplications() {
    this._applications.clear();
  }

  /**
   * Get a testability hook associated with the application
   * @param elem root element
   */
  getTestability(elem: any): Testability|null {
    return this._applications.get(elem) || null;
  }

  /**
   * Get all registered testabilities
   */
  getAllTestabilities(): Testability[] {
    return Array.from(this._applications.values());
  }

  /**
   * Get all registered applications(root elements)
   */
  getAllRootElements(): any[] {
    return Array.from(this._applications.keys());
  }

  /**
   * Find testability of a node in the Tree
   * @param elem node
   * @param findInAncestors whether finding testability in ancestors if testability was not found in
   * current node
   */
  findTestabilityInTree(elem: Node, findInAncestors: boolean = true): Testability|null {
    return _testabilityGetter.findTestabilityInTree(this, elem, findInAncestors);
  }
}

/**
 * Adapter interface for retrieving the `Testability` service associated for a
 * particular context.
 *
 * @publicApi
 */
export interface GetTestability {
  addToWindow(registry: TestabilityRegistry): void;
  findTestabilityInTree(registry: TestabilityRegistry, elem: any, findInAncestors: boolean):
      Testability|null;
}

class _NoopGetTestability implements GetTestability {
  addToWindow(registry: TestabilityRegistry): void {}
  findTestabilityInTree(registry: TestabilityRegistry, elem: any, findInAncestors: boolean):
      Testability|null {
    return null;
  }
}

/**
 * Set the {@link GetTestability} implementation used by the Angular testing framework.
 * @publicApi
 */
export function setTestabilityGetter(getter: GetTestability): void {
  _testabilityGetter = getter;
}

let _testabilityGetter: GetTestability = new _NoopGetTestability();
