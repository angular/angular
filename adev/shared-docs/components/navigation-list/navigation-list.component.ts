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
import {IsActiveNavigationItem} from '../../pipes';
import {NgTemplateOutlet, TitleCasePipe} from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'docs-navigation-list',
  imports: [
    RouterLink,
    RouterLinkActive,
    IconComponent,
    IsActiveNavigationItem,
    NgTemplateOutlet,
    MatTooltipModule,
    ReactiveFormsModule,
    TitleCasePipe,
  ],
  templateUrl: './navigation-list.component.html',
  styleUrls: ['./navigation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationList {
  readonly navigationItems = input.required<NavigationItem[]>();
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

  protected groupItems(items: NavigationItem[]): Map<string, NavigationItem[]> {
    const hasCategories = this.hasCategories(items);
    if (hasCategories) {
      const others: NavigationItem[] = [];
      const categorizedItems = new Map<string, NavigationItem[]>();
      for (const item of items) {
        const category = item.category || 'Other';
        if (category === 'Other') {
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
