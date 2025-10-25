/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterContentInit,
  ChangeDetectorRef,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import {from, of, Subscription} from 'rxjs';
import {mergeAll} from 'rxjs/operators';

import {Event, NavigationEnd} from '../events';
import {Router} from '../router';
import {IsActiveMatchOptions} from '../url_tree';

import {RouterLink} from './router_link';

/**
 *
 * @description
 *
 * Tracks whether the linked route of an element is currently active, and allows you
 * to specify one or more CSS classes to add to the element when the linked route
 * is active.
 *
 * Use this directive to create a visual distinction for elements associated with an active route.
 * For example, the following code highlights the word "Bob" when the router
 * activates the associated route:
 *
 * ```html
 * <a routerLink="/user/bob" routerLinkActive="active-link">Bob</a>
 * ```
 *
 * Whenever the URL is either '/user' or '/user/bob', the "active-link" class is
 * added to the anchor tag. If the URL changes, the class is removed.
 *
 * You can set more than one class using a space-separated string or an array.
 * For example:
 *
 * ```html
 * <a routerLink="/user/bob" routerLinkActive="class1 class2">Bob</a>
 * <a routerLink="/user/bob" [routerLinkActive]="['class1', 'class2']">Bob</a>
 * ```
 *
 * To add the classes only when the URL matches the link exactly, add the option `exact: true`:
 *
 * ```html
 * <a routerLink="/user/bob" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:
 * true}">Bob</a>
 * ```
 *
 * To directly check the `isActive` status of the link, assign the `RouterLinkActive`
 * instance to a template variable.
 * For example, the following checks the status without assigning any CSS classes:
 *
 * ```html
 * <a routerLink="/user/bob" routerLinkActive #rla="routerLinkActive">
 *   Bob {{ rla.isActive ? '(already open)' : ''}}
 * </a>
 * ```
 *
 * You can apply the `RouterLinkActive` directive to an ancestor of linked elements.
 * For example, the following sets the active-link class on the `<div>`  parent tag
 * when the URL is either '/user/jim' or '/user/bob'.
 *
 * ```html
 * <div routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
 *   <a routerLink="/user/jim">Jim</a>
 *   <a routerLink="/user/bob">Bob</a>
 * </div>
 * ```
 *
 * The `RouterLinkActive` directive can also be used to set the aria-current attribute
 * to provide an alternative distinction for active elements to visually impaired users.
 *
 * For example, the following code adds the 'active' class to the Home Page link when it is
 * indeed active and in such case also sets its aria-current attribute to 'page':
 *
 * ```html
 * <a routerLink="/" routerLinkActive="active" ariaCurrentWhenActive="page">Home Page</a>
 * ```
 *
 * NOTE: RouterLinkActive is a `ContentChildren` query.
 * Content children queries do not retrieve elements or directives that are in other components' templates, since a component's template is always a black box to its ancestors.
 *
 * @ngModule RouterModule
 *
 * @publicApi
 */
@Directive({
  selector: '[routerLinkActive]',
  exportAs: 'routerLinkActive',
})
export class RouterLinkActive implements OnChanges, OnDestroy, AfterContentInit {
  @ContentChildren(RouterLink, {descendants: true}) links!: QueryList<RouterLink>;

  private classes: string[] = [];
  private routerEventsSubscription: Subscription;
  private linkInputChangesSubscription?: Subscription;
  private _isActive = false;

  get isActive(): boolean {
    return this._isActive;
  }

  /**
   * Options to configure how to determine if the router link is active.
   *
   * These options are passed to the `Router.isActive()` function.
   *
   * @see {@link Router#isActive}
   */
  @Input() routerLinkActiveOptions: {exact: boolean} | IsActiveMatchOptions = {exact: false};

  /**
   * Aria-current attribute to apply when the router link is active.
   *
   * Possible values: `'page'` | `'step'` | `'location'` | `'date'` | `'time'` | `true` | `false`.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current}
   */
  @Input() ariaCurrentWhenActive?: 'page' | 'step' | 'location' | 'date' | 'time' | true | false;

