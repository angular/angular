/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import { Location } from '@angular/common';
import {
  AfterContentInit,
  computed,
  contentChildren,
  Directive,
  effect,
  inject,
  Injector,
  input,
  OnDestroy,
  output,
  signal,
  untracked
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  IsActiveMatchOptions,
  NavigationEnd,
  Router,
  RouterLink
} from '@angular/router';
import { containsTree } from '../url_tree';
import { from, Subject, Subscription } from 'rxjs';
import { filter, mergeAll } from 'rxjs/operators';

@Directive({
  selector: '[routerLinkActive]',
  exportAs: 'routerLinkActive',
  host: {
    '[class]': "_isActive() ? routerLinkActive() : ''",
    '[attr.aria-current]': 'ariaCurrentWhenActive() !== undefined && _isActive() ? ariaCurrentWhenActive() : null'
  }
})
export class RouterLinkActive implements OnDestroy, AfterContentInit {
  readonly links = contentChildren(RouterLink, { descendants: true });

  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly link = inject(RouterLink, { optional: true });
  private readonly injector = inject(Injector);

  private readonly routerEvents = toSignal(this.router.events.pipe(filter((s) => s instanceof NavigationEnd)));
  private readonly linksChanged = signal({});
  private linkInputChangesSubscription?: Subscription;

  protected readonly _isActive = computed(() => {
    this.routerEvents();
    this.linksChanged();
    return this.hasActiveLinks();
  });

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
  readonly routerLinkActiveOptions = input<{ exact: boolean } | IsActiveMatchOptions>({ exact: false });

  /**
   * Aria-current attribute to apply when the router link is active.
   *
   * Possible values: `'page'` | `'step'` | `'location'` | `'date'` | `'time'` | `true` | `false`.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current}
   */
  readonly ariaCurrentWhenActive = input<'page' | 'step' | 'location' | 'date' | 'time' | true | false>();

  readonly routerLinkActive = input<string[] | string>([]);

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
  readonly isActiveChange = output<boolean>();

  constructor() {
    effect(() => {
      this.isActiveChange.emit(this._isActive());
    });
  }

  /** @docs-private */
  ngAfterContentInit(): void {
    effect(
      () => {
        this.links();
        untracked(() => {
          this.subscribeToEachLinkOnChanges();
        });
      },
      { injector: this.injector }
    );
  }

  private subscribeToEachLinkOnChanges() {
    this.linkInputChangesSubscription?.unsubscribe();
    const allLinkChanges = [...this.links(), this.link]
      .filter((link): link is RouterLink => !!link)
      .map((link) => (link as any).onChanges as Subject<RouterLink>);
    this.linkInputChangesSubscription = from(allLinkChanges)
      .pipe(mergeAll())
      .subscribe(() => {
        this.linksChanged.set({});
      });
  }

  /** @docs-private */
  ngOnDestroy(): void {
    this.linkInputChangesSubscription?.unsubscribe();
  }

  private isLinkActive(): (link: RouterLink) => boolean {
    const routerLinkActiveOptions = this.routerLinkActiveOptions();
    const options: boolean | IsActiveMatchOptions = isActiveMatchOptions(routerLinkActiveOptions)
      ? routerLinkActiveOptions
      : // While the types should disallow `undefined` here, it's possible without strict inputs
        {
          paths: routerLinkActiveOptions.exact ? 'exact' : 'subset',
          queryParams: routerLinkActiveOptions.exact ? 'exact' : 'subset',
          fragment: 'ignored',
          matrixParams: 'ignored'
        };
    return (link: RouterLink) => {
      const urlTree = link.urlTree;
      return urlTree
        ? this.router.navigated
          ? this.router.isActive(urlTree, options)
          : containsTree(this.router.parseUrl(this.location.path()), urlTree, options)
        : false;
    };
  }

  private hasActiveLinks(): boolean {
    const isActiveCheckFn = this.isLinkActive();
    return (this.link && isActiveCheckFn(this.link)) || this.links().some(isActiveCheckFn);
  }
}

/**
 * Use instead of `'paths' in options` to be compatible with property renaming
 */
function isActiveMatchOptions(options: { exact: boolean } | IsActiveMatchOptions): options is IsActiveMatchOptions {
  return !!(options as IsActiveMatchOptions).paths;
}