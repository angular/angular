/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {
  ClickOutside,
  NavigationItem,
  NavigationList,
  NavigationState,
  findNavigationItem,
  getBaseUrlAfterRedirects,
  getNavigationItemsTree,
  markExternalLinks,
  shouldReduceMotion,
} from '@angular/docs';
import {distinctUntilChanged, filter, map, skip, startWith} from 'rxjs/operators';
import {SUB_NAVIGATION_DATA} from '../../../routing/sub-navigation-data';
import {ActivatedRouteSnapshot, NavigationEnd, Router, RouterStateSnapshot} from '@angular/router';
import {isPlatformBrowser} from '@angular/common';
import {PRIMARY_NAV_ID, SECONDARY_NAV_ID} from '../../constants/element-ids';
import {PAGE_PREFIX} from '../../constants/pages';

export const ANIMATION_DURATION = 500;

@Component({
  selector: 'adev-secondary-navigation',
  imports: [NavigationList, ClickOutside],
  templateUrl: './secondary-navigation.component.html',
  styleUrls: ['./secondary-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecondaryNavigation {
  private readonly destroyRef = inject(DestroyRef);
  private readonly navigationState = inject(NavigationState);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  protected readonly isSecondaryNavVisible = this.navigationState.isMobileNavVisible;
  readonly primaryActiveRouteItem = this.navigationState.primaryActiveRouteItem;
  protected readonly maxVisibleLevelsOnSecondaryNav = computed(() =>
    this.primaryActiveRouteItem() === PAGE_PREFIX.REFERENCE ? 1 : 2,
  );
  protected readonly navigationItemsSlides = this.navigationState.expandedItems;

  protected navigationItems: NavigationItem[] | undefined;

  protected readonly translateX = computed(() => {
    const level = this.navigationState.level();
    return `translateX(${-level * 100}%)`;
  });
  protected readonly transition = signal('0ms');

  protected readonly PRIMARY_NAV_ID = PRIMARY_NAV_ID;
  protected readonly SECONDARY_NAV_ID = SECONDARY_NAV_ID;

  private readonly routeMap: Record<string, NavigationItem[]> = {
    [PAGE_PREFIX.REFERENCE]: getNavigationItemsTree(SUB_NAVIGATION_DATA.reference, (tree) =>
      markExternalLinks(tree),
    ),
    [PAGE_PREFIX.DOCS]: getNavigationItemsTree(SUB_NAVIGATION_DATA.docs, (tree) =>
      markExternalLinks(tree),
    ),
  };

  private readonly primaryActiveRouteChanged$ = toObservable(this.primaryActiveRouteItem).pipe(
    distinctUntilChanged(),
    takeUntilDestroyed(this.destroyRef),
  );

  private readonly urlAfterRedirects$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map((event) => (event as NavigationEnd).urlAfterRedirects),
    filter((url): url is string => url !== undefined),
    startWith(this.getInitialPath(this.router.routerState.snapshot)),
    takeUntilDestroyed(this.destroyRef),
  );

  constructor() {
    this.navigationState.cleanExpandedState();
    this.listenToPrimaryRouteChange();
    this.setActiveRouteOnNavigationEnd();

    if (isPlatformBrowser(this.platformId)) {
      this.initSlideAnimation();
    }
  }

  protected close(): void {
    this.navigationState.setMobileNavigationListVisibility(false);
  }

  private setActiveRouteOnNavigationEnd(): void {
    this.urlAfterRedirects$.subscribe((url) => {
      const activeNavigationItem = this.getActiveNavigationItem(url);
      if (
        activeNavigationItem?.level &&
        activeNavigationItem.level <= this.maxVisibleLevelsOnSecondaryNav()
      ) {
        this.navigationState.cleanExpandedState();
      } else if (activeNavigationItem) {
        /**
         * For the `Docs`, we don't expand the "level === 1" items because they are already displayed in the main navigation list.
         * Example:
         * In-depth Guides (level == 0)
         * Components (level == 1) -> Selectors, Styling, etc (level == 2)
         * Template Syntax (level == 1) -> Text interpolation, etc (level == 2)
         *
         * For the `Tutorials`, we display the navigation in the dropdown and it has flat structure (all items are displayed as items with level === 0).
         *
         * For the `Reference` we would like to give possibility to expand the "level === 1" items cause they are not visible in the first slide of navigation list.
         * Example:
         * API Reference (level == 0) -> Overview, Animations, common, etc (level == 1) -> API Package exports (level == 2)
         */
        const shouldExpandItem = (node: NavigationItem): boolean =>
          !!node.level &&
          (this.primaryActiveRouteItem() === PAGE_PREFIX.REFERENCE
            ? node.level > 0
            : node.level > 1);

        // Skip expand when active item is API Reference homepage - `/api`.
        // It protect us from displaying second level of the navigation when user clicks on `Reference`,
        // Because in this situation we want to display the first level, which contains, in addition to the API Reference, also the CLI Reference, Error Encyclopedia etc.
        const skipExpandPredicateFn = (node: NavigationItem): boolean =>
          node.path === PAGE_PREFIX.API;

        this.navigationState.expandItemHierarchy(
          activeNavigationItem,
          shouldExpandItem,
          skipExpandPredicateFn,
        );
      }
    });
  }

  private getActiveNavigationItem(url: string): NavigationItem | null {
    // set visible navigation items if not present
    this.setVisibleNavigationItems();

    const activeNavigationItem = findNavigationItem(
      this.navigationItems!,
      (item) =>
        !!item.path &&
        getBaseUrlAfterRedirects(item.path, this.router) ===
          getBaseUrlAfterRedirects(url, this.router),
    );

    this.navigationState.setActiveNavigationItem(activeNavigationItem);

    return activeNavigationItem;
  }

  private initSlideAnimation(): void {
    if (shouldReduceMotion()) {
      return;
    }
    setTimeout(() => {
      this.transition.set(`${ANIMATION_DURATION}ms`);
    }, ANIMATION_DURATION);
  }

  private setVisibleNavigationItems(): void {
    const routeMap = this.routeMap[this.primaryActiveRouteItem()!];
    this.navigationItems = routeMap
      ? getNavigationItemsTree(routeMap, (item) => {
          item.isExpanded = this.primaryActiveRouteItem() === PAGE_PREFIX.DOCS && item.level === 1;
        })
      : [];
  }

  private listenToPrimaryRouteChange(): void {
    // Fix: flicker of sub-navigation on init
    this.primaryActiveRouteChanged$.pipe(skip(1)).subscribe(() => {
      this.navigationState.cleanExpandedState();
    });
  }

  private getInitialPath(routerState: RouterStateSnapshot): string {
    let route: ActivatedRouteSnapshot = routerState.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    return route.routeConfig?.path ?? '';
  }
}
