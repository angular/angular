/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewportScroller} from '@angular/common';
import {Injectable, InjectionToken, NgZone, OnDestroy} from '@angular/core';
import {Unsubscribable} from 'rxjs';

import {NavigationEnd, NavigationSkipped, NavigationSkippedCode, NavigationStart, Scroll} from './events';
import {NavigationTransitions} from './navigation_transition';
import {UrlSerializer} from './url_tree';

export const ROUTER_SCROLLER = new InjectionToken<RouterScroller>('');

@Injectable()
export class RouterScroller implements OnDestroy {
  private routerEventsSubscription?: Unsubscribable;
  private scrollEventsSubscription?: Unsubscribable;

  private lastId = 0;
  private lastSource: 'imperative'|'popstate'|'hashchange'|undefined = 'imperative';
  private restoredId = 0;
  private store: {[key: string]: [number, number]} = {};

  /** @nodoc */
  constructor(
      readonly urlSerializer: UrlSerializer, private transitions: NavigationTransitions,
      public readonly viewportScroller: ViewportScroller, private readonly zone: NgZone,
      private options: {
        scrollPositionRestoration?: 'disabled'|'enabled'|'top',
        anchorScrolling?: 'disabled'|'enabled'
      } = {}) {
    // Default both options to 'disabled'
    options.scrollPositionRestoration = options.scrollPositionRestoration || 'disabled';
    options.anchorScrolling = options.anchorScrolling || 'disabled';
  }

  init(): void {
    // we want to disable the automatic scrolling because having two places
    // responsible for scrolling results race conditions, especially given
    // that browser don't implement this behavior consistently
    if (this.options.scrollPositionRestoration !== 'disabled') {
      this.viewportScroller.setHistoryScrollRestoration('manual');
    }
    this.routerEventsSubscription = this.createScrollEvents();
    this.scrollEventsSubscription = this.consumeScrollEvents();
  }

  private createScrollEvents() {
    return this.transitions.events.subscribe(e => {
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
          e.code === NavigationSkippedCode.IgnoredSameUrlNavigation) {
        this.lastSource = undefined;
        this.restoredId = 0;
        this.scheduleScrollEvent(e, this.urlSerializer.parse(e.url).fragment);
      }
    });
  }

  private consumeScrollEvents() {
    return this.transitions.events.subscribe(e => {
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

  private scheduleScrollEvent(routerEvent: NavigationEnd|NavigationSkipped, anchor: string|null):
      void {
    this.zone.runOutsideAngular(() => {
      // The scroll event needs to be delayed until after change detection. Otherwise, we may
      // attempt to restore the scroll position before the router outlet has fully rendered the
      // component by executing its update block of the template function.
      setTimeout(() => {
        this.zone.run(() => {
          this.transitions.events.next(new Scroll(
              routerEvent, this.lastSource === 'popstate' ? this.store[this.restoredId] : null,
              anchor));
        });
      }, 0);
    });
  }

  /** @nodoc */
  ngOnDestroy() {
    this.routerEventsSubscription?.unsubscribe();
    this.scrollEventsSubscription?.unsubscribe();
  }
}
