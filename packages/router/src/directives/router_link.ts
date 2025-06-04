/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {LocationStrategy} from '@angular/common';
import {
  Attribute,
  booleanAttribute,
  Directive,
  ElementRef,
  HostAttributeToken,
  HostBinding,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Renderer2,
  ɵRuntimeError as RuntimeError,
  signal,
  SimpleChanges,
  untracked,
  ɵINTERNAL_APPLICATION_ERROR_HANDLER,
} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {RuntimeErrorCode} from '../errors';
import {Event, NavigationEnd} from '../events';
import {QueryParamsHandling} from '../models';
import {Router} from '../router';
import {ROUTER_CONFIGURATION} from '../router_config';
import {ActivatedRoute} from '../router_state';
import {Params} from '../shared';
import {isUrlTree, UrlTree} from '../url_tree';

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
@Directive({
  selector: '[routerLink]',
  host: {
    '[attr.href]': 'reactiveHref()',
  },
})
export class RouterLink implements OnChanges, OnDestroy {
  /** @nodoc */
  protected readonly reactiveHref = signal<string | null>(null);
  /**
   * Represents an `href` attribute value applied to a host element,
   * when a host element is an `<a>`/`<area>` tag or a compatible custom element.
   * For other tags, the value is `null`.
   */
  get href() {
    return untracked(this.reactiveHref);
  }
  /** @deprecated */
  set href(value: string | null) {
    this.reactiveHref.set(value);
  }

  /**
   * Represents the `target` attribute on a host element.
   * This is only used when the host element is
   * an `<a>`/`<area>` tag or a compatible custom element.
   */
  @HostBinding('attr.target') @Input() target?: string;

  /**
   * Passed to {@link Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#queryParams}
   * @see {@link Router#createUrlTree}
   */
  @Input() queryParams?: Params | null;
  /**
   * Passed to {@link Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#fragment}
   * @see {@link Router#createUrlTree}
   */
  @Input() fragment?: string;
  /**
   * Passed to {@link Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#queryParamsHandling}
   * @see {@link Router#createUrlTree}
   */
  @Input() queryParamsHandling?: QueryParamsHandling | null;
  /**
   * Passed to {@link Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#state}
   * @see {@link Router#navigateByUrl}
   */
  @Input() state?: {[k: string]: any};
  /**
   * Passed to {@link Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#info}
   * @see {@link Router#navigateByUrl}
   */
  @Input() info?: unknown;
  /**
   * Passed to {@link Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * Specify a value here when you do not want to use the default value
   * for `routerLink`, which is the current activated route.
   * Note that a value of `undefined` here will use the `routerLink` default.
   * @see {@link UrlCreationOptions#relativeTo}
   * @see {@link Router#createUrlTree}
   */
  @Input() relativeTo?: ActivatedRoute | null;

  /** Whether a host element is an `<a>`/`<area>` tag or a compatible custom element. */
  private isAnchorElement: boolean;

  private subscription?: Subscription;

  /** @internal */
  onChanges = new Subject<RouterLink>();

