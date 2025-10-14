/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Component, effect, inject, model} from '@angular/core';
import {IS_SEARCH_DIALOG_OPEN, Search} from '@angular/docs';
import {RouterOutlet} from '@angular/router';
let MainComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'adev-main',
      imports: [RouterOutlet],
      template: `<router-outlet />`,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var MainComponent = class {
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
      MainComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    displaySearchDialog = inject(IS_SEARCH_DIALOG_OPEN);
    searchService = inject(Search);
    search = model('');
    constructor() {
      effect(() => {
        const search = this.search();
        if (search !== undefined) {
          this.displaySearchDialog.set(true);
          this.searchService.searchQuery.set(search);
        }
      });
    }
  };
  return (MainComponent = _classThis);
})();
export default MainComponent;
//# sourceMappingURL=main.component.js.map
