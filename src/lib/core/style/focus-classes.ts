import {Directive, Injectable, Optional, SkipSelf, Renderer, ElementRef} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';


export type FocusOrigin = 'mouse' | 'keyboard' | 'program';


/** Monitors mouse and keyboard events to determine the cause of focus events. */
@Injectable()
export class FocusOriginMonitor {
  /** The focus origin that the next focus event is a result of. */
  private _origin: FocusOrigin = null;

  /** The FocusOrigin of the last focus event tracked by the FocusOriginMonitor. */
  private _lastFocusOrigin: FocusOrigin;

  /** Whether the window has just been focused. */
  private _windowFocused = false;

  constructor() {
    // Listen to keydown and mousedown in the capture phase so we can detect them even if the user
    // stops propagation.
    // TODO(mmalerba): Figure out how to handle touchstart
    document.addEventListener(
        'keydown', () => this._setOriginForCurrentEventQueue('keyboard'), true);
    document.addEventListener(
        'mousedown', () => this._setOriginForCurrentEventQueue('mouse'), true);

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
    renderer.listen(element, 'focus', () => this._onFocus(element, renderer, subject));
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

  /** Handles focus events on a registered element. */
  private _onFocus(element: Element, renderer: Renderer, subject: Subject<FocusOrigin>) {
    // If we couldn't detect a cause for the focus event, it's due to one of two reasons:
    // 1) The window has just regained focus, in which case we want to restore the focused state of
    //    the element from before the window blurred.
    // 2) The element was programmatically focused, in which case we should mark the origin as
    //    'program'.
    if (!this._origin) {
      if (this._windowFocused && this._lastFocusOrigin) {
        this._origin = this._lastFocusOrigin;
      } else {
        this._origin = 'program';
      }
    }

    renderer.setElementClass(element, 'cdk-focused', true);
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
