/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  afterNextRender,
  Component,
  DestroyRef,
  effect,
  inject,
  Injector,
  viewChildren,
} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import {NgTemplateOutlet} from '@angular/common';
import {SearchHistory} from '../../services';
import {RelativeLink} from '../../pipes';
import {SearchItem} from '../../directives';
let SearchHistoryComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'docs-search-history',
      imports: [NgTemplateOutlet, RelativeLink, RouterLink, SearchItem],
      templateUrl: './search-history.component.html',
      styleUrl: './search-history.component.scss',
      host: {
        '(document:keydown)': 'onKeydown($event)',
        '(document:mousemove)': 'onMouseMove($event)',
      },
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var SearchHistoryComponent = class {
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
      SearchHistoryComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    items = viewChildren(SearchItem);
    history = inject(SearchHistory);
    injector = inject(Injector);
    router = inject(Router);
    relativeLink = new RelativeLink();
    keyManager = new ActiveDescendantKeyManager(this.items, this.injector).withWrap();
    lastMouseCoor = {x: 0, y: 0};
    constructor() {
      inject(DestroyRef).onDestroy(() => this.keyManager.destroy());
      afterNextRender({
        write: () => {
          if (this.items().length) {
            this.keyManager.setFirstItemActive();
          }
        },
      });
      const keyManagerActive = toSignal(this.keyManager.change);
      effect(() => {
        if (keyManagerActive() !== undefined) {
          this.keyManager.activeItem?.scrollIntoView();
        }
      });
    }
    onKeydown(e) {
      if (e.key === 'Enter') {
        this.navigateToTheActiveItem();
      } else {
        this.keyManager.onKeydown(e);
      }
    }
    onMouseMove(e) {
      // Happens before mouseenter
      this.lastMouseCoor = {x: e.clientX, y: e.clientY};
    }
    onMouseEnter(e, idx) {
      // Since `mouseenter` can be called when there isn't a `mousemove`
      // in the case when the key navigation is scrolling items into the view
      // that happen to be under the mouse cursor, we need to perform a mouse
      // coor check to prevent this undesired behavior.
      const {x, y} = this.lastMouseCoor;
      if (e.clientX === x && e.clientY === y) {
        return;
      }
      this.keyManager.setActiveItem(idx);
    }
    navigateToTheActiveItem() {
      const activeItemLink = this.keyManager.activeItem?.item()?.url;
      if (activeItemLink) {
        const url = this.relativeLink.transform(activeItemLink);
        this.router.navigateByUrl(url);
      }
    }
  };
  return (SearchHistoryComponent = _classThis);
})();
export {SearchHistoryComponent};
//# sourceMappingURL=search-history.component.js.map
