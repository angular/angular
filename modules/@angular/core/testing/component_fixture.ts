/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationEntryMetadata, ChangeDetectorRef, ComponentFactory, ComponentRef, ComponentResolver, DebugElement, ElementRef, Injectable, Injector, NgZone, NgZoneError, OpaqueToken, ViewMetadata, getDebugNode} from '../index';
import {ObservableWrapper, PromiseCompleter, PromiseWrapper} from '../src/facade/async';
import {BaseException} from '../src/facade/exceptions';
import {scheduleMicroTask} from '../src/facade/lang';

import {tick} from './fake_async';


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
  componentInstance: any;

  /**
   * The native element at the root of the component.
   */
  nativeElement: any;

  /**
   * The ElementRef for the element at the root of the component.
   */
  elementRef: ElementRef;

  /**
   * The ComponentRef for the component
   */
  componentRef: ComponentRef<T>;

  /**
   * The ChangeDetectorRef for the component
   */
  changeDetectorRef: ChangeDetectorRef;

  /**
   * The NgZone in which this component was instantiated.
   */
  ngZone: NgZone;

  private _autoDetect: boolean;

  private _isStable: boolean = true;
  private _completer: PromiseCompleter<any> = null;
  private _onUnstableSubscription: any /** TODO #9100 */ = null;
  private _onStableSubscription: any /** TODO #9100 */ = null;
  private _onMicrotaskEmptySubscription: any /** TODO #9100 */ = null;
  private _onErrorSubscription: any /** TODO #9100 */ = null;

  constructor(componentRef: ComponentRef<T>, ngZone: NgZone, autoDetect: boolean) {
    this.changeDetectorRef = componentRef.changeDetectorRef;
    this.elementRef = componentRef.location;
    this.debugElement = <DebugElement>getDebugNode(this.elementRef.nativeElement);
    this.componentInstance = componentRef.instance;
    this.nativeElement = this.elementRef.nativeElement;
    this.componentRef = componentRef;
    this.ngZone = ngZone;
    this._autoDetect = autoDetect;

    if (ngZone != null) {
      this._onUnstableSubscription =
          ObservableWrapper.subscribe(ngZone.onUnstable, (_) => { this._isStable = false; });
      this._onMicrotaskEmptySubscription =
          ObservableWrapper.subscribe(ngZone.onMicrotaskEmpty, (_) => {
            if (this._autoDetect) {
              // Do a change detection run with checkNoChanges set to true to check
              // there are no changes on the second run.
              this.detectChanges(true);
            }
          });
      this._onStableSubscription = ObservableWrapper.subscribe(ngZone.onStable, (_) => {
        this._isStable = true;
        // Check whether there are no pending macrotasks in a microtask so that ngZone gets a chance
        // to update the state of pending macrotasks.
        scheduleMicroTask(() => {
          if (!this.ngZone.hasPendingMacrotasks) {
            if (this._completer != null) {
              this._completer.resolve(true);
              this._completer = null;
            }
          }
        });
      });

      this._onErrorSubscription = ObservableWrapper.subscribe(
          ngZone.onError, (error: NgZoneError) => { throw error.error; });
    }
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
    if (this.ngZone != null) {
      // Run the change detection inside the NgZone so that any async tasks as part of the change
      // detection are captured by the zone and can be waited for in isStable.
      this.ngZone.run(() => { this._tick(checkNoChanges); });
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
      throw new BaseException('Cannot call autoDetectChanges when ComponentFixtureNoNgZone is set');
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
      return PromiseWrapper.resolve(false);
    } else if (this._completer !== null) {
      return this._completer.promise;
    } else {
      this._completer = new PromiseCompleter<any>();
      return this._completer.promise;
    }
  }

  /**
   * Trigger component destruction.
   */
  destroy(): void {
    this.componentRef.destroy();
    if (this._onUnstableSubscription != null) {
      ObservableWrapper.dispose(this._onUnstableSubscription);
      this._onUnstableSubscription = null;
    }
    if (this._onStableSubscription != null) {
      ObservableWrapper.dispose(this._onStableSubscription);
      this._onStableSubscription = null;
    }
    if (this._onMicrotaskEmptySubscription != null) {
      ObservableWrapper.dispose(this._onMicrotaskEmptySubscription);
      this._onMicrotaskEmptySubscription = null;
    }
    if (this._onErrorSubscription != null) {
      ObservableWrapper.dispose(this._onErrorSubscription);
      this._onErrorSubscription = null;
    }
  }
}
