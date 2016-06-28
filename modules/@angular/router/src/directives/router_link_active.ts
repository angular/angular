/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterContentInit, ContentChildren, Directive, ElementRef, Input, OnChanges, OnDestroy, QueryList, Renderer} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {NavigationEnd, Router} from '../router';
import {containsTree} from '../url_tree';

import {RouterLink} from './router_link';

/**
 * The RouterLinkActive directive lets you add a CSS class to an element when the link's route
 * becomes active.
 *
 * Consider the following example:
 *
 * ```
 * <a [routerLink]="/user/bob" routerLinkActive="active-link">Bob</a>
 * ```
 *
 * When the url is either '/user' or '/user/bob', the active-link class will
 * be added to the `a` tag. If the url changes, the class will be removed.
 *
 * You can set more than one class, as follows:
 *
 * ```
 * <a [routerLink]="/user/bob" routerLinkActive="class1 class2">Bob</a>
 * <a [routerLink]="/user/bob" routerLinkActive="['class1', 'class2']">Bob</a>
 * ```
 *
 * You can configure RouterLinkActive by passing `exact: true`. This will add the classes
 * only when the url matches the link exactly.
 *
 * ```
 * <a [routerLink]="/user/bob" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:
 * true}">Bob</a>
 * ```
 *
 * Finally, you can apply the RouterLinkActive directive to an ancestor of a RouterLink.
 *
 * ```
 * <div routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
 *   <a [routerLink]="/user/jim">Jim</a>
 *   <a [routerLink]="/user/bob">Bob</a>
 * </div>
 * ```
 *
 * This will set the active-link class on the div tag if the url is either '/user/jim' or
 * '/user/bob'.
 *
 * @stable
 */
@Directive({selector: '[routerLinkActive]'})
export class RouterLinkActive implements OnChanges, OnDestroy, AfterContentInit {
  @ContentChildren(RouterLink) private links: QueryList<RouterLink>;
  private classes: string[] = [];
  private subscription: Subscription;

  @Input() private routerLinkActiveOptions: {exact: boolean} = {exact: false};

  /**
   * @internal
   */
  constructor(private router: Router, private element: ElementRef, private renderer: Renderer) {
    this.subscription = router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        this.update();
      }
    });
  }

  ngAfterContentInit(): void {
    this.links.changes.subscribe(s => this.update());
    this.update();
  }

  @Input()
  set routerLinkActive(data: string[]|string) {
    if (Array.isArray(data)) {
      this.classes = <any>data;
    } else {
      this.classes = data.split(' ');
    }
  }

  ngOnChanges(changes: {}): any { this.update(); }
  ngOnDestroy(): any { this.subscription.unsubscribe(); }

  private update(): void {
    if (!this.links || this.links.length === 0) return;

    const currentUrlTree = this.router.parseUrl(this.router.url);
    const isActive = this.links.reduce(
        (res, link) =>
            res || containsTree(currentUrlTree, link.urlTree, this.routerLinkActiveOptions.exact),
        false);

    this.classes.forEach(
        c => this.renderer.setElementClass(this.element.nativeElement, c, isActive));
  }
}
