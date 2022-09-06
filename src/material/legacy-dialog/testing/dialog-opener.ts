/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentType} from '@angular/cdk/overlay';
import {ChangeDetectionStrategy, Component, NgModule, ViewEncapsulation} from '@angular/core';
import {
  MatLegacyDialog,
  MatLegacyDialogConfig,
  MatLegacyDialogContainer,
  MatLegacyDialogModule,
} from '@angular/material/legacy-dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {_MatTestDialogOpenerBase} from '@angular/material/dialog/testing';

/**
 * Test component that immediately opens a dialog when created.
 * @deprecated Use `MatTestDialogOpener` from `@angular/material/dialog/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@Component({
  selector: 'mat-test-dialog-opener',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatTestLegacyDialogOpener<T = unknown, R = unknown> extends _MatTestDialogOpenerBase<
  MatLegacyDialogContainer,
  T,
  R
> {
  constructor(dialog: MatLegacyDialog) {
    super(dialog);
  }

  /** Static method that prepares this class to open the provided component. */
  static withComponent<T = unknown, R = unknown>(
    component: ComponentType<T>,
    config?: MatLegacyDialogConfig,
  ) {
    _MatTestDialogOpenerBase.component = component;
    _MatTestDialogOpenerBase.config = config;
    return MatTestLegacyDialogOpener as ComponentType<MatTestLegacyDialogOpener<T, R>>;
  }
}

/**
 * @deprecated Use `MatTestDialogOpenerModule` from `@angular/material/dialog/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@NgModule({
  declarations: [MatTestLegacyDialogOpener],
  imports: [MatLegacyDialogModule, NoopAnimationsModule],
})
export class MatTestLegacyDialogOpenerModule {}
