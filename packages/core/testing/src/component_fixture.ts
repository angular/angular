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
  ChangeDetectorRef,
  ComponentRef,
  DebugElement,
  ɵDeferBlockDetails as DeferBlockDetails,
  ɵEffectScheduler as EffectScheduler,
  ElementRef,
  getDebugNode,
  ɵgetDeferBlocks as getDeferBlocks,
  inject,
  NgZone,
  ɵNoopNgZone as NoopNgZone,
  RendererFactory2,
  ViewRef,
  ɵZONELESS_ENABLED as ZONELESS_ENABLED,
  ɵChangeDetectionScheduler,
  ɵNotificationSource,
} from '../../src/core';
import {PendingTasksInternal} from '../../src/pending_tasks';

import {TestBedApplicationErrorHandler} from './application_error_handler';
import {DeferBlockFixture} from './defer';
import {ComponentFixtureAutoDetect, ComponentFixtureNoNgZone} from './test_bed_common';

interface TestAppRef {
  allTestViews: Set<ViewRef>;
  includeAllTestViews: boolean;
  autoDetectTestViews: Set<ViewRef>;
}

/**
 * Fixture for debugging and testing a component.
 *
 * @publicApi
 */
export class ComponentFixture<T> {
  /**
   * The DebugElement associated with the root element of this component.
   */
  debugElement: DebugElement;

  /**
   * The instance of the root component class.
   */
  componentInstance: T;

  /**
   * The native element at the root of the component.
   */
  nativeElement: any;

  /**
   * The ElementRef for the element at the root of the component.
   */
  elementRef: ElementRef;

  /**
   * The ChangeDetectorRef for the component
   */
  changeDetectorRef: ChangeDetectorRef;

  private _renderer: RendererFactory2 | null | undefined;
  private _isDestroyed: boolean = false;
  /** @internal */
  protected readonly _noZoneOptionIsSet = inject(ComponentFixtureNoNgZone, {optional: true});
  /** @internal */
  protected _ngZone: NgZone = this._noZoneOptionIsSet ? new NoopNgZone() : inject(NgZone);
  // Inject ApplicationRef to ensure NgZone stableness causes after render hooks to run
  // This will likely happen as a result of fixture.detectChanges because it calls ngZone.run
  // This is a crazy way of doing things but hey, it's the world we live in.
  // The zoneless scheduler should instead do this more imperatively by attaching
  // the `ComponentRef` to `ApplicationRef` and calling `appRef.tick` as the `detectChanges`
  // behavior.
  /** @internal */
  protected readonly _appRef = inject(ApplicationRef);
  private readonly _testAppRef = this._appRef as unknown as TestAppRef;
  private readonly pendingTasks = inject(PendingTasksInternal);
  private readonly appErrorHandler = inject(TestBedApplicationErrorHandler);
  private readonly zonelessEnabled = inject(ZONELESS_ENABLED);
  private readonly scheduler = inject(ɵChangeDetectionScheduler);
  private readonly rootEffectScheduler = inject(EffectScheduler);
  private readonly autoDetectDefault = this.zonelessEnabled ? true : false;
  private autoDetect =
    inject(ComponentFixtureAutoDetect, {optional: true}) ?? this.autoDetectDefault;

  private subscriptions = new Subscription();

  // TODO(atscott): Remove this from public API
  ngZone = this._noZoneOptionIsSet ? null : this._ngZone;

  /** @docs-private */
  constructor(public componentRef: ComponentRef<T>) {
    this.changeDetectorRef = componentRef.changeDetectorRef;
    this.elementRef = componentRef.location;
    this.debugElement = <DebugElement>getDebugNode(this.elementRef.nativeElement);
    this.componentInstance = componentRef.instance;
    this.nativeElement = this.elementRef.nativeElement;
    this.componentRef = componentRef;

    this._testAppRef.allTestViews.add(this.componentRef.hostView);
    if (this.autoDetect) {
      this._testAppRef.autoDetectTestViews.add(this.componentRef.hostView);
      this.scheduler?.notify(ɵNotificationSource.ViewAttached);
      this.scheduler?.notify(ɵNotificationSource.MarkAncestorsForTraversal);
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
          next: (error: any) => {
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
  detectChanges(checkNoChanges = true): void {
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
  checkNoChanges(): void {
    this.changeDetectorRef.checkNoChanges();
  }

  /**
   * Set whether the fixture should autodetect changes.
   *
   * Also runs detectChanges once so that any existing change is detected.
   *
   * @param autoDetect Whether to autodetect changes. By default, `true`.
   * @deprecated For `autoDetect: true`, use `autoDetectChanges()`.
   * We have not seen a use-case for `autoDetect: false` but `changeDetectorRef.detach()` is a close equivalent.
   */
  autoDetectChanges(autoDetect: boolean): void;
  /**
   * Enables automatically synchronizing the view, as it would in an application.
   *
   * Also runs detectChanges once so that any existing change is detected.
   */
  autoDetectChanges(): void;
  autoDetectChanges(autoDetect = true): void {
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
  isStable(): boolean {
    return !this.pendingTasks.hasPendingTasks;
  }

  /**
   * Get a promise that resolves when the fixture is stable.
   *
   * This can be used to resume testing after events have triggered asynchronous activity or
   * asynchronous change detection.
   */
  whenStable(): Promise<any> {
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
  getDeferBlocks(): Promise<DeferBlockFixture[]> {
    const deferBlocks: DeferBlockDetails[] = [];
    const lView = (this.componentRef.hostView as any)['_lView'];
    getDeferBlocks(lView, deferBlocks);

    const deferBlockFixtures = [];
    for (const block of deferBlocks) {
      deferBlockFixtures.push(new DeferBlockFixture(block, this));
    }

    return Promise.resolve(deferBlockFixtures);
  }

  private _getRenderer() {
    if (this._renderer === undefined) {
      this._renderer = this.componentRef.injector.get(RendererFactory2, null);
    }
    return this._renderer as RendererFactory2 | null;
  }

  /**
   * Get a promise that resolves when the ui state is stable following animations.
   */
  whenRenderingDone(): Promise<any> {
    const renderer = this._getRenderer();
    if (renderer && renderer.whenRenderingDone) {
      return renderer.whenRenderingDone();
    }
    return this.whenStable();
  }

  /**
   * Trigger component destruction.
   */
  destroy(): void {
    this.subscriptions.unsubscribe();
    this._testAppRef.autoDetectTestViews.delete(this.componentRef.hostView);
    this._testAppRef.allTestViews.delete(this.componentRef.hostView);
    if (!this._isDestroyed) {
      this.componentRef.destroy();
      this._isDestroyed = true;
    }
  }
}
