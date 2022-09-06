/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LiveAnnouncer} from '@angular/cdk/a11y';
import {BreakpointObserver} from '@angular/cdk/layout';
import {Overlay} from '@angular/cdk/overlay';
import {Inject, Injectable, Injector, Optional, SkipSelf} from '@angular/core';
import {LegacySimpleSnackBar} from './simple-snack-bar';
import {
  _MatSnackBarBase,
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatSnackBarConfig,
} from '@angular/material/snack-bar';
import {MatLegacySnackBarContainer} from './snack-bar-container';
import {MatLegacySnackBarModule} from './snack-bar-module';

/**
 * Service to dispatch Material Design snack bar messages.
 * @deprecated Use `MatSnackBar` from `@angular/material/snack-bar` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@Injectable({providedIn: MatLegacySnackBarModule})
export class MatLegacySnackBar extends _MatSnackBarBase {
  protected simpleSnackBarComponent = LegacySimpleSnackBar;
  protected snackBarContainerComponent = MatLegacySnackBarContainer;
  protected handsetCssClass = 'mat-snack-bar-handset';

  constructor(
    overlay: Overlay,
    live: LiveAnnouncer,
    injector: Injector,
    breakpointObserver: BreakpointObserver,
    @Optional() @SkipSelf() parentSnackBar: MatLegacySnackBar,
    @Inject(MAT_SNACK_BAR_DEFAULT_OPTIONS) defaultConfig: MatSnackBarConfig,
  ) {
    super(overlay, live, injector, breakpointObserver, parentSnackBar, defaultConfig);
  }
}
