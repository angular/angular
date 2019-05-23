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
  Component,
  ElementRef,
  Inject,
  NgZone,
  Provider,
  ViewEncapsulation
} from '@angular/core';
import {
  MAT_MENU_DEFAULT_OPTIONS,
  MAT_MENU_PANEL,
  MAT_MENU_SCROLL_STRATEGY,
  MatMenu as BaseMatMenu,
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
  moduleId: module.id,
  selector: 'mat-menu',
  templateUrl: 'menu.html',
  styleUrls: ['menu.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matMenu',
  animations: [
    matMenuAnimations.transformMenu,
    matMenuAnimations.fadeInItems
  ],
  providers: [
    {provide: MAT_MENU_PANEL, useExisting: MatMenu},
    {provide: BaseMatMenu, useExisting: MatMenu},
  ]
})
export class MatMenu extends BaseMatMenu {

  constructor(_elementRef: ElementRef<HTMLElement>,
              _ngZone: NgZone,
              @Inject(MAT_MENU_DEFAULT_OPTIONS) _defaultOptions: MatMenuDefaultOptions) {
    super(_elementRef, _ngZone, _defaultOptions);
  }

  setElevation(_depth: number) {
    // TODO(crisbeto): MDC's styles come with elevation already and we haven't mapped our mixins
    // to theirs. Disable the elevation stacking for now until everything has been mapped.
    // The following unit tests should be re-enabled:
    // - should not remove mat-elevation class from overlay when panelClass is changed
    // - should increase the sub-menu elevation based on its depth
    // - should update the elevation when the same menu is opened at a different depth
    // - should not increase the elevation if the user specified a custom one
  }
}
