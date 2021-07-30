/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {_getFocusedElementPierceShadowDom} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {
  AfterContentInit,
  Directive,
  ElementRef,
  Inject,
  Injectable,
  Input,
  NgZone,
  OnDestroy,
  DoCheck,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import {take} from 'rxjs/operators';
import {InteractivityChecker} from '../interactivity-checker/interactivity-checker';


/**
 * Class that allows for trapping focus within a DOM element.
 *
 * This class currently uses a relatively simple approach to focus trapping.
 * It assumes that the tab order is the same as DOM order, which is not necessarily true.
 * Things like `tabIndex > 0`, flex `order`, and shadow roots can cause the two to be misaligned.
 *
 * @deprecated Use `ConfigurableFocusTrap` instead.
 * @breaking-change 11.0.0
 */
export class FocusTrap {
  private _startAnchor: HTMLElement | null;
  private _endAnchor: HTMLElement | null;
  private _hasAttached = false;

  // Event listeners for the anchors. Need to be regular functions so that we can unbind them later.
  protected startAnchorListener = () => this.focusLastTabbableElement();
  protected endAnchorListener = () => this.focusFirstTabbableElement();

  /** Whether the focus trap is active. */
  get enabled(): boolean { return this._enabled; }
  set enabled(value: boolean) {
    this._enabled = value;

    if (this._startAnchor && this._endAnchor) {
      this._toggleAnchorTabIndex(value, this._startAnchor);
      this._toggleAnchorTabIndex(value, this._endAnchor);
    }
  }
  protected _enabled: boolean = true;

  constructor(
    readonly _element: HTMLElement,
    private _checker: InteractivityChecker,
    readonly _ngZone: NgZone,
    readonly _document: Document,
    deferAnchors = false) {

    if (!deferAnchors) {
      this.attachAnchors();
    }
  }

  /** Destroys the focus trap by cleaning up the anchors. */
  destroy() {
    const startAnchor = this._startAnchor;
    const endAnchor = this._endAnchor;

    if (startAnchor) {
      startAnchor.removeEventListener('focus', this.startAnchorListener);

      if (startAnchor.parentNode) {
        startAnchor.parentNode.removeChild(startAnchor);
      }
    }

    if (endAnchor) {
      endAnchor.removeEventListener('focus', this.endAnchorListener);

      if (endAnchor.parentNode) {
        endAnchor.parentNode.removeChild(endAnchor);
      }
    }

    this._startAnchor = this._endAnchor = null;
    this._hasAttached = false;
  }

  /**
   * Inserts the anchors into the DOM. This is usually done automatically
   * in the constructor, but can be deferred for cases like directives with `*ngIf`.
   * @returns Whether the focus trap managed to attach successfully. This may not be the case
   * if the target element isn't currently in the DOM.
   */
  attachAnchors(): boolean {
    // If we're not on the browser, there can be no focus to trap.
    if (this._hasAttached) {
      return true;
    }

    this._ngZone.runOutsideAngular(() => {
      if (!this._startAnchor) {
        this._startAnchor = this._createAnchor();
        this._startAnchor!.addEventListener('focus', this.startAnchorListener);
      }

      if (!this._endAnchor) {
        this._endAnchor = this._createAnchor();
        this._endAnchor!.addEventListener('focus', this.endAnchorListener);
      }
    });

    if (this._element.parentNode) {
      this._element.parentNode.insertBefore(this._startAnchor!, this._element);
      this._element.parentNode.insertBefore(this._endAnchor!, this._element.nextSibling);
      this._hasAttached = true;
    }

    return this._hasAttached;
  }

  /**
   * Waits for the zone to stabilize, then focuses the first tabbable element.
   * @returns Returns a promise that resolves with a boolean, depending
   * on whether focus was moved successfully.
   */
  focusInitialElementWhenReady(options?: FocusOptions): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this._executeOnStable(() => resolve(this.focusInitialElement(options)));
    });
  }

  /**
   * Waits for the zone to stabilize, then focuses
   * the first tabbable element within the focus trap region.
   * @returns Returns a promise that resolves with a boolean, depending
   * on whether focus was moved successfully.
   */
  focusFirstTabbableElementWhenReady(options?: FocusOptions): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this._executeOnStable(() => resolve(this.focusFirstTabbableElement(options)));
    });
  }

  /**
   * Waits for the zone to stabilize, then focuses
   * the last tabbable element within the focus trap region.
   * @returns Returns a promise that resolves with a boolean, depending
   * on whether focus was moved successfully.
   */
  focusLastTabbableElementWhenReady(options?: FocusOptions): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this._executeOnStable(() => resolve(this.focusLastTabbableElement(options)));
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
      // @breaking-change 8.0.0
      if (markers[i].hasAttribute(`cdk-focus-${bound}`)) {
        console.warn(`Found use of deprecated attribute 'cdk-focus-${bound}', ` +
                     `use 'cdkFocusRegion${bound}' instead. The deprecated ` +
                     `attribute will be removed in 8.0.0.`, markers[i]);
      } else if (markers[i].hasAttribute(`cdk-focus-region-${bound}`)) {
        console.warn(`Found use of deprecated attribute 'cdk-focus-region-${bound}', ` +
                     `use 'cdkFocusRegion${bound}' instead. The deprecated attribute ` +
                     `will be removed in 8.0.0.`, markers[i]);
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
   * @returns Whether focus was moved successfully.
   */
  focusInitialElement(options?: FocusOptions): boolean {
    // Contains the deprecated version of selector, for temporary backwards comparability.
    const redirectToElement = this._element.querySelector(`[cdk-focus-initial], ` +
                                                          `[cdkFocusInitial]`) as HTMLElement;

    if (redirectToElement) {
      // @breaking-change 8.0.0
      if (redirectToElement.hasAttribute(`cdk-focus-initial`)) {
        console.warn(`Found use of deprecated attribute 'cdk-focus-initial', ` +
                    `use 'cdkFocusInitial' instead. The deprecated attribute ` +
                    `will be removed in 8.0.0`, redirectToElement);
      }

      // Warn the consumer if the element they've pointed to
      // isn't focusable, when not in production mode.
      if ((typeof ngDevMode === 'undefined' || ngDevMode) &&
        !this._checker.isFocusable(redirectToElement)) {
        console.warn(`Element matching '[cdkFocusInitial]' is not focusable.`, redirectToElement);
      }

      if (!this._checker.isFocusable(redirectToElement)) {
        const focusableChild = this._getFirstTabbableElement(redirectToElement) as HTMLElement;
        focusableChild?.focus(options);
        return !!focusableChild;
      }

      redirectToElement.focus(options);
      return true;
    }

    return this.focusFirstTabbableElement(options);
  }

  /**
   * Focuses the first tabbable element within the focus trap region.
   * @returns Whether focus was moved successfully.
   */
  focusFirstTabbableElement(options?: FocusOptions): boolean {
    const redirectToElement = this._getRegionBoundary('start');

    if (redirectToElement) {
      redirectToElement.focus(options);
    }

    return !!redirectToElement;
  }

  /**
   * Focuses the last tabbable element within the focus trap region.
   * @returns Whether focus was moved successfully.
   */
  focusLastTabbableElement(options?: FocusOptions): boolean {
    const redirectToElement = this._getRegionBoundary('end');

    if (redirectToElement) {
      redirectToElement.focus(options);
    }

    return !!redirectToElement;
  }

  /**
   * Checks whether the focus trap has successfully been attached.
   */
  hasAttached(): boolean {
    return this._hasAttached;
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
      let tabbableChild = children[i].nodeType === this._document.ELEMENT_NODE ?
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
      let tabbableChild = children[i].nodeType === this._document.ELEMENT_NODE ?
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
    this._toggleAnchorTabIndex(this._enabled, anchor);
    anchor.classList.add('cdk-visually-hidden');
    anchor.classList.add('cdk-focus-trap-anchor');
    anchor.setAttribute('aria-hidden', 'true');
    return anchor;
  }

  /**
   * Toggles the `tabindex` of an anchor, based on the enabled state of the focus trap.
   * @param isEnabled Whether the focus trap is enabled.
   * @param anchor Anchor on which to toggle the tabindex.
   */
  private _toggleAnchorTabIndex(isEnabled: boolean, anchor: HTMLElement) {
    // Remove the tabindex completely, rather than setting it to -1, because if the
    // element has a tabindex, the user might still hit it when navigating with the arrow keys.
    isEnabled ? anchor.setAttribute('tabindex', '0') : anchor.removeAttribute('tabindex');
  }

  /**
   * Toggles the`tabindex` of both anchors to either trap Tab focus or allow it to escape.
   * @param enabled: Whether the anchors should trap Tab.
   */
  protected toggleAnchors(enabled: boolean) {
    if (this._startAnchor && this._endAnchor) {
      this._toggleAnchorTabIndex(enabled, this._startAnchor);
      this._toggleAnchorTabIndex(enabled, this._endAnchor);
    }
  }

  /** Executes a function when the zone is stable. */
  private _executeOnStable(fn: () => any): void {
    if (this._ngZone.isStable) {
      fn();
    } else {
      this._ngZone.onStable.pipe(take(1)).subscribe(fn);
    }
  }
}

