/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacySelectModule} from '@angular/material/legacy-select';
import {
  MatLegacySnackBar,
  MatLegacySnackBarConfig,
  MatLegacySnackBarHorizontalPosition,
  MatLegacySnackBarModule,
  MatLegacySnackBarVerticalPosition,
} from '@angular/material/legacy-snack-bar';

@Component({
  selector: 'legacy-snack-bar-demo',
  styleUrls: ['legacy-snack-bar-demo.css'],
  templateUrl: 'legacy-snack-bar-demo.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatLegacyButtonModule,
    MatLegacyCheckboxModule,
    MatLegacyFormFieldModule,
    MatLegacyInputModule,
    MatLegacySelectModule,
    MatLegacySnackBarModule,
  ],
})
export class LegacySnackBarDemo {
  @ViewChild('template') template: TemplateRef<any>;
  message = 'Snack Bar opened.';
  actionButtonLabel = 'Retry';
  action = false;
  setAutoHide = true;
  autoHide = 10000;
  addExtraClass = false;
  horizontalPosition: MatLegacySnackBarHorizontalPosition = 'center';
  verticalPosition: MatLegacySnackBarVerticalPosition = 'bottom';

  constructor(public snackBar: MatLegacySnackBar, private _dir: Directionality) {}

  open() {
    const config = this._createConfig();
    this.snackBar.open(this.message, this.action ? this.actionButtonLabel : undefined, config);
  }

  openTemplate() {
    const config = this._createConfig();
    this.snackBar.openFromTemplate(this.template, config);
  }

  private _createConfig() {
    const config = new MatLegacySnackBarConfig();
    config.verticalPosition = this.verticalPosition;
    config.horizontalPosition = this.horizontalPosition;
    config.duration = this.setAutoHide ? this.autoHide : 0;
    config.panelClass = this.addExtraClass ? ['demo-party'] : undefined;
    config.direction = this._dir.value;
    return config;
  }
}
