/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {
  MDCChipActionAdapter,
  MDCChipActionFoundation,
  MDCChipActionType,
  MDCChipPrimaryActionFoundation,
} from '@material/chips';
import {emitCustomEvent} from './emit-event';
import {
  CanDisable,
  HasTabIndex,
  mixinDisabled,
  mixinTabIndex,
} from '@angular/material-experimental/mdc-core';

const _MatChipActionMixinBase = mixinTabIndex(mixinDisabled(class {}), -1);

/**
 * Interactive element within a chip.
 * @docs-private
 */
@Directive({
  selector: '[matChipAction]',
  inputs: ['disabled', 'tabIndex'],
  host: {
    'class': 'mdc-evolution-chip__action mat-mdc-chip-action',
    '[class.mdc-evolution-chip__action--primary]': `_getFoundation().actionType() === ${MDCChipActionType.PRIMARY}`,
    // Note that while our actions are interactive, we have to add the `--presentational` class,
    // in order to avoid some super-specific `:hover` styles from MDC.
    '[class.mdc-evolution-chip__action--presentational]': `_getFoundation().actionType() === ${MDCChipActionType.PRIMARY}`,
    '[class.mdc-evolution-chip__action--trailing]': `_getFoundation().actionType() === ${MDCChipActionType.TRAILING}`,
    '[attr.tabindex]': '(disabled || !isInteractive) ? null : tabIndex',
    '[attr.disabled]': "disabled ? '' : null",
    '[attr.aria-disabled]': 'disabled',
    '(click)': '_handleClick($event)',
    '(keydown)': '_handleKeydown($event)',
  },
})
export class MatChipAction
  extends _MatChipActionMixinBase
  implements AfterViewInit, OnDestroy, CanDisable, HasTabIndex, OnChanges
{
  private _document: Document;
  private _foundation: MDCChipActionFoundation;
  private _adapter: MDCChipActionAdapter = {
    focus: () => this.focus(),
    getAttribute: (name: string) => this._elementRef.nativeElement.getAttribute(name),
    setAttribute: (name: string, value: string) => {
      // MDC tries to update the tabindex directly in the DOM when navigating using the keyboard
      // which overrides our own handling. If we detect such a case, assign it to the same property
      // as the Angular binding in order to maintain consistency.
      if (name === 'tabindex') {
        this._updateTabindex(parseInt(value));
      } else {
        this._elementRef.nativeElement.setAttribute(name, value);
      }
    },
    removeAttribute: (name: string) => {
      if (name !== 'tabindex') {
        this._elementRef.nativeElement.removeAttribute(name);
      }
    },
    getElementID: () => this._elementRef.nativeElement.id,
    emitEvent: <T>(eventName: string, data: T) => {
      emitCustomEvent<T>(this._elementRef.nativeElement, this._document, eventName, data, true);
    },
  };

  /** Whether the action is interactive. */
  @Input() isInteractive = true;

  _handleClick(event: MouseEvent) {
    // Usually these events can't happen while the chip is disabled since the browser won't
    // allow them which is what MDC seems to rely on, however the event can be faked in tests.
    if (!this.disabled && this.isInteractive) {
      this._foundation.handleClick();
      event.preventDefault();
    }
  }

  _handleKeydown(event: KeyboardEvent) {
    // Usually these events can't happen while the chip is disabled since the browser won't
    // allow them which is what MDC seems to rely on, however the event can be faked in tests.
    if (!this.disabled && this.isInteractive) {
      this._foundation.handleKeydown(event);
    }
  }

  protected _createFoundation(adapter: MDCChipActionAdapter): MDCChipActionFoundation {
    return new MDCChipPrimaryActionFoundation(adapter);
  }

  constructor(
    public _elementRef: ElementRef,
    @Inject(DOCUMENT) _document: any,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
    this._foundation = this._createFoundation(this._adapter);

    if (_elementRef.nativeElement.nodeName === 'BUTTON') {
      _elementRef.nativeElement.setAttribute('type', 'button');
    }
  }

  ngAfterViewInit() {
    this._foundation.init();
    this._foundation.setDisabled(this.disabled);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['disabled']) {
      this._foundation.setDisabled(this.disabled);
    }
  }

  ngOnDestroy() {
    this._foundation.destroy();
  }

  focus() {
    this._elementRef.nativeElement.focus();
  }

  _getFoundation() {
    return this._foundation;
  }

  _updateTabindex(value: number) {
    this.tabIndex = value;
    this._changeDetectorRef.markForCheck();
  }
}
