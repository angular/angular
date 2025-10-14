/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ChangeDetectionStrategy, Component, inject, input, output} from '@angular/core';
import {NavigationState} from '../../services/index';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {IconComponent} from '../icon/icon.component';
import {IsActiveNavigationItem} from '../../pipes';
import {NgTemplateOutlet, TitleCasePipe} from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ReactiveFormsModule} from '@angular/forms';
let NavigationList = (() => {
  let _classDecorators = [
    Component({
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
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var NavigationList = class {
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
      NavigationList = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    navigationItems = input.required();
    displayItemsToLevel = input(2);
    collapsableLevel = input();
    expandableLevel = input(2);
    isDropdownView = input(false);
    linkClicked = output();
    navigationState = inject(NavigationState);
    activeItem = this.navigationState.activeNavigationItem;
    toggle(item) {
      if (
        item.level === 1 &&
        item.level !== this.expandableLevel() &&
        item.level !== this.collapsableLevel()
      ) {
        return;
      }
      this.navigationState.toggleItem(item);
    }
    emitClickOnLink() {
      this.linkClicked.emit();
    }
    hasCategories(items) {
      return items.some((item) => !!item.category);
    }
    groupItems(items) {
      const hasCategories = this.hasCategories(items);
      if (hasCategories) {
        const others = [];
        const categorizedItems = new Map();
        for (const item of items) {
          const category = item.category || 'Other';
          if (category === 'Other') {
            others.push(item);
            continue;
          }
          if (!categorizedItems.has(category)) {
            categorizedItems.set(category, []);
          }
          categorizedItems.get(category).push(item);
        }
        if (others.length) {
          categorizedItems.set('Other', others);
        }
        return categorizedItems;
      } else {
        return new Map([['', items]]);
      }
    }
  };
  return (NavigationList = _classThis);
})();
export {NavigationList};
//# sourceMappingURL=navigation-list.component.js.map
