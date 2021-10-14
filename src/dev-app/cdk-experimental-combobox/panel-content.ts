/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Inject, InjectionToken, Input, OnInit, Optional} from '@angular/core';
import {AriaHasPopupValue, CdkComboboxPanel} from '@angular/cdk-experimental/combobox';

export const PANEL = new InjectionToken<CdkComboboxPanel>('CdkComboboxPanel');

let id = 0;

@Directive({
  selector: '[panelContent]',
  exportAs: 'panelContent',
  host: {
    'role': 'role',
    '[id]': 'dialogId',
  },
})
export class PanelContent<V> implements OnInit {
  dialogId = `dialog-${id++}`;
  role = 'dialog';

  @Input('parentPanel') private readonly _explicitPanel: CdkComboboxPanel;

  constructor(@Optional() @Inject(PANEL) readonly _parentPanel?: CdkComboboxPanel<V>) {}

  ngOnInit() {
    this.registerWithPanel();
  }

  registerWithPanel(): void {
    if (this._parentPanel === null || this._parentPanel === undefined) {
      this._explicitPanel._registerContent(this.dialogId, this.role as AriaHasPopupValue);
    } else {
      this._parentPanel._registerContent(this.dialogId, this.role as AriaHasPopupValue);
    }
  }
}
