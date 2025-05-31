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
  computed,
  Directive,
  effect,
  ElementRef,
  HostAttributeToken,
  HostListener,
  inject,
  Input,
  isSignal,
  linkedSignal,
  Renderer2,
  ɵRuntimeError as RuntimeError,
  signal,
  untracked,
  ɵINTERNAL_APPLICATION_ERROR_HANDLER,
} from '@angular/core';
import {RuntimeErrorCode} from '../errors';
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
    '[attr.target]': '_target()',
  },
})
export class RouterLink {
  private hrefAttributeValue = inject(new HostAttributeToken('href'), {optional: true});
  /** @docs-private */
  protected readonly reactiveHref = linkedSignal(() => {
    if (!this.isAnchorElement) {
      // Set the initial href value to whatever exists on the host element already
      return this.hrefAttributeValue;
    }

    const urlTree = this._urlTree();
    return urlTree !== null && this.locationStrategy
      ? (this.locationStrategy?.prepareExternalUrl(this.router.serializeUrl(urlTree)) ?? '')
      : null;
  });
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
  @Input() set target(v: string | undefined) {
    this._target.set(v);
  }
  get target(): string | undefined {
    return untracked(this._target);
  }
  /** @docs-private */
  protected _target = signal<string | undefined>(undefined);

  /**
   * Passed to {@link Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#queryParams}
   * @see {@link Router#createUrlTree}
   */
  @Input() set queryParams(v: Params | null | undefined) {
    this._queryParams.set(v);
  }
  get queryParams(): Params | null | undefined {
    return untracked(this._queryParams);
  }
  private _queryParams = signal<Params | null | undefined>(undefined);

  /**
   * Passed to {@link Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#fragment}
   * @see {@link Router#createUrlTree}
   */
  @Input() set fragment(v: string | undefined) {
    this._fragment.set(v);
  }
  get fragment(): string | undefined {
    return untracked(this._fragment);
  }
  private _fragment = signal<string | undefined>(undefined);

  /**
   * Passed to {@link Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#queryParamsHandling}
   * @see {@link Router#createUrlTree}
   */
  @Input() set queryParamsHandling(v: undefined | QueryParamsHandling | null) {
    this._queryParamsHandling.set(v);
  }
  get queryParamsHandling(): undefined | QueryParamsHandling | null {
    return untracked(this._queryParamsHandling);
  }
  private _queryParamsHandling = signal<QueryParamsHandling | null | undefined>(undefined);

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
  @Input() set relativeTo(v: undefined | ActivatedRoute | null) {
    this._relativeTo.set(v);
  }
  get relativeTo(): undefined | ActivatedRoute | null {
    return untracked(this._relativeTo);
  }
  private _relativeTo = signal<ActivatedRoute | null | undefined>(undefined);

  /**
   * Passed to {@link Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#preserveFragment}
   * @see {@link Router#createUrlTree}
   */
  @Input({transform: booleanAttribute})
  set preserveFragment(v: boolean) {
    this._preserveFragment.set(v);
  }
  get preserveFragment(): boolean {
    return untracked(this._preserveFragment);
  }
  private _preserveFragment = signal(false);

  /**
   * Passed to {@link Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#skipLocationChange}
   * @see {@link Router#navigateByUrl}
   */
  @Input({transform: booleanAttribute}) set skipLocationChange(v: boolean) {
    this._skipLocationChange.set(v);
  }
  get skipLocationChange(): boolean {
    return untracked(this._skipLocationChange);
  }
  private _skipLocationChange = signal(false);

  /**
   * Passed to {@link Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#replaceUrl}
   * @see {@link Router#navigateByUrl}
   */
  @Input({transform: booleanAttribute}) set replaceUrl(v: boolean) {
    this._replaceUrl.set(v);
  }
  get replaceUrl(): boolean {
    return untracked(this._replaceUrl);
  }
  private _replaceUrl = signal(false);

  /** Whether a host element is an `<a>`/`<area>` tag or a compatible custom element. */
  private readonly isAnchorElement: boolean;

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

    this.setTabIndexIfNotOnNativeEl('0');

    if (ngDevMode) {
      effect(() => {
        if (
          isUrlTree(this.routerLinkInput()) &&
          (this._fragment() !== undefined ||
            this._queryParams() ||
            this._queryParamsHandling() ||
            this._preserveFragment() ||
            this._relativeTo())
        ) {
          throw new RuntimeError(
            RuntimeErrorCode.INVALID_ROUTER_LINK_INPUTS,
            'Cannot configure queryParams or fragment when using a UrlTree as the routerLink input value.',
          );
        }
      });
    }
  }

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

  private routerLinkInput = signal<readonly any[] | UrlTree | null>(null);

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
      this.routerLinkInput.set(null);
      this.setTabIndexIfNotOnNativeEl(null);
    } else {
      if (isUrlTree(commandsOrUrlTree)) {
        this.routerLinkInput.set(commandsOrUrlTree);
      } else {
        this.routerLinkInput.set(
          Array.isArray(commandsOrUrlTree) ? commandsOrUrlTree : [commandsOrUrlTree],
        );
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

  private applyAttributeValue(attrName: string, attrValue: string | null) {
    const renderer = this.renderer;
    const nativeElement = this.el.nativeElement;
    if (attrValue !== null) {
      renderer.setAttribute(nativeElement, attrName, attrValue);
    } else {
      renderer.removeAttribute(nativeElement, attrName);
    }
  }

  /** @internal */
  _urlTree = linkedSignal({
    source: () => {
      const routerLinkInput = this.routerLinkInput();
      if (routerLinkInput === null) {
        return null;
      } else if (isUrlTree(routerLinkInput)) {
        return routerLinkInput;
      }
      return this.router.createUrlTreeComputed(routerLinkInput, {
        // If the `relativeTo` input is not defined, we want to use `this.route` by default.
        // Otherwise, we should use the value provided by the user in the input.
        relativeTo: this._relativeTo() !== undefined ? this.relativeTo : this.route,
        queryParams: this._queryParams(),
        fragment: this._fragment(),
        queryParamsHandling: this._queryParamsHandling(),
        preserveFragment: this._preserveFragment(),
      });
    },
    computation: (v) => {
      return isSignal(v) ? v() : v;
    },
  });

  get urlTree(): UrlTree | null {
    return untracked(this._urlTree);
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
