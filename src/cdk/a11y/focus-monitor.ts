/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform, supportsPassiveEventListeners} from '@angular/cdk/platform';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Injectable,
  NgZone,
  OnDestroy,
  Optional,
  Output,
  Renderer2,
  SkipSelf,
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {of as observableOf} from 'rxjs/observable/of';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';


// This is the value used by AngularJS Material. Through trial and error (on iPhone 6S) they found
// that a value of around 650ms seems appropriate.
export const TOUCH_BUFFER_MS = 650;


export type FocusOrigin = 'touch' | 'mouse' | 'keyboard' | 'program' | null;


type MonitoredElementInfo = {
  unlisten: Function,
  checkChildren: boolean,
  subject: Subject<FocusOrigin>
};


/** Monitors mouse and keyboard events to determine the cause of focus events. */
@Injectable()
export class FocusMonitor {
  /** The focus origin that the next focus event is a result of. */
  private _origin: FocusOrigin = null;

  /** The FocusOrigin of the last focus event tracked by the FocusMonitor. */
  private _lastFocusOrigin: FocusOrigin;

  /** Whether the window has just been focused. */
  private _windowFocused = false;

  /** The target of the last touch event. */
  private _lastTouchTarget: EventTarget | null;

  /** The timeout id of the touch timeout, used to cancel timeout later. */
  private _touchTimeout: number;

  /** Weak map of elements being monitored to their info. */
  private _elementInfo = new WeakMap<Element, MonitoredElementInfo>();

  /** A map of global objects to lists of current listeners. */
  private _unregisterGlobalListeners = () => {};

  /** The number of elements currently being monitored. */
  private _monitoredElementCount = 0;

  constructor(private _ngZone: NgZone, private _platform: Platform) {}

  /**
   * @docs-private
   * @deprecated renderer param no longer needed.
   */
  monitor(element: HTMLElement, renderer: Renderer2, checkChildren: boolean):
      Observable<FocusOrigin>;
  /**
   * Monitors focus on an element and applies appropriate CSS classes.
   * @param element The element to monitor
   * @param checkChildren Whether to count the element as focused when its children are focused.
   * @returns An observable that emits when the focus state of the element changes.
   *     When the element is blurred, null will be emitted.
   */
  monitor(element: HTMLElement, checkChildren: boolean): Observable<FocusOrigin>;
  monitor(
      element: HTMLElement,
      renderer: Renderer2 | boolean,
      checkChildren?: boolean): Observable<FocusOrigin> {
    // TODO(mmalerba): clean up after deprecated signature is removed.
    if (!(renderer instanceof Renderer2)) {
      checkChildren = renderer;
    }
    checkChildren = !!checkChildren;

    // Do nothing if we're not on the browser platform.
    if (!this._platform.isBrowser) {
      return observableOf(null);
    }
    // Check if we're already monitoring this element.
    if (this._elementInfo.has(element)) {
      let cachedInfo = this._elementInfo.get(element);
      cachedInfo!.checkChildren = checkChildren;
      return cachedInfo!.subject.asObservable();
    }

    // Create monitored element info.
    let info: MonitoredElementInfo = {
      unlisten: () => {},
      checkChildren: checkChildren,
      subject: new Subject<FocusOrigin>()
    };
    this._elementInfo.set(element, info);
    this._incrementMonitoredElementCount();

    // Start listening. We need to listen in capture phase since focus events don't bubble.
    let focusListener = (event: FocusEvent) => this._onFocus(event, element);
    let blurListener = (event: FocusEvent) => this._onBlur(event, element);
    this._ngZone.runOutsideAngular(() => {
      element.addEventListener('focus', focusListener, true);
      element.addEventListener('blur', blurListener, true);
    });

    // Create an unlisten function for later.
    info.unlisten = () => {
      element.removeEventListener('focus', focusListener, true);
      element.removeEventListener('blur', blurListener, true);
    };

    return info.subject.asObservable();
  }

  /**
   * Stops monitoring an element and removes all focus classes.
   * @param element The element to stop monitoring.
   */
  stopMonitoring(element: HTMLElement): void {
    let elementInfo = this._elementInfo.get(element);

    if (elementInfo) {
      elementInfo.unlisten();
      elementInfo.subject.complete();

      this._setClasses(element);
      this._elementInfo.delete(element);
      this._decrementMonitoredElementCount();
    }
  }

