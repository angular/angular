/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterContentInit, ContentChildren, Directive, ElementRef, Inject, Input, OnChanges, OnDestroy, QueryList, Renderer} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {ExtraOptions} from '../extra_options';
import {Event, NavigationEnd, Router} from '../router';
import {ROUTER_CONFIGURATION} from '../router_tokens';

import {RouterLink, RouterLinkWithHref} from './router_link';

const DEFAULT_ACTIVE_CLASS: string = 'router-link-active';

/**
 * @whatItDoes Lets you add a CSS class to an element when the link's route becomes active.
 *
 * @howToUse
 *
 * ```
 * <a routerLink="/user/bob" routerLinkActive="active-link">Bob</a>
 * ```
 *
 * @description
 *
 * The RouterLinkActive directive lets you add a CSS class to an element when the link's route
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
 * @selector '[routerLinkActive],[routerLink]'
 * @ngModule RouterModule
 *
 * @stable
 */
@Directive({
  selector: '[routerLinkActive],[routerLink]',
  exportAs: 'routerLinkActive',
})
export class RouterLinkActive implements OnChanges,
    OnDestroy, AfterContentInit {
  @ContentChildren(RouterLink, {descendants: true}) links: QueryList<RouterLink>;
  @ContentChildren(RouterLinkWithHref, {descendants: true})
  linksWithHrefs: QueryList<RouterLinkWithHref>;

  private classes: string[] = [DEFAULT_ACTIVE_CLASS];
  private _routerLinkActiveOptions: {exact: boolean} = {exact: false};
  private enabled: boolean = true;
  private subscription: Subscription;

  @Input()
  set routerLinkActiveOptions(options: {exact: boolean}) {
    this._routerLinkActiveOptions = options;
  }

  get routerLinkActiveOptions() { return this._routerLinkActiveOptions; }

  constructor(
      private router: Router, private element: ElementRef, private renderer: Renderer,
      @Inject(ROUTER_CONFIGURATION) private config: any /* TODO #12631 ExtraOptions*/) {
    this.parseConfig(config);
    this.subscription = this.router.events.subscribe((e: Event) => {
      if (e instanceof NavigationEnd) {
        this.update();
      }
    });
  }

  get isActive(): boolean { return this.hasActiveLink(); }

  ngAfterContentInit(): void {
    this.links.changes.subscribe(() => this.update());
    this.linksWithHrefs.changes.subscribe(() => this.update());
    this.update();
  }

  @Input()
  set routerLinkActive(data: string[]|string) {
    this.classes = Array.isArray(data) ? <any>data : data.split(' ');
    this.enabled = true;
  }

  ngOnChanges(changes: {}): void { this.update(); }
  ngOnDestroy(): void { this.subscription.unsubscribe(); }

  private parseConfig(config: ExtraOptions): void {
    if (config && config.routerLinkActive) {
      const linkOpts = config.routerLinkActive;
      if (linkOpts.defaultClass) {
        this.classes = [linkOpts.defaultClass];
      }
      if (linkOpts.exact != null) {
        this._routerLinkActiveOptions = {exact: linkOpts.exact};
      }
      if (linkOpts.enabled != null) {
        this.enabled = linkOpts.enabled;
      }
    }
  }

  private update(): void {
    if (!this.enabled) return;
    if (!this.links || !this.linksWithHrefs || !this.router.navigated) return;

    const isActive = this.hasActiveLink();
    this.classes.forEach(c => {
      if (c) {
        this.renderer.setElementClass(this.element.nativeElement, c, isActive);
      }
    });
  }

  private isLinkActive(router: Router): (link: (RouterLink|RouterLinkWithHref)) => boolean {
    return (link: RouterLink | RouterLinkWithHref) =>
               router.isActive(link.urlTree, this.routerLinkActiveOptions.exact);
  }

  private hasActiveLink(): boolean {
    return this.links.some(this.isLinkActive(this.router)) ||
        this.linksWithHrefs.some(this.isLinkActive(this.router));
  }
}
