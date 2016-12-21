import {Component, ViewEncapsulation, ViewChild, ElementRef, Input, NgZone} from '@angular/core';
import {InteractivityChecker} from './interactivity-checker';
import {coerceBooleanProperty} from '../coercion/boolean-property';


/**
 * Directive for trapping focus within a region.
 *
 * NOTE: This directive currently uses a very simple (naive) approach to focus trapping.
 * It assumes that the tab order is the same as DOM order, which is not necessarily true.
 * Things like tabIndex > 0, flex `order`, and shadow roots can cause to two to misalign.
 * This will be replaced with a more intelligent solution before the library is considered stable.
 */
@Component({
  moduleId: module.id,
  selector: 'cdk-focus-trap, focus-trap',
  templateUrl: 'focus-trap.html',
  encapsulation: ViewEncapsulation.None,
})
export class FocusTrap {
  @ViewChild('trappedContent') trappedContent: ElementRef;

  /** Whether the focus trap is active. */
  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(val: boolean) { this._disabled = coerceBooleanProperty(val); }
  private _disabled: boolean = false;

  constructor(private _checker: InteractivityChecker, private _ngZone: NgZone) { }

  /**
   * Waits for microtask queue to empty, then focuses the first tabbable element within the focus
   * trap region.
   */
  focusFirstTabbableElementWhenReady() {
    this._ngZone.onMicrotaskEmpty.first().subscribe(() => {
      this.focusFirstTabbableElement();
    });
  }

  /**
   * Waits for microtask queue to empty, then focuses the last tabbable element within the focus
   * trap region.
   */
  focusLastTabbableElementWhenReady() {
    this._ngZone.onMicrotaskEmpty.first().subscribe(() => {
      this.focusLastTabbableElement();
    });
  }

  /**
   * Focuses the first tabbable element within the focus trap region.
   */
  focusFirstTabbableElement() {
    let rootElement = this.trappedContent.nativeElement;
    let redirectToElement = rootElement.querySelector('[cdk-focus-start]') as HTMLElement ||
                            this._getFirstTabbableElement(rootElement);

    if (redirectToElement) {
      redirectToElement.focus();
    }
  }

  /**
   * Focuses the last tabbable element within the focus trap region.
   */
  focusLastTabbableElement() {
    let rootElement = this.trappedContent.nativeElement;
    let focusTargets = rootElement.querySelectorAll('[cdk-focus-end]');
    let redirectToElement: HTMLElement = null;

    if (focusTargets.length) {
      redirectToElement = focusTargets[focusTargets.length - 1] as HTMLElement;
    } else {
      redirectToElement = this._getLastTabbableElement(rootElement);
    }

    if (redirectToElement) {
      redirectToElement.focus();
    }
  }

  /** Get the first tabbable element from a DOM subtree (inclusive). */
  private _getFirstTabbableElement(root: HTMLElement): HTMLElement {
    if (this._checker.isFocusable(root) && this._checker.isTabbable(root)) {
      return root;
    }

    // Iterate in DOM order.
    let childCount = root.children.length;
    for (let i = 0; i < childCount; i++) {
      let tabbableChild = this._getFirstTabbableElement(root.children[i] as HTMLElement);
      if (tabbableChild) {
        return tabbableChild;
      }
    }

    return null;
  }

  /** Get the last tabbable element from a DOM subtree (inclusive). */
  private _getLastTabbableElement(root: HTMLElement): HTMLElement {
    if (this._checker.isFocusable(root) && this._checker.isTabbable(root)) {
      return root;
    }

    // Iterate in reverse DOM order.
    for (let i = root.children.length - 1; i >= 0; i--) {
      let tabbableChild = this._getLastTabbableElement(root.children[i] as HTMLElement);
      if (tabbableChild) {
        return tabbableChild;
      }
    }

    return null;
  }
}
