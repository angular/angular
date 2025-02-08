/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject, input, output} from '@angular/core';
import {NavigationItem} from '../../interfaces/index';
import {NavigationState} from '../../services/index';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {IconComponent} from '../icon/icon.component';
import {IsActiveNavigationItem} from '../../pipes/is-active-navigation-item.pipe';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'docs-navigation-list',
  imports: [RouterLink, RouterLinkActive, IconComponent, IsActiveNavigationItem, NgTemplateOutlet],
  templateUrl: './navigation-list.component.html',
  styleUrls: ['./navigation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationList {
  readonly navigationItems = input.required<NavigationItem[]>();
  readonly displayItemsToLevel = input<number>(2);
  readonly collapsableLevel = input<number | undefined>();
  readonly expandableLevel = input<number>(2);
  readonly isDropdownView = input<boolean>(false);

  readonly linkClicked = output<void>();

  private readonly navigationState = inject(NavigationState);

  readonly activeItem = this.navigationState.activeNavigationItem;

  toggle(item: NavigationItem): void {
    if (
      item.level === 1 &&
      item.level !== this.expandableLevel() &&
      item.level !== this.collapsableLevel()
    ) {
      return;
    }
    this.navigationState.toggleItem(item);
  }

  emitClickOnLink(): void {
    this.linkClicked.emit();
  }
}
