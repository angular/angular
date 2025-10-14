/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ChangeDetectionStrategy, Component, inject, computed} from '@angular/core';
import {NavigationState} from '../../services/index';
import {RouterLink} from '@angular/router';
let Breadcrumb = (() => {
  let _classDecorators = [
    Component({
      selector: 'docs-breadcrumb',
      imports: [RouterLink],
      templateUrl: './breadcrumb.component.html',
      styleUrls: ['./breadcrumb.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Breadcrumb = class {
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
      Breadcrumb = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    navigationState = inject(NavigationState);
    breadcrumbItems = computed(() => {
      const breadcrumbs = [];
      let activeItem = this.navigationState.activeNavigationItem()?.parent;
      while (activeItem != null) {
        breadcrumbs.push(activeItem);
        activeItem = activeItem.parent;
      }
      return breadcrumbs.reverse();
    });
  };
  return (Breadcrumb = _classThis);
})();
export {Breadcrumb};
//# sourceMappingURL=breadcrumb.component.js.map
