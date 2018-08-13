/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, NgZone, OnDestroy, OnInit} from '@angular/core';
import {fromEvent, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ScrollDispatcher} from './scroll-dispatcher';


/**
 * Sends an event when the directive's element is scrolled. Registers itself with the
 * ScrollDispatcher service to include itself as part of its collection of scrolling events that it
 * can be listened to through the service.
 */
@Directive({
  selector: '[cdk-scrollable], [cdkScrollable]'
})
export class CdkScrollable implements OnInit, OnDestroy {
  private _destroyed = new Subject();

  private _elementScrolled: Observable<Event> = Observable.create(observer =>
      this._ngZone.runOutsideAngular(() =>
          fromEvent(this._elementRef.nativeElement, 'scroll').pipe(takeUntil(this._destroyed))
              .subscribe(observer)));

  constructor(private _elementRef: ElementRef,
              private _scroll: ScrollDispatcher,
              private _ngZone: NgZone) {}

  ngOnInit() {
    this._scroll.register(this);
  }

  ngOnDestroy() {
    this._scroll.deregister(this);
    this._destroyed.next();
    this._destroyed.complete();
  }

  /**
   * Returns observable that emits when a scroll event is fired on the host element.
   */
  elementScrolled(): Observable<Event> {
    return this._elementScrolled;
  }

  getElementRef(): ElementRef {
    return this._elementRef;
  }
}
