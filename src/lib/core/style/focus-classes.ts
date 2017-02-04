import {Directive, Injectable, Optional, SkipSelf, Renderer, ElementRef} from '@angular/core';


export type FocusOrigin = 'mouse' | 'keyboard' | 'program';


/** Monitors mouse and keyboard events to determine the cause of focus events. */
@Injectable()
export class FocusOriginMonitor {
  /** The focus origin that the next focus event is a result of. */
  private _origin: FocusOrigin = null;

  constructor() {
    // Listen to keydown and mousedown in the capture phase so we can detect them even if the user
    // stops propagation.
    // TODO(mmalerba): Figure out how to handle touchstart
    document.addEventListener(
        'keydown', () => this._setOriginForCurrentEventQueue('keyboard'), true);
    document.addEventListener(
        'mousedown', () => this._setOriginForCurrentEventQueue('mouse'), true);
  }

  /** Register an element to receive focus classes. */
  registerElementForFocusClasses(element: Element, renderer: Renderer) {
    renderer.listen(element, 'focus', () => this._onFocus(element, renderer));
    renderer.listen(element, 'blur', () => this._onBlur(element, renderer));
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
  private _onFocus(element: Element, renderer: Renderer) {
    renderer.setElementClass(element, 'cdk-focused', true);
    renderer.setElementClass(element, 'cdk-keyboard-focused', this._origin == 'keyboard');
    renderer.setElementClass(element, 'cdk-mouse-focused', this._origin == 'mouse');
    renderer.setElementClass(element, 'cdk-program-focused',
        !this._origin || this._origin == 'program');
    this._origin = null;
  }

  /** Handles blur events on a registered element. */
  private _onBlur(element: Element, renderer: Renderer) {
    renderer.setElementClass(element, 'cdk-focused', false);
    renderer.setElementClass(element, 'cdk-keyboard-focused', false);
    renderer.setElementClass(element, 'cdk-mouse-focused', false);
    renderer.setElementClass(element, 'cdk-program-focused', false);
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
  constructor(elementRef: ElementRef, focusOriginMonitor: FocusOriginMonitor, renderer: Renderer) {
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
