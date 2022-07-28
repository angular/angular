/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from '@angular/cdk/platform';
import {Directive, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  CanColor,
  CanDisable,
  CanDisableRipple,
  MatRipple,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple,
} from '@angular/material/core';
import {FocusOrigin} from '@angular/cdk/a11y';

/** Inputs common to all buttons. */
export const MAT_BUTTON_INPUTS = ['disabled', 'disableRipple', 'color'];

/** Shared host configuration for all buttons */
export const MAT_BUTTON_HOST = {
  '[attr.disabled]': 'disabled || null',
  '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
  // MDC automatically applies the primary theme color to the button, but we want to support
  // an unthemed version. If color is undefined, apply a CSS class that makes it easy to
  // select and style this "theme".
  '[class.mat-unthemed]': '!color',
  // Add a class that applies to all buttons. This makes it easier to target if somebody
  // wants to target all Material buttons.
  '[class.mat-mdc-button-base]': 'true',
};

/** List of classes to add to buttons instances based on host attribute selector. */
const HOST_SELECTOR_MDC_CLASS_PAIR: {selector: string; mdcClasses: string[]}[] = [
  {
    selector: 'mat-button',
    mdcClasses: ['mdc-button', 'mat-mdc-button'],
  },
  {
    selector: 'mat-flat-button',
    mdcClasses: ['mdc-button', 'mdc-button--unelevated', 'mat-mdc-unelevated-button'],
  },
  {
    selector: 'mat-raised-button',
    mdcClasses: ['mdc-button', 'mdc-button--raised', 'mat-mdc-raised-button'],
  },
  {
    selector: 'mat-stroked-button',
    mdcClasses: ['mdc-button', 'mdc-button--outlined', 'mat-mdc-outlined-button'],
  },
  {
    selector: 'mat-fab',
    mdcClasses: ['mdc-fab', 'mat-mdc-fab'],
  },
  {
    selector: 'mat-mini-fab',
    mdcClasses: ['mdc-fab', 'mdc-fab--mini', 'mat-mdc-mini-fab'],
  },
  {
    selector: 'mat-icon-button',
    mdcClasses: ['mdc-icon-button', 'mat-mdc-icon-button'],
  },
];

// Boilerplate for applying mixins to MatButton.
/** @docs-private */
export const _MatButtonMixin = mixinColor(
  mixinDisabled(
    mixinDisableRipple(
      class {
        constructor(public _elementRef: ElementRef) {}
      },
    ),
  ),
);

/** Base class for all buttons.  */
@Directive()
export class MatButtonBase
  extends _MatButtonMixin
  implements CanDisable, CanColor, CanDisableRipple
{
  /** Whether this button is a FAB. Used to apply the correct class on the ripple. */
  _isFab = false;

  /** Reference to the MatRipple instance of the button. */
  @ViewChild(MatRipple) ripple: MatRipple;

  constructor(
    elementRef: ElementRef,
    public _platform: Platform,
    public _ngZone: NgZone,
    public _animationMode?: string,
  ) {
    super(elementRef);

    const classList = (elementRef.nativeElement as HTMLElement).classList;

    // For each of the variant selectors that is present in the button's host
    // attributes, add the correct corresponding MDC classes.
    for (const pair of HOST_SELECTOR_MDC_CLASS_PAIR) {
      if (this._hasHostAttributes(pair.selector)) {
        pair.mdcClasses.forEach((className: string) => {
          classList.add(className);
        });
      }
    }
  }

  /** Focuses the button. */
  focus(_origin: FocusOrigin = 'program', options?: FocusOptions): void {
    this._elementRef.nativeElement.focus(options);
  }

  /** Gets whether the button has one of the given attributes. */
  private _hasHostAttributes(...attributes: string[]) {
    return attributes.some(attribute => this._elementRef.nativeElement.hasAttribute(attribute));
  }

  _isRippleDisabled() {
    return this.disableRipple || this.disabled;
  }
}

/** Shared inputs by buttons using the `<a>` tag */
export const MAT_ANCHOR_INPUTS = ['disabled', 'disableRipple', 'color', 'tabIndex'];

/** Shared host configuration for buttons using the `<a>` tag. */
export const MAT_ANCHOR_HOST = {
  '[attr.disabled]': 'disabled || null',
  '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',

  // Note that we ignore the user-specified tabindex when it's disabled for
  // consistency with the `mat-button` applied on native buttons where even
  // though they have an index, they're not tabbable.
  '[attr.tabindex]': 'disabled ? -1 : tabIndex',
  '[attr.aria-disabled]': 'disabled.toString()',
  // MDC automatically applies the primary theme color to the button, but we want to support
  // an unthemed version. If color is undefined, apply a CSS class that makes it easy to
  // select and style this "theme".
  '[class.mat-unthemed]': '!color',
  // Add a class that applies to all buttons. This makes it easier to target if somebody
  // wants to target all Material buttons.
  '[class.mat-mdc-button-base]': 'true',
};

/**
 * Anchor button base.
 */
@Directive()
export class MatAnchorBase extends MatButtonBase implements OnInit, OnDestroy {
  tabIndex: number;

  constructor(elementRef: ElementRef, platform: Platform, ngZone: NgZone, animationMode?: string) {
    super(elementRef, platform, ngZone, animationMode);
  }

  ngOnInit(): void {
    this._ngZone.runOutsideAngular(() => {
      this._elementRef.nativeElement.addEventListener('click', this._haltDisabledEvents);
    });
  }

  ngOnDestroy(): void {
    this._elementRef.nativeElement.removeEventListener('click', this._haltDisabledEvents);
  }

  _haltDisabledEvents = (event: Event): void => {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
}
