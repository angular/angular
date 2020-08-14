/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Inject, InjectionToken, Input, OnInit, Optional} from '@angular/core';
import {AriaHasPopupValue, CdkComboboxPanel} from './combobox-panel';

export const PANEL = new InjectionToken<CdkComboboxPanel>('CdkComboboxPanel');

let nextId = 0;

@Directive({
  selector: '[cdkComboboxPopup]',
  exportAs: 'cdkComboboxPopup',
  host: {
    'class': 'cdk-combobox-popup',
    '[attr.role]': 'role',
    '[id]': 'id',
    'tabindex': '-1'
  }
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

  @Input() id = `cdk-combobox-popup-${nextId++}`;

  @Input('parentPanel') private readonly _explicitPanel: CdkComboboxPanel;

  constructor(
    @Optional() @Inject(PANEL) readonly _parentPanel?: CdkComboboxPanel<T>,
  ) { }

  ngOnInit() {
    this.registerWithPanel();
  }

  registerWithPanel(): void {
    if (this._parentPanel === null || this._parentPanel === undefined) {
      this._explicitPanel._registerContent(this.id, this._role);
    } else {
      this._parentPanel._registerContent(this.id, this._role);
    }
  }
}
