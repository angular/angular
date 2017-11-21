/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  AfterContentInit,
  Injectable,
  Inject,
} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {take} from 'rxjs/operators/take';
import {InteractivityChecker} from './interactivity-checker';
import {DOCUMENT} from '@angular/common';


/**
 * Class that allows for trapping focus within a DOM element.
 *
 * This class currently uses a relatively simple approach to focus trapping.
 * It assumes that the tab order is the same as DOM order, which is not necessarily true.
 * Things like tabIndex > 0, flex `order`, and shadow roots can cause to two to misalign.
 */
export class FocusTrap {
  private _startAnchor: HTMLElement | null;
  private _endAnchor: HTMLElement | null;

  /** Whether the focus trap is active. */
  get enabled(): boolean { return this._enabled; }
  set enabled(val: boolean) {
    this._enabled = val;

    if (this._startAnchor && this._endAnchor) {
      this._startAnchor.tabIndex = this._endAnchor.tabIndex = this._enabled ? 0 : -1;
    }
  }
  private _enabled: boolean = true;

  constructor(
    private _element: HTMLElement,
    private _checker: InteractivityChecker,
    private _ngZone: NgZone,
    private _document: Document,
    deferAnchors = false) {

    if (!deferAnchors) {
      this.attachAnchors();
    }
  }

  /** Destroys the focus trap by cleaning up the anchors. */
  destroy() {
    if (this._startAnchor && this._startAnchor.parentNode) {
      this._startAnchor.parentNode.removeChild(this._startAnchor);
    }

    if (this._endAnchor && this._endAnchor.parentNode) {
      this._endAnchor.parentNode.removeChild(this._endAnchor);
    }

    this._startAnchor = this._endAnchor = null;
  }

  /**
   * Inserts the anchors into the DOM. This is usually done automatically
   * in the constructor, but can be deferred for cases like directives with `*ngIf`.
   */
  attachAnchors(): void {
    if (!this._startAnchor) {
      this._startAnchor = this._createAnchor();
    }

    if (!this._endAnchor) {
      this._endAnchor = this._createAnchor();
    }

    this._ngZone.runOutsideAngular(() => {
      this._startAnchor!.addEventListener('focus', () => {
        this.focusLastTabbableElement();
      });

      this._endAnchor!.addEventListener('focus', () => {
        this.focusFirstTabbableElement();
      });

      if (this._element.parentNode) {
        this._element.parentNode.insertBefore(this._startAnchor!, this._element);
        this._element.parentNode.insertBefore(this._endAnchor!, this._element.nextSibling);
      }
    });
  }

