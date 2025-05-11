/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Inject, Injectable, InjectionToken} from '../di';
import {isInInjectionContext} from '../di/contextual';
import {DestroyRef} from '../linker/destroy_ref';
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

interface WaitCallback {
  // Needs to be 'any' - setTimeout returns a number according to ES6, but
  // on NodeJS it returns a Timer.
  timeoutId: any;
  doneCb: Function;
  updateCb?: Function;
}

/**
 * Internal injection token that can used to access an instance of a Testability class.
 *
 * This token acts as a bridge between the core bootstrap code and the `Testability` class. This is
 * needed to ensure that there are no direct references to the `Testability` class, so it can be
 * tree-shaken away (if not referenced). For the environments/setups when the `Testability` class
 * should be available, this token is used to add a provider that references the `Testability`
 * class. Otherwise, only this token is retained in a bundle, but the `Testability` class is not.
 */
export const TESTABILITY = new InjectionToken<Testability>('');

/**
 * Internal injection token to retrieve Testability getter class instance.
 */
export const TESTABILITY_GETTER = new InjectionToken<GetTestability>('');

/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser.
 *
 * Angular applications bootstrapped using an NgModule (via `@NgModule.bootstrap` field) will also
 * instantiate Testability by default (in both development and production modes).
 *
 * For applications bootstrapped using the `bootstrapApplication` function, Testability is not
 * included by default. You can include it into your applications by getting the list of necessary
 * providers using the `provideProtractorTestingSupport()` function and adding them into the
 * `options.providers` array. Example:
 *
 * ```ts
 * import {provideProtractorTestingSupport} from '@angular/platform-browser';
 *
 * await bootstrapApplication(RootComponent, providers: [provideProtractorTestingSupport()]);
 * ```
 *
 * @publicApi
 */
@Injectable()
export class Testability implements PublicTestability {
  private _isZoneStable: boolean = true;
  private _callbacks: WaitCallback[] = [];

  private _taskTrackingZone: {macroTasks: Task[]} | null = null;

  private _destroyRef?: DestroyRef;

  constructor(
    private _ngZone: NgZone,
    private registry: TestabilityRegistry,
    @Inject(TESTABILITY_GETTER) testabilityGetter: GetTestability,
  ) {
    // Attempt to retrieve a `DestroyRef` optionally.
    // For backwards compatibility reasons, this cannot be required.
    if (isInInjectionContext()) {
      this._destroyRef = inject(DestroyRef, {optional: true}) ?? undefined;
    }

    // If there was no Testability logic registered in the global scope
    // before, register the current testability getter as a global one.
    if (!_testabilityGetter) {
      setTestabilityGetter(testabilityGetter);
      testabilityGetter.addToWindow(registry);
    }
    this._watchAngularEvents();
    _ngZone.run(() => {
      this._taskTrackingZone =
        typeof Zone == 'undefined' ? null : Zone.current.get('TaskTrackingZone');
    });
  }

  private _watchAngularEvents(): void {
    const onUnstableSubscription = this._ngZone.onUnstable.subscribe({
      next: () => {
        this._isZoneStable = false;
      },
    });

    const onStableSubscription = this._ngZone.runOutsideAngular(() =>
      this._ngZone.onStable.subscribe({
        next: () => {
          NgZone.assertNotInAngularZone();
          queueMicrotask(() => {
            this._isZoneStable = true;
            this._runCallbacksIfReady();
          });
        },
      }),
    );

    this._destroyRef?.onDestroy(() => {
      onUnstableSubscription.unsubscribe();
      onStableSubscription.unsubscribe();
    });
  }

  /**
   * Whether an associated application is stable
   */
  isStable(): boolean {
    return this._isZoneStable && !this._ngZone.hasPendingMacrotasks;
  }

  private _runCallbacksIfReady(): void {
    if (this.isStable()) {
      // Schedules the call backs in a new frame so that it is always async.
      queueMicrotask(() => {
        while (this._callbacks.length !== 0) {
          let cb = this._callbacks.pop()!;
          clearTimeout(cb.timeoutId);
          cb.doneCb();
        }
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
    }
  }

  private getPendingTasks(): PendingMacrotask[] {
    if (!this._taskTrackingZone) {
      return [];
    }

    // Copy the tasks data so that we don't leak tasks.
    return this._taskTrackingZone.macroTasks.map((t: Task) => {
      return {
        source: t.source,
        // From TaskTrackingZone:
        // https://github.com/angular/zone.js/blob/master/lib/zone-spec/task-tracking.ts#L40
        creationLocation: (t as any).creationLocation as Error,
        data: t.data,
      };
    });
  }

  private addCallback(cb: Function, timeout?: number, updateCb?: Function) {
    let timeoutId: any = -1;
    if (timeout && timeout > 0) {
      timeoutId = setTimeout(() => {
        this._callbacks = this._callbacks.filter((cb) => cb.timeoutId !== timeoutId);
        cb();
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
    if (updateCb && !this._taskTrackingZone) {
      throw new Error(
        'Task tracking zone is required when passing an update callback to ' +
          'whenStable(). Is "zone.js/plugins/task-tracking" loaded?',
      );
    }
    this.addCallback(doneCb, timeout, updateCb);
    this._runCallbacksIfReady();
  }

  /**
   * Registers an application with a testability hook so that it can be tracked.
   * @param token token of application, root element
   *
   * @internal
   */
  registerApplication(token: any) {
    this.registry.registerApplication(token, this);
  }

  /**
   * Unregisters an application.
   * @param token token of application, root element
   *
   * @internal
   */
  unregisterApplication(token: any) {
    this.registry.unregisterApplication(token);
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
@Injectable({providedIn: 'platform'})
export class TestabilityRegistry {
  /** @internal */
  _applications = new Map<any, Testability>();

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
  getTestability(elem: any): Testability | null {
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
  findTestabilityInTree(elem: Node, findInAncestors: boolean = true): Testability | null {
    return _testabilityGetter?.findTestabilityInTree(this, elem, findInAncestors) ?? null;
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
  findTestabilityInTree(
    registry: TestabilityRegistry,
    elem: any,
    findInAncestors: boolean,
  ): Testability | null;
}

/**
 * Set the {@link GetTestability} implementation used by the Angular testing framework.
 * @publicApi
 */
export function setTestabilityGetter(getter: GetTestability): void {
  _testabilityGetter = getter;
}

let _testabilityGetter: GetTestability | undefined;
