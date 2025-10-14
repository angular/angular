/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable, inject} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {TitleStrategy} from '@angular/router';
export const ROUTE_TITLE_PROPERTY = 'label';
export const ROUTE_PARENT_PROPERTY = 'parent';
export const TITLE_SUFFIX = 'Angular';
export const TITLE_SEPARATOR = ' • ';
export const DEFAULT_PAGE_TITLE = 'Overview';
let ADevTitleStrategy = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = TitleStrategy;
  var ADevTitleStrategy = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ADevTitleStrategy = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    title = inject(Title);
    constructor() {
      super();
    }
    updateTitle(routerState) {
      const title = this.buildTitle(routerState);
      if (title !== undefined) {
        this.title.setTitle(title);
      }
    }
    buildTitle(snapshot) {
      let route = snapshot.root;
      while (route.firstChild) {
        route = route.firstChild;
      }
      const data = route.data;
      const routeTitle = data.label ?? '';
      const prefix =
        routeTitle.startsWith(DEFAULT_PAGE_TITLE) && data.parent
          ? `${data.parent.label}${TITLE_SEPARATOR}`
          : '';
      return !!routeTitle
        ? `${prefix}${routeTitle}${TITLE_SEPARATOR}${TITLE_SUFFIX}`
        : TITLE_SUFFIX;
    }
  };
  return (ADevTitleStrategy = _classThis);
})();
export {ADevTitleStrategy};
//# sourceMappingURL=a-dev-title-strategy.js.map
