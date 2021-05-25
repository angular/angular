/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform, normalizePassiveListenerOptions, _getShadowRoot} from '@angular/cdk/platform';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Injectable,
  InjectionToken,
  NgZone,
  OnDestroy,
  Optional,
  Output,
  AfterViewInit,
} from '@angular/core';
import {Observable, of as observableOf, Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {coerceElement} from '@angular/cdk/coercion';
import {DOCUMENT} from '@angular/common';
import {
  getTarget,
  InputModalityDetector,
  TOUCH_BUFFER_MS,
} from '../input-modality/input-modality-detector';


export type FocusOrigin = 'touch' | 'mouse' | 'keyboard' | 'program' | null;

/**
 * Corresponds to the options that can be passed to the native `focus` event.
 * via https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
 */
export interface FocusOptions {
  /** Whether the browser should scroll to the element when it is focused. */
  preventScroll?: boolean;
}

/** Detection mode used for attributing the origin of a focus event. */
export const enum FocusMonitorDetectionMode {
  /**
   * Any mousedown, keydown, or touchstart event that happened in the previous
   * tick or the current tick will be used to assign a focus event's origin (to
   * either mouse, keyboard, or touch). This is the default option.
   */
  IMMEDIATE,
  /**
   * A focus event's origin is always attributed to the last corresponding
   * mousedown, keydown, or touchstart event, no matter how long ago it occurred.
   */
  EVENTUAL
}

/** Injectable service-level options for FocusMonitor. */
export interface FocusMonitorOptions {
  detectionMode?: FocusMonitorDetectionMode;
}

/** InjectionToken for FocusMonitorOptions. */
export const FOCUS_MONITOR_DEFAULT_OPTIONS =
    new InjectionToken<FocusMonitorOptions>('cdk-focus-monitor-default-options');

type MonitoredElementInfo = {
  checkChildren: boolean,
  readonly subject: Subject<FocusOrigin>,
  rootNode: HTMLElement|ShadowRoot|Document
};

/**
 * Event listener options that enable capturing and also
 * mark the listener as passive if the browser supports it.
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

  /** The timeout id of the window focus timeout. */
  private _windowFocusTimeoutId: number;

  /** The timeout id of the origin clearing timeout. */
  private _originTimeoutId: number;

  /**
   * Whether the origin was determined via a touch interaction. Necessary as properly attributing
   * focus events to touch interactions requires special logic.
   */
  private _originFromTouchInteraction = false;

  /** Map of elements being monitored to their info. */
  private _elementInfo = new Map<HTMLElement, MonitoredElementInfo>();

  /** The number of elements currently being monitored. */
  private _monitoredElementCount = 0;

  /**
   * Keeps track of the root nodes to which we've currently bound a focus/blur handler,
   * as well as the number of monitored elements that they contain. We have to treat focus/blur
   * handlers differently from the rest of the events, because the browser won't emit events
   * to the document when focus moves inside of a shadow root.
   */
  private _rootNodeFocusListenerCount = new Map<HTMLElement|Document|ShadowRoot, number>();

  /**
   * The specified detection mode, used for attributing the origin of a focus
   * event.
   */
  private readonly _detectionMode: FocusMonitorDetectionMode;

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

  /** Used to reference correct document/window */
  protected _document?: Document;

  /** Subject for stopping our InputModalityDetector subscription. */
  private readonly _stopInputModalityDetector = new Subject<void>();

  constructor(
      private _ngZone: NgZone,
      private _platform: Platform,
      private readonly _inputModalityDetector: InputModalityDetector,
      /** @breaking-change 11.0.0 make document required */
      @Optional() @Inject(DOCUMENT) document: any|null,
      @Optional() @Inject(FOCUS_MONITOR_DEFAULT_OPTIONS) options:
          FocusMonitorOptions|null) {
    this._document = document;
    this._detectionMode = options?.detectionMode || FocusMonitorDetectionMode.IMMEDIATE;
  }
  /**
   * Event listener for `focus` and 'blur' events on the document.
   * Needs to be an arrow function in order to preserve the context when it gets bound.
   */
  private _rootNodeFocusAndBlurListener = (event: Event) => {
    const target = getTarget(event);
    const handler = event.type === 'focus' ? this._onFocus : this._onBlur;

    // We need to walk up the ancestor chain in order to support `checkChildren`.
    for (let element = target; element; element = element.parentElement) {
      handler.call(this, event as FocusEvent, element);
    }
  }

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
    const nativeElement = coerceElement(element);

    // Do nothing if we're not on the browser platform or the passed in node isn't an element.
    if (!this._platform.isBrowser || nativeElement.nodeType !== 1) {
      return observableOf(null);
    }

    // If the element is inside the shadow DOM, we need to bind our focus/blur listeners to
    // the shadow root, rather than the `document`, because the browser won't emit focus events
    // to the `document`, if focus is moving within the same shadow root.
    const rootNode = _getShadowRoot(nativeElement) || this._getDocument();
    const cachedInfo = this._elementInfo.get(nativeElement);

    // Check if we're already monitoring this element.
    if (cachedInfo) {
      if (checkChildren) {
        // TODO(COMP-318): this can be problematic, because it'll turn all non-checkChildren
        // observers into ones that behave as if `checkChildren` was turned on. We need a more
        // robust solution.
        cachedInfo.checkChildren = true;
      }

      return cachedInfo.subject;
    }

    // Create monitored element info.
    const info: MonitoredElementInfo = {
      checkChildren: checkChildren,
      subject: new Subject<FocusOrigin>(),
      rootNode
    };
    this._elementInfo.set(nativeElement, info);
    this._registerGlobalListeners(info);

    return info.subject;
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
      elementInfo.subject.complete();

      this._setClasses(nativeElement);
      this._elementInfo.delete(nativeElement);
      this._removeGlobalListeners(elementInfo);
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
    const focusedElement = this._getDocument().activeElement;

    // If the element is focused already, calling `focus` again won't trigger the event listener
    // which means that the focus classes won't be updated. If that's the case, update the classes
    // directly without waiting for an event.
    if (nativeElement === focusedElement) {
      this._getClosestElementsInfo(nativeElement)
        .forEach(([currentElement, info]) => this._originChanged(currentElement, origin, info));
    } else {
      this._setOrigin(origin);

      // `focus` isn't available on the server
      if (typeof nativeElement.focus === 'function') {
        nativeElement.focus(options);
      }
    }
  }

  ngOnDestroy() {
    this._elementInfo.forEach((_info, element) => this.stopMonitoring(element));
  }

  /** Access injected document if available or fallback to global document reference */
  private _getDocument(): Document {
    return this._document || document;
  }

  /** Use defaultView of injected document if available or fallback to global window reference */
  private _getWindow(): Window {
    const doc = this._getDocument();
    return doc.defaultView || window;
  }

  private _toggleClass(element: Element, className: string, shouldSet: boolean) {
    if (shouldSet) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }

  private _getFocusOrigin(focusEventTarget: HTMLElement | null): FocusOrigin {
    if (this._origin) {
      // If the origin was realized via a touch interaction, we need to perform additional checks
      // to determine whether the focus origin should be attributed to touch or program.
      if (this._originFromTouchInteraction) {
        return this._shouldBeAttributedToTouch(focusEventTarget) ? 'touch' : 'program';
      } else {
        return this._origin;
      }
    }

    // If the window has just regained focus, we can restore the most recent origin from before the
    // window blurred. Otherwise, we've reached the point where we can't identify the source of the
    // focus. This typically means one of two things happened:
    //
    // 1) The element was programmatically focused, or
    // 2) The element was focused via screen reader navigation (which generally doesn't fire
    //    events).
    //
    // Because we can't distinguish between these two cases, we default to setting `program`.
    return (this._windowFocused && this._lastFocusOrigin) ? this._lastFocusOrigin : 'program';
  }

  /**
   * Returns whether the focus event should be attributed to touch. Recall that in IMMEDIATE mode, a
   * touch origin isn't immediately reset at the next tick (see _setOrigin). This means that when we
   * handle a focus event following a touch interaction, we need to determine whether (1) the focus
   * event was directly caused by the touch interaction or (2) the focus event was caused by a
   * subsequent programmatic focus call triggered by the touch interaction.
   * @param focusEventTarget The target of the focus event under examination.
   */
  private _shouldBeAttributedToTouch(focusEventTarget: HTMLElement | null): boolean {
    // Please note that this check is not perfect. Consider the following edge case:
    //
    // <div #parent tabindex="0">
    //   <div #child tabindex="0" (click)="#parent.focus()"></div>
    // </div>
    //
    // Suppose there is a FocusMonitor in IMMEDIATE mode attached to #parent. When the user touches
    // #child, #parent is programmatically focused. This code will attribute the focus to touch
    // instead of program. This is a relatively minor edge-case that can be worked around by using
    // focusVia(parent, 'program') to focus #parent.
    return (this._detectionMode === FocusMonitorDetectionMode.EVENTUAL) ||
        !!focusEventTarget?.contains(this._inputModalityDetector._mostRecentTarget);
  }

  /**
   * Sets the focus classes on the element based on the given focus origin.
   * @param element The element to update the classes on.
   * @param origin The focus origin.
   */
  private _setClasses(element: HTMLElement, origin?: FocusOrigin): void {
    this._toggleClass(element, 'cdk-focused', !!origin);
    this._toggleClass(element, 'cdk-touch-focused', origin === 'touch');
    this._toggleClass(element, 'cdk-keyboard-focused', origin === 'keyboard');
    this._toggleClass(element, 'cdk-mouse-focused', origin === 'mouse');
    this._toggleClass(element, 'cdk-program-focused', origin === 'program');
  }

  /**
   * Updates the focus origin. If we're using immediate detection mode, we schedule an async
   * function to clear the origin at the end of a timeout. The duration of the timeout depends on
   * the origin being set.
   * @param origin The origin to set.
   * @param isFromInteraction Whether we are setting the origin from an interaction event.
   */
  private _setOrigin(origin: FocusOrigin, isFromInteraction = false): void {
    this._ngZone.runOutsideAngular(() => {
      this._origin = origin;
      this._originFromTouchInteraction = (origin === 'touch') && isFromInteraction;

      // If we're in IMMEDIATE mode, reset the origin at the next tick (or in `TOUCH_BUFFER_MS` ms
      // for a touch event). We reset the origin at the next tick because Firefox focuses one tick
      // after the interaction event. We wait `TOUCH_BUFFER_MS` ms before resetting the origin for
      // a touch event because when a touch event is fired, the associated focus event isn't yet in
      // the event queue. Before doing so, clear any pending timeouts.
      if (this._detectionMode === FocusMonitorDetectionMode.IMMEDIATE) {
        clearTimeout(this._originTimeoutId);
        const ms = this._originFromTouchInteraction ? TOUCH_BUFFER_MS : 1;
        this._originTimeoutId = setTimeout(() => this._origin = null, ms);
      }
    });
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
    const focusEventTarget = getTarget(event);
    if (!elementInfo || (!elementInfo.checkChildren && element !== focusEventTarget)) {
      return;
    }

    this._originChanged(element, this._getFocusOrigin(focusEventTarget), elementInfo);
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

  private _registerGlobalListeners(elementInfo: MonitoredElementInfo) {
    if (!this._platform.isBrowser) {
      return;
    }

    const rootNode = elementInfo.rootNode;
    const rootNodeFocusListeners = this._rootNodeFocusListenerCount.get(rootNode) || 0;

    if (!rootNodeFocusListeners) {
      this._ngZone.runOutsideAngular(() => {
        rootNode.addEventListener('focus', this._rootNodeFocusAndBlurListener,
          captureEventListenerOptions);
        rootNode.addEventListener('blur', this._rootNodeFocusAndBlurListener,
          captureEventListenerOptions);
      });
    }

    this._rootNodeFocusListenerCount.set(rootNode, rootNodeFocusListeners + 1);

    // Register global listeners when first element is monitored.
    if (++this._monitoredElementCount === 1) {
      // Note: we listen to events in the capture phase so we
      // can detect them even if the user stops propagation.
      this._ngZone.runOutsideAngular(() => {
        const window = this._getWindow();
        window.addEventListener('focus', this._windowFocusListener);
      });

      // The InputModalityDetector is also just a collection of global listeners.
      this._inputModalityDetector.modalityDetected
        .pipe(takeUntil(this._stopInputModalityDetector))
        .subscribe(modality => { this._setOrigin(modality, true /* isFromInteraction */); });
    }
  }

  private _removeGlobalListeners(elementInfo: MonitoredElementInfo) {
    const rootNode = elementInfo.rootNode;

    if (this._rootNodeFocusListenerCount.has(rootNode)) {
      const rootNodeFocusListeners = this._rootNodeFocusListenerCount.get(rootNode)!;

      if (rootNodeFocusListeners > 1) {
        this._rootNodeFocusListenerCount.set(rootNode, rootNodeFocusListeners - 1);
      } else {
        rootNode.removeEventListener('focus', this._rootNodeFocusAndBlurListener,
          captureEventListenerOptions);
        rootNode.removeEventListener('blur', this._rootNodeFocusAndBlurListener,
          captureEventListenerOptions);
        this._rootNodeFocusListenerCount.delete(rootNode);
      }
    }

    // Unregister global listeners when last element is unmonitored.
    if (!--this._monitoredElementCount) {
      const window = this._getWindow();
      window.removeEventListener('focus', this._windowFocusListener);

      // Equivalently, stop our InputModalityDetector subscription.
      this._stopInputModalityDetector.next();

      // Clear timeouts for all potentially pending timeouts to prevent the leaks.
      clearTimeout(this._windowFocusTimeoutId);
      clearTimeout(this._originTimeoutId);
    }
  }

  /** Updates all the state on an element once its focus origin has changed. */
  private _originChanged(element: HTMLElement, origin: FocusOrigin,
                         elementInfo: MonitoredElementInfo) {
    this._setClasses(element, origin);
    this._emitOrigin(elementInfo.subject, origin);
    this._lastFocusOrigin = origin;
  }

  /**
   * Collects the `MonitoredElementInfo` of a particular element and
   * all of its ancestors that have enabled `checkChildren`.
   * @param element Element from which to start the search.
   */
  private _getClosestElementsInfo(element: HTMLElement): [HTMLElement, MonitoredElementInfo][] {
    const results: [HTMLElement, MonitoredElementInfo][] = [];

    this._elementInfo.forEach((info, currentElement) => {
      if (currentElement === element || (info.checkChildren && currentElement.contains(element))) {
        results.push([currentElement, info]);
      }
    });

    return results;
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
export class CdkMonitorFocus implements AfterViewInit, OnDestroy {
  private _monitorSubscription: Subscription;
  @Output() readonly cdkFocusChange = new EventEmitter<FocusOrigin>();

  constructor(private _elementRef: ElementRef<HTMLElement>, private _focusMonitor: FocusMonitor) {}

  ngAfterViewInit() {
    const element = this._elementRef.nativeElement;
    this._monitorSubscription = this._focusMonitor.monitor(
      element,
      element.nodeType === 1 && element.hasAttribute('cdkMonitorSubtreeFocus'))
    .subscribe(origin => this.cdkFocusChange.emit(origin));
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef);

    if (this._monitorSubscription) {
      this._monitorSubscription.unsubscribe();
    }
  }
}
