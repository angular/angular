/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable, inject, linkedSignal, signal} from '@angular/core';
import {Router} from '@angular/router';
let NavigationState = (() => {
  let _classDecorators = [
    Injectable({
      providedIn: 'root',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var NavigationState = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      NavigationState = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    router = inject(Router);
    _activeNavigationItem = signal(null);
    _expandedItems = signal([]);
    _isMobileNavVisible = signal(false);
    _level = linkedSignal(() => this._expandedItems().length);
    primaryActiveRouteItem = signal(null);
    activeNavigationItem = this._activeNavigationItem.asReadonly();
    expandedItems = this._expandedItems.asReadonly();
    isMobileNavVisible = this._isMobileNavVisible.asReadonly();
    level = this._level.asReadonly();
    async toggleItem(item) {
      if (!item.children) {
        return;
      }
      if (item.isExpanded) {
        this.collapse(item);
      } else if (item.children && item.children.length > 0 && item.children[0].path) {
        // It resolves false, when the user has displayed the page, then changed the slide to a secondary navigation component
        // and wants to reopen the slide, where the first item is the currently displayed page
        const navigationSucceeds = await this.navigateToFirstPageOfTheCategory(
          item.children[0].path,
        );
        if (!navigationSucceeds) {
          this.expand(item);
        }
      }
    }
    cleanExpandedState() {
      this._expandedItems.set([]);
    }
    expandItemHierarchy(item, shouldExpand, skipExpandPredicateFn) {
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
        let itemsToExpand = [];
        let node = item.parent;
        while (node && shouldExpand(node)) {
          itemsToExpand.push({...node, isExpanded: true});
          node = node.parent;
        }
        this._expandedItems.set(itemsToExpand.reverse());
      }
    }
    setActiveNavigationItem(item) {
      this._activeNavigationItem.set(item);
    }
    setMobileNavigationListVisibility(isVisible) {
      this._isMobileNavVisible.set(isVisible);
    }
    expand(item) {
      // Add item to the expanded items list
      this._expandedItems.update((expandedItems) => {
        return [...(this.actualExpandedItems() ?? []), {...item, isExpanded: true}];
      });
      // No need to update the level here, this is handled by linkedSignal already
    }
    collapse(item) {
      item.isExpanded = false;
      // We won't remove the item, just update the level,
      // this allows animation on the items to hide them without destroying them
      this._level.set(this.actualExpandedItems().length - 1);
    }
    /**
     * return the actual navigation items, that is to say the one that match the current level
     */
    actualExpandedItems() {
      return this.expandedItems().slice(0, this.level());
    }
    async navigateToFirstPageOfTheCategory(path) {
      return this.router.navigateByUrl(path);
    }
  };
  return (NavigationState = _classThis);
})();
export {NavigationState};
//# sourceMappingURL=navigation-state.service.js.map
