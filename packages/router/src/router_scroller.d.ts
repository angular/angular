/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ViewportScroller } from '@angular/common';
import { InjectionToken, NgZone, OnDestroy } from '@angular/core';
import { NavigationTransitions } from './navigation_transition';
import { UrlSerializer } from './url_tree';
export declare const ROUTER_SCROLLER: InjectionToken<RouterScroller>;
export declare class RouterScroller implements OnDestroy {
    readonly urlSerializer: UrlSerializer;
    private transitions;
    readonly viewportScroller: ViewportScroller;
    private readonly zone;
    private options;
    private routerEventsSubscription?;
    private scrollEventsSubscription?;
    private lastId;
    private lastSource;
    private restoredId;
    private store;
    /** @docs-private */
    constructor(urlSerializer: UrlSerializer, transitions: NavigationTransitions, viewportScroller: ViewportScroller, zone: NgZone, options?: {
        scrollPositionRestoration?: 'disabled' | 'enabled' | 'top';
        anchorScrolling?: 'disabled' | 'enabled';
    });
    init(): void;
    private createScrollEvents;
    private consumeScrollEvents;
    private scheduleScrollEvent;
    /** @docs-private */
    ngOnDestroy(): void;
}
