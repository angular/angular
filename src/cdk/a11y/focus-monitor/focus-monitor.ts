/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform, normalizePassiveListenerOptions} from '@angular/cdk/platform';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Injectable,
  NgZone,
  OnDestroy,
  Optional,
  Output,
  SkipSelf,
} from '@angular/core';
import {Observable, of as observableOf, Subject, Subscription} from 'rxjs';
import {coerceElement} from '@angular/cdk/coercion';


// This is the value used by AngularJS Material. Through trial and error (on iPhone 6S) they found
// that a value of around 650ms seems appropriate.
export const TOUCH_BUFFER_MS = 650;


export type FocusOrigin = 'touch' | 'mouse' | 'keyboard' | 'program' | null;

/**
 * Corresponds to the options that can be passed to the native `focus` event.
 * via https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
 */
export interface FocusOptions {
  /** Whether the browser should scroll to the element when it is focused. */
  preventScroll?: boolean;
}

type MonitoredElementInfo = {
  unlisten: Function,
  checkChildren: boolean,
  subject: Subject<FocusOrigin>
};

/**
 * Event listener options that enable capturing and also
 * mark the the listener as passive if the browser supports it.
 */
const captureEventListenerOptions = normalizePassiveListenerOptions({
  passive: true,
  capture: true
});


/** Monitors mouse and keyboard events to determine the cause of focus events. */
@Injectable({providedIn: 'root'})
export class FocusMonitor implements OnDestroy {
  /** The focus origin that the next focus event is a result of. */
  private _origin: FocusOrigin = null;

  /** The FocusOrigin of the last focus event tracked by the FocusMonitor. */
  private _lastFocusOrigin: FocusOrigin;

  /** Whether the window has just been focused. */
  private _windowFocused = false;

  /** The target of the last touch event. */
  private _lastTouchTarget: EventTarget | null;

  /** The timeout id of the touch timeout, used to cancel timeout later. */
  private _touchTimeoutId: number;

  /** The timeout id of the window focus timeout. */
  private _windowFocusTimeoutId: number;

  /** The timeout id of the origin clearing timeout. */
  private _originTimeoutId: number;

  /** Map of elements being monitored to their info. */
  private _elementInfo = new Map<HTMLElement, MonitoredElementInfo>();

  /** The number of elements currently being monitored. */
  private _monitoredElementCount = 0;

  /**
   * Event listener for `keydown` events on the document.
   * Needs to be an arrow function in order to preserve the context when it gets bound.
   */
  private _documentKeydownListener = () => {
    // On keydown record the origin and clear any touch event that may be in progress.
    this._lastTouchTarget = null;
    this._setOriginForCurrentEventQueue('keyboard');
  }

  /**
   * Event listener for `mousedown` events on the document.
   * Needs to be an arrow function in order to preserve the context when it gets bound.
   */
  private _documentMousedownListener = () => {
    // On mousedown record the origin only if there is not touch
    // target, since a mousedown can happen as a result of a touch event.
    if (!this._lastTouchTarget) {
      this._setOriginForCurrentEventQueue('mouse');
    }
  }

  /**
   * Event listener for `touchstart` events on the document.
   * Needs to be an arrow function in order to preserve the context when it gets bound.
   */
  private _documentTouchstartListener = (event: TouchEvent) => {
    // When the touchstart event fires the focus event is not yet in the event queue. This means
    // we can't rely on the trick used above (setting timeout of 1ms). Instead we wait 650ms to
    // see if a focus happens.
    if (this._touchTimeoutId != null) {
      clearTimeout(this._touchTimeoutId);
    }
    this._lastTouchTarget = event.target;
    this._touchTimeoutId = setTimeout(() => this._lastTouchTarget = null, TOUCH_BUFFER_MS);
  }

  /**
   * Event listener for `focus` events on the window.
   * Needs to be an arrow function in order to preserve the context when it gets bound.
   */
  private _windowFocusListener = () => {
    // Make a note of when the window regains focus, so we can
    // restore the origin info for the focused element.
    this._windowFocused = true;
    this._windowFocusTimeoutId = setTimeout(() => this._windowFocused = false);
  }

  constructor(private _ngZone: NgZone, private _platform: Platform) {}