  /**
   *
   * You can use the output `isActiveChange` to get notified each time the link becomes
   * active or inactive.
   *
   * Emits:
   * true  -> Route is active
   * false -> Route is inactive
   *
   * ```html
   * <a
   *  routerLink="/user/bob"
   *  routerLinkActive="active-link"
   *  (isActiveChange)="this.onRouterLinkActive($event)">Bob</a>
   * ```
   */
  @Output() readonly isActiveChange: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private router: Router,
    private element: ElementRef,
    private renderer: Renderer2,
    private readonly cdr: ChangeDetectorRef,
    @Optional() private link?: RouterLink,
  ) {
    this.routerEventsSubscription = router.events.subscribe((s: Event) => {
      if (s instanceof NavigationEnd) {
        this.update();
      }
    });
  }

  /** @docs-private */
  ngAfterContentInit(): void {
    // `of(null)` is used to force subscribe body to execute once immediately (like `startWith`).
    of(this.links.changes, of(null))
      .pipe(mergeAll())
      .subscribe((_) => {
        this.update();
        this.subscribeToEachLinkOnChanges();
      });
  }

  private subscribeToEachLinkOnChanges() {
    this.linkInputChangesSubscription?.unsubscribe();
    const allLinkChanges = [...this.links.toArray(), this.link]
      .filter((link): link is RouterLink => !!link)
      .map((link) => link.onChanges);
    this.linkInputChangesSubscription = from(allLinkChanges)
      .pipe(mergeAll())
      .subscribe((link) => {
        if (this._isActive !== this.isLinkActive(this.router)(link)) {
          this.update();
        }
      });
  }

  @Input()
  set routerLinkActive(data: string[] | string) {
    const classes = Array.isArray(data) ? data : data.split(' ');
    this.classes = classes.filter((c) => !!c);
  }

  /** @docs-private */
  ngOnChanges(changes: SimpleChanges): void {
    this.update();
  }
  /** @docs-private */
  ngOnDestroy(): void {
    this.routerEventsSubscription.unsubscribe();
    this.linkInputChangesSubscription?.unsubscribe();
  }

  private update(): void {
    if (!this.links || !this.router.navigated) return;

    queueMicrotask(() => {
      const hasActiveLinks = this.hasActiveLinks();
      this.classes.forEach((c) => {
        if (hasActiveLinks) {
          this.renderer.addClass(this.element.nativeElement, c);
        } else {
          this.renderer.removeClass(this.element.nativeElement, c);
        }
      });
      if (hasActiveLinks && this.ariaCurrentWhenActive !== undefined) {
        this.renderer.setAttribute(
          this.element.nativeElement,
          'aria-current',
          this.ariaCurrentWhenActive.toString(),
        );
      } else {
        this.renderer.removeAttribute(this.element.nativeElement, 'aria-current');
      }

      // Only emit change if the active state changed.
      if (this._isActive !== hasActiveLinks) {
        this._isActive = hasActiveLinks;
        this.cdr.markForCheck();
        // Emit on isActiveChange after classes are updated
        this.isActiveChange.emit(hasActiveLinks);
      }
    });
  }

  private isLinkActive(router: Router): (link: RouterLink) => boolean {
    const options: boolean | IsActiveMatchOptions = isActiveMatchOptions(
      this.routerLinkActiveOptions,
    )
      ? this.routerLinkActiveOptions
      : // While the types should disallow `undefined` here, it's possible without strict inputs
        this.routerLinkActiveOptions.exact || false;
    return (link: RouterLink) => {
      const urlTree = link.urlTree;
      return urlTree ? router.isActive(urlTree, options) : false;
    };
  }

  private hasActiveLinks(): boolean {
    const isActiveCheckFn = this.isLinkActive(this.router);
    return (this.link && isActiveCheckFn(this.link)) || this.links.some(isActiveCheckFn);
  }
}

/**
 * Use instead of `'paths' in options` to be compatible with property renaming
 */
function isActiveMatchOptions(
  options: {exact: boolean} | IsActiveMatchOptions,
): options is IsActiveMatchOptions {
  return !!(options as IsActiveMatchOptions).paths;
}
