/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, ComponentRef, DebugElement, ElementRef, getDebugNode, inject, NgZone, RendererFactory2, ɵDeferBlockDetails as DeferBlockDetails, ɵgetDeferBlocks as getDeferBlocks, ɵNoopNgZone as NoopNgZone, ɵZoneAwareQueueingScheduler as ZoneAwareQueueingScheduler} from '@angular/core';
import {Subscription} from 'rxjs';

import {DeferBlockFixture} from './defer';
import {ComponentFixtureAutoDetect, ComponentFixtureNoNgZone} from './test_bed_common';


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

  private _renderer: RendererFactory2|null|undefined;
  private _isStable: boolean = true;
  private _isDestroyed: boolean = false;
  private _resolve: ((result: boolean) => void)|null = null;
  private _promise: Promise<boolean>|null = null;
  private readonly noZoneOptionIsSet = inject(ComponentFixtureNoNgZone, {optional: true});
  private _ngZone: NgZone = this.noZoneOptionIsSet ? new NoopNgZone() : inject(NgZone);
  private _autoDetect = inject(ComponentFixtureAutoDetect, {optional: true}) ?? false;
  private effectRunner = inject(ZoneAwareQueueingScheduler, {optional: true});
  private _subscriptions = new Subscription();

  // TODO(atscott): Remove this from public API
  public ngZone = this.noZoneOptionIsSet ? null : this._ngZone;

  /** @nodoc */
  constructor(public componentRef: ComponentRef<T>) {
    this.changeDetectorRef = componentRef.changeDetectorRef;
    this.elementRef = componentRef.location;
    this.debugElement = <DebugElement>getDebugNode(this.elementRef.nativeElement);
    this.componentInstance = componentRef.instance;
    this.nativeElement = this.elementRef.nativeElement;
    this.componentRef = componentRef;
    this.setupNgZone();
  }

  private setupNgZone() {
    // Create subscriptions outside the NgZone so that the callbacks run outside
    // of NgZone.
    this._ngZone.runOutsideAngular(() => {
      this._subscriptions.add(this._ngZone.onUnstable.subscribe({
        next: () => {
          this._isStable = false;
        }
      }));
      this._subscriptions.add(this._ngZone.onMicrotaskEmpty.subscribe({
        next: () => {
          if (this._autoDetect) {
            // Do a change detection run with checkNoChanges set to true to check
            // there are no changes on the second run.
            this.detectChanges(true);
          }
        }
      }));
      this._subscriptions.add(this._ngZone.onStable.subscribe({
        next: () => {
          this._isStable = true;
          // Check whether there is a pending whenStable() completer to resolve.
          if (this._promise !== null) {
            // If so check whether there are no pending macrotasks before resolving.
            // Do this check in the next tick so that ngZone gets a chance to update the state of
            // pending macrotasks.
            queueMicrotask(() => {
              if (!this._ngZone.hasPendingMacrotasks) {
                if (this._promise !== null) {
                  this._resolve!(true);
                  this._resolve = null;
                  this._promise = null;
                }
              }
            });
          }
        }
      }));

      this._subscriptions.add(this._ngZone.onError.subscribe({
        next: (error: any) => {
          throw error;
        }
      }));
    });
  }

  private _tick(checkNoChanges: boolean) {
    this.changeDetectorRef.detectChanges();
    if (checkNoChanges) {
      this.checkNoChanges();
    }
  }

  /**
   * Trigger a change detection cycle for the component.
   */
  detectChanges(checkNoChanges: boolean = true): void {
    this.effectRunner?.flush();
    // Run the change detection inside the NgZone so that any async tasks as part of the change
    // detection are captured by the zone and can be waited for in isStable.
    this._ngZone.run(() => {
      this._tick(checkNoChanges);
    });
    // Run any effects that were created/dirtied during change detection. Such effects might become
    // dirty in response to input signals changing.
    this.effectRunner?.flush();
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
   */
  autoDetectChanges(autoDetect: boolean = true) {
    if (this.noZoneOptionIsSet) {
      throw new Error('Cannot call autoDetectChanges when ComponentFixtureNoNgZone is set');
    }
    this._autoDetect = autoDetect;
    this.detectChanges();
  }

  /**
   * Return whether the fixture is currently stable or has async tasks that have not been completed
   * yet.
   */
  isStable(): boolean {
    return this._isStable && !this._ngZone.hasPendingMacrotasks;
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
    } else if (this._promise !== null) {
      return this._promise;
    } else {
      this._promise = new Promise(res => {
        this._resolve = res;
      });
      return this._promise;
    }
  }

  /**
   * Retrieves all defer block fixtures in the component fixture.
   *
   * @developerPreview
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
    if (!this._isDestroyed) {
      this.componentRef.destroy();
      this._subscriptions.unsubscribe();
      this._isDestroyed = true;
    }
  }
}
