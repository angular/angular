/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate, __param} from 'tslib';
import {inject, Inject, Injectable, InjectionToken} from '../di';
import {isInInjectionContext} from '../di/contextual';
import {DestroyRef} from '../linker/destroy_ref';
import {NgZone} from '../zone/ng_zone';
/**
 * Internal injection token that can used to access an instance of a Testability class.
 *
 * This token acts as a bridge between the core bootstrap code and the `Testability` class. This is
 * needed to ensure that there are no direct references to the `Testability` class, so it can be
 * tree-shaken away (if not referenced). For the environments/setups when the `Testability` class
 * should be available, this token is used to add a provider that references the `Testability`
 * class. Otherwise, only this token is retained in a bundle, but the `Testability` class is not.
 */
export const TESTABILITY = new InjectionToken('');
/**
 * Internal injection token to retrieve Testability getter class instance.
 */
export const TESTABILITY_GETTER = new InjectionToken('');
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
let Testability = class Testability {
  constructor(_ngZone, registry, testabilityGetter) {
    this._ngZone = _ngZone;
    this.registry = registry;
    this._isZoneStable = true;
    this._callbacks = [];
    this._taskTrackingZone = null;
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
  _watchAngularEvents() {
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
  isStable() {
    return this._isZoneStable && !this._ngZone.hasPendingMacrotasks;
  }
  _runCallbacksIfReady() {
    if (this.isStable()) {
      // Schedules the call backs in a new frame so that it is always async.
      queueMicrotask(() => {
        while (this._callbacks.length !== 0) {
          let cb = this._callbacks.pop();
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
  getPendingTasks() {
    if (!this._taskTrackingZone) {
      return [];
    }
    // Copy the tasks data so that we don't leak tasks.
    return this._taskTrackingZone.macroTasks.map((t) => {
      return {
        source: t.source,
        // From TaskTrackingZone:
        // https://github.com/angular/zone.js/blob/master/lib/zone-spec/task-tracking.ts#L40
        creationLocation: t.creationLocation,
        data: t.data,
      };
    });
  }
  addCallback(cb, timeout, updateCb) {
    let timeoutId = -1;
    if (timeout && timeout > 0) {
      timeoutId = setTimeout(() => {
        this._callbacks = this._callbacks.filter((cb) => cb.timeoutId !== timeoutId);
        cb();
      }, timeout);
    }
    this._callbacks.push({doneCb: cb, timeoutId: timeoutId, updateCb: updateCb});
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
  whenStable(doneCb, timeout, updateCb) {
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
  registerApplication(token) {
    this.registry.registerApplication(token, this);
  }
  /**
   * Unregisters an application.
   * @param token token of application, root element
   *
   * @internal
   */
  unregisterApplication(token) {
    this.registry.unregisterApplication(token);
  }
  /**
   * Find providers by name
   * @param using The root element to search from
   * @param provider The name of binding variable
   * @param exactMatch Whether using exactMatch
   */
  findProviders(using, provider, exactMatch) {
    // TODO(juliemr): implement.
    return [];
  }
};
Testability = __decorate([Injectable(), __param(2, Inject(TESTABILITY_GETTER))], Testability);
export {Testability};
/**
 * A global registry of {@link Testability} instances for specific elements.
 * @publicApi
 */
let TestabilityRegistry = class TestabilityRegistry {
  constructor() {
    /** @internal */
    this._applications = new Map();
  }
  /**
   * Registers an application with a testability hook so that it can be tracked
   * @param token token of application, root element
   * @param testability Testability hook
   */
  registerApplication(token, testability) {
    this._applications.set(token, testability);
  }
  /**
   * Unregisters an application.
   * @param token token of application, root element
   */
  unregisterApplication(token) {
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
  getTestability(elem) {
    return this._applications.get(elem) || null;
  }
  /**
   * Get all registered testabilities
   */
  getAllTestabilities() {
    return Array.from(this._applications.values());
  }
  /**
   * Get all registered applications(root elements)
   */
  getAllRootElements() {
    return Array.from(this._applications.keys());
  }
  /**
   * Find testability of a node in the Tree
   * @param elem node
   * @param findInAncestors whether finding testability in ancestors if testability was not found in
   * current node
   */
  findTestabilityInTree(elem, findInAncestors = true) {
    return _testabilityGetter?.findTestabilityInTree(this, elem, findInAncestors) ?? null;
  }
};
TestabilityRegistry = __decorate([Injectable({providedIn: 'platform'})], TestabilityRegistry);
export {TestabilityRegistry};
/**
 * Set the {@link GetTestability} implementation used by the Angular testing framework.
 * @publicApi
 */
export function setTestabilityGetter(getter) {
  _testabilityGetter = getter;
}
let _testabilityGetter;
//# sourceMappingURL=testability.js.map
