/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {NgTemplateOutlet} from '@angular/common';
let TutorialNavigationList = (() => {
  let _classDecorators = [
    Component({
      selector: 'adev-tutorial-navigation-list',
      imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
      template: `
  <ng-template #navigationList let-navigationItems>
  <ul class="docs-navigation-list docs-faceted-list">
    @for (item of navigationItems; track $index) {
      <li class="docs-faceted-list-item">
        <a
        [routerLink]="'/' + item.path"
        routerLinkActive="docs-faceted-list-item-active"
        [routerLinkActiveOptions]="{ exact: true }"
        >
            <span class="docs-faceted-list-item-text"> {{item.label}} </span>
        </a>

        @if (item.children && item.children.length > 0) {
          <ng-container
            *ngTemplateOutlet="navigationList; context: {$implicit: item.children, level: item.level}"
          />
        }
      </li>
    }
  </ul>
</ng-template>

<ng-container *ngTemplateOutlet="navigationList; context: {$implicit: navigationItems()}" />
  `,
      styleUrls: ['./tutorial-navigation-list.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TutorialNavigationList = class {
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
      TutorialNavigationList = _classThis = _classDescriptor.value;
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
  };
  return (TutorialNavigationList = _classThis);
})();
export {TutorialNavigationList};
//# sourceMappingURL=tutorial-navigation-list.js.map