  /**
   * Focuses the element via the specified focus origin.
   * @param element The element to focus.
   * @param origin The focus origin.
   */
  focusVia(element: HTMLElement, origin: FocusOrigin): void {
    this._setOriginForCurrentEventQueue(origin);
    element.focus();
  }

  /** Register necessary event listeners on the document and window. */
  private _registerGlobalListeners() {
    // Do nothing if we're not on the browser platform.
    if (!this._platform.isBrowser) {
      return;
    }

    // On keydown record the origin and clear any touch event that may be in progress.
    let documentKeydownListener = () => {
      this._lastTouchTarget = null;
      this._setOriginForCurrentEventQueue('keyboard');
    };

    // On mousedown record the origin only if there is not touch target, since a mousedown can
    // happen as a result of a touch event.
    let documentMousedownListener = () => {
      if (!this._lastTouchTarget) {
        this._setOriginForCurrentEventQueue('mouse');
      }
    };

    // When the touchstart event fires the focus event is not yet in the event queue. This means
    // we can't rely on the trick used above (setting timeout of 0ms). Instead we wait 650ms to
    // see if a focus happens.
    let documentTouchstartListener = (event: TouchEvent) => {
      if (this._touchTimeout != null) {
        clearTimeout(this._touchTimeout);
      }
      this._lastTouchTarget = event.target;
      this._touchTimeout = setTimeout(() => this._lastTouchTarget = null, TOUCH_BUFFER_MS);
    };

    // Make a note of when the window regains focus, so we can restore the origin info for the
    // focused element.
    let windowFocusListener = () => {
      this._windowFocused = true;
      setTimeout(() => this._windowFocused = false, 0);
    };

    // Note: we listen to events in the capture phase so we can detect them even if the user stops
    // propagation.
    this._ngZone.runOutsideAngular(() => {
      document.addEventListener('keydown', documentKeydownListener, true);
      document.addEventListener('mousedown', documentMousedownListener, true);
      document.addEventListener('touchstart', documentTouchstartListener,
          supportsPassiveEventListeners() ? ({passive: true, capture: true} as any) : true);
      window.addEventListener('focus', windowFocusListener);
    });

    this._unregisterGlobalListeners = () => {
      document.removeEventListener('keydown', documentKeydownListener, true);
      document.removeEventListener('mousedown', documentMousedownListener, true);
      document.removeEventListener('touchstart', documentTouchstartListener,
          supportsPassiveEventListeners() ? ({passive: true, capture: true} as any) : true);
      window.removeEventListener('focus', windowFocusListener);
    };
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
    this._origin = origin;
    setTimeout(() => this._origin = null, 0);
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
    if (!this._origin) {
      if (this._windowFocused && this._lastFocusOrigin) {
        this._origin = this._lastFocusOrigin;
      } else if (this._wasCausedByTouch(event)) {
        this._origin = 'touch';
      } else {
        this._origin = 'program';
      }
    }

    this._setClasses(element, this._origin);
    elementInfo.subject.next(this._origin);
    this._lastFocusOrigin = this._origin;
    this._origin = null;
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
    elementInfo.subject.next(null);
  }

  private _incrementMonitoredElementCount() {
    // Register global listeners when first element is monitored.
    if (++this._monitoredElementCount == 1) {
      this._registerGlobalListeners();
    }
  }

  private _decrementMonitoredElementCount() {
    // Unregister global listeners when last element is unmonitored.
    if (!--this._monitoredElementCount) {
      this._unregisterGlobalListeners();
      this._unregisterGlobalListeners = () => {};
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

  constructor(private _elementRef: ElementRef, private _focusMonitor: FocusMonitor) {
    this._monitorSubscription = this._focusMonitor.monitor(
        this._elementRef.nativeElement,
        this._elementRef.nativeElement.hasAttribute('cdkMonitorSubtreeFocus'))
        .subscribe(origin => this.cdkFocusChange.emit(origin));
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
    this._monitorSubscription.unsubscribe();
  }
}

/** @docs-private */
export function FOCUS_MONITOR_PROVIDER_FACTORY(
    parentDispatcher: FocusMonitor, ngZone: NgZone, platform: Platform) {
  return parentDispatcher || new FocusMonitor(ngZone, platform);
}

/** @docs-private */
export const FOCUS_MONITOR_PROVIDER = {
  // If there is already a FocusMonitor available, use that. Otherwise, provide a new one.
  provide: FocusMonitor,
  deps: [[new Optional(), new SkipSelf(), FocusMonitor], NgZone, Platform],
  useFactory: FOCUS_MONITOR_PROVIDER_FACTORY
};
