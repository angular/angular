/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  PLATFORM_ID,
  signal,
  isDevMode,
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
let AppComponent = (() => {
  let _classDecorators = [
    Component({
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
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AppComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      AppComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    document = inject(DOCUMENT);
    router = inject(Router);
    headerService = inject(HeaderService);
    isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    displaySecondaryNav = signal(false);
    displayFooter = signal(false);
    displaySearchDialog = inject(IS_SEARCH_DIALOG_OPEN);
    constructor() {
      this.closeSearchDialogOnNavigationSkipped();
      this.router.events
        .pipe(
          filter((e) => e instanceof NavigationEnd),
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
    focusFirstHeading() {
      const h1 = this.document.querySelector('h1:not(docs-top-level-banner h1)');
      h1?.focus();
    }
    setSearchDialogVisibilityOnKeyPress(event) {
      if (event.key === SEARCH_TRIGGER_KEY && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        this.displaySearchDialog.update((display) => !display);
      }
      if (event.key === ESCAPE && this.displaySearchDialog()) {
        event.preventDefault();
        this.displaySearchDialog.set(false);
      }
      if (isDevMode() && event.key === 'o' && (event.metaKey || event.ctrlKey)) {
        // In debug this shortcut allows us to open the same page on adev
        // Helpful to compare differences
        event.preventDefault();
        window.open(`https://angular.dev/${location.pathname}`, '_blank');
      }
    }
    updateCanonicalLink(absoluteUrl) {
      this.headerService.setCanonical(absoluteUrl);
    }
    closeSearchDialogOnNavigationSkipped() {
      this.router.events
        .pipe(filter((event) => event instanceof NavigationSkipped))
        .subscribe(() => {
          this.displaySearchDialog.set(false);
        });
    }
  };
  return (AppComponent = _classThis);
})();
export {AppComponent};
//# sourceMappingURL=app.component.js.map
