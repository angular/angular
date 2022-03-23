/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Inject, Input, OnInit} from '@angular/core';
import {AriaHasPopupValue, CDK_COMBOBOX, CdkCombobox} from './combobox';

let nextId = 0;

@Directive({
  selector: '[cdkComboboxPopup]',
  exportAs: 'cdkComboboxPopup',
  host: {
    'class': 'cdk-combobox-popup',
    '[attr.role]': 'role',
    '[id]': 'id',
    'tabindex': '-1',
    '(focus)': 'focusFirstElement()',
  },
})
export class CdkComboboxPopup<T = unknown> implements OnInit {
  @Input()
  get role(): AriaHasPopupValue {
    return this._role;
  }
  set role(value: AriaHasPopupValue) {
    this._role = value;
  }
  private _role: AriaHasPopupValue = 'dialog';

  @Input()
  get firstFocus(): HTMLElement {
    return this._firstFocusElement;
  }
  set firstFocus(id: HTMLElement) {
    this._firstFocusElement = id;
  }
  private _firstFocusElement: HTMLElement;

  @Input() id = `cdk-combobox-popup-${nextId++}`;

  constructor(
    private readonly _elementRef: ElementRef<HTMLElement>,
    @Inject(CDK_COMBOBOX) private readonly _combobox: CdkCombobox,
  ) {}

  ngOnInit() {
    this.registerWithPanel();
  }

  registerWithPanel(): void {
    this._combobox._registerContent(this.id, this._role);
  }

  focusFirstElement() {
    if (this._firstFocusElement) {
      this._firstFocusElement.focus();
    } else {
      this._elementRef.nativeElement.focus();
    }
  }
}
