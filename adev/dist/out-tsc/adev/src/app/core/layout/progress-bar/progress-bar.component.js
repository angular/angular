/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ChangeDetectionStrategy, Component, inject, PLATFORM_ID, viewChild} from '@angular/core';
import {isPlatformServer} from '@angular/common';
import {NgProgressbar, NgProgressRef} from 'ngx-progressbar';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  Router,
} from '@angular/router';
import {filter, map, switchMap, take} from 'rxjs/operators';
/** Time to wait after navigation starts before showing the progress bar. This delay allows a small amount of time to skip showing the progress bar when a navigation is effectively immediate. 30ms is approximately the amount of time we can wait before a delay is perceptible.*/
export const PROGRESS_BAR_DELAY = 30;
let ProgressBarComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'adev-progress-bar',
      imports: [NgProgressbar],
      template: `<ng-progress aria-label="Page load progress" />`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ProgressBarComponent = class {
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
      ProgressBarComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    router = inject(Router);
    progressBar = viewChild.required(NgProgressRef);
    isServer = isPlatformServer(inject(PLATFORM_ID));
    constructor() {
      this.setupPageNavigationDimming();
    }
    /**
     * Dims the main router-outlet content when navigating to a new page.
     */
    setupPageNavigationDimming() {
      if (this.isServer) {
        return;
      }
      this.router.events
        .pipe(
          filter((e) => e instanceof NavigationStart),
          map(() => {
            // Only apply set the property if the navigation is not "immediate"
            return setTimeout(() => {
              this.progressBar().start();
            }, PROGRESS_BAR_DELAY);
          }),
          switchMap((timeoutId) => {
            return this.router.events.pipe(
              filter((e) => {
                return (
                  e instanceof NavigationEnd ||
                  e instanceof NavigationCancel ||
                  e instanceof NavigationSkipped ||
                  e instanceof NavigationError
                );
              }),
              take(1),
              map(() => timeoutId),
            );
          }),
        )
        .subscribe((timeoutId) => {
          // When the navigation finishes, prevent the navigating class from being applied in the timeout.
          clearTimeout(timeoutId);
          this.progressBar().complete();
        });
    }
  };
  return (ProgressBarComponent = _classThis);
})();
export {ProgressBarComponent};
//# sourceMappingURL=progress-bar.component.js.map
