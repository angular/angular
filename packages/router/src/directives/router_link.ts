/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LocationStrategy} from '@angular/common';
import {Attribute, Directive, ElementRef, HostBinding, HostListener, Input, OnChanges, OnDestroy, Renderer2, SimpleChanges} from '@angular/core';
import {Subject, Subscription} from 'rxjs';

import {QueryParamsHandling} from '../config';
import {Event, NavigationEnd} from '../events';
import {Router} from '../router';
import {ActivatedRoute} from '../router_state';
import {Params} from '../shared';
import {UrlTree} from '../url_tree';


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
 * Multiple static segments can be merged into one term and combined with dynamic segements.
 * For example, `['/team/11/user', userName, {details: true}]`
 *
 * The input that you provide to the link is treated as a delta to the current URL.
 * For instance, suppose the current URL is `/user/(box//aux:team)`.
 * The link `<a [routerLink]="['/user/jim']">Jim</a>` creates the URL
 * `/user/(jim//aux:team)`.
 * See {@link Router#createUrlTree createUrlTree} for more information.
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
 * See {@link UrlCreationOptions.queryParamsHandling UrlCreationOptions#queryParamsHandling}.
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
 * Use {@link Router.getCurrentNavigation() Router#getCurrentNavigation} to retrieve a saved
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
@Directive({selector: ':not(a):not(area)[routerLink]'})
export class RouterLink implements OnChanges {
  /**
   * Passed to {@link Router#createUrlTree Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#queryParams UrlCreationOptions#queryParams}
   * @see {@link Router#createUrlTree Router#createUrlTree}
   */
  @Input() queryParams?: Params|null;
  /**
   * Passed to {@link Router#createUrlTree Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#fragment UrlCreationOptions#fragment}
   * @see {@link Router#createUrlTree Router#createUrlTree}
   */
  @Input() fragment?: string;
  /**
   * Passed to {@link Router#createUrlTree Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#queryParamsHandling UrlCreationOptions#queryParamsHandling}
   * @see {@link Router#createUrlTree Router#createUrlTree}
   */
  @Input() queryParamsHandling?: QueryParamsHandling|null;
  /**
   * Passed to {@link Router#createUrlTree Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#preserveFragment UrlCreationOptions#preserveFragment}
   * @see {@link Router#createUrlTree Router#createUrlTree}
   */
  // TODO(issue/24571): remove '!'.
  @Input() preserveFragment!: boolean;
  /**
   * Passed to {@link Router#navigateByUrl Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#skipLocationChange NavigationBehaviorOptions#skipLocationChange}
   * @see {@link Router#navigateByUrl Router#navigateByUrl}
   */
  // TODO(issue/24571): remove '!'.
  @Input() skipLocationChange!: boolean;
  /**
   * Passed to {@link Router#navigateByUrl Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#replaceUrl NavigationBehaviorOptions#replaceUrl}
   * @see {@link Router#navigateByUrl Router#navigateByUrl}
   */
  // TODO(issue/24571): remove '!'.
  @Input() replaceUrl!: boolean;
  /**
   * Passed to {@link Router#navigateByUrl Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#state NavigationBehaviorOptions#state}
   * @see {@link Router#navigateByUrl Router#navigateByUrl}
   */
  @Input() state?: {[k: string]: any};
  /**
   * Passed to {@link Router#createUrlTree Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * Specify a value here when you do not want to use the default value
   * for `routerLink`, which is the current activated route.
   * Note that a value of `undefined` here will use the `routerLink` default.
   * @see {@link UrlCreationOptions#relativeTo UrlCreationOptions#relativeTo}
   * @see {@link Router#createUrlTree Router#createUrlTree}
   */
  @Input() relativeTo?: ActivatedRoute|null;

  private commands: any[] = [];
  private preserve!: boolean;

  /** @internal */
  onChanges = new Subject<RouterLink>();

  constructor(
      private router: Router, private route: ActivatedRoute,
      @Attribute('tabindex') tabIndex: string, renderer: Renderer2, el: ElementRef) {
    if (tabIndex == null) {
      renderer.setAttribute(el.nativeElement, 'tabindex', '0');
    }
  }

  /** @nodoc */
  ngOnChanges(changes: SimpleChanges) {
    // This is subscribed to by `RouterLinkActive` so that it knows to update when there are changes
    // to the RouterLinks it's tracking.
    this.onChanges.next(this);
  }

  /**
   * Commands to pass to {@link Router#createUrlTree Router#createUrlTree}.
   *   - **array**: commands to pass to {@link Router#createUrlTree Router#createUrlTree}.
   *   - **string**: shorthand for array of commands with just the string, i.e. `['/route']`
   *   - **null|undefined**: shorthand for an empty array of commands, i.e. `[]`
   * @see {@link Router#createUrlTree Router#createUrlTree}
   */
  @Input()
  set routerLink(commands: any[]|string|null|undefined) {
    if (commands != null) {
      this.commands = Array.isArray(commands) ? commands : [commands];
    } else {
      this.commands = [];
    }
  }

  /** @nodoc */
  @HostListener('click')
  onClick(): boolean {
    const extras = {
      skipLocationChange: attrBoolValue(this.skipLocationChange),
      replaceUrl: attrBoolValue(this.replaceUrl),
      state: this.state,
    };
    this.router.navigateByUrl(this.urlTree, extras);
    return true;
  }

  get urlTree(): UrlTree {
    return this.router.createUrlTree(this.commands, {
      // If the `relativeTo` input is not defined, we want to use `this.route` by default.
      // Otherwise, we should use the value provided by the user in the input.
      relativeTo: this.relativeTo !== undefined ? this.relativeTo : this.route,
      queryParams: this.queryParams,
      fragment: this.fragment,
      queryParamsHandling: this.queryParamsHandling,
      preserveFragment: attrBoolValue(this.preserveFragment),
    });
  }
}

/**
 * @description
 *
 * Lets you link to specific routes in your app.
 *
 * See `RouterLink` for more information.
 *
 * @ngModule RouterModule
 *
 * @publicApi
 */
@Directive({selector: 'a[routerLink],area[routerLink]'})
export class RouterLinkWithHref implements OnChanges, OnDestroy {
  // TODO(issue/24571): remove '!'.
  @HostBinding('attr.target') @Input() target!: string;
  /**
   * Passed to {@link Router#createUrlTree Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#queryParams UrlCreationOptions#queryParams}
   * @see {@link Router#createUrlTree Router#createUrlTree}
   */
  @Input() queryParams?: Params|null;
  /**
   * Passed to {@link Router#createUrlTree Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#fragment UrlCreationOptions#fragment}
   * @see {@link Router#createUrlTree Router#createUrlTree}
   */
  @Input() fragment?: string;
  /**
   * Passed to {@link Router#createUrlTree Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#queryParamsHandling UrlCreationOptions#queryParamsHandling}
   * @see {@link Router#createUrlTree Router#createUrlTree}
   */
  @Input() queryParamsHandling?: QueryParamsHandling|null;
  /**
   * Passed to {@link Router#createUrlTree Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * @see {@link UrlCreationOptions#preserveFragment UrlCreationOptions#preserveFragment}
   * @see {@link Router#createUrlTree Router#createUrlTree}
   */
  // TODO(issue/24571): remove '!'.
  @Input() preserveFragment!: boolean;
  /**
   * Passed to {@link Router#navigateByUrl Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#skipLocationChange NavigationBehaviorOptions#skipLocationChange}
   * @see {@link Router#navigateByUrl Router#navigateByUrl}
   */
  // TODO(issue/24571): remove '!'.
  @Input() skipLocationChange!: boolean;
  /**
   * Passed to {@link Router#navigateByUrl Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#replaceUrl NavigationBehaviorOptions#replaceUrl}
   * @see {@link Router#navigateByUrl Router#navigateByUrl}
   */
  // TODO(issue/24571): remove '!'.
  @Input() replaceUrl!: boolean;
  /**
   * Passed to {@link Router#navigateByUrl Router#navigateByUrl} as part of the
   * `NavigationBehaviorOptions`.
   * @see {@link NavigationBehaviorOptions#state NavigationBehaviorOptions#state}
   * @see {@link Router#navigateByUrl Router#navigateByUrl}
   */
  @Input() state?: {[k: string]: any};
  /**
   * Passed to {@link Router#createUrlTree Router#createUrlTree} as part of the
   * `UrlCreationOptions`.
   * Specify a value here when you do not want to use the default value
   * for `routerLink`, which is the current activated route.
   * Note that a value of `undefined` here will use the `routerLink` default.
   * @see {@link UrlCreationOptions#relativeTo UrlCreationOptions#relativeTo}
   * @see {@link Router#createUrlTree Router#createUrlTree}
   */
  @Input() relativeTo?: ActivatedRoute|null;

  private commands: any[] = [];
  private subscription: Subscription;
  // TODO(issue/24571): remove '!'.
  private preserve!: boolean;

  // the url displayed on the anchor element.
  // TODO(issue/24571): remove '!'.
  @HostBinding() href!: string;

  /** @internal */
  onChanges = new Subject<RouterLinkWithHref>();

  constructor(
      private router: Router, private route: ActivatedRoute,
      private locationStrategy: LocationStrategy) {
    this.subscription = router.events.subscribe((s: Event) => {
      if (s instanceof NavigationEnd) {
        this.updateTargetUrlAndHref();
      }
    });
  }

  /**
   * Commands to pass to {@link Router#createUrlTree Router#createUrlTree}.
   *   - **array**: commands to pass to {@link Router#createUrlTree Router#createUrlTree}.
   *   - **string**: shorthand for array of commands with just the string, i.e. `['/route']`
   *   - **null|undefined**: shorthand for an empty array of commands, i.e. `[]`
   * @see {@link Router#createUrlTree Router#createUrlTree}
   */
  @Input()
  set routerLink(commands: any[]|string|null|undefined) {
    if (commands != null) {
      this.commands = Array.isArray(commands) ? commands : [commands];
    } else {
      this.commands = [];
    }
  }

  /** @nodoc */
  ngOnChanges(changes: SimpleChanges): any {
    this.updateTargetUrlAndHref();
    this.onChanges.next(this);
  }
  /** @nodoc */
  ngOnDestroy(): any {
    this.subscription.unsubscribe();
  }

  /** @nodoc */
  @HostListener(
      'click',
      ['$event.button', '$event.ctrlKey', '$event.shiftKey', '$event.altKey', '$event.metaKey'])
  onClick(button: number, ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean):
      boolean {
    if (button !== 0 || ctrlKey || shiftKey || altKey || metaKey) {
      return true;
    }

    if (typeof this.target === 'string' && this.target != '_self') {
      return true;
    }

    const extras = {
      skipLocationChange: attrBoolValue(this.skipLocationChange),
      replaceUrl: attrBoolValue(this.replaceUrl),
      state: this.state
    };
    this.router.navigateByUrl(this.urlTree, extras);
    return false;
  }

  private updateTargetUrlAndHref(): void {
    this.href = this.locationStrategy.prepareExternalUrl(this.router.serializeUrl(this.urlTree));
  }

  get urlTree(): UrlTree {
    return this.router.createUrlTree(this.commands, {
      // If the `relativeTo` input is not defined, we want to use `this.route` by default.
      // Otherwise, we should use the value provided by the user in the input.
      relativeTo: this.relativeTo !== undefined ? this.relativeTo : this.route,
      queryParams: this.queryParams,
      fragment: this.fragment,
      queryParamsHandling: this.queryParamsHandling,
      preserveFragment: attrBoolValue(this.preserveFragment),
    });
  }
}

function attrBoolValue(s: any): boolean {
  return s === '' || !!s;
}
