/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Injectable, InjectionToken} from '@angular/core';
import {
  IMPERATIVE_NAVIGATION,
  NavigationEnd,
  NavigationSkipped,
  NavigationSkippedCode,
  NavigationStart,
  Scroll,
} from './events';
export const ROUTER_SCROLLER = new InjectionToken('');
let RouterScroller = class RouterScroller {
  /** @docs-private */
  constructor(urlSerializer, transitions, viewportScroller, zone, options = {}) {
    this.urlSerializer = urlSerializer;
    this.transitions = transitions;
    this.viewportScroller = viewportScroller;
    this.zone = zone;
    this.options = options;
    this.lastId = 0;
    this.lastSource = IMPERATIVE_NAVIGATION;
    this.restoredId = 0;
    this.store = {};
    // Default both options to 'disabled'
    options.scrollPositionRestoration || (options.scrollPositionRestoration = 'disabled');
    options.anchorScrolling || (options.anchorScrolling = 'disabled');
  }
  init() {
    // we want to disable the automatic scrolling because having two places
    // responsible for scrolling results race conditions, especially given
    // that browser don't implement this behavior consistently
    if (this.options.scrollPositionRestoration !== 'disabled') {
      this.viewportScroller.setHistoryScrollRestoration('manual');
    }
    this.routerEventsSubscription = this.createScrollEvents();
    this.scrollEventsSubscription = this.consumeScrollEvents();
  }
  createScrollEvents() {
    return this.transitions.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        // store the scroll position of the current stable navigations.
        this.store[this.lastId] = this.viewportScroller.getScrollPosition();
        this.lastSource = e.navigationTrigger;
        this.restoredId = e.restoredState ? e.restoredState.navigationId : 0;
      } else if (e instanceof NavigationEnd) {
        this.lastId = e.id;
        this.scheduleScrollEvent(e, this.urlSerializer.parse(e.urlAfterRedirects).fragment);
      } else if (
        e instanceof NavigationSkipped &&
        e.code === NavigationSkippedCode.IgnoredSameUrlNavigation
      ) {
        this.lastSource = undefined;
        this.restoredId = 0;
        this.scheduleScrollEvent(e, this.urlSerializer.parse(e.url).fragment);
      }
    });
  }
  consumeScrollEvents() {
    return this.transitions.events.subscribe((e) => {
      if (!(e instanceof Scroll)) return;
      // a popstate event. The pop state event will always ignore anchor scrolling.
      if (e.position) {
        if (this.options.scrollPositionRestoration === 'top') {
          this.viewportScroller.scrollToPosition([0, 0]);
        } else if (this.options.scrollPositionRestoration === 'enabled') {
          this.viewportScroller.scrollToPosition(e.position);
        }
        // imperative navigation "forward"
      } else {
        if (e.anchor && this.options.anchorScrolling === 'enabled') {
          this.viewportScroller.scrollToAnchor(e.anchor);
        } else if (this.options.scrollPositionRestoration !== 'disabled') {
          this.viewportScroller.scrollToPosition([0, 0]);
        }
      }
    });
  }
  scheduleScrollEvent(routerEvent, anchor) {
    this.zone.runOutsideAngular(async () => {
      // The scroll event needs to be delayed until after change detection. Otherwise, we may
      // attempt to restore the scroll position before the router outlet has fully rendered the
      // component by executing its update block of the template function.
      //
      // #57109 (we need to wait at least a macrotask before scrolling. AfterNextRender resolves in microtask event loop with Zones)
      // We could consider _also_ waiting for a render promise though one should have already happened or been scheduled by this point
      // and should definitely happen before rAF/setTimeout.
      // #53985 (cannot rely solely on setTimeout because a frame may paint before the timeout)
      await new Promise((resolve) => {
        setTimeout(resolve);
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(resolve);
        }
      });
      this.zone.run(() => {
        this.transitions.events.next(
          new Scroll(
            routerEvent,
            this.lastSource === 'popstate' ? this.store[this.restoredId] : null,
            anchor,
          ),
        );
      });
    });
  }
  /** @docs-private */
  ngOnDestroy() {
    this.routerEventsSubscription?.unsubscribe();
    this.scrollEventsSubscription?.unsubscribe();
  }
};
RouterScroller = __decorate([Injectable()], RouterScroller);
export {RouterScroller};
//# sourceMappingURL=router_scroller.js.map
