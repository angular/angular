/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, NgZone} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {FocusTrap, InteractivityChecker} from '@angular/cdk/a11y';
import {Observable, Subject} from 'rxjs';

/** Value indicating whether focus left the target area before or after the enclosed elements. */
export const enum FocusEscapeNotifierDirection {
  START,
  END,
}

/**
 * Like FocusTrap, but rather than trapping focus within a dom region, notifies subscribers when
 * focus leaves the region.
 */
export class FocusEscapeNotifier extends FocusTrap {
  private _escapeSubject = new Subject<FocusEscapeNotifierDirection>();

  constructor(
      element: HTMLElement,
      checker: InteractivityChecker,
      ngZone: NgZone,
      document: Document) {
    super(element, checker, ngZone, document, true /* deferAnchors */);

    // The focus trap adds "anchors" at the beginning and end of a trapped region that redirect
    // focus. We override that redirect behavior here with simply emitting on a stream.
    this.startAnchorListener = () => {
      this._escapeSubject.next(FocusEscapeNotifierDirection.START);
      return true;
    };
    this.endAnchorListener = () => {
      this._escapeSubject.next(FocusEscapeNotifierDirection.END);
      return true;
    };

    this.attachAnchors();
  }

  escapes(): Observable<FocusEscapeNotifierDirection> {
    return this._escapeSubject.asObservable();
  }
}

/** Factory that allows easy instantiation of focus escape notifiers. */
@Injectable({providedIn: 'root'})
export class FocusEscapeNotifierFactory {
  private _document: Document;

  constructor(
      private _checker: InteractivityChecker,
      private _ngZone: NgZone,
      @Inject(DOCUMENT) _document: any) {

    this._document = _document;
  }

  /**
   * Creates a focus escape notifier region around the given element.
   * @param element The element around which focus will be monitored.
   * @returns The created focus escape notifier instance.
   */
  create(element: HTMLElement): FocusEscapeNotifier {
    return new FocusEscapeNotifier(element, this._checker, this._ngZone, this._document);
  }
}
