/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import {NavigationEnd, NavigationSkipped, Router, RouterOutlet} from '@angular/router';
import {filter, map} from 'rxjs/operators';
import {
  CookiePopup,
  getActivatedRouteSnapshotFromRouter,
  IS_SEARCH_DIALOG_OPEN,
  SearchDialog,
  TopLevelBannerComponent,
} from '@angular/docs';
import {Footer} from './core/layout/footer/footer.component';
import {Navigation} from './core/layout/navigation/navigation.component';
import {SecondaryNavigation} from './core/layout/secondary-navigation/secondary-navigation.component';
import {ProgressBarComponent} from './core/layout/progress-bar/progress-bar.component';
import {ESCAPE, SEARCH_TRIGGER_KEY} from './core/constants/keys';
import {HeaderService} from './core/services/header.service';

@Component({
  selector: 'adev-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CookiePopup,
    Navigation,
    Footer,
    SecondaryNavigation,
    RouterOutlet,
    SearchDialog,
    ProgressBarComponent,
    TopLevelBannerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: {
    '(window:keydown)': 'setSearchDialogVisibilityOnKeyPress($event)',
  },
})
export class AppComponent {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly headerService = inject(HeaderService);

  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  displaySecondaryNav = signal(false);
  displayFooter = signal(false);
  displaySearchDialog = inject(IS_SEARCH_DIALOG_OPEN);

  constructor() {
    this.closeSearchDialogOnNavigationSkipped();
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map((event) => event.urlAfterRedirects),
      )
      .subscribe((url) => {
        // We can't use an input binded to the route here
        // because AppComponent itself is not a routed component
        // so we access it via the snapshot
        const activatedRoute = getActivatedRouteSnapshotFromRouter(this.router);
        this.displayFooter.set(!activatedRoute.data['hideFooter']);
        this.displaySecondaryNav.set(activatedRoute.data['displaySecondaryNav']);

        this.displaySearchDialog.set(false);
        this.updateCanonicalLink(url);
      });
  }

  focusFirstHeading(): void {
    const h1 = this.document.querySelector<HTMLHeadingElement>('h1:not(docs-top-level-banner h1)');
    h1?.focus();
  }

  protected setSearchDialogVisibilityOnKeyPress(event: KeyboardEvent): void {
    if (event.key === SEARCH_TRIGGER_KEY && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      this.displaySearchDialog.update((display) => !display);
    }

    if (event.key === ESCAPE && this.displaySearchDialog()) {
      event.preventDefault();
      this.displaySearchDialog.set(false);
    }
  }

  private updateCanonicalLink(absoluteUrl: string) {
    this.headerService.setCanonical(absoluteUrl);
  }

  private closeSearchDialogOnNavigationSkipped(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationSkipped)).subscribe(() => {
      this.displaySearchDialog.set(false);
    });
  }
}
