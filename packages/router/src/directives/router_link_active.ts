/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  ChangeDetectorRef,
  contentChildren,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  EventEmitter,
  Input,
  Optional,
  Output,
  Renderer2,
  signal,
  untracked,
} from '@angular/core';
import {from} from 'rxjs';
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
 * @ngModule RouterModule
 *
 * @publicApi
 */
@Directive({
  selector: '[routerLinkActive]',
  exportAs: 'routerLinkActive',
  host: {
    '[attr.aria-current]': '_isActive() ? ariaCurrentWhenActive : null',
  },
})
export class RouterLinkActive {
  links = contentChildren(RouterLink, {descendants: true});

  private classes = signal<string[]>([]);

  /** @internal */
  protected _isActive = signal(false);
  private _routerLinkActiveOptions = signal<{exact: boolean} | IsActiveMatchOptions>({
    exact: false,
  });
  private _ariaCurrentWhenActive = signal<
    'page' | 'step' | 'location' | 'date' | 'time' | boolean | undefined
  >(undefined);

  get isActive(): boolean {
    return this._isActive();
  }

  /**
   * Options to configure how to determine if the router link is active.
   *
   * These options are passed to the `Router.isActive()` function.
   *
   * @see {@link Router#isActive}
   */
  @Input()
  set routerLinkActiveOptions(options: {exact: boolean} | IsActiveMatchOptions) {
    this._routerLinkActiveOptions.set(options);
  }
  get routerLinkActiveOptions(): {exact: boolean} | IsActiveMatchOptions {
    return untracked(this._routerLinkActiveOptions);
  }

  /**
   * Aria-current attribute to apply when the router link is active.
   *
   * Possible values: `'page'` | `'step'` | `'location'` | `'date'` | `'time'` | `true` | `false`.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current}
   */
  @Input()
  set ariaCurrentWhenActive(value: 'page' | 'step' | 'location' | 'date' | 'time' | true | false) {
    this._ariaCurrentWhenActive.set(value);
  }
  get ariaCurrentWhenActive():
    | 'page'
    | 'step'
    | 'location'
    | 'date'
    | 'time'
    | true
    | false
    | undefined {
    return untracked(this._ariaCurrentWhenActive);
  }

  @Input()
  set routerLinkActive(data: string[] | string) {
    const classes = Array.isArray(data) ? data : data.split(' ');
    this.classes.set(classes.filter((c) => !!c));
  }

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
    private destroyRef: DestroyRef,
    @Optional() private link?: RouterLink,
  ) {
    const subscription = router.events.subscribe((s: Event) => {
      if (s instanceof NavigationEnd) {
        this.update();
      }
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());

    effect((cleanupFn) => {
      const links = [...(this.link ? [this.link] : []), ...this.links()];
      const linkOnChanges = links.map((link) => link.onChanges);
      this.update();

      const subscriptions = from(linkOnChanges)
        .pipe(mergeAll())
        .subscribe((link) => {
          if (untracked(this._isActive) !== this.isLinkActive(this.router)(link)) {
            untracked(() => this.update());
          }
        });

      cleanupFn(() => subscriptions.unsubscribe());
    });
  }

  private update() {
    if (!this.links || !this.router.navigated) return;
    const hasActiveLink = this.hasActiveLinks();

    // We can't use host binding for the classes instead of this imperative code,
    // because it is expected that the active classes are removed if the link was never active.
    this.classes().forEach((c) => {
      if (hasActiveLink) {
        this.renderer.addClass(this.element.nativeElement, c);
      } else {
        this.renderer.removeClass(this.element.nativeElement, c);
      }
    });

    if (untracked(this._isActive) !== hasActiveLink) {
      this._isActive.set(hasActiveLink);
      // this.cdr.markForCheck(); Still needed ?
      // Emit on isActiveChange after classes are updated
      this.isActiveChange.emit(hasActiveLink);
    }
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
    return (this.link && isActiveCheckFn(this.link)) || untracked(this.links).some(isActiveCheckFn);
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
