/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  booleanAttribute,
  Directive,
  HostAttributeToken,
  HostBinding,
  HostListener,
  inject,
  Input,
  ɵRuntimeError as RuntimeError,
  signal,
  untracked,
  ɵINTERNAL_APPLICATION_ERROR_HANDLER,
} from '@angular/core';
import {Subject} from 'rxjs';
import {NavigationEnd} from '../events';
import {ROUTER_CONFIGURATION} from '../router_config';
import {isUrlTree} from '../url_tree';
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
let RouterLink = (() => {
  let _classDecorators = [
    Directive({
      selector: '[routerLink]',
      host: {
        '[attr.href]': 'reactiveHref()',
      },
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _instanceExtraInitializers = [];
  let _target_decorators;
  let _target_initializers = [];
  let _target_extraInitializers = [];
  let _queryParams_decorators;
  let _queryParams_initializers = [];
  let _queryParams_extraInitializers = [];
  let _fragment_decorators;
  let _fragment_initializers = [];
  let _fragment_extraInitializers = [];
  let _queryParamsHandling_decorators;
  let _queryParamsHandling_initializers = [];
  let _queryParamsHandling_extraInitializers = [];
  let _state_decorators;
  let _state_initializers = [];
  let _state_extraInitializers = [];
  let _info_decorators;
  let _info_initializers = [];
  let _info_extraInitializers = [];
  let _relativeTo_decorators;
  let _relativeTo_initializers = [];
  let _relativeTo_extraInitializers = [];
  let _preserveFragment_decorators;
  let _preserveFragment_initializers = [];
  let _preserveFragment_extraInitializers = [];
  let _skipLocationChange_decorators;
  let _skipLocationChange_initializers = [];
  let _skipLocationChange_extraInitializers = [];
  let _replaceUrl_decorators;
  let _replaceUrl_initializers = [];
  let _replaceUrl_extraInitializers = [];
  let _set_routerLink_decorators;
  let _onClick_decorators;
  var RouterLink = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _target_decorators = [HostBinding('attr.target'), Input()];
      _queryParams_decorators = [Input()];
      _fragment_decorators = [Input()];
      _queryParamsHandling_decorators = [Input()];
      _state_decorators = [Input()];
      _info_decorators = [Input()];
      _relativeTo_decorators = [Input()];
      _preserveFragment_decorators = [Input({transform: booleanAttribute})];
      _skipLocationChange_decorators = [Input({transform: booleanAttribute})];
      _replaceUrl_decorators = [Input({transform: booleanAttribute})];
      _set_routerLink_decorators = [Input()];
      _onClick_decorators = [
        HostListener('click', [
          '$event.button',
          '$event.ctrlKey',
          '$event.shiftKey',
          '$event.altKey',
          '$event.metaKey',
        ]),
      ];
      __esDecorate(
        this,
        null,
        _set_routerLink_decorators,
        {
          kind: 'setter',
          name: 'routerLink',
          static: false,
          private: false,
          access: {
            has: (obj) => 'routerLink' in obj,
            set: (obj, value) => {
              obj.routerLink = value;
            },
          },
          metadata: _metadata,
        },
        null,
        _instanceExtraInitializers,
      );
      __esDecorate(
        this,
        null,
        _onClick_decorators,
        {
          kind: 'method',
          name: 'onClick',
          static: false,
          private: false,
          access: {has: (obj) => 'onClick' in obj, get: (obj) => obj.onClick},
          metadata: _metadata,
        },
        null,
        _instanceExtraInitializers,
      );
      __esDecorate(
        null,
        null,
        _target_decorators,
        {
          kind: 'field',
          name: 'target',
          static: false,
          private: false,
          access: {
            has: (obj) => 'target' in obj,
            get: (obj) => obj.target,
            set: (obj, value) => {
              obj.target = value;
            },
          },
          metadata: _metadata,
        },
        _target_initializers,
        _target_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _queryParams_decorators,
        {
          kind: 'field',
          name: 'queryParams',
          static: false,
          private: false,
          access: {
            has: (obj) => 'queryParams' in obj,
            get: (obj) => obj.queryParams,
            set: (obj, value) => {
              obj.queryParams = value;
            },
          },
          metadata: _metadata,
        },
        _queryParams_initializers,
        _queryParams_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _fragment_decorators,
        {
          kind: 'field',
          name: 'fragment',
          static: false,
          private: false,
          access: {
            has: (obj) => 'fragment' in obj,
            get: (obj) => obj.fragment,
            set: (obj, value) => {
              obj.fragment = value;
            },
          },
          metadata: _metadata,
        },
        _fragment_initializers,
        _fragment_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _queryParamsHandling_decorators,
        {
          kind: 'field',
          name: 'queryParamsHandling',
          static: false,
          private: false,
          access: {
            has: (obj) => 'queryParamsHandling' in obj,
            get: (obj) => obj.queryParamsHandling,
            set: (obj, value) => {
              obj.queryParamsHandling = value;
            },
          },
          metadata: _metadata,
        },
        _queryParamsHandling_initializers,
        _queryParamsHandling_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _state_decorators,
        {
          kind: 'field',
          name: 'state',
          static: false,
          private: false,
          access: {
            has: (obj) => 'state' in obj,
            get: (obj) => obj.state,
            set: (obj, value) => {
              obj.state = value;
            },
          },
          metadata: _metadata,
        },
        _state_initializers,
        _state_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _info_decorators,
        {
          kind: 'field',
          name: 'info',
          static: false,
          private: false,
          access: {
            has: (obj) => 'info' in obj,
            get: (obj) => obj.info,
            set: (obj, value) => {
              obj.info = value;
            },
          },
          metadata: _metadata,
        },
        _info_initializers,
        _info_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _relativeTo_decorators,
        {
          kind: 'field',
          name: 'relativeTo',
          static: false,
          private: false,
          access: {
            has: (obj) => 'relativeTo' in obj,
            get: (obj) => obj.relativeTo,
            set: (obj, value) => {
              obj.relativeTo = value;
            },
          },
          metadata: _metadata,
        },
        _relativeTo_initializers,
        _relativeTo_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _preserveFragment_decorators,
        {
          kind: 'field',
          name: 'preserveFragment',
          static: false,
          private: false,
          access: {
            has: (obj) => 'preserveFragment' in obj,
            get: (obj) => obj.preserveFragment,
            set: (obj, value) => {
              obj.preserveFragment = value;
            },
          },
          metadata: _metadata,
        },
        _preserveFragment_initializers,
        _preserveFragment_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _skipLocationChange_decorators,
        {
          kind: 'field',
          name: 'skipLocationChange',
          static: false,
          private: false,
          access: {
            has: (obj) => 'skipLocationChange' in obj,
            get: (obj) => obj.skipLocationChange,
            set: (obj, value) => {
              obj.skipLocationChange = value;
            },
          },
          metadata: _metadata,
        },
        _skipLocationChange_initializers,
        _skipLocationChange_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _replaceUrl_decorators,
        {
          kind: 'field',
          name: 'replaceUrl',
          static: false,
          private: false,
          access: {
            has: (obj) => 'replaceUrl' in obj,
            get: (obj) => obj.replaceUrl,
            set: (obj, value) => {
              obj.replaceUrl = value;
            },
          },
          metadata: _metadata,
        },
        _replaceUrl_initializers,
        _replaceUrl_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      RouterLink = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    router = __runInitializers(this, _instanceExtraInitializers);
    route;
    tabIndexAttribute;
    renderer;
    el;
    locationStrategy;
    /** @nodoc */
    reactiveHref = signal(null);
    /**
     * Represents an `href` attribute value applied to a host element,
     * when a host element is an `<a>`/`<area>` tag or a compatible custom element.
     * For other tags, the value is `null`.
     */
    get href() {
      return untracked(this.reactiveHref);
    }
    /** @deprecated */
    set href(value) {
      this.reactiveHref.set(value);
    }
    /**
     * Represents the `target` attribute on a host element.
     * This is only used when the host element is
     * an `<a>`/`<area>` tag or a compatible custom element.
     */
    target = __runInitializers(this, _target_initializers, void 0);
    /**
     * Passed to {@link Router#createUrlTree} as part of the
     * `UrlCreationOptions`.
     * @see {@link UrlCreationOptions#queryParams}
     * @see {@link Router#createUrlTree}
     */
    queryParams =
      (__runInitializers(this, _target_extraInitializers),
      __runInitializers(this, _queryParams_initializers, void 0));
    /**
     * Passed to {@link Router#createUrlTree} as part of the
     * `UrlCreationOptions`.
     * @see {@link UrlCreationOptions#fragment}
     * @see {@link Router#createUrlTree}
     */
    fragment =
      (__runInitializers(this, _queryParams_extraInitializers),
      __runInitializers(this, _fragment_initializers, void 0));
    /**
     * Passed to {@link Router#createUrlTree} as part of the
     * `UrlCreationOptions`.
     * @see {@link UrlCreationOptions#queryParamsHandling}
     * @see {@link Router#createUrlTree}
     */
    queryParamsHandling =
      (__runInitializers(this, _fragment_extraInitializers),
      __runInitializers(this, _queryParamsHandling_initializers, void 0));
    /**
     * Passed to {@link Router#navigateByUrl} as part of the
     * `NavigationBehaviorOptions`.
     * @see {@link NavigationBehaviorOptions#state}
     * @see {@link Router#navigateByUrl}
     */
    state =
      (__runInitializers(this, _queryParamsHandling_extraInitializers),
      __runInitializers(this, _state_initializers, void 0));
    /**
     * Passed to {@link Router#navigateByUrl} as part of the
     * `NavigationBehaviorOptions`.
     * @see {@link NavigationBehaviorOptions#info}
     * @see {@link Router#navigateByUrl}
     */
    info =
      (__runInitializers(this, _state_extraInitializers),
      __runInitializers(this, _info_initializers, void 0));
    /**
     * Passed to {@link Router#createUrlTree} as part of the
     * `UrlCreationOptions`.
     * Specify a value here when you do not want to use the default value
     * for `routerLink`, which is the current activated route.
     * Note that a value of `undefined` here will use the `routerLink` default.
     * @see {@link UrlCreationOptions#relativeTo}
     * @see {@link Router#createUrlTree}
     */
    relativeTo =
      (__runInitializers(this, _info_extraInitializers),
      __runInitializers(this, _relativeTo_initializers, void 0));
    /** Whether a host element is an `<a>`/`<area>` tag or a compatible custom element. */
    isAnchorElement = __runInitializers(this, _relativeTo_extraInitializers);
    subscription;
    /** @internal */
    onChanges = new Subject();
    applicationErrorHandler = inject(ɵINTERNAL_APPLICATION_ERROR_HANDLER);
    options = inject(ROUTER_CONFIGURATION, {optional: true});
    constructor(router, route, tabIndexAttribute, renderer, el, locationStrategy) {
      this.router = router;
      this.route = route;
      this.tabIndexAttribute = tabIndexAttribute;
      this.renderer = renderer;
      this.el = el;
      this.locationStrategy = locationStrategy;
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
            customElements.get(tagName)?.observedAttributes?.includes?.('href')
          )
        );
      if (!this.isAnchorElement) {
        this.subscribeToNavigationEventsIfNecessary();
      } else {
        this.setTabIndexIfNotOnNativeEl('0');
      }
    }
    subscribeToNavigationEventsIfNecessary() {
      if (this.subscription !== undefined || !this.isAnchorElement) {
        return;
      }
      // preserving fragment in router state
      let createSubcription = this.preserveFragment;
      // preserving or merging with query params in router state
      const dependsOnRouterState = (handling) => handling === 'merge' || handling === 'preserve';
      createSubcription ||= dependsOnRouterState(this.queryParamsHandling);
      createSubcription ||=
        !this.queryParamsHandling &&
        !dependsOnRouterState(this.options?.defaultQueryParamsHandling);
      if (!createSubcription) {
        return;
      }
      this.subscription = this.router.events.subscribe((s) => {
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
    preserveFragment = __runInitializers(this, _preserveFragment_initializers, false);
    /**
     * Passed to {@link Router#navigateByUrl} as part of the
     * `NavigationBehaviorOptions`.
     * @see {@link NavigationBehaviorOptions#skipLocationChange}
     * @see {@link Router#navigateByUrl}
     */
    skipLocationChange =
      (__runInitializers(this, _preserveFragment_extraInitializers),
      __runInitializers(this, _skipLocationChange_initializers, false));
    /**
     * Passed to {@link Router#navigateByUrl} as part of the
     * `NavigationBehaviorOptions`.
     * @see {@link NavigationBehaviorOptions#replaceUrl}
     * @see {@link Router#navigateByUrl}
     */
    replaceUrl =
      (__runInitializers(this, _skipLocationChange_extraInitializers),
      __runInitializers(this, _replaceUrl_initializers, false));
    /**
     * Modifies the tab index if there was not a tabindex attribute on the element during
     * instantiation.
     */
    setTabIndexIfNotOnNativeEl(newTabIndex) {
      if (
        this.tabIndexAttribute != null /* both `null` and `undefined` */ ||
        this.isAnchorElement
      ) {
        return;
      }
      this.applyAttributeValue('tabindex', newTabIndex);
    }
    /** @docs-private */
    // TODO(atscott): Remove changes parameter in major version as a breaking change.
    ngOnChanges(changes) {
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
          4017 /* RuntimeErrorCode.INVALID_ROUTER_LINK_INPUTS */,
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
    routerLinkInput = (__runInitializers(this, _replaceUrl_extraInitializers), null);
    /**
     * Commands to pass to {@link Router#createUrlTree} or a `UrlTree`.
     *   - **array**: commands to pass to {@link Router#createUrlTree}.
     *   - **string**: shorthand for array of commands with just the string, i.e. `['/route']`
     *   - **UrlTree**: a `UrlTree` for this link rather than creating one from the commands
     *     and other inputs that correspond to properties of `UrlCreationOptions`.
     *   - **null|undefined**: effectively disables the `routerLink`
     * @see {@link Router#createUrlTree}
     */
    set routerLink(commandsOrUrlTree) {
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
    onClick(button, ctrlKey, shiftKey, altKey, metaKey) {
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
    ngOnDestroy() {
      this.subscription?.unsubscribe();
    }
    updateHref() {
      const urlTree = this.urlTree;
      this.reactiveHref.set(
        urlTree !== null && this.locationStrategy
          ? (this.locationStrategy?.prepareExternalUrl(this.router.serializeUrl(urlTree)) ?? '')
          : null,
      );
    }
    applyAttributeValue(attrName, attrValue) {
      const renderer = this.renderer;
      const nativeElement = this.el.nativeElement;
      if (attrValue !== null) {
        renderer.setAttribute(nativeElement, attrName, attrValue);
      } else {
        renderer.removeAttribute(nativeElement, attrName);
      }
    }
    get urlTree() {
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
  };
  return (RouterLink = _classThis);
})();
export {RouterLink};
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
//# sourceMappingURL=router_link.js.map
