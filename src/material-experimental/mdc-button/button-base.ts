/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from '@angular/cdk/platform';
import {ElementRef, NgZone, OnChanges, SimpleChanges} from '@angular/core';
import {
  CanColor,
  CanColorCtor,
  CanDisable,
  CanDisableCtor,
  CanDisableRipple,
  CanDisableRippleCtor,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple,
  RippleRenderer,
  RippleTarget
} from '@angular/material/core';

/** Inputs common to all buttons. */
export const MAT_BUTTON_INPUTS = ['disabled', 'disableRipple', 'color'];

/** Shared host configuration for all buttons */
export const MAT_BUTTON_HOST = {
  'class': 'mat-mdc-button',
  '[attr.disabled]': 'disabled || null',
  '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
};

/**
 * List of classes to add to buttons instances based on host attributes to
 * style as different variants.
 */
const HOST_SELECTOR_MDC_CLASS_PAIR: {selector: string, mdcClasses: string[]}[] = [
  {selector: 'mat-button', mdcClasses: ['mdc-button']},
  {selector: 'mat-flat-button', mdcClasses: ['mdc-button', 'mdc-button--unelevated']},
  {selector: 'mat-raised-button', mdcClasses: ['mdc-button', 'mdc-button--raised']},
  {selector: 'mat-stroked-button', mdcClasses: ['mdc-button', 'mdc-button--outlined']},
  {selector: 'mat-fab', mdcClasses: ['mdc-fab']},
  {selector: 'mat-mini-fab', mdcClasses: ['mdc-fab', 'mdc-fab--mini']},
  {selector: 'mat-icon-button', mdcClasses: ['mdc-icon-button']}
];

// Boilerplate for applying mixins to MatButton.
/** @docs-private */
export class MatButtonMixinCore {
  constructor(public _elementRef: ElementRef) {}
}

export const _MatButtonBaseMixin: CanDisableRippleCtor&CanDisableCtor&CanColorCtor&
    typeof MatButtonMixinCore = mixinColor(mixinDisabled(mixinDisableRipple(MatButtonMixinCore)));

/** Base class for all buttons.  */
export class MatButtonBase extends _MatButtonBaseMixin implements CanDisable, CanColor,
                                                                  CanDisableRipple, OnChanges {
  rippleTarget: RippleTarget = {
    rippleConfig: {
      animation: {
        // TODO(mmalerba): Use the MDC constants once they are exported separately from the
        // foundation. Grabbing them off the foundation prevents the foundation class from being
        // tree-shaken. There is an open PR for this:
        // https://github.com/material-components/material-components-web/pull/4593
        enterDuration: 225 /* MDCRippleFoundation.numbers.DEACTIVATION_TIMEOUT_MS */,
        exitDuration: 150 /* MDCRippleFoundation.numbers.FG_DEACTIVATION_MS */,
      },
    },
    rippleDisabled: false,
  };

  /** The ripple renderer for the button. */
  private _rippleRenderer =
      new RippleRenderer(this.rippleTarget, this._ngZone, this._elementRef, this._platform);

  constructor(
      elementRef: ElementRef, public _platform: Platform, public _ngZone: NgZone,
      public _animationMode?: string) {
    super(elementRef);
    this._rippleRenderer.setupTriggerEvents(this._elementRef.nativeElement);

    // For each of the variant selectors that is present in the button's host
    // attributes, add the correct corresponding MDC classes.
    for (const pair of HOST_SELECTOR_MDC_CLASS_PAIR) {
      if (this._hasHostAttributes(pair.selector)) {
        (elementRef.nativeElement as HTMLElement).classList.add(...pair.mdcClasses);
      }
    }
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['disableRipple'] || simpleChanges['disabled']) {
      this.rippleTarget.rippleDisabled = this.disableRipple || this.disabled;
    }
  }

  /** Focuses the button. */
  focus(): void {
    this._elementRef.nativeElement.focus();
  }

  /** Gets whether the button has one of the given attributes. */
  private _hasHostAttributes(...attributes: string[]) {
    return attributes.some(attribute => this._elementRef.nativeElement.hasAttribute(attribute));
  }
}

/** Shared inputs by buttons using the `<a>` tag */
export const MAT_ANCHOR_INPUTS = ['disabled', 'disableRipple', 'color', 'tabIndex'];

/** Shared host configuration for buttons using the `<a>` tag. */
export const MAT_ANCHOR_HOST = {
  ...MAT_BUTTON_HOST,
  // Note that we ignore the user-specified tabindex when it's disabled for
  // consistency with the `mat-button` applied on native buttons where even
  // though they have an index, they're not tabbable.
  '[attr.tabindex]': 'disabled ? -1 : (tabIndex || 0)',
  '[attr.aria-disabled]': 'disabled.toString()',
  '(click)': '_haltDisabledEvents($event)',
};

/**
 * Anchor button base.
 */
export class MatAnchorBase extends MatButtonBase {
  tabIndex: number;

  constructor(elementRef: ElementRef, platform: Platform, ngZone: NgZone, animationMode?: string) {
    super(elementRef, platform, ngZone, animationMode);
  }

  _haltDisabledEvents(event: Event) {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