  /**
   * Waits for the zone to stabilize, then either focuses the first element that the
   * user specified, or the first tabbable element.
   * @returns Returns a promise that resolves with a boolean, depending
   * on whether focus was moved successfuly.
   */
  focusInitialElementWhenReady(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this._executeOnStable(() => resolve(this.focusInitialElement()));
    });
  }

  /**
   * Waits for the zone to stabilize, then focuses
   * the first tabbable element within the focus trap region.
   * @returns Returns a promise that resolves with a boolean, depending
   * on whether focus was moved successfuly.
   */
  focusFirstTabbableElementWhenReady(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this._executeOnStable(() => resolve(this.focusFirstTabbableElement()));
    });
  }

  /**
   * Waits for the zone to stabilize, then focuses
   * the last tabbable element within the focus trap region.
   * @returns Returns a promise that resolves with a boolean, depending
   * on whether focus was moved successfuly.
   */
  focusLastTabbableElementWhenReady(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this._executeOnStable(() => resolve(this.focusLastTabbableElement()));
    });
  }

  /**
   * Get the specified boundary element of the trapped region.
   * @param bound The boundary to get (start or end of trapped region).
   * @returns The boundary element.
   */
  private _getRegionBoundary(bound: 'start' | 'end'): HTMLElement | null {
    // Contains the deprecated version of selector, for temporary backwards comparability.
    let markers = this._element.querySelectorAll(`[cdk-focus-region-${bound}], ` +
                                                 `[cdkFocusRegion${bound}], ` +
                                                 `[cdk-focus-${bound}]`) as NodeListOf<HTMLElement>;

    for (let i = 0; i < markers.length; i++) {
      if (markers[i].hasAttribute(`cdk-focus-${bound}`)) {
        console.warn(`Found use of deprecated attribute 'cdk-focus-${bound}',` +
                     ` use 'cdkFocusRegion${bound}' instead.`, markers[i]);
      } else if (markers[i].hasAttribute(`cdk-focus-region-${bound}`)) {
        console.warn(`Found use of deprecated attribute 'cdk-focus-region-${bound}',` +
                     ` use 'cdkFocusRegion${bound}' instead.`, markers[i]);
      }
    }

    if (bound == 'start') {
      return markers.length ? markers[0] : this._getFirstTabbableElement(this._element);
    }
    return markers.length ?
        markers[markers.length - 1] : this._getLastTabbableElement(this._element);
  }

  /**
   * Focuses the element that should be focused when the focus trap is initialized.
   * @returns Whether focus was moved successfuly.
   */
  focusInitialElement(): boolean {
    // Contains the deprecated version of selector, for temporary backwards comparability.
    const redirectToElement = this._element.querySelector(`[cdk-focus-initial], ` +
                                                          `[cdkFocusInitial]`) as HTMLElement;

    if (this._element.hasAttribute(`cdk-focus-initial`)) {
      console.warn(`Found use of deprecated attribute 'cdk-focus-initial',` +
                    ` use 'cdkFocusInitial' instead.`, this._element);
    }

    if (redirectToElement) {
      redirectToElement.focus();
      return true;
    }

    return this.focusFirstTabbableElement();
  }

  /**
   * Focuses the first tabbable element within the focus trap region.
   * @returns Whether focus was moved successfuly.
   */
  focusFirstTabbableElement(): boolean {
    const redirectToElement = this._getRegionBoundary('start');

    if (redirectToElement) {
      redirectToElement.focus();
    }

    return !!redirectToElement;
  }

  /**
   * Focuses the last tabbable element within the focus trap region.
   * @returns Whether focus was moved successfuly.
   */
  focusLastTabbableElement(): boolean {
    const redirectToElement = this._getRegionBoundary('end');

    if (redirectToElement) {
      redirectToElement.focus();
    }

    return !!redirectToElement;
  }

  /** Get the first tabbable element from a DOM subtree (inclusive). */
  private _getFirstTabbableElement(root: HTMLElement): HTMLElement | null {
    if (this._checker.isFocusable(root) && this._checker.isTabbable(root)) {
      return root;
    }

    // Iterate in DOM order. Note that IE doesn't have `children` for SVG so we fall
    // back to `childNodes` which includes text nodes, comments etc.
    let children = root.children || root.childNodes;

    for (let i = 0; i < children.length; i++) {
      let tabbableChild = children[i].nodeType === Node.ELEMENT_NODE ?
        this._getFirstTabbableElement(children[i] as HTMLElement) :
        null;

      if (tabbableChild) {
        return tabbableChild;
      }
    }

    return null;
  }

  /** Get the last tabbable element from a DOM subtree (inclusive). */
  private _getLastTabbableElement(root: HTMLElement): HTMLElement | null {
    if (this._checker.isFocusable(root) && this._checker.isTabbable(root)) {
      return root;
    }

    // Iterate in reverse DOM order.
    let children = root.children || root.childNodes;

    for (let i = children.length - 1; i >= 0; i--) {
      let tabbableChild = children[i].nodeType === Node.ELEMENT_NODE ?
        this._getLastTabbableElement(children[i] as HTMLElement) :
        null;

      if (tabbableChild) {
        return tabbableChild;
      }
    }

    return null;
  }

  /** Creates an anchor element. */
  private _createAnchor(): HTMLElement {
    const anchor = this._document.createElement('div');
    anchor.tabIndex = this._enabled ? 0 : -1;
    anchor.classList.add('cdk-visually-hidden');
    anchor.classList.add('cdk-focus-trap-anchor');
    return anchor;
  }

  /** Executes a function when the zone is stable. */
  private _executeOnStable(fn: () => any): void {
    if (this._ngZone.isStable) {
      fn();
    } else {
      this._ngZone.onStable.asObservable().pipe(take(1)).subscribe(fn);
    }
  }
}


