/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, ComponentRef, DebugElement, ElementRef, getDebugNode, NgZone, RendererFactory2, ɵDeferBlockDetails as DeferBlockDetails, ɵFlushableEffectRunner as FlushableEffectRunner, ɵgetDeferBlocks as getDeferBlocks} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {first} from 'rxjs/operators';

import {DeferBlockFixture} from './defer';


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
  private _isDestroyed: boolean = false;
  private _isStable = true;
  private subscriptions = new Subscription();

  /** @nodoc */
  constructor(
      public componentRef: ComponentRef<T>, public ngZone: NgZone|null,
      private effectRunner: FlushableEffectRunner|null, private _autoDetect: boolean,
      private isStableObservable: Observable<boolean>|null) {
    this.changeDetectorRef = componentRef.changeDetectorRef;
    this.elementRef = componentRef.location;
    this.debugElement = <DebugElement>getDebugNode(this.elementRef.nativeElement);
    this.componentInstance = componentRef.instance;
    this.nativeElement = this.elementRef.nativeElement;
    this.componentRef = componentRef;
    this.ngZone = ngZone;

    this.subscriptions.add(this.isStableObservable?.subscribe(v => {
      this._isStable = v;
    }));

    if (ngZone) {
      // Create subscriptions outside the NgZone so that the callbacks run oustide
      // of NgZone.
      ngZone.runOutsideAngular(() => {
        this.subscriptions.add(ngZone.onMicrotaskEmpty.subscribe({
          next: () => {
            if (this._autoDetect) {
              // Do a change detection run with checkNoChanges set to true to check
              // there are no changes on the second run.
              this.detectChanges(true);
            }
          }
        }));

        this.subscriptions.add(ngZone.onError.subscribe({
          next: (error: any) => {
            throw error;
          }
        }));
      });
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
    this.effectRunner?.flush();
    if (this.ngZone != null) {
      // Run the change detection inside the NgZone so that any async tasks as part of the change
      // detection are captured by the zone and can be waited for in isStable.
      this.ngZone.run(() => {
        this._tick(checkNoChanges);
      });
    } else {
      // Running without zone. Just do the change detection.
      this._tick(checkNoChanges);
    }
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
  isStable(): boolean {
    return this._isStable;
  }

  /**
   * Get a promise that resolves when the fixture is stable.
   *
   * This can be used to resume testing after events have triggered asynchronous activity or
   * asynchronous change detection.
   */
  whenStable(): Promise<any> {
    if (!this.isStableObservable || this.isStable()) {
      return Promise.resolve(false);
    }
    return this.isStableObservable.pipe(first(stable => stable))
        .toPromise()
        .then(() => Promise.resolve(true));
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
      this.subscriptions.unsubscribe();
      this._isDestroyed = true;
    }
  }
}
