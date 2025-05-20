/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, inject, linkedSignal, signal} from '@angular/core';
import {NavigationItem} from '../interfaces/index';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationState {
  private readonly router = inject(Router);

  private readonly _activeNavigationItem = signal<NavigationItem | null>(null);
  private readonly _expandedItems = signal<NavigationItem[]>([]);
  private readonly _isMobileNavVisible = signal<boolean>(false);
  private readonly _level = linkedSignal(() => this._expandedItems().length);

  primaryActiveRouteItem = signal<string | null>(null);
  activeNavigationItem = this._activeNavigationItem.asReadonly();
  expandedItems = this._expandedItems.asReadonly();
  isMobileNavVisible = this._isMobileNavVisible.asReadonly();
  level = this._level.asReadonly();

  async toggleItem(item: NavigationItem): Promise<void> {
    if (!item.children) {
      return;
    }

    if (item.isExpanded) {
      this.collapse(item);
    } else if (item.children && item.children.length > 0 && item.children[0].path) {
      // It resolves false, when the user has displayed the page, then changed the slide to a secondary navigation component
      // and wants to reopen the slide, where the first item is the currently displayed page
      const navigationSucceeds = await this.navigateToFirstPageOfTheCategory(item.children[0].path);

      if (!navigationSucceeds) {
        this.expand(item);
      }
    }
  }

  cleanExpandedState(): void {
    this._expandedItems.set([]);
  }

  expandItemHierarchy(
    item: NavigationItem,
    shouldExpand: (item: NavigationItem) => boolean,
    skipExpandPredicateFn?: (item: NavigationItem) => boolean,
  ): void {
    if (skipExpandPredicateFn && skipExpandPredicateFn(item)) {
      // When `skipExpandPredicateFn` returns `true` then we should trigger `cleanExpandedState`
      // to be sure that first navigation slide will be displayed.
      this.cleanExpandedState();
      return;
    }
    // Returns item when parent node was already expanded
    const parentItem = this.actualExpandedItems().find(
      (expandedItem) =>
        item.parent?.label === expandedItem.label && item.parent?.path === expandedItem.path,
    );

    if (parentItem) {
      // If the parent item is expanded, then we should display all expanded items up to the active item level.
      // This provides us with an appropriate list of expanded elements also when the user navigates using browser buttons.
      this._expandedItems.update((expandedItems) =>
        expandedItems.filter(
          (item) =>
            item.level !== undefined &&
            parentItem.level !== undefined &&
            item.level <= parentItem.level,
        ),
      );
    } else {
      let itemsToExpand: NavigationItem[] = [];

      let node = item.parent;

      while (node && shouldExpand(node)) {
        itemsToExpand.push({...node, isExpanded: true});
        node = node.parent;
      }

      this._expandedItems.set(itemsToExpand.reverse());
    }
  }

  setActiveNavigationItem(item: NavigationItem | null): void {
    this._activeNavigationItem.set(item);
  }

  setMobileNavigationListVisibility(isVisible: boolean): void {
    this._isMobileNavVisible.set(isVisible);
  }

  private expand(item: NavigationItem): void {
    // Add item to the expanded items list
    this._expandedItems.update((expandedItems) => {
      return [...(this.actualExpandedItems() ?? []), {...item, isExpanded: true}];
    });

    // No need to update the level here, this is handled by linkedSignal already
  }

  private collapse(item: NavigationItem): void {
    item.isExpanded = false;

    // We won't remove the item, just update the level,
    // this allows animation on the items to hide them without destroying them
    this._level.set(this.actualExpandedItems().length - 1);
  }

  /**
   * return the actual navigation items, that is to say the one that match the current level
   */
  private actualExpandedItems() {
    return this.expandedItems().slice(0, this.level());
  }

  private async navigateToFirstPageOfTheCategory(path: string): Promise<boolean> {
    return this.router.navigateByUrl(path);
  }
}
