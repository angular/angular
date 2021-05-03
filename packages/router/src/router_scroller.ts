/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewportScroller} from '@angular/common';
import {Injectable, OnDestroy} from '@angular/core';
import {Unsubscribable} from 'rxjs';

import {NavigationEnd, NavigationStart, Scroll} from './events';
import {Router} from './router';

@Injectable()
export class RouterScroller implements OnDestroy {
  // TODO(issue/24571): remove '!'.
  private routerEventsSubscription!: Unsubscribable;
  // TODO(issue/24571): remove '!'.
  private scrollEventsSubscription!: Unsubscribable;

  private lastId = 0;
  private lastSource: 'imperative'|'popstate'|'hashchange'|undefined = 'imperative';
  private restoredId = 0;
  private store: {[key: string]: [number, number]} = {};

  constructor(
      private router: Router,
      /** @docsNotRequired */ public readonly viewportScroller: ViewportScroller, private options: {
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
    return this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) {
        // store the scroll position of the current stable navigations.
        this.store[this.lastId] = this.viewportScroller.getScrollPosition();
        this.lastSource = e.navigationTrigger;
        this.restoredId = e.restoredState ? e.restoredState.navigationId : 0;
      } else if (e instanceof NavigationEnd) {
        this.lastId = e.id;
        this.scheduleScrollEvent(e, this.router.parseUrl(e.urlAfterRedirects).fragment);
      }
    });
  }

  private consumeScrollEvents() {
    return this.router.events.subscribe(e => {
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

  private scheduleScrollEvent(routerEvent: NavigationEnd, anchor: string|null): void {
    this.router.triggerEvent(new Scroll(
        routerEvent, this.lastSource === 'popstate' ? this.store[this.restoredId] : null, anchor));
  }

  /** @nodoc */
  ngOnDestroy() {
    if (this.routerEventsSubscription) {
      this.routerEventsSubscription.unsubscribe();
    }
    if (this.scrollEventsSubscription) {
      this.scrollEventsSubscription.unsubscribe();
    }
  }
}
