/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import {NavigationItem} from '../../interfaces/index';
import {NavigationState} from '../../services/index';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {CommonModule} from '@angular/common';
import {IconComponent} from '../icon/icon.component';
import {IsActiveNavigationItem} from '../../pipes/is-active-navigation-item.pipe';

@Component({
  selector: 'docs-navigation-list',
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent, IsActiveNavigationItem],
  templateUrl: './navigation-list.component.html',
  styleUrls: ['./navigation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationList {
  @Input({required: true}) navigationItems: NavigationItem[] = [];
  @Input() displayItemsToLevel: number = 2;
  @Input() collapsableLevel: number | undefined = undefined;
  @Input() expandableLevel: number = 2;
  @Input() isDropdownView = false;

  @Output() linkClicked = new EventEmitter<void>();

  private readonly navigationState = inject(NavigationState);

  expandedItems = this.navigationState.expandedItems;
  activeItem = this.navigationState.activeNavigationItem;

  toggle(item: NavigationItem): void {
    if (
      item.level === 1 &&
      item.level !== this.expandableLevel &&
      item.level !== this.collapsableLevel
    ) {
      return;
    }
    this.navigationState.toggleItem(item);
  }

  emitClickOnLink(): void {
    this.linkClicked.emit();
  }
}