  /**
   * Monitors focus on an element and applies appropriate CSS classes.
   * @param element The element to monitor
   * @param checkChildren Whether to count the element as focused when its children are focused.
   * @returns An observable that emits when the focus state of the element changes.
   *     When the element is blurred, null will be emitted.
   */
  monitor(element: HTMLElement, checkChildren?: boolean): Observable<FocusOrigin>;

  /**
   * Monitors focus on an element and applies appropriate CSS classes.
   * @param element The element to monitor
   * @param checkChildren Whether to count the element as focused when its children are focused.
   * @returns An observable that emits when the focus state of the element changes.
   *     When the element is blurred, null will be emitted.
   */
  monitor(element: ElementRef<HTMLElement>, checkChildren?: boolean): Observable<FocusOrigin>;

  monitor(element: HTMLElement | ElementRef<HTMLElement>,
          checkChildren: boolean = false): Observable<FocusOrigin> {
    // Do nothing if we're not on the browser platform.
    if (!this._platform.isBrowser) {
      return observableOf(null);
    }

    const nativeElement = coerceElement(element);

    // Check if we're already monitoring this element.
    if (this._elementInfo.has(nativeElement)) {
      let cachedInfo = this._elementInfo.get(nativeElement);
      cachedInfo!.checkChildren = checkChildren;
      return cachedInfo!.subject.asObservable();
    }

    // Create monitored element info.
    let info: MonitoredElementInfo = {
      unlisten: () => {},
      checkChildren: checkChildren,
      subject: new Subject<FocusOrigin>()
    };
    this._elementInfo.set(nativeElement, info);
    this._incrementMonitoredElementCount();

    // Start listening. We need to listen in capture phase since focus events don't bubble.
    let focusListener = (event: FocusEvent) => this._onFocus(event, nativeElement);
    let blurListener = (event: FocusEvent) => this._onBlur(event, nativeElement);
    this._ngZone.runOutsideAngular(() => {
      nativeElement.addEventListener('focus', focusListener, true);
      nativeElement.addEventListener('blur', blurListener, true);
    });

    // Create an unlisten function for later.
    info.unlisten = () => {
      nativeElement.removeEventListener('focus', focusListener, true);
      nativeElement.removeEventListener('blur', blurListener, true);
    };

    return info.subject.asObservable();
  }

  /**
   * Stops monitoring an element and removes all focus classes.
   * @param element The element to stop monitoring.
   */
  stopMonitoring(element: HTMLElement): void;

  /**
   * Stops monitoring an element and removes all focus classes.
   * @param element The element to stop monitoring.
   */
  stopMonitoring(element: ElementRef<HTMLElement>): void;

  stopMonitoring(element: HTMLElement | ElementRef<HTMLElement>): void {
    const nativeElement = coerceElement(element);
    const elementInfo = this._elementInfo.get(nativeElement);

    if (elementInfo) {
      elementInfo.unlisten();
      elementInfo.subject.complete();

      this._setClasses(nativeElement);
      this._elementInfo.delete(nativeElement);
      this._decrementMonitoredElementCount();
    }
  }

  /**
   * Focuses the element via the specified focus origin.
   * @param element Element to focus.
   * @param origin Focus origin.
   * @param options Options that can be used to configure the focus behavior.
   */
  focusVia(element: HTMLElement, origin: FocusOrigin, options?: FocusOptions): void;

  /**
   * Focuses the element via the specified focus origin.
   * @param element Element to focus.
   * @param origin Focus origin.
   * @param options Options that can be used to configure the focus behavior.
   */
  focusVia(element: ElementRef<HTMLElement>, origin: FocusOrigin, options?: FocusOptions): void;

  focusVia(element: HTMLElement | ElementRef<HTMLElement>,
          origin: FocusOrigin,
          options?: FocusOptions): void {

    const nativeElement = coerceElement(element);

    this._setOriginForCurrentEventQueue(origin);

    // `focus` isn't available on the server
    if (typeof nativeElement.focus === 'function') {
      // Cast the element to `any`, because the TS typings don't have the `options` parameter yet.
      (nativeElement as any).focus(options);
    }
  }