  private readonly applicationErrorHandler = inject(ɵINTERNAL_APPLICATION_ERROR_HANDLER);
  private readonly options = inject(ROUTER_CONFIGURATION, {optional: true});

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    @Attribute('tabindex') private readonly tabIndexAttribute: string | null | undefined,
    private readonly renderer: Renderer2,
    private readonly el: ElementRef,
    private locationStrategy?: LocationStrategy,
  ) {
    // Set the initial href value to whatever exists on the host element already
    this.reactiveHref.set(inject(new HostAttributeToken('href'), {optional: true}));
    const tagName = el.nativeElement.tagName?.toLowerCase();
    this.isAnchorElement =
      tagName === 'a' ||
      tagName === 'area' ||
      !!(
        // Avoid breaking in an SSR context where customElements might not be defined.
        (
          typeof customElements === 'object' &&
          // observedAttributes is an optional static property/getter on a custom element.
          // The spec states that this must be an array of strings.
          (
            customElements.get(tagName) as {observedAttributes?: string[]} | undefined
          )?.observedAttributes?.includes?.('href')
        )
      );

    if (!this.isAnchorElement) {
      this.subscribeToNavigationEventsIfNecessary();
    } else {
      this.setTabIndexIfNotOnNativeEl('0');
    }
  }

  private subscribeToNavigationEventsIfNecessary() {
    if (this.subscription !== undefined || !this.isAnchorElement) {
      return;
    }

    // preserving fragment in router state
    let createSubcription = this.preserveFragment;
    // preserving or merging with query params in router state
    const dependsOnRouterState = (handling?: QueryParamsHandling | null) =>
      handling === 'merge' || handling === 'preserve';
    createSubcription ||= dependsOnRouterState(this.queryParamsHandling);
    createSubcription ||=
      !this.queryParamsHandling && !dependsOnRouterState(this.options?.defaultQueryParamsHandling);
    if (!createSubcription) {
      return;
    }

    this.subscription = this.router.events.subscribe((s: Event) => {
      if (s instanceof NavigationEnd) {
        this.updateHref();
      }
    });
  }

  /**
   * Passed to {@link Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#preserveFragment}
   * @see {@link Router#createUrlTree}
   */
  @Input({transform: booleanAttribute}) preserveFragment: boolean = false;

  /**
   * Passed to {@link Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#skipLocationChange}
   * @see {@link Router#navigateByUrl}
   */
  @Input({transform: booleanAttribute}) skipLocationChange: boolean = false;

  /**
   * Passed to {@link Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#replaceUrl}
   * @see {@link Router#navigateByUrl}
   */
  @Input({transform: booleanAttribute}) replaceUrl: boolean = false;

  /**
   * Modifies the tab index if there was not a tabindex attribute on the element during
   * instantiation.
   */
  private setTabIndexIfNotOnNativeEl(newTabIndex: string | null) {
    if (this.tabIndexAttribute != null /* both `null` and `undefined` */ || this.isAnchorElement) {
      return;
    }
    this.applyAttributeValue('tabindex', newTabIndex);
  }

  /** @docs-private */
  // TODO(atscott): Remove changes parameter in major version as a breaking change.
  ngOnChanges(changes?: SimpleChanges): void {
    if (
      ngDevMode &&
      isUrlTree(this.routerLinkInput) &&
      (this.fragment !== undefined ||
        this.queryParams ||
        this.queryParamsHandling ||
        this.preserveFragment ||
        this.relativeTo)
    ) {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_ROUTER_LINK_INPUTS,
        'Cannot configure queryParams or fragment when using a UrlTree as the routerLink input value.',
      );
    }
    if (this.isAnchorElement) {
      this.updateHref();
      this.subscribeToNavigationEventsIfNecessary();
    }
    // This is subscribed to by `RouterLinkActive` so that it knows to update when there are changes
    // to the RouterLinks it's tracking.
    this.onChanges.next(this);
  }

  private routerLinkInput: readonly any[] | UrlTree | null = null;

  /**
   * Commands to pass to {@link Router#createUrlTree} or a `UrlTree`.
   *   - **array**: commands to pass to {@link Router#createUrlTree}.
   *   - **string**: shorthand for array of commands with just the string, i.e. `['/route']`
   *   - **UrlTree**: a `UrlTree` for this link rather than creating one from the commands
   *     and other inputs that correspond to properties of `UrlCreationOptions`.
   *   - **null|undefined**: effectively disables the `routerLink`
   * @see {@link Router#createUrlTree}
   */
  @Input()
  set routerLink(commandsOrUrlTree: readonly any[] | string | UrlTree | null | undefined) {
    if (commandsOrUrlTree == null) {
      this.routerLinkInput = null;
      this.setTabIndexIfNotOnNativeEl(null);
    } else {
      if (isUrlTree(commandsOrUrlTree)) {
        this.routerLinkInput = commandsOrUrlTree;
      } else {
        this.routerLinkInput = Array.isArray(commandsOrUrlTree)
          ? commandsOrUrlTree
          : [commandsOrUrlTree];
      }
      this.setTabIndexIfNotOnNativeEl('0');
    }
  }

  /** @docs-private */
  @HostListener('click', [
    '$event.button',
    '$event.ctrlKey',
    '$event.shiftKey',
    '$event.altKey',
    '$event.metaKey',
  ])
  onClick(
    button: number,
    ctrlKey: boolean,
    shiftKey: boolean,
    altKey: boolean,
    metaKey: boolean,
  ): boolean {
    const urlTree = this.urlTree;

    if (urlTree === null) {
      return true;
    }

    if (this.isAnchorElement) {
      if (button !== 0 || ctrlKey || shiftKey || altKey || metaKey) {
        return true;
      }

      if (typeof this.target === 'string' && this.target != '_self') {
        return true;
      }
    }

    const extras = {
      skipLocationChange: this.skipLocationChange,
      replaceUrl: this.replaceUrl,
      state: this.state,
      info: this.info,
    };
    // navigateByUrl is mocked frequently in tests... Reduce breakages when adding `catch`
    this.router.navigateByUrl(urlTree, extras)?.catch((e) => {
      this.applicationErrorHandler(e);
    });

    // Return `false` for `<a>` elements to prevent default action
    // and cancel the native behavior, since the navigation is handled
    // by the Router.
    return !this.isAnchorElement;
  }

  /** @docs-private */
  ngOnDestroy(): any {
    this.subscription?.unsubscribe();
  }

  private updateHref(): void {
    const urlTree = this.urlTree;
    this.reactiveHref.set(
      urlTree !== null && this.locationStrategy
        ? (this.locationStrategy?.prepareExternalUrl(this.router.serializeUrl(urlTree)) ?? '')
        : null,
    );
  }

  private applyAttributeValue(attrName: string, attrValue: string | null) {
    const renderer = this.renderer;
    const nativeElement = this.el.nativeElement;
    if (attrValue !== null) {
      renderer.setAttribute(nativeElement, attrName, attrValue);
    } else {
      renderer.removeAttribute(nativeElement, attrName);
    }
  }

  get urlTree(): UrlTree | null {
    if (this.routerLinkInput === null) {
      return null;
    } else if (isUrlTree(this.routerLinkInput)) {
      return this.routerLinkInput;
    }
    return this.router.createUrlTree(this.routerLinkInput, {
      // If the `relativeTo` input is not defined, we want to use `this.route` by default.
      // Otherwise, we should use the value provided by the user in the input.
      relativeTo: this.relativeTo !== undefined ? this.relativeTo : this.route,
      queryParams: this.queryParams,
      fragment: this.fragment,
      queryParamsHandling: this.queryParamsHandling,
      preserveFragment: this.preserveFragment,
    });
  }
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
export {RouterLink as RouterLinkWithHref};
