/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, ComponentRef, DebugElement, ElementRef, NgZone, getDebugNode} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

/**
 * Fixture for debugging and testing a component.
 *
 * @stable
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

  private _isStable: boolean = true;
  private _isDestroyed: boolean = false;
  private _resolve: (result: any) => void;
  private _promise: Promise<any> = null;
  private _subscription: Subscription = null;

  constructor(
      public componentRef: ComponentRef<T>, public ngZone: NgZone, private _autoDetect: boolean) {
    this.changeDetectorRef = componentRef.changeDetectorRef;
    this.elementRef = componentRef.location;
    this.debugElement = <DebugElement>getDebugNode(this.elementRef.nativeElement);
    this.componentInstance = componentRef.instance;
    this.nativeElement = this.elementRef.nativeElement;

    if (ngZone != null) {
      this._subscription = ngZone.onUnstable.subscribe(() => this._isStable = false);
      this._subscription.add(ngZone.onMicrotaskEmpty.subscribe(() => {
        if (this._autoDetect) {
          // Do a change detection run with checkNoChanges set to true to check
          // there are no changes on the second run.
          this.detectChanges(true);
        }
      }));
      this._subscription.add(ngZone.onStable.subscribe(() => {
        this._isStable = true;
        // Check whether there is a pending whenStable() completer to resolve.
        if (this._promise !== null) {
          // If so check whether there are no pending macrotasks before resolving.
          // Do this check in the next tick so that ngZone gets a chance to update the state of
          // pending macrotasks.
          scheduleMicroTask(() => {
            if (!this.ngZone.hasPendingMacrotasks) {
              if (this._promise !== null) {
                this._resolve(true);
                this._resolve = null;
                this._promise = null;
              }
            }
          });
        }
      }));

      this._subscription.add(ngZone.onError.subscribe((error: any) => { throw error; }));
    }
  }

  private _tick(checkNoChanges: boolean): void {
    this.changeDetectorRef.detectChanges();
    if (checkNoChanges) {
      this.checkNoChanges();
    }
  }

  /**
   * Trigger a change detection cycle for the component.
   */
  detectChanges(checkNoChanges: boolean = true): void {
    if (this.ngZone != null) {
      // Run the change detection inside the NgZone so that any async tasks as part of the change
      // detection are captured by the zone and can be waited for in isStable.
      this.ngZone.run(() => this._tick(checkNoChanges));
    } else {
      // Running without zone. Just do the change detection.
      this._tick(checkNoChanges);
    }
  }

  /**
   * Do a change detection run to make sure there were no changes.
   */
  checkNoChanges(): void { this.changeDetectorRef.checkNoChanges(); }

  /**
   * Set whether the fixture should autodetect changes.
   *
   * Also runs detectChanges once so that any existing change is detected.
   */
  autoDetectChanges(autoDetect: boolean = true) {
    if (this.ngZone == null) {
      throw new Error('Cannot call autoDetectChanges when ComponentFixtureNoNgZone is set');
    }
    this._autoDetect = autoDetect;
    this.detectChanges();
  }

  /**
   * Return whether the fixture is currently stable or has async tasks that have not been completed
   * yet.
   */
  isStable(): boolean { return this._isStable && !this.ngZone.hasPendingMacrotasks; }

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
    if (this._promise !== null) {
      return this._promise;
    }
    this._promise = new Promise(res => this._resolve = res);
    return this._promise;
  }

  /**
   * Trigger component destruction.
   */
  destroy(): void {
    if (!this._isDestroyed) {
      this.componentRef.destroy();
      if (this._subscription != null) {
        this._subscription.unsubscribe();
        this._subscription = null;
      }
      this._isDestroyed = true;
    }
  }
}

function scheduleMicroTask(fn: Function): void {
  Zone.current.scheduleMicroTask('scheduleMicrotask', fn);
}
