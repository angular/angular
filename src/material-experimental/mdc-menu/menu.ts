/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Overlay, ScrollStrategy} from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  NgZone,
  Provider,
  ViewEncapsulation,
} from '@angular/core';
import {
  MAT_MENU_DEFAULT_OPTIONS,
  MAT_MENU_PANEL,
  MAT_MENU_SCROLL_STRATEGY,
  _MatMenuBase,
  matMenuAnimations,
  MatMenuDefaultOptions,
} from '@angular/material/menu';

/** @docs-private */
export function MAT_MENU_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER: Provider = {
  provide: MAT_MENU_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: MAT_MENU_SCROLL_STRATEGY_FACTORY,
};

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
  providers: [{provide: MAT_MENU_PANEL, useExisting: MatMenu}],
})
export class MatMenu extends _MatMenuBase {
  protected override _elevationPrefix = 'mat-mdc-elevation-z';
  protected override _baseElevation = 8;

  /*
   * @deprecated `changeDetectorRef` parameter will become a required parameter.
   * @breaking-change 15.0.0
   */
  constructor(
    elementRef: ElementRef<HTMLElement>,
    ngZone: NgZone,
    defaultOptions: MatMenuDefaultOptions,
  );

  constructor(
    _elementRef: ElementRef<HTMLElement>,
    _ngZone: NgZone,
    @Inject(MAT_MENU_DEFAULT_OPTIONS) _defaultOptions: MatMenuDefaultOptions,
    changeDetectorRef?: ChangeDetectorRef,
  ) {
    super(_elementRef, _ngZone, _defaultOptions, changeDetectorRef);
  }
}
