/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { LocationStrategy } from '@angular/common';
import { ElementRef, OnChanges, OnDestroy, Renderer2, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { QueryParamsHandling } from '../models';
import { Router } from '../router';
import { ActivatedRoute } from '../router_state';
import { Params } from '../shared';
import { UrlTree } from '../url_tree';
/**
 * @description
 *
 * When applied to an element in a template, makes that element a link
 * that initiates navigation to a route. Navigation opens one or more routed components
 * in one or more `<router-outlet>` locations on the page.
 *
 * Given a route configuration `[{ path: 'user/:name', component: UserCmp }]`,
 * the following creates a static link to the route:
 * `<a routerLink="/user/bob">link to user component</a>`
 *
 * You can use dynamic values to generate the link.
 * For a dynamic link, pass an array of path segments,
 * followed by the params for each segment.
 * For example, `['/team', teamId, 'user', userName, {details: true}]`
 * generates a link to `/team/11/user/bob;details=true`.
 *
 * Multiple static segments can be merged into one term and combined with dynamic segments.
 * For example, `['/team/11/user', userName, {details: true}]`
 *
 * The input that you provide to the link is treated as a delta to the current URL.
 * For instance, suppose the current URL is `/user/(box//aux:team)`.
 * The link `<a [routerLink]="['/user/jim']">Jim</a>` creates the URL
 * `/user/(jim//aux:team)`.
 * See {@link Router#createUrlTree} for more information.
 *
 * @usageNotes
 *
 * You can use absolute or relative paths in a link, set query parameters,
 * control how parameters are handled, and keep a history of navigation states.
 *
 * ### Relative link paths
 *
 * The first segment name can be prepended with `/`, `./`, or `../`.
 * * If the first segment begins with `/`, the router looks up the route from the root of the
 *   app.
 * * If the first segment begins with `./`, or doesn't begin with a slash, the router
 *   looks in the children of the current activated route.
 * * If the first segment begins with `../`, the router goes up one level in the route tree.
 *
 * ### Setting and handling query params and fragments
 *
 * The following link adds a query parameter and a fragment to the generated URL:
 *
 * ```html
 * <a [routerLink]="['/user/bob']" [queryParams]="{debug: true}" fragment="education">
 *   link to user component
 * </a>
 * ```
 * By default, the directive constructs the new URL using the given query parameters.
 * The example generates the link: `/user/bob?debug=true#education`.
 *
 * You can instruct the directive to handle query parameters differently
 * by specifying the `queryParamsHandling` option in the link.
 * Allowed values are:
 *
 *  - `'merge'`: Merge the given `queryParams` into the current query params.
 *  - `'preserve'`: Preserve the current query params.
 *
 * For example:
 *
 * ```html
 * <a [routerLink]="['/user/bob']" [queryParams]="{debug: true}" queryParamsHandling="merge">
 *   link to user component
 * </a>
 * ```
 *
 * `queryParams`, `fragment`, `queryParamsHandling`, `preserveFragment`, and `relativeTo`
 * cannot be used when the `routerLink` input is a `UrlTree`.
 *
 * See {@link UrlCreationOptions#queryParamsHandling}.
 *
 * ### Preserving navigation history
 *
 * You can provide a `state` value to be persisted to the browser's
 * [`History.state` property](https://developer.mozilla.org/en-US/docs/Web/API/History#Properties).
 * For example:
 *
 * ```html
 * <a [routerLink]="['/user/bob']" [state]="{tracingId: 123}">
 *   link to user component
 * </a>
 * ```
 *
 * Use {@link Router#getCurrentNavigation} to retrieve a saved
 * navigation-state value. For example, to capture the `tracingId` during the `NavigationStart`
 * event:
 *
 * ```ts
 * // Get NavigationStart events
 * router.events.pipe(filter(e => e instanceof NavigationStart)).subscribe(e => {
 *   const navigation = router.getCurrentNavigation();
 *   tracingService.trace({id: navigation.extras.state.tracingId});
 * });
 * ```
 *
 * ### RouterLink compatible custom elements
 *
 * In order to make a custom element work with routerLink, the corresponding custom
 * element must implement the `href` attribute and must list `href` in the array of
 * the static property/getter `observedAttributes`.
 *
 * @ngModule RouterModule
 *
 * @publicApi
 */
export declare class RouterLink implements OnChanges, OnDestroy {
    private router;
    private route;
    private readonly tabIndexAttribute;
    private readonly renderer;
    private readonly el;
    private locationStrategy?;
    /** @nodoc */
    protected readonly reactiveHref: import("@angular/core").WritableSignal<string | null>;
    /**
     * Represents an `href` attribute value applied to a host element,
     * when a host element is an `<a>`/`<area>` tag or a compatible custom element.
     * For other tags, the value is `null`.
     */
    get href(): string | null;
    /** @deprecated */
    set href(value: string | null);
    /**
     * Represents the `target` attribute on a host element.
     * This is only used when the host element is
     * an `<a>`/`<area>` tag or a compatible custom element.
     */
    target?: string;
    /**
     * Passed to {@link Router#createUrlTree} as part of the
     * `UrlCreationOptions`.
     * @see {@link UrlCreationOptions#queryParams}
     * @see {@link Router#createUrlTree}
     */
    queryParams?: Params | null;
    /**
     * Passed to {@link Router#createUrlTree} as part of the
     * `UrlCreationOptions`.
     * @see {@link UrlCreationOptions#fragment}
     * @see {@link Router#createUrlTree}
     */
    fragment?: string;
    /**
     * Passed to {@link Router#createUrlTree} as part of the
     * `UrlCreationOptions`.
     * @see {@link UrlCreationOptions#queryParamsHandling}
     * @see {@link Router#createUrlTree}
     */
    queryParamsHandling?: QueryParamsHandling | null;
    /**
     * Passed to {@link Router#navigateByUrl} as part of the
     * `NavigationBehaviorOptions`.
     * @see {@link NavigationBehaviorOptions#state}
     * @see {@link Router#navigateByUrl}
     */
    state?: {
        [k: string]: any;
    };
    /**
     * Passed to {@link Router#navigateByUrl} as part of the
     * `NavigationBehaviorOptions`.
     * @see {@link NavigationBehaviorOptions#info}
     * @see {@link Router#navigateByUrl}
     */
    info?: unknown;
    /**
     * Passed to {@link Router#createUrlTree} as part of the
     * `UrlCreationOptions`.
     * Specify a value here when you do not want to use the default value
     * for `routerLink`, which is the current activated route.
     * Note that a value of `undefined` here will use the `routerLink` default.
     * @see {@link UrlCreationOptions#relativeTo}
     * @see {@link Router#createUrlTree}
     */
    relativeTo?: ActivatedRoute | null;
    /** Whether a host element is an `<a>`/`<area>` tag or a compatible custom element. */
    private isAnchorElement;
    private subscription?;
    /** @internal */
    onChanges: Subject<RouterLink>;
    private readonly applicationErrorHandler;
    private readonly options;
    constructor(router: Router, route: ActivatedRoute, tabIndexAttribute: string | null | undefined, renderer: Renderer2, el: ElementRef, locationStrategy?: LocationStrategy | undefined);
    private subscribeToNavigationEventsIfNecessary;
    /**
     * Passed to {@link Router#createUrlTree} as part of the
     * `UrlCreationOptions`.
     * @see {@link UrlCreationOptions#preserveFragment}
     * @see {@link Router#createUrlTree}
     */
    preserveFragment: boolean;
    /**
     * Passed to {@link Router#navigateByUrl} as part of the
     * `NavigationBehaviorOptions`.
     * @see {@link NavigationBehaviorOptions#skipLocationChange}
     * @see {@link Router#navigateByUrl}
     */
    skipLocationChange: boolean;
    /**
     * Passed to {@link Router#navigateByUrl} as part of the
     * `NavigationBehaviorOptions`.
     * @see {@link NavigationBehaviorOptions#replaceUrl}
     * @see {@link Router#navigateByUrl}
     */
    replaceUrl: boolean;
    /**
     * Modifies the tab index if there was not a tabindex attribute on the element during
     * instantiation.
     */
    private setTabIndexIfNotOnNativeEl;
    /** @docs-private */
    ngOnChanges(changes?: SimpleChanges): void;
    private routerLinkInput;
    /**
     * Commands to pass to {@link Router#createUrlTree} or a `UrlTree`.
     *   - **array**: commands to pass to {@link Router#createUrlTree}.
     *   - **string**: shorthand for array of commands with just the string, i.e. `['/route']`
     *   - **UrlTree**: a `UrlTree` for this link rather than creating one from the commands
     *     and other inputs that correspond to properties of `UrlCreationOptions`.
     *   - **null|undefined**: effectively disables the `routerLink`
     * @see {@link Router#createUrlTree}
     */
    set routerLink(commandsOrUrlTree: readonly any[] | string | UrlTree | null | undefined);
    /** @docs-private */
    onClick(button: number, ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean): boolean;
    /** @docs-private */
    ngOnDestroy(): any;
    private updateHref;
    private applyAttributeValue;
    get urlTree(): UrlTree | null;
}
/**
 * @description
 * An alias for the `RouterLink` directive.
 * Deprecated since v15, use `RouterLink` directive instead.
 *
export { RouterLink as RouterLinkWithHref };
nstead.
 * @publicApi
 */
export { RouterLink as RouterLinkWithHref };
