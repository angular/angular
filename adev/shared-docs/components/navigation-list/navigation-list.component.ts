/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgTemplateOutlet} from '@angular/common';
import {ChangeDetectionStrategy, Component, inject, input, output} from '@angular/core';
import {MatTooltip} from '@angular/material/tooltip';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {NavigationItem} from '../../interfaces/index';
import {IsActiveNavigationItem} from '../../pipes';
import {NavigationState} from '../../services/index';
import {IconComponent} from '../icon/icon.component';

@Component({
  selector: 'docs-navigation-list',
  imports: [
    RouterLink,
    RouterLinkActive,
    IconComponent,
    IsActiveNavigationItem,
    NgTemplateOutlet,
    MatTooltip,
  ],
  templateUrl: './navigation-list.component.html',
  styleUrls: ['./navigation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationList {
  readonly navigationItems = input.required<NavigationItem[]>();
  readonly preserveOtherCategoryOrder = input.required<boolean>();
  readonly displayItemsToLevel = input(2);
  readonly collapsableLevel = input<number | undefined>();
  readonly expandableLevel = input(2);
  readonly isDropdownView = input(false);

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

  private hasCategories(items: NavigationItem[]): boolean {
    return items.some((item) => !!item.category);
  }

  protected groupItems(
    items: NavigationItem[],
    preserveOtherCategoryOrder: boolean,
  ): Map<string, NavigationItem[]> {
    const hasCategories = this.hasCategories(items);
    if (hasCategories) {
      const others: NavigationItem[] = [];
      const categorizedItems = new Map<string, NavigationItem[]>();
      for (const item of items) {
        const category = item.category || 'Other';
        if (!preserveOtherCategoryOrder && category === 'Other') {
          others.push(item);
          continue;
        }
        if (!categorizedItems.has(category)) {
          categorizedItems.set(category, []);
        }
        categorizedItems.get(category)!.push(item);
      }
      if (others.length) {
        categorizedItems.set('Other', others);
      }
      return categorizedItems;
    } else {
      return new Map([['', items]]);
    }
  }
}
