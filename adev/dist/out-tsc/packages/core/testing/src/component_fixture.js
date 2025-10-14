/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Subscription} from 'rxjs';
import {
  ApplicationRef,
  ɵEffectScheduler as EffectScheduler,
  getDebugNode,
  ɵgetDeferBlocks as getDeferBlocks,
  inject,
  NgZone,
  ɵNoopNgZone as NoopNgZone,
  RendererFactory2,
  ɵZONELESS_ENABLED as ZONELESS_ENABLED,
  ɵChangeDetectionScheduler,
} from '../../src/core';
import {PendingTasksInternal} from '../../src/pending_tasks_internal';
import {TestBedApplicationErrorHandler} from './application_error_handler';
import {DeferBlockFixture} from './defer';
import {ComponentFixtureAutoDetect, ComponentFixtureNoNgZone} from './test_bed_common';
/**
 * Fixture for debugging and testing a component.
 *
 * @publicApi
 */
export class ComponentFixture {
  componentRef;
  /**
   * The DebugElement associated with the root element of this component.
   */
  debugElement;
  /**
   * The instance of the root component class.
   */
  componentInstance;
  /**
   * The native element at the root of the component.
   */
  nativeElement;
  /**
   * The ElementRef for the element at the root of the component.
   */
  elementRef;
  /**
   * The ChangeDetectorRef for the component
   */
  changeDetectorRef;
  _renderer;
  _isDestroyed = false;
  /** @internal */
  _noZoneOptionIsSet = inject(ComponentFixtureNoNgZone, {optional: true});
  /** @internal */
  _ngZone = this._noZoneOptionIsSet ? new NoopNgZone() : inject(NgZone);
  // Inject ApplicationRef to ensure NgZone stableness causes after render hooks to run
  // This will likely happen as a result of fixture.detectChanges because it calls ngZone.run
  // This is a crazy way of doing things but hey, it's the world we live in.
  // The zoneless scheduler should instead do this more imperatively by attaching
  // the `ComponentRef` to `ApplicationRef` and calling `appRef.tick` as the `detectChanges`
  // behavior.
  /** @internal */
  _appRef = inject(ApplicationRef);
  _testAppRef = this._appRef;
  pendingTasks = inject(PendingTasksInternal);
  appErrorHandler = inject(TestBedApplicationErrorHandler);
  zonelessEnabled = inject(ZONELESS_ENABLED);
  scheduler = inject(ɵChangeDetectionScheduler);
  rootEffectScheduler = inject(EffectScheduler);
  autoDetectDefault = this.zonelessEnabled ? true : false;
  autoDetect = inject(ComponentFixtureAutoDetect, {optional: true}) ?? this.autoDetectDefault;
  subscriptions = new Subscription();
  // TODO(atscott): Remove this from public API
  ngZone = this._noZoneOptionIsSet ? null : this._ngZone;
  /** @docs-private */
  constructor(componentRef) {
    this.componentRef = componentRef;
    this.changeDetectorRef = componentRef.changeDetectorRef;
    this.elementRef = componentRef.location;
    this.debugElement = getDebugNode(this.elementRef.nativeElement);
    this.componentInstance = componentRef.instance;
    this.nativeElement = this.elementRef.nativeElement;
    this.componentRef = componentRef;
    this._testAppRef.allTestViews.add(this.componentRef.hostView);
    if (this.autoDetect) {
      this._testAppRef.autoDetectTestViews.add(this.componentRef.hostView);
      this.scheduler?.notify(8 /* ɵNotificationSource.ViewAttached */);
      this.scheduler?.notify(0 /* ɵNotificationSource.MarkAncestorsForTraversal */);
    }
    this.componentRef.hostView.onDestroy(() => {
      this._testAppRef.allTestViews.delete(this.componentRef.hostView);
      this._testAppRef.autoDetectTestViews.delete(this.componentRef.hostView);
    });
    // Create subscriptions outside the NgZone so that the callbacks run outside
    // of NgZone.
    this._ngZone.runOutsideAngular(() => {
      this.subscriptions.add(
        this._ngZone.onError.subscribe({
          next: (error) => {
            // The rethrow here is to ensure that errors don't go unreported. Since `NgZone.onHandleError` returns `false`,
            // ZoneJS will not throw the error coming out of a task. Instead, the handling is defined by
            // the chain of parent delegates and whether they indicate the error is handled in some way (by returning `false`).
            // Unfortunately, 'onError' does not forward the information about whether the error was handled by a parent zone
            // so cannot know here whether throwing is appropriate. As a half-solution, we can check to see if we're inside
            // a fakeAsync context, which we know has its own error handling.
            // https://github.com/angular/angular/blob/db2f2d99c82aae52d8a0ae46616c6411d070b35e/packages/zone.js/lib/zone-spec/fake-async-test.ts#L783-L784
            // https://github.com/angular/angular/blob/db2f2d99c82aae52d8a0ae46616c6411d070b35e/packages/zone.js/lib/zone-spec/fake-async-test.ts#L473-L478
            if (typeof Zone === 'undefined' || Zone.current.get('FakeAsyncTestZoneSpec')) {
              return;
            }
            throw error;
          },
        }),
      );
    });
  }
  /**
   * Trigger a change detection cycle for the component.
   */
  detectChanges(checkNoChanges = true) {
    const originalCheckNoChanges = this.componentRef.changeDetectorRef.checkNoChanges;
    try {
      if (!checkNoChanges) {
        this.componentRef.changeDetectorRef.checkNoChanges = () => {};
      }
      if (this.zonelessEnabled) {
        try {
          this._testAppRef.includeAllTestViews = true;
          this._appRef.tick();
        } finally {
          this._testAppRef.includeAllTestViews = false;
        }
      } else {
        // Run the change detection inside the NgZone so that any async tasks as part of the change
        // detection are captured by the zone and can be waited for in isStable.
        this._ngZone.run(() => {
          // Flush root effects before `detectChanges()`, to emulate the sequencing of `tick()`.
          this.rootEffectScheduler.flush();
          this.changeDetectorRef.detectChanges();
          this.checkNoChanges();
        });
      }
    } finally {
      this.componentRef.changeDetectorRef.checkNoChanges = originalCheckNoChanges;
    }
  }
  /**
   * Do a change detection run to make sure there were no changes.
   */
  checkNoChanges() {
    this.changeDetectorRef.checkNoChanges();
  }
  autoDetectChanges(autoDetect = true) {
    if (!autoDetect && this.zonelessEnabled) {
      throw new Error('Cannot set autoDetect to false with zoneless change detection.');
    }
    if (this._noZoneOptionIsSet && !this.zonelessEnabled) {
      throw new Error('Cannot call autoDetectChanges when ComponentFixtureNoNgZone is set.');
    }
    if (autoDetect) {
      this._testAppRef.autoDetectTestViews.add(this.componentRef.hostView);
    } else {
      this._testAppRef.autoDetectTestViews.delete(this.componentRef.hostView);
    }
    this.autoDetect = autoDetect;
    this.detectChanges();
  }
  /**
   * Return whether the fixture is currently stable or has async tasks that have not been completed
   * yet.
   */
  isStable() {
    return !this.pendingTasks.hasPendingTasks;
  }
  /**
   * Get a promise that resolves when the fixture is stable.
   *
   * This can be used to resume testing after events have triggered asynchronous activity or
   * asynchronous change detection.
   */
  whenStable() {
    if (this.isStable()) {
      return Promise.resolve(false);
    }
    return new Promise((resolve, reject) => {
      this.appErrorHandler.whenStableRejectFunctions.add(reject);
      this._appRef.whenStable().then(() => {
        this.appErrorHandler.whenStableRejectFunctions.delete(reject);
        resolve(true);
      });
    });
  }
  /**
   * Retrieves all defer block fixtures in the component fixture.
   */
  getDeferBlocks() {
    const deferBlocks = [];
    const lView = this.componentRef.hostView['_lView'];
    getDeferBlocks(lView, deferBlocks);
    const deferBlockFixtures = [];
    for (const block of deferBlocks) {
      deferBlockFixtures.push(new DeferBlockFixture(block, this));
    }
    return Promise.resolve(deferBlockFixtures);
  }
  _getRenderer() {
    if (this._renderer === undefined) {
      this._renderer = this.componentRef.injector.get(RendererFactory2, null);
    }
    return this._renderer;
  }
  /**
   * Get a promise that resolves when the ui state is stable following animations.
   */
  whenRenderingDone() {
    const renderer = this._getRenderer();
    if (renderer && renderer.whenRenderingDone) {
      return renderer.whenRenderingDone();
    }
    return this.whenStable();
  }
  /**
   * Trigger component destruction.
   */
  destroy() {
    this.subscriptions.unsubscribe();
    this._testAppRef.autoDetectTestViews.delete(this.componentRef.hostView);
    this._testAppRef.allTestViews.delete(this.componentRef.hostView);
    if (!this._isDestroyed) {
      this.componentRef.destroy();
      this._isDestroyed = true;
    }
  }
}
//# sourceMappingURL=component_fixture.js.map
