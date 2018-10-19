/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterContentInit, ChangeDetectorRef, ContentChildren, Directive, ElementRef, Input, OnChanges, OnDestroy, QueryList, Renderer2, SimpleChanges} from '@angular/core';
import {Subscription} from 'rxjs';

import {NavigationEnd, RouterEvent} from '../events';
import {Router} from '../router';

import {RouterLink, RouterLinkWithHref} from './router_link';


/**
 *
 * @description
 *
 * Lets you add a CSS class to an element when the link's route becomes active.
 *
 * This directive lets you add a CSS class to an element when the link's route
 * becomes active.
 *
 * Consider the following example:
 *
 * ```
 * <a routerLink="/user/bob" routerLinkActive="active-link">Bob</a>
 * ```
 *
 * When the url is either '/user' or '/user/bob', the active-link class will
 * be added to the `a` tag. If the url changes, the class will be removed.
 *
 * You can set more than one class, as follows:
 *
 * ```
 * <a routerLink="/user/bob" routerLinkActive="class1 class2">Bob</a>
 * <a routerLink="/user/bob" [routerLinkActive]="['class1', 'class2']">Bob</a>
 * ```
 *
 * You can configure RouterLinkActive by passing `exact: true`. This will add the classes
 * only when the url matches the link exactly.
 *
 * ```
 * <a routerLink="/user/bob" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:
 * true}">Bob</a>
 * ```
 *
 * You can assign the RouterLinkActive instance to a template variable and directly check
 * the `isActive` status.
 * ```
 * <a routerLink="/user/bob" routerLinkActive #rla="routerLinkActive">
 *   Bob {{ rla.isActive ? '(already open)' : ''}}
 * </a>
 * ```
 *
 * Finally, you can apply the RouterLinkActive directive to an ancestor of a RouterLink.
 *
 * ```
 * <div routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
 *   <a routerLink="/user/jim">Jim</a>
 *   <a routerLink="/user/bob">Bob</a>
 * </div>
 * ```
 *
 * This will set the active-link class on the div tag if the url is either '/user/jim' or
 * '/user/bob'.
 *
 * @ngModule RouterModule
 *
 * @publicApi
 */
@Directive({
  selector: '[routerLinkActive]',
  exportAs: 'routerLinkActive',
})
export class RouterLinkActive implements OnChanges,
    OnDestroy, AfterContentInit {
  // TODO(issue/24571): remove '!'.
  @ContentChildren(RouterLink, {descendants: true})
  links !: QueryList<RouterLink>;
  // TODO(issue/24571): remove '!'.
  @ContentChildren(RouterLinkWithHref, {descendants: true})
  linksWithHrefs !: QueryList<RouterLinkWithHref>;

  private classes: string[] = [];
  private subscription: Subscription;
  public readonly isActive: boolean = false;

  @Input() routerLinkActiveOptions: {exact: boolean} = {exact: false};

  constructor(
      private router: Router, private element: ElementRef, private renderer: Renderer2,
      private cdr: ChangeDetectorRef) {
    this.subscription = router.events.subscribe((s: RouterEvent) => {
      if (s instanceof NavigationEnd) {
        this.update();
      }
    });
  }


  ngAfterContentInit(): void {
    this.links.changes.subscribe(_ => this.update());
    this.linksWithHrefs.changes.subscribe(_ => this.update());
    this.update();
  }

  @Input()
  set routerLinkActive(data: string[]|string) {
    const classes = Array.isArray(data) ? data : data.split(' ');
    this.classes = classes.filter(c => !!c);
  }

  ngOnChanges(changes: SimpleChanges): void { this.update(); }
  ngOnDestroy(): void { this.subscription.unsubscribe(); }

  private update(): void {
    if (!this.links || !this.linksWithHrefs || !this.router.navigated) return;
    Promise.resolve().then(() => {
      const hasActiveLinks = this.hasActiveLinks();
      if (this.isActive !== hasActiveLinks) {
        (this as any).isActive = hasActiveLinks;
        this.classes.forEach((c) => {
          if (hasActiveLinks) {
            this.renderer.addClass(this.element.nativeElement, c);
          } else {
            this.renderer.removeClass(this.element.nativeElement, c);
          }
        });
      }
    });
  }

  private isLinkActive(router: Router): (link: (RouterLink|RouterLinkWithHref)) => boolean {
    return (link: RouterLink | RouterLinkWithHref) =>
               router.isActive(link.urlTree, this.routerLinkActiveOptions.exact);
  }

  private hasActiveLinks(): boolean {
    return this.links.some(this.isLinkActive(this.router)) ||
        this.linksWithHrefs.some(this.isLinkActive(this.router));
  }
}
