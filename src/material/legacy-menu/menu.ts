/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  NgZone,
  ViewEncapsulation,
  ChangeDetectorRef,
} from '@angular/core';
import {
  MAT_MENU_PANEL,
  matMenuAnimations,
  _MatMenuBase,
  MAT_MENU_DEFAULT_OPTIONS,
  MatMenuDefaultOptions,
} from '@angular/material/menu';

/**
 * @docs-public MatMenu
 * @deprecated Use `MatMenu` from `@angular/material/menu` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@Component({
  selector: 'mat-menu',
  templateUrl: 'menu.html',
  styleUrls: ['menu.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matMenu',
  host: {
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-describedby]': 'null',
  },
  animations: [matMenuAnimations.transformMenu, matMenuAnimations.fadeInItems],
  providers: [{provide: MAT_MENU_PANEL, useExisting: MatLegacyMenu}],
})
export class MatLegacyMenu extends _MatMenuBase {
  protected override _elevationPrefix = 'mat-elevation-z';
  protected override _baseElevation = 4;

  /**
   * @deprecated `changeDetectorRef` parameter will become a required parameter.
   * @breaking-change 15.0.0
   */
  constructor(
    elementRef: ElementRef<HTMLElement>,
    ngZone: NgZone,
    defaultOptions: MatMenuDefaultOptions,
  );

  constructor(
    elementRef: ElementRef<HTMLElement>,
    ngZone: NgZone,
    @Inject(MAT_MENU_DEFAULT_OPTIONS) defaultOptions: MatMenuDefaultOptions,
    changeDetectorRef?: ChangeDetectorRef,
  ) {
    super(elementRef, ngZone, defaultOptions, changeDetectorRef);
  }
}
