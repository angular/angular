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
  Injectable,
  Input,
  linkedSignal,
  OnChanges,
  OnDestroy,
  Renderer2,
  signal,
  SimpleChanges,
  untracked,
  ɵINTERNAL_APPLICATION_ERROR_HANDLER,
  ɵRuntimeError as RuntimeError,
  input,
} from '@angular/core';
import {Subject} from 'rxjs';

import {RuntimeErrorCode} from '../errors';
import {NavigationEnd} from '../events';
import {QueryParamsHandling} from '../models';
import {Router} from '../router';
import {ROUTER_CONFIGURATION} from '../router_config';
import {ActivatedRoute} from '../router_state';
import {Params} from '../shared';
import {StateManager} from '../statemanager/state_manager';
import {isUrlTree, UrlSerializer, UrlTree} from '../url_tree';

// Converts non-reactive router state to reactive state via the NavigationEnd
// event. This isn't the ideal way of doing things, but is necessary to avoid
// breaking tests which have mocked the Router.
@Injectable({providedIn: 'root'})
export class ReactiveRouterState {
  private readonly router = inject(Router);
  private readonly stateManager = inject(StateManager);
  readonly fragment = signal<string | null>('');
  readonly queryParams = signal<Params>({});
  readonly path = signal<string>('');
  private readonly serializer = inject(UrlSerializer);

  constructor() {
    this.updateState();
    this.router.events?.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.updateState();
      }
    });
  }

  private updateState() {
    const {fragment, root, queryParams} = this.stateManager.getCurrentUrlTree();
    this.fragment.set(fragment);
    this.queryParams.set(queryParams);
    this.path.set(this.serializer.serialize(new UrlTree(root)));
  }
}

