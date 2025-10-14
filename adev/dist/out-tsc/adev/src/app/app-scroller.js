import {__esDecorate, __runInitializers} from 'tslib';
/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ViewportScroller} from '@angular/common';
import {
  Injectable,
  inject,
  ApplicationRef,
  afterNextRender,
  EnvironmentInjector,
} from '@angular/core';
import {Scroll, Router} from '@angular/router';
import {filter, firstValueFrom, map, switchMap, tap} from 'rxjs';
let AppScroller = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AppScroller = class {
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
      AppScroller = _classThis = _classDescriptor.value;
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
    viewportScroller = inject(ViewportScroller);
    appRef = inject(ApplicationRef);
    injector = inject(EnvironmentInjector);
    _lastScrollEvent;
    canScroll = false;
    cancelScroll;
    get lastScrollEvent() {
      return this._lastScrollEvent;
    }
    constructor() {
      this.viewportScroller.setHistoryScrollRestoration('manual');
      this.router.events
        .pipe(
          filter((e) => e instanceof Scroll),
          tap((e) => {
            this.cancelScroll?.();
            this.canScroll = true;
            this._lastScrollEvent = e;
          }),
          filter(() => {
            const info = this.router.lastSuccessfulNavigation()?.extras.info;
            return !info?.['disableScrolling'];
          }),
          switchMap((e) => {
            return firstValueFrom(
              this.appRef.isStable.pipe(
                filter((stable) => stable),
                map(() => e),
              ),
            );
          }),
        )
        .subscribe(() => {
          this.scroll();
        });
      // This value is primarly intended to offset the scroll position on mobile when the menu is on the top.
      // But on desktop, it doesn't hurt to have a small offset either.
      this.viewportScroller.setOffset([0, 64]);
    }
    scroll(injector) {
      if (!this._lastScrollEvent || !this.canScroll) {
        return;
      }
      // Prevent double scrolling on the same event
      this.canScroll = false;
      const {anchor, position} = this._lastScrollEvent;
      // Don't scroll during rendering
      const ref = afterNextRender(
        {
          write: () => {
            if (position) {
              this.viewportScroller.scrollToPosition(position);
            } else if (anchor) {
              this.viewportScroller.scrollToAnchor(anchor);
            } else {
              this.viewportScroller.scrollToPosition([0, 0]);
            }
          },
        },
        // Use the component injector when provided so that the manager can
        // deregister the sequence once the component is destroyed.
        {injector: injector ?? this.injector},
      );
      this.cancelScroll = () => {
        ref.destroy();
      };
    }
  };
  return (AppScroller = _classThis);
})();
export {AppScroller};
//# sourceMappingURL=app-scroller.js.map