/** Factory that allows easy instantiation of focus traps. */
@Injectable()
export class FocusTrapFactory {
  private _document: Document;

  constructor(
      private _checker: InteractivityChecker,
      private _ngZone: NgZone,
      @Inject(DOCUMENT) _document: any) {

    this._document = _document;
  }

  /**
   * Creates a focus-trapped region around the given element.
   * @param element The element around which focus will be trapped.
   * @param deferCaptureElements Defers the creation of focus-capturing elements to be done
   *     manually by the user.
   * @returns The created focus trap instance.
   */
  create(element: HTMLElement, deferCaptureElements: boolean = false): FocusTrap {
    return new FocusTrap(
        element, this._checker, this._ngZone, this._document, deferCaptureElements);
  }
}


/**
 * Directive for trapping focus within a region.
 * @docs-private
 * @deprecated
 */
@Directive({
  selector: 'cdk-focus-trap',
})
export class FocusTrapDeprecatedDirective implements OnDestroy, AfterContentInit {
  focusTrap: FocusTrap;

  /** Whether the focus trap is active. */
  @Input()
  get disabled(): boolean { return !this.focusTrap.enabled; }
  set disabled(val: boolean) {
    this.focusTrap.enabled = !coerceBooleanProperty(val);
  }

  constructor(private _elementRef: ElementRef, private _focusTrapFactory: FocusTrapFactory) {
    this.focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement, true);
  }

  ngOnDestroy() {
    this.focusTrap.destroy();
  }

  ngAfterContentInit() {
    this.focusTrap.attachAnchors();
  }
}


/** Directive for trapping focus within a region. */
@Directive({
  selector: '[cdkTrapFocus]',
  exportAs: 'cdkTrapFocus',
})
export class CdkTrapFocus implements OnDestroy, AfterContentInit {
  private _document: Document;

  /** Underlying FocusTrap instance. */
  focusTrap: FocusTrap;

  /** Previously focused element to restore focus to upon destroy when using autoCapture. */
  private _previouslyFocusedElement: HTMLElement | null = null;

  /** Whether the focus trap is active. */
  @Input('cdkTrapFocus')
  get enabled(): boolean { return this.focusTrap.enabled; }
  set enabled(value: boolean) { this.focusTrap.enabled = coerceBooleanProperty(value); }

  /**
   * Whether the directive should automatially move focus into the trapped region upon
   * initialization and return focus to the previous activeElement upon destruction.
   */
  @Input('cdkTrapFocusAutoCapture')
  get autoCapture(): boolean { return this._autoCapture; }
  set autoCapture(value: boolean) { this._autoCapture = coerceBooleanProperty(value); }
  private _autoCapture: boolean;

  constructor(
      private _elementRef: ElementRef,
      private _focusTrapFactory: FocusTrapFactory,
      @Inject(DOCUMENT) _document: any) {

    this._document = _document;
    this.focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement, true);
  }

  ngOnDestroy() {
    this.focusTrap.destroy();

    // If we stored a previously focused element when using autoCapture, return focus to that
    // element now that the trapped region is being destroyed.
    if (this._previouslyFocusedElement) {
      this._previouslyFocusedElement.focus();
      this._previouslyFocusedElement = null;
    }
  }

  ngAfterContentInit() {
    this.focusTrap.attachAnchors();

    if (this.autoCapture) {
      this._previouslyFocusedElement = this._document.activeElement as HTMLElement;
      this.focusTrap.focusInitialElementWhenReady();
    }
  }
}