  ngOnDestroy() {
    this._elementInfo.forEach((_info, element) => this.stopMonitoring(element));
  }

  private _toggleClass(element: Element, className: string, shouldSet: boolean) {
    if (shouldSet) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }

  /**
   * Sets the focus classes on the element based on the given focus origin.
   * @param element The element to update the classes on.
   * @param origin The focus origin.
   */
  private _setClasses(element: HTMLElement, origin?: FocusOrigin): void {
    const elementInfo = this._elementInfo.get(element);

    if (elementInfo) {
      this._toggleClass(element, 'cdk-focused', !!origin);
      this._toggleClass(element, 'cdk-touch-focused', origin === 'touch');
      this._toggleClass(element, 'cdk-keyboard-focused', origin === 'keyboard');
      this._toggleClass(element, 'cdk-mouse-focused', origin === 'mouse');
      this._toggleClass(element, 'cdk-program-focused', origin === 'program');
    }
  }

  /**
   * Sets the origin and schedules an async function to clear it at the end of the event queue.
   * @param origin The origin to set.
   */
  private _setOriginForCurrentEventQueue(origin: FocusOrigin): void {
    this._ngZone.runOutsideAngular(() => {
      this._origin = origin;
      // Sometimes the focus origin won't be valid in Firefox because Firefox seems to focus *one*
      // tick after the interaction event fired. To ensure the focus origin is always correct,
      // the focus origin will be determined at the beginning of the next tick.
      this._originTimeoutId = setTimeout(() => this._origin = null, 1);
    });
  }

  /**
   * Checks whether the given focus event was caused by a touchstart event.
   * @param event The focus event to check.
   * @returns Whether the event was caused by a touch.
   */
  private _wasCausedByTouch(event: FocusEvent): boolean {
    // Note(mmalerba): This implementation is not quite perfect, there is a small edge case.
    // Consider the following dom structure:
    //
    // <div #parent tabindex="0" cdkFocusClasses>
    //   <div #child (click)="#parent.focus()"></div>
    // </div>
    //
    // If the user touches the #child element and the #parent is programmatically focused as a
    // result, this code will still consider it to have been caused by the touch event and will
    // apply the cdk-touch-focused class rather than the cdk-program-focused class. This is a
    // relatively small edge-case that can be worked around by using
    // focusVia(parentEl, 'program') to focus the parent element.
    //
    // If we decide that we absolutely must handle this case correctly, we can do so by listening
    // for the first focus event after the touchstart, and then the first blur event after that
    // focus event. When that blur event fires we know that whatever follows is not a result of the
    // touchstart.
    let focusTarget = event.target;
    return this._lastTouchTarget instanceof Node && focusTarget instanceof Node &&
        (focusTarget === this._lastTouchTarget || focusTarget.contains(this._lastTouchTarget));
  }

  /**
   * Handles focus events on a registered element.
   * @param event The focus event.
   * @param element The monitored element.
   */
  private _onFocus(event: FocusEvent, element: HTMLElement) {
    // NOTE(mmalerba): We currently set the classes based on the focus origin of the most recent
    // focus event affecting the monitored element. If we want to use the origin of the first event
    // instead we should check for the cdk-focused class here and return if the element already has
    // it. (This only matters for elements that have includesChildren = true).

    // If we are not counting child-element-focus as focused, make sure that the event target is the
    // monitored element itself.
    const elementInfo = this._elementInfo.get(element);
    if (!elementInfo || (!elementInfo.checkChildren && element !== event.target)) {
      return;
    }

    // If we couldn't detect a cause for the focus event, it's due to one of three reasons:
    // 1) The window has just regained focus, in which case we want to restore the focused state of
    //    the element from before the window blurred.
    // 2) It was caused by a touch event, in which case we mark the origin as 'touch'.
    // 3) The element was programmatically focused, in which case we should mark the origin as
    //    'program'.
    let origin = this._origin;
    if (!origin) {
      if (this._windowFocused && this._lastFocusOrigin) {
        origin = this._lastFocusOrigin;
      } else if (this._wasCausedByTouch(event)) {
        origin = 'touch';
      } else {
        origin = 'program';
      }
    }

    this._setClasses(element, origin);
    this._emitOrigin(elementInfo.subject, origin);
    this._lastFocusOrigin = origin;
  }

