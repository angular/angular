/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectorRef,
  computed,
  contentChildren,
  Directive,
  effect,
  ElementRef,
  EventEmitter,
  Input,
  linkedSignal,
  Optional,
  Output,
  Renderer2,
  signal,
  untracked,
} from '@angular/core';

import {Router} from '../router';
import {IsActiveMatchOptions} from '../url_tree';

import {RouterLink} from './router_link';
import {shallowEqualArrays} from '../utils/collection';

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
    '[attr.aria-current]': '_ariaCurrent()',
    '[class]': '_classBinding()',
  },
})
export class RouterLinkActive {
  private readonly _links = contentChildren(RouterLink, {descendants: true});

  @Input()
  set routerLinkActive(data: string[] | string) {
    const classes = Array.isArray(data) ? data : data.split(' ');
    this.classes.set(classes.filter((c) => !!c));
  }
  private classes = signal<string[]>([], {equal: shallowEqualArrays});
  /** @docs-private */
  protected _classBinding = computed(() =>
    this._hasActiveLinks()
      ? this.classes()
      : this.classes().reduce(
          (acc, v) => {
            acc[v] = false;
            return acc;
          },
          {} as {[k: string]: false},
        ),
  );

  get isActive(): boolean {
    return untracked(this._hasActiveLinks);
  }

  /**
   * Options to configure how to determine if the router link is active.
   *
   * These options are passed to the `Router.isActive()` function.
   *
   * @see {@link Router#isActive}
   */
  @Input() set routerLinkActiveOptions(v: {exact: boolean} | IsActiveMatchOptions) {
    this._routerLinkActiveOptionsInput.set(v);
  }
  get routerLinkActiveOptions(): {exact: boolean} | IsActiveMatchOptions {
    return untracked(this._routerLinkActiveOptionsInput);
  }
  private readonly _routerLinkActiveOptionsInput = signal<{exact: boolean} | IsActiveMatchOptions>({
    exact: false,
  });
  private _routerLinkActiveOptions = computed(() => {
    const options = this._routerLinkActiveOptionsInput();
    return isActiveMatchOptions(options)
      ? options
      : // While the types should disallow `undefined` here, it's possible without strict inputs
        options.exact || false;
  });

  /**
   * Aria-current attribute to apply when the router link is active.
   *
   * Possible values: `'page'` | `'step'` | `'location'` | `'date'` | `'time'` | `true` | `false`.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current}
   */
  @Input() set ariaCurrentWhenActive(
    v: undefined | 'page' | 'step' | 'location' | 'date' | 'time' | true | false,
  ) {
    this._ariaCurrentWhenActiveInput.set(v);
  }
  get ariaCurrentWhenActive():
    | undefined
    | 'page'
    | 'step'
    | 'location'
    | 'date'
    | 'time'
    | true
    | false {
    return untracked(this._ariaCurrentWhenActiveInput);
  }
  private _ariaCurrentWhenActiveInput = signal<
    undefined | 'page' | 'step' | 'location' | 'date' | 'time' | true | false
  >(undefined);

  protected _ariaCurrent = computed(() => {
    const value = this._ariaCurrentWhenActiveInput();
    if (!this._hasActiveLinks() || value === undefined) {
      return null;
    }
    return value.toString();
  });

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
  // Async emit to avoid expression changed errors since this emits during change detection
  // Could be changed to synchronous as a breaking change in the future.
  @Output() readonly isActiveChange: EventEmitter<boolean> = new EventEmitter(true);

  constructor(
    private router: Router,
    private element: ElementRef,
    private renderer: Renderer2,
    private readonly cdr: ChangeDetectorRef,
    @Optional() private link?: RouterLink,
  ) {
    let lastValue = false;
    effect(() => {
      const hasActiveLinks = this._hasActiveLinks();
      if (lastValue !== hasActiveLinks) {
        // Emit on isActiveChange after classes are updated
        this.isActiveChange.emit(hasActiveLinks);
      }
      lastValue = hasActiveLinks;
    });
  }

  private isLinkActive(link: RouterLink) {
    return computed(() => {
      const urlTree = link._urlTree();
      return urlTree ? this.router._isActive(urlTree, this._routerLinkActiveOptions())() : false;
    });
  }

  private thisLinkActive = computed(() => (!this.link ? false : this.isLinkActive(this.link)()));
  private contentLinkActiveSignals = computed(() =>
    this._links().map((link) => this.isLinkActive(link)),
  );
  private someContentLinkActive = computed(() =>
    this.contentLinkActiveSignals().some((active) => active()),
  );
  private routerHasNavigated = linkedSignal<boolean, boolean>({
    source: () => this.router._navigated(),
    computation: (navigated, previouslyNavigated): boolean =>
      navigated || !!previouslyNavigated?.source,
  });
  protected _hasActiveLinks = computed(() => {
    return this.routerHasNavigated() && (this.thisLinkActive() || this.someContentLinkActive());
  });
}

/**
 * Use instead of `'paths' in options` to be compatible with property renaming
 */
function isActiveMatchOptions(
  options: {exact: boolean} | IsActiveMatchOptions,
): options is IsActiveMatchOptions {
  return !!(options as IsActiveMatchOptions).paths;
}
