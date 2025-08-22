/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkMenu, CdkMenuItem, CdkMenuTrigger} from '@angular/cdk/menu';
import {DOCUMENT, Location, isPlatformBrowser} from '@angular/common';
import {ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, inject} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {
  ClickOutside,
  NavigationState,
  IconComponent,
  getBaseUrlAfterRedirects,
  isApple,
  IS_SEARCH_DIALOG_OPEN,
} from '@angular/docs';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {filter, map, startWith} from 'rxjs/operators';
import {DOCS_ROUTES, REFERENCE_ROUTES, TUTORIALS_ROUTES} from '../../../routes';
import {Theme, ThemeManager} from '../../services/theme-manager.service';
import {VersionManager} from '../../services/version-manager.service';
import {ConnectionPositionPair} from '@angular/cdk/overlay';
import {ANGULAR_LINKS} from '../../constants/links';
import {PRIMARY_NAV_ID, SECONDARY_NAV_ID} from '../../constants/element-ids';
import {COMMAND, CONTROL, SEARCH_TRIGGER_KEY} from '../../constants/keys';
import {PAGE_PREFIX} from '../../constants/pages';

type MenuType = 'social' | 'theme-picker' | 'version-picker';

@Component({
  selector: 'div.adev-nav',
  imports: [RouterLink, ClickOutside, CdkMenu, CdkMenuItem, CdkMenuTrigger, IconComponent],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss', './mini-menu.scss', './nav-item.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navigation {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly navigationState = inject(NavigationState);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly themeManager = inject(ThemeManager);
  private readonly isSearchDialogOpen = inject(IS_SEARCH_DIALOG_OPEN);
  private readonly versionManager = inject(VersionManager);

  protected PAGE_PREFIX = PAGE_PREFIX;
  protected ngLinks = ANGULAR_LINKS;
  readonly PRIMARY_NAV_ID = PRIMARY_NAV_ID;
  readonly SECONDARY_NAV_ID = SECONDARY_NAV_ID;

  // We can't use the ActivatedRouter queryParams as we're outside the router outlet
  readonly isUwu = 'location' in globalThis ? location.search.includes('uwu') : false;

  miniMenuPositions = [
    new ConnectionPositionPair(
      {originX: 'end', originY: 'center'},
      {overlayX: 'start', overlayY: 'center'},
    ),
    new ConnectionPositionPair(
      {originX: 'end', originY: 'top'},
      {overlayX: 'start', overlayY: 'top'},
    ),
  ];

  readonly APPLE_SEARCH_LABEL = `⌘`;
  readonly DEFAULT_SEARCH_LABEL = `ctrl`;

  activeRouteItem = this.navigationState.primaryActiveRouteItem;
  theme = this.themeManager.theme;
  openedMenu: MenuType | null = null;

  currentDocsVersion = this.versionManager.currentDocsVersion;
  currentDocsVersionMode = this.versionManager.currentDocsVersionMode;

  // Set the values of the search label and title only on the client, because the label is user-agent specific.
  searchLabel = this.isBrowser
    ? isApple
      ? this.APPLE_SEARCH_LABEL
      : this.DEFAULT_SEARCH_LABEL
    : '';
  searchTitle = this.isBrowser
    ? isApple
      ? `${COMMAND} ${SEARCH_TRIGGER_KEY.toUpperCase()}`
      : `${CONTROL} ${SEARCH_TRIGGER_KEY.toUpperCase()}`
    : '';
  versions = this.versionManager.versions;

  isMobileNavigationOpened = this.navigationState.isMobileNavVisible;
  isMobileNavigationOpened$ = toObservable(this.isMobileNavigationOpened);
  primaryRouteChanged$ = toObservable(this.activeRouteItem);

  constructor() {
    this.listenToRouteChange();
    this.preventToScrollContentWhenSecondaryNavIsOpened();
    this.closeMobileNavOnPrimaryRouteChange();
  }

  setTheme(theme: Theme): void {
    this.themeManager.setTheme(theme);
  }

  openVersionMenu($event: MouseEvent): void {
    // It's required to avoid redirection to `home`
    $event.stopImmediatePropagation();
    $event.preventDefault();
    this.openMenu('version-picker');
  }

  openMenu(menuType: MenuType): void {
    this.openedMenu = menuType;
  }

  closeMenu(): void {
    this.openedMenu = null;
  }

  openMobileNav($event: MouseEvent): void {
    $event.stopPropagation();
    this.navigationState.setMobileNavigationListVisibility(true);
  }

  closeMobileNav(): void {
    this.navigationState.setMobileNavigationListVisibility(false);
  }

  toggleSearchDialog(event: MouseEvent): void {
    event.stopPropagation();
    this.isSearchDialogOpen.update((isOpen) => !isOpen);
  }

  private closeMobileNavOnPrimaryRouteChange(): void {
    this.primaryRouteChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.closeMobileNav();
    });
  }

  private listenToRouteChange(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event) => (event as NavigationEnd).urlAfterRedirects),
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        //using location because router.url will only return "/" here
        startWith(this.location.path()),
      )
      .subscribe((url) => {
        this.setActivePrimaryRoute(getBaseUrlAfterRedirects(url, this.router));
      });
  }

  // Set active route item, based on urlAfterRedirects.
  // First check if url starts with the main prefixes (docs, reference, tutorials).
  // (*) Docs navigation tree contains items which will navigate to /tutorials.
  // In that case after click on such link we should mark as active item, and display tutorials navigation tree.
  // If it's not starting with prefix then check if specific path exist in the array of defined routes
  // (*) Reference navigation tree contains items which are not start with prefix like /migrations or /errors.
  private setActivePrimaryRoute(urlAfterRedirects: string): void {
    if (urlAfterRedirects === '') {
      this.activeRouteItem.set(PAGE_PREFIX.HOME);
    } else if (urlAfterRedirects.startsWith(PAGE_PREFIX.DOCS)) {
      this.activeRouteItem.set(PAGE_PREFIX.DOCS);
    } else if (
      urlAfterRedirects.startsWith(PAGE_PREFIX.REFERENCE) ||
      urlAfterRedirects.startsWith(PAGE_PREFIX.API) ||
      urlAfterRedirects.startsWith(PAGE_PREFIX.UPDATE)
    ) {
      this.activeRouteItem.set(PAGE_PREFIX.REFERENCE);
    } else if (urlAfterRedirects === PAGE_PREFIX.PLAYGROUND) {
      this.activeRouteItem.set(PAGE_PREFIX.PLAYGROUND);
    } else if (urlAfterRedirects.startsWith(PAGE_PREFIX.TUTORIALS)) {
      this.activeRouteItem.set(PAGE_PREFIX.TUTORIALS);
    } else if (DOCS_ROUTES.some((route) => route.path === urlAfterRedirects)) {
      this.activeRouteItem.set(PAGE_PREFIX.DOCS);
    } else if (REFERENCE_ROUTES.some((route) => route.path === urlAfterRedirects)) {
      this.activeRouteItem.set(PAGE_PREFIX.REFERENCE);
    } else if (TUTORIALS_ROUTES.some((route) => route.path === urlAfterRedirects)) {
      this.activeRouteItem.set(PAGE_PREFIX.TUTORIALS);
    } else {
      // Reset if no active route item could be found
      this.activeRouteItem.set(null);
    }
  }

  private preventToScrollContentWhenSecondaryNavIsOpened(): void {
    this.isMobileNavigationOpened$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((opened) => {
      if (opened) {
        this.document.body.style.overflowY = 'hidden';
      } else {
        this.document.body.style.removeProperty('overflow-y');
      }
    });
  }
}