  /**
   * Handles blur events on a registered element.
   * @param event The blur event.
   * @param element The monitored element.
   */
  _onBlur(event: FocusEvent, element: HTMLElement) {
    // If we are counting child-element-focus as focused, make sure that we aren't just blurring in
    // order to focus another child of the monitored element.
    const elementInfo = this._elementInfo.get(element);

    if (!elementInfo || (elementInfo.checkChildren && event.relatedTarget instanceof Node &&
        element.contains(event.relatedTarget))) {
      return;
    }

    this._setClasses(element);
    this._emitOrigin(elementInfo.subject, null);
  }

  private _emitOrigin(subject: Subject<FocusOrigin>, origin: FocusOrigin) {
    this._ngZone.run(() => subject.next(origin));
  }

  private _incrementMonitoredElementCount() {
    // Register global listeners when first element is monitored.
    if (++this._monitoredElementCount == 1 && this._platform.isBrowser) {
      // Note: we listen to events in the capture phase so we
      // can detect them even if the user stops propagation.
      this._ngZone.runOutsideAngular(() => {
        document.addEventListener('keydown', this._documentKeydownListener,
          captureEventListenerOptions);
        document.addEventListener('mousedown', this._documentMousedownListener,
          captureEventListenerOptions);
        document.addEventListener('touchstart', this._documentTouchstartListener,
          captureEventListenerOptions);
        window.addEventListener('focus', this._windowFocusListener);
      });
    }
  }

  private _decrementMonitoredElementCount() {
    // Unregister global listeners when last element is unmonitored.
    if (!--this._monitoredElementCount) {
      document.removeEventListener('keydown', this._documentKeydownListener,
        captureEventListenerOptions);
      document.removeEventListener('mousedown', this._documentMousedownListener,
        captureEventListenerOptions);
      document.removeEventListener('touchstart', this._documentTouchstartListener,
        captureEventListenerOptions);
      window.removeEventListener('focus', this._windowFocusListener);

      // Clear timeouts for all potentially pending timeouts to prevent the leaks.
      clearTimeout(this._windowFocusTimeoutId);
      clearTimeout(this._touchTimeoutId);
      clearTimeout(this._originTimeoutId);
    }
  }
}


/**
 * Directive that determines how a particular element was focused (via keyboard, mouse, touch, or
 * programmatically) and adds corresponding classes to the element.
 *
 * There are two variants of this directive:
 * 1) cdkMonitorElementFocus: does not consider an element to be focused if one of its children is
 *    focused.
 * 2) cdkMonitorSubtreeFocus: considers an element focused if it or any of its children are focused.
 */
@Directive({
  selector: '[cdkMonitorElementFocus], [cdkMonitorSubtreeFocus]',
})
export class CdkMonitorFocus implements OnDestroy {
  private _monitorSubscription: Subscription;
  @Output() cdkFocusChange = new EventEmitter<FocusOrigin>();

  constructor(private _elementRef: ElementRef<HTMLElement>, private _focusMonitor: FocusMonitor) {
    this._monitorSubscription = this._focusMonitor.monitor(
        this._elementRef,
        this._elementRef.nativeElement.hasAttribute('cdkMonitorSubtreeFocus'))
        .subscribe(origin => this.cdkFocusChange.emit(origin));
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef);
    this._monitorSubscription.unsubscribe();
  }
}

/** @docs-private @deprecated @breaking-change 8.0.0 */
export function FOCUS_MONITOR_PROVIDER_FACTORY(
    parentDispatcher: FocusMonitor, ngZone: NgZone, platform: Platform) {
  return parentDispatcher || new FocusMonitor(ngZone, platform);
}

/** @docs-private @deprecated @breaking-change 8.0.0 */
export const FOCUS_MONITOR_PROVIDER = {
  // If there is already a FocusMonitor available, use that. Otherwise, provide a new one.
  provide: FocusMonitor,
  deps: [[new Optional(), new SkipSelf(), FocusMonitor], NgZone, Platform],
  useFactory: FOCUS_MONITOR_PROVIDER_FACTORY
};
