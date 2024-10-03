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
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Renderer2,
  ɵRuntimeError as RuntimeError,
  SimpleChanges,
  ɵɵsanitizeUrlOrResourceUrl,
} from '@angular/core';
import {Subject, Subscription} from 'rxjs';

import {Event, NavigationEnd} from '../events';
import {QueryParamsHandling} from '../models';
import {Router} from '../router';
import {ActivatedRoute} from '../router_state';
import {Params} from '../shared';
import {isUrlTree, UrlTree} from '../url_tree';
import {RuntimeErrorCode} from '../errors';

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
 * ```
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
 * ```
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
 * ```
 * <a [routerLink]="['/user/bob']" [state]="{tracingId: 123}">
 *   link to user component
 * </a>
 * ```
 *
 * Use {@link Router#getCurrentNavigation} to retrieve a saved
 * navigation-state value. For example, to capture the `tracingId` during the `NavigationStart`
 * event:
 *
 * ```
 * // Get NavigationStart events
 * router.events.pipe(filter(e => e instanceof NavigationStart)).subscribe(e => {
 *   const navigation = router.getCurrentNavigation();
 *   tracingService.trace({id: navigation.extras.state.tracingId});
 * });
 * ```
 *
 * @ngModule RouterModule
 *
 * @publicApi
 */
@Directive({
  selector: '[routerLink]',
})
export class RouterLink implements OnChanges, OnDestroy {
  /**
   * Represents an `href` attribute value applied to a host element,
   * when a host element is `<a>`. For other tags, the value is `null`.
   */
  href: string | null = null;

  /**
   * Represents the `target` attribute on a host element.
   * This is only used when the host element is an `<a>` tag.
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

  /** Whether a host element is an `<a>` tag. */
  private isAnchorElement: boolean;

  private subscription?: Subscription;

  /** @internal */
  onChanges = new Subject<RouterLink>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    @Attribute('tabindex') private readonly tabIndexAttribute: string | null | undefined,
    private readonly renderer: Renderer2,
    private readonly el: ElementRef,
    private locationStrategy?: LocationStrategy,
  ) {
    const tagName = el.nativeElement.tagName?.toLowerCase();
    this.isAnchorElement = tagName === 'a' || tagName === 'area';

    if (this.isAnchorElement) {
      this.subscription = router.events.subscribe((s: Event) => {
        if (s instanceof NavigationEnd) {
          this.updateHref();
        }
      });
    } else {
      this.setTabIndexIfNotOnNativeEl('0');
    }
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

  /** @nodoc */
  // TODO(atscott): Remove changes parameter in major version as a breaking change.
  ngOnChanges(changes?: SimpleChanges) {
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
    }
    // This is subscribed to by `RouterLinkActive` so that it knows to update when there are changes
    // to the RouterLinks it's tracking.
    this.onChanges.next(this);
  }

  private routerLinkInput: any[] | UrlTree | null = null;

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
  set routerLink(commandsOrUrlTree: any[] | string | UrlTree | null | undefined) {
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

  /** @nodoc */
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
    this.router.navigateByUrl(urlTree, extras);

    // Return `false` for `<a>` elements to prevent default action
    // and cancel the native behavior, since the navigation is handled
    // by the Router.
    return !this.isAnchorElement;
  }

  /** @nodoc */
  ngOnDestroy(): any {
    this.subscription?.unsubscribe();
  }

  private updateHref(): void {
    const urlTree = this.urlTree;
    this.href =
      urlTree !== null && this.locationStrategy
        ? this.locationStrategy?.prepareExternalUrl(this.router.serializeUrl(urlTree))
        : null;

    const sanitizedValue =
      this.href === null
        ? null
        : // This class represents a directive that can be added to both `<a>` elements,
          // as well as other elements. As a result, we can't define security context at
          // compile time. So the security context is deferred to runtime.
          // The `ɵɵsanitizeUrlOrResourceUrl` selects the necessary sanitizer function
          // based on the tag and property names. The logic mimics the one from
          // `packages/compiler/src/schema/dom_security_schema.ts`, which is used at compile time.
          //
          // Note: we should investigate whether we can switch to using `@HostBinding('attr.href')`
          // instead of applying a value via a renderer, after a final merge of the
          // `RouterLinkWithHref` directive.
          ɵɵsanitizeUrlOrResourceUrl(
            this.href,
            this.el.nativeElement.tagName.toLowerCase(),
            'href',
          );
    this.applyAttributeValue('href', sanitizedValue);
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
 * @deprecated use `RouterLink` directive instead.
 * @publicApi
 */
export {RouterLink as RouterLinkWithHref};