/**
 * Factory that allows easy instantiation of focus traps.
 * @deprecated Use `ConfigurableFocusTrapFactory` instead.
 * @breaking-change 11.0.0
 */
@Injectable({providedIn: 'root'})
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

/** Directive for trapping focus within a region. */
@Directive({
  selector: '[cdkTrapFocus]',
  exportAs: 'cdkTrapFocus',
})
export class CdkTrapFocus implements OnDestroy, AfterContentInit, OnChanges, DoCheck {
  /** Underlying FocusTrap instance. */
  focusTrap: FocusTrap;

  /** Previously focused element to restore focus to upon destroy when using autoCapture. */
  private _previouslyFocusedElement: HTMLElement | null = null;

  /** Whether the focus trap is active. */
  @Input('cdkTrapFocus')
  get enabled(): boolean { return this.focusTrap.enabled; }
  set enabled(value: boolean) { this.focusTrap.enabled = coerceBooleanProperty(value); }

  /**
   * Whether the directive should automatically move focus into the trapped region upon
   * initialization and return focus to the previous activeElement upon destruction.
   */
  @Input('cdkTrapFocusAutoCapture')
  get autoCapture(): boolean { return this._autoCapture; }
  set autoCapture(value: boolean) { this._autoCapture = coerceBooleanProperty(value); }
  private _autoCapture: boolean;

  constructor(
      private _elementRef: ElementRef<HTMLElement>,
      private _focusTrapFactory: FocusTrapFactory,
      /**
       * @deprecated No longer being used. To be removed.
       * @breaking-change 13.0.0
       */
      @Inject(DOCUMENT) _document: any) {
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
      this._captureFocus();
    }
  }

  ngDoCheck() {
    if (!this.focusTrap.hasAttached()) {
      this.focusTrap.attachAnchors();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const autoCaptureChange = changes['autoCapture'];

    if (autoCaptureChange && !autoCaptureChange.firstChange && this.autoCapture &&
        this.focusTrap.hasAttached()) {
      this._captureFocus();
    }
  }

  private _captureFocus() {
    this._previouslyFocusedElement = _getFocusedElementPierceShadowDom();
    this.focusTrap.focusInitialElementWhenReady();
  }

  static ngAcceptInputType_enabled: BooleanInput;
  static ngAcceptInputType_autoCapture: BooleanInput;
}