/**
 * @description
 *
 * When applied to an element in a template, makes that element a link
 * that initiates navigation to a route. Navigation opens one or more routed
 * components in one or more `<router-outlet>` locations on the page.
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
 * Multiple static segments can be merged into one term and combined with
 * dynamic segments. For example, `['/team/11/user', userName, {details: true}]`
 *
 * The input that you provide to the link is treated as a delta to the current
 * URL. For instance, suppose the current URL is `/user/(box//aux:team)`. The
 * link `<a [routerLink]="['/user/jim']">Jim</a>` creates the URL
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
 * * If the first segment begins with `/`, the router looks up the route from
 * the root of the app.
 * * If the first segment begins with `./`, or doesn't begin with a slash, the
 * router looks in the children of the current activated route.
 * * If the first segment begins with `../`, the router goes up one level in the
 * route tree.
 *
 * ### Setting and handling query params and fragments
 *
 * The following link adds a query parameter and a fragment to the generated
 * URL:
 *
 * ```html
 * <a [routerLink]="['/user/bob']" [queryParams]="{debug: true}"
 * fragment="education"> link to user component
 * </a>
 * ```
 * By default, the directive constructs the new URL using the given query
 * parameters. The example generates the link: `/user/bob?debug=true#education`.
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
 * <a [routerLink]="['/user/bob']" [queryParams]="{debug: true}"
 * queryParamsHandling="merge"> link to user component
 * </a>
 * ```
 *
 * `queryParams`, `fragment`, `queryParamsHandling`, `preserveFragment`, and
 * `relativeTo` cannot be used when the `routerLink` input is a `UrlTree`.
 *
 * See {@link UrlCreationOptions#queryParamsHandling}.
 *
 * ### Preserving navigation history
 *
 * You can provide a `state` value to be persisted to the browser's
 * [`History.state`
 * property](https://developer.mozilla.org/en-US/docs/Web/API/History#Properties).
 * For example:
 *
 * ```html
 * <a [routerLink]="['/user/bob']" [state]="{tracingId: 123}">
 *   link to user component
 * </a>
 * ```
 *
 * Use {@link Router#currentNavigation} to retrieve a saved Signal
 * navigation-state value. For example, to capture the `tracingId` during the `NavigationStart`
 * event:
 *
 * ```ts
 * // Get NavigationStart events
 * router.events.pipe(filter(e => e instanceof NavigationStart)).subscribe(e => {
 *   const navigation = router.currentNavigation();
 *   tracingService.trace({id: navigation.extras.state.tracingId});
 * });
 * ```
 *
 * ### RouterLink compatible custom elements
 *
 * In order to make a custom element work with routerLink, the corresponding
 * custom element must implement the `href` attribute and must list `href` in
 * the array of the static property/getter `observedAttributes`.
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
export class RouterLink implements OnChanges, OnDestroy {
  private hrefAttributeValue = inject(new HostAttributeToken('href'), {optional: true});
  /** @docs-private */
  protected readonly reactiveHref = linkedSignal(() => {
    // Never change href for non-anchor elements
    if (!this.isAnchorElement) {
      return this.hrefAttributeValue;
    }
    return this.computeHref(this._urlTree());
  });
  /**
   * Represents an `href` attribute value applied to a host element,
   * when a host element is an `<a>`/`<area>` tag or a compatible custom
   * element. For other tags, the value is `null`.
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
  @Input() set target(value: string | undefined) {
    this._target.set(value);
  }
  get target(): string | undefined {
    return untracked(this._target);
  }

  /**
   * @docs-private
   * @internal
   */
  protected _target = signal<string | undefined>(undefined);

  /**
   * Passed to {@link Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#queryParams}
   * @see {@link Router#createUrlTree}
   */
  @Input() set queryParams(value: Params | null | undefined) {
    this._queryParams.set(value);
  }
  get queryParams(): Params | null | undefined {
    return untracked(this._queryParams);
  }
  // Rather than trying deep equality checks or serialization, just allow urlTree to recompute
  // whenever queryParams change (which will be rare).
  private _queryParams = signal<Params | null | undefined>(undefined, {equal: () => false});
  /**
   * Passed to {@link Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#fragment}
   * @see {@link Router#createUrlTree}
   */
  @Input() set fragment(value: string | undefined) {
    this._fragment.set(value);
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
  @Input() set queryParamsHandling(value: QueryParamsHandling | null | undefined) {
    this._queryParamsHandling.set(value);
  }
  get queryParamsHandling(): QueryParamsHandling | null | undefined {
    return untracked(this._queryParamsHandling);
  }
  private _queryParamsHandling = signal<QueryParamsHandling | null | undefined>(undefined);
  /**
   * Passed to {@link Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#state}
   * @see {@link Router#navigateByUrl}
   */
  @Input() set state(value: {[k: string]: any} | undefined) {
    this._state.set(value);
  }
  get state(): {[k: string]: any} | undefined {
    return untracked(this._state);
  }
  private _state = signal<{[k: string]: any} | undefined>(undefined, {equal: () => false});
  /**
   * Passed to {@link Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#info}
   * @see {@link Router#navigateByUrl}
   */
  @Input() set info(value: unknown) {
    this._info.set(value);
  }
  get info(): unknown {
    return untracked(this._info);
  }
  private _info = signal<unknown>(undefined, {equal: () => false});
  /**
   * Passed to {@link Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * Specify a value here when you do not want to use the default value
   * for `routerLink`, which is the current activated route.
   * Note that a value of `undefined` here will use the `routerLink` default.
   * @see {@link UrlCreationOptions#relativeTo}
   * @see {@link Router#createUrlTree}
   */
  @Input() set relativeTo(value: ActivatedRoute | null | undefined) {
    this._relativeTo.set(value);
  }
  get relativeTo(): ActivatedRoute | null | undefined {
    return untracked(this._relativeTo);
  }
  private _relativeTo = signal<ActivatedRoute | null | undefined>(undefined);

  /**
   * Passed to {@link Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#preserveFragment}
   * @see {@link Router#createUrlTree}
   */
  @Input({transform: booleanAttribute}) set preserveFragment(value: boolean) {
    this._preserveFragment.set(value);
  }
  get preserveFragment(): boolean {
    return untracked(this._preserveFragment);
  }
  private _preserveFragment = signal<boolean>(false);

  /**
   * Passed to {@link Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#skipLocationChange}
   * @see {@link Router#navigateByUrl}
   */
  @Input({transform: booleanAttribute}) set skipLocationChange(value: boolean) {
    this._skipLocationChange.set(value);
  }
  get skipLocationChange(): boolean {
    return untracked(this._skipLocationChange);
  }
  private _skipLocationChange = signal<boolean>(false);

  /**
   * Passed to {@link Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#replaceUrl}
   * @see {@link Router#navigateByUrl}
   */
  @Input({transform: booleanAttribute}) set replaceUrl(value: boolean) {
    this._replaceUrl.set(value);
  }
  get replaceUrl(): boolean {
    return untracked(this._replaceUrl);
  }
  private _replaceUrl = signal<boolean>(false);

  /**
   * Passed to {@link Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#browserUrl}
   * @see {@link Router#navigateByUrl}
   */
  browserUrl = input<UrlTree | string | undefined>(undefined);

  /**
   * Whether a host element is an `<a>`/`<area>` tag or a compatible custom
   * element.
   */
  private readonly isAnchorElement: boolean;
  /** @internal */
  onChanges = new Subject<RouterLink>();
  private readonly applicationErrorHandler = inject(ɵINTERNAL_APPLICATION_ERROR_HANDLER);
  private readonly options = inject(ROUTER_CONFIGURATION, {optional: true});
  private readonly reactiveRouterState = inject(ReactiveRouterState);

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
        // Avoid breaking in an SSR context where customElements might not
        // be defined.
        (
          typeof customElements === 'object' &&
          // observedAttributes is an optional static property/getter on a
          // custom element. The spec states that this must be an array of
          // strings.
          (
            customElements.get(tagName) as {observedAttributes?: string[]} | undefined
          )?.observedAttributes?.includes?.('href')
        )
      );

    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
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
   * Modifies the tab index if there was not a tabindex attribute on the element
   * during instantiation.
   */
  private setTabIndexIfNotOnNativeEl(newTabIndex: string | null) {
    if (this.tabIndexAttribute != null /* both `null` and `undefined` */ || this.isAnchorElement) {
      return;
    }
    this.applyAttributeValue('tabindex', newTabIndex);
  }

  /** @docs-private */
  // TODO(atscott): Remove changes parameter in major version as a breaking
  // change.
  ngOnChanges(changes?: SimpleChanges): void {
    // This is subscribed to by `RouterLinkActive` so that it knows to update
    // when there are changes to the RouterLinks it's tracking.
    this.onChanges.next(this);
  }

  private routerLinkInput = signal<readonly any[] | UrlTree | null>(null);

  /**
   * Commands to pass to {@link Router#createUrlTree} or a `UrlTree`.
   *   - **array**: commands to pass to {@link Router#createUrlTree}.
   *   - **string**: shorthand for array of commands with just the string, i.e.
   * `['/route']`
   *   - **UrlTree**: a `UrlTree` for this link rather than creating one from
   * the commands and other inputs that correspond to properties of
   * `UrlCreationOptions`.
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
    const urlTree = this._urlTree();

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
      browserUrl: this.browserUrl(),
    };
    // navigateByUrl is mocked frequently in tests... Reduce breakages when
    // adding `catch`
    this.router.navigateByUrl(urlTree, extras)?.catch((e) => {
      this.applicationErrorHandler(e);
    });

    // Return `false` for `<a>` elements to prevent default action
    // and cancel the native behavior, since the navigation is handled
    // by the Router.
    return !this.isAnchorElement;
  }

  /** @docs-private */
  ngOnDestroy(): any {}

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
  _urlTree = computed(
    () => {
      // Track path changes. It's knowing which segments we actually depend on is somewhat difficult
      this.reactiveRouterState.path();
      if (this._preserveFragment()) {
        this.reactiveRouterState.fragment();
      }
      const shouldTrackParams = (handling: QueryParamsHandling | undefined | null) =>
        handling === 'preserve' || handling === 'merge';
      if (
        shouldTrackParams(this._queryParamsHandling()) ||
        shouldTrackParams(this.options?.defaultQueryParamsHandling)
      ) {
        this.reactiveRouterState.queryParams();
      }

      const routerLinkInput = this.routerLinkInput();
      if (routerLinkInput === null || !this.router.createUrlTree) {
        return null;
      } else if (isUrlTree(routerLinkInput)) {
        return routerLinkInput;
      }
      return this.router.createUrlTree(routerLinkInput, {
        // If the `relativeTo` input is not defined, we want to use `this.route`
        // by default.
        // Otherwise, we should use the value provided by the user in the input.
        relativeTo: this._relativeTo() !== undefined ? this._relativeTo() : this.route,
        queryParams: this._queryParams(),
        fragment: this._fragment(),
        queryParamsHandling: this._queryParamsHandling(),
        preserveFragment: this._preserveFragment(),
      });
    },
    {equal: (a, b) => this.computeHref(a) === this.computeHref(b)},
  );

  get urlTree(): UrlTree | null {
    return untracked(this._urlTree);
  }

  private computeHref(urlTree: UrlTree | null): string | null {
    return urlTree !== null && this.locationStrategy
      ? (this.locationStrategy?.prepareExternalUrl(this.router.serializeUrl(urlTree)) ?? '')
      : null;
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
