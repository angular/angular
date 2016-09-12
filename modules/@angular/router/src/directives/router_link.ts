/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LocationStrategy} from '@angular/common';
import {Directive, HostBinding, HostListener, Input, OnChanges, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {NavigationEnd, Router} from '../router';
import {ActivatedRoute} from '../router_state';
import {UrlTree} from '../url_tree';


/**
 * @whatItDoes Lets you link to specific parts of your app.
 *
 * @howToUse
 *
 * Consider the following route configuration:

 * ```
 * [{ path: 'user/:name', component: UserCmp }]
 * ```
 *
 * When linking to this `user/:name` route, you can write:
 *
 * ```
 * <a routerLink='/user/bob'>link to user component</a>
 * ```
 *
 * @description
 *
 * The RouterLink directives let you link to specific parts of your app.
 *
 * Whe the link is static, you can use the directive as follows:
 *
 * ```
 * <a routerLink="/user/bob">link to user component</a>
 * ```
 *
 * If you use dynamic values to generate the link, you can pass an array of path
 * segments, followed by the params for each segment.
 *
 * For instance `['/team', teamId, 'user', userName, {details: true}]`
 * means that we want to generate a link to `/team/11/user/bob;details=true`.
 *
 * Multiple static segments can be merged into one (e.g., `['/team/11/user', userName, {details:
 true}]`).
 *
 * The first segment name can be prepended with `/`, `./`, or `../`:
 * * If the first segment begins with `/`, the router will look up the route from the root of the
 app.
 * * If the first segment begins with `./`, or doesn't begin with a slash, the router will
 * instead look in the children of the current activated route.
 * * And if the first segment begins with `../`, the router will go up one level.
 *
 * You can set query params and fragment as follows:
 *
 * ```
 * <a [routerLink]="['/user/bob']" [queryParams]="{debug: true}" fragment="education">link to user
 component</a>
 * ```
 * RouterLink will use these to generate this link: `/user/bob#education?debug=true`.
 *
 * You can also tell the directive to preserve the current query params and fragment:
 *
 * ```
 * <a [routerLink]="['/user/bob']" preserveQueryParams preserveFragment>link to user
 component</a>
 * ```
 *
 * The router link directive always treats the provided input as a delta to the current url.
 *
 * For instance, if the current url is `/user/(box//aux:team)`.
 *
 * Then the following link `<a [routerLink]="['/user/jim']">Jim</a>` will generate the link
 * `/user/(jim//aux:team)`.
 *
 * @selector ':not(a)[routerLink]'
 * @ngModule RouterModule
 *
 * See {@link Router.createUrlTree} for more information.
 *
 * @stable
 */
@Directive({selector: ':not(a)[routerLink]'})
export class RouterLink {
  private commands: any[] = [];
  @Input() queryParams: {[k: string]: any};
  @Input() fragment: string;
  @Input() preserveQueryParams: boolean;
  @Input() preserveFragment: boolean;

  constructor(
      private router: Router, private route: ActivatedRoute,
      private locationStrategy: LocationStrategy) {}

  @Input()
  set routerLink(data: any[]|string) {
    if (Array.isArray(data)) {
      this.commands = data;
    } else {
      this.commands = [data];
    }
  }

  @HostListener('click', ['$event.button', '$event.ctrlKey', '$event.metaKey'])
  onClick(button: number, ctrlKey: boolean, metaKey: boolean): boolean {
    if (button !== 0 || ctrlKey || metaKey) {
      return true;
    }
    this.router.navigateByUrl(this.urlTree);
    return false;
  }

  get urlTree(): UrlTree {
    return this.router.createUrlTree(this.commands, {
      relativeTo: this.route,
      queryParams: this.queryParams,
      fragment: this.fragment,
      preserveQueryParams: toBool(this.preserveQueryParams),
      preserveFragment: toBool(this.preserveFragment)
    });
  }
}

/**
 * @whatItDoes Lets you link to specific parts of your app.
 *
 * See {@link RouterLink} for more information.
 *
 * @selector 'a[routerLink]'
 * @ngModule RouterModule
 *
 * @stable
 */
@Directive({selector: 'a[routerLink]'})
export class RouterLinkWithHref implements OnChanges, OnDestroy {
  @Input() target: string;
  private commands: any[] = [];
  @Input() queryParams: {[k: string]: any};
  @Input() fragment: string;
  @Input() routerLinkOptions: {preserveQueryParams: boolean, preserveFragment: boolean};
  @Input() preserveQueryParams: boolean;
  @Input() preserveFragment: boolean;
  private subscription: Subscription;

  // the url displayed on the anchor element.
  @HostBinding() href: string;

  constructor(
      private router: Router, private route: ActivatedRoute,
      private locationStrategy: LocationStrategy) {
    this.subscription = router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        this.updateTargetUrlAndHref();
      }
    });
  }

  @Input()
  set routerLink(data: any[]|string) {
    if (Array.isArray(data)) {
      this.commands = data;
    } else {
      this.commands = [data];
    }
  }

  ngOnChanges(changes: {}): any { this.updateTargetUrlAndHref(); }
  ngOnDestroy(): any { this.subscription.unsubscribe(); }

  @HostListener('click', ['$event.button', '$event.ctrlKey', '$event.metaKey'])
  onClick(button: number, ctrlKey: boolean, metaKey: boolean): boolean {
    if (button !== 0 || ctrlKey || metaKey) {
      return true;
    }

    if (typeof this.target === 'string' && this.target != '_self') {
      return true;
    }

    this.router.navigateByUrl(this.urlTree);
    return false;
  }

  private updateTargetUrlAndHref(): void {
    this.href = this.locationStrategy.prepareExternalUrl(this.router.serializeUrl(this.urlTree));
  }

  get urlTree(): UrlTree {
    return this.router.createUrlTree(this.commands, {
      relativeTo: this.route,
      queryParams: this.queryParams,
      fragment: this.fragment,
      preserveQueryParams: toBool(this.preserveQueryParams),
      preserveFragment: toBool(this.preserveFragment)
    });
  }
}

function toBool(s?: any): boolean {
  if (s === '') return true;
  return !!s;
}