/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from './router_state';
/**
 * Provides a strategy for setting the page title after a router navigation.
 *
 * The built-in implementation traverses the router state snapshot and finds the deepest primary
 * outlet with `title` property. Given the `Routes` below, navigating to
 * `/base/child(popup:aux)` would result in the document title being set to "child".
 * ```ts
 * [
 *   {path: 'base', title: 'base', children: [
 *     {path: 'child', title: 'child'},
 *   ],
 *   {path: 'aux', outlet: 'popup', title: 'popupTitle'}
 * ]
 * ```
 *
 * This class can be used as a base class for custom title strategies. That is, you can create your
 * own class that extends the `TitleStrategy`. Note that in the above example, the `title`
 * from the named outlet is never used. However, a custom strategy might be implemented to
 * incorporate titles in named outlets.
 *
 * @publicApi
 * @see [Page title guide](guide/routing/common-router-tasks#setting-the-page-title)
 */
export declare abstract class TitleStrategy {
    /** Performs the application title update. */
    abstract updateTitle(snapshot: RouterStateSnapshot): void;
    /**
     * @returns The `title` of the deepest primary route.
     */
    buildTitle(snapshot: RouterStateSnapshot): string | undefined;
    /**
     * Given an `ActivatedRouteSnapshot`, returns the final value of the
     * `Route.title` property, which can either be a static string or a resolved value.
     */
    getResolvedTitleForRoute(snapshot: ActivatedRouteSnapshot): any;
}
/**
 * The default `TitleStrategy` used by the router that updates the title using the `Title` service.
 */
export declare class DefaultTitleStrategy extends TitleStrategy {
    readonly title: Title;
    constructor(title: Title);
    /**
     * Sets the title of the browser to the given value.
     *
     * @param title The `pageTitle` from the deepest primary route.
     */
    updateTitle(snapshot: RouterStateSnapshot): void;
}
