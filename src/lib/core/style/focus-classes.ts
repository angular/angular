import {Directive, Injectable, Optional, SkipSelf, Renderer, ElementRef} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';


// This is the value used by AngularJS Material. Through trial and error (on iPhone 6S) they found
// that a value of around 650ms seems appropriate.
export const TOUCH_BUFFER_MS = 650;


export type FocusOrigin = 'touch' | 'mouse' | 'keyboard' | 'program';


/** Monitors mouse and keyboard events to determine the cause of focus events. */
@Injectable()
export class FocusOriginMonitor {
  /** The focus origin that the next focus event is a result of. */
  private _origin: FocusOrigin = null;

  /** The FocusOrigin of the last focus event tracked by the FocusOriginMonitor. */
  private _lastFocusOrigin: FocusOrigin;

  /** Whether the window has just been focused. */
  private _windowFocused = false;

  /** The target of the last touch event. */
  private _lastTouchTarget: EventTarget;

  /** The timeout id of the touch timeout, used to cancel timeout later. */
  private _touchTimeout: number;

  constructor() {
    // Note: we listen to events in the capture phase so we can detect them even if the user stops
    // propagation.

    // On keydown record the origin and clear any touch event that may be in progress.
    document.addEventListener('keydown', () => {
      this._lastTouchTarget = null;
      this._setOriginForCurrentEventQueue('keyboard');
    }, true);

    // On mousedown record the origin only if there is not touch target, since a mousedown can
    // happen as a result of a touch event.
    document.addEventListener('mousedown', () => {
      if (!this._lastTouchTarget) {
        this._setOriginForCurrentEventQueue('mouse');
      }
    }, true);

    // When the touchstart event fires the focus event is not yet in the event queue. This means we
    // can't rely on the trick used above (setting timeout of 0ms). Instead we wait 650ms to see if
    // a focus happens.
    document.addEventListener('touchstart', (event: Event) => {
      if (this._touchTimeout != null) {
        clearTimeout(this._touchTimeout);
      }
      this._lastTouchTarget = event.target;
      this._touchTimeout = setTimeout(() => this._lastTouchTarget = null, TOUCH_BUFFER_MS);
    }, true);

    // Make a note of when the window regains focus, so we can restore the origin info for the
    // focused element.
    window.addEventListener('focus', () => {
      this._windowFocused = true;
      setTimeout(() => this._windowFocused = false, 0);
    });
  }

  /** Register an element to receive focus classes. */
  registerElementForFocusClasses(element: Element, renderer: Renderer): Observable<FocusOrigin> {
    let subject = new Subject<FocusOrigin>();
    renderer.listen(element, 'focus',
        (event: Event) => this._onFocus(event, element, renderer, subject));
    renderer.listen(element, 'blur', () => this._onBlur(element, renderer, subject));
    return subject.asObservable();
  }

  /** Focuses the element via the specified focus origin. */
  focusVia(element: Node, renderer: Renderer, origin: FocusOrigin) {
    this._setOriginForCurrentEventQueue(origin);
    renderer.invokeElementMethod(element, 'focus');
  }

  /** Sets the origin and schedules an async function to clear it at the end of the event queue. */
  private _setOriginForCurrentEventQueue(origin: FocusOrigin) {
    this._origin = origin;
    setTimeout(() => this._origin = null, 0);
  }

  /** Checks whether the given focus event was caused by a touchstart event. */
  private _wasCausedByTouch(event: Event): boolean {
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
    // focusVia(parentEl, renderer,  'program') to focus the parent element.
    //
    // If we decide that we absolutely must handle this case correctly, we can do so by listening
    // for the first focus event after the touchstart, and then the first blur event after that
    // focus event. When that blur event fires we know that whatever follows is not a result of the
    // touchstart.
    let focusTarget = event.target;
    return this._lastTouchTarget instanceof Node && focusTarget instanceof Node &&
        (focusTarget == this._lastTouchTarget || focusTarget.contains(this._lastTouchTarget));
  }

  /** Handles focus events on a registered element. */
  private _onFocus(event: Event, element: Element, renderer: Renderer,
                   subject: Subject<FocusOrigin>) {
    // If we couldn't detect a cause for the focus event, it's due to one of two reasons:
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

    renderer.setElementClass(element, 'cdk-focused', true);
    renderer.setElementClass(element, 'cdk-touch-focused', this._origin == 'touch');
    renderer.setElementClass(element, 'cdk-keyboard-focused', this._origin == 'keyboard');
    renderer.setElementClass(element, 'cdk-mouse-focused', this._origin == 'mouse');
    renderer.setElementClass(element, 'cdk-program-focused', this._origin == 'program');
    subject.next(this._origin);

    this._lastFocusOrigin = this._origin;
    this._origin = null;
  }

  /** Handles blur events on a registered element. */
  private _onBlur(element: Element, renderer: Renderer, subject: Subject<FocusOrigin>) {
    renderer.setElementClass(element, 'cdk-focused', false);
    renderer.setElementClass(element, 'cdk-touch-focused', false);
    renderer.setElementClass(element, 'cdk-keyboard-focused', false);
    renderer.setElementClass(element, 'cdk-mouse-focused', false);
    renderer.setElementClass(element, 'cdk-program-focused', false);
    subject.next(null);
  }
}


/**
 * Directive that determines how a particular element was focused (via keyboard, mouse, or
 * programmatically) and adds corresponding classes to the element.
 */
@Directive({
  selector: '[cdkFocusClasses]',
})
export class CdkFocusClasses {
  changes: Observable<FocusOrigin>;

  constructor(elementRef: ElementRef, focusOriginMonitor: FocusOriginMonitor, renderer: Renderer) {
    this.changes =
        focusOriginMonitor.registerElementForFocusClasses(elementRef.nativeElement, renderer);
  }
}


export function FOCUS_ORIGIN_MONITOR_PROVIDER_FACTORY(parentDispatcher: FocusOriginMonitor) {
  return parentDispatcher || new FocusOriginMonitor();
}


export const FOCUS_ORIGIN_MONITOR_PROVIDER = {
  // If there is already a FocusOriginMonitor available, use that. Otherwise, provide a new one.
  provide: FocusOriginMonitor,
  deps: [[new Optional(), new SkipSelf(), FocusOriginMonitor]],
  useFactory: FOCUS_ORIGIN_MONITOR_PROVIDER_FACTORY
};
