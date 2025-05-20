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
  inject,
  OnInit,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
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

@Component({
  selector: 'adev-progress-bar',
  imports: [NgProgressbar],
  template: `
    <ng-progress aria-label="Page load progress" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent implements OnInit {
  private readonly router = inject(Router);

  readonly progressBar = viewChild.required(NgProgressRef);

  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnInit() {
    this.setupPageNavigationDimming();
  }

  /**
   * Dims the main router-outlet content when navigating to a new page.
   */
  private setupPageNavigationDimming() {
    if (!this.isBrowser) {
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
}
