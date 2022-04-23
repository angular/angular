/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewEncapsulation, ChangeDetectionStrategy} from '@angular/core';
import {CdkMenuItem} from '@angular/cdk/menu';

/** Removes all icons from within the given element. */
function removeIcons(element: Element) {
  for (const icon of Array.from(element.querySelectorAll('mat-icon, .material-icons'))) {
    icon.remove();
  }
}

/**
 * A material design MenubarItem adhering to the functionality of CdkMenuItem and
 * CdkMenuItemTrigger. Its main purpose is to trigger menus and it lives inside of
 * MatMenubar.
 */
@Component({
  selector: 'mat-menubar-item',
  exportAs: 'matMenubarItem',
  templateUrl: 'menubar-item.html',
  styleUrls: ['menubar-item.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[tabindex]': '_tabindex',
    'type': 'button',
    'role': 'menuitem',
    'class': 'cdk-menu-item mat-menubar-item',
    '[attr.aria-disabled]': 'disabled || null',
  },
  providers: [{provide: CdkMenuItem, useExisting: MatMenuBarItem}],
})
export class MatMenuBarItem extends CdkMenuItem {
  override getLabel(): string {
    if (this.typeaheadLabel !== undefined) {
      return this.typeaheadLabel || '';
    }
    const clone = this._elementRef.nativeElement.cloneNode(true) as Element;
    removeIcons(clone);
    return clone.textContent?.trim() || '';
  }
}
