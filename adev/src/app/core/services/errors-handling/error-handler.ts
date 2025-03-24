/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, isPlatformServer} from '@angular/common';
import {ErrorHandler, PLATFORM_ID, inject} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AnalyticsService} from '../analytics/analytics.service';
import {ErrorSnackBar, ErrorSnackBarData} from './error-snack-bar';

export class CustomErrorHandler implements ErrorHandler {
  snackBar = inject(MatSnackBar);
  document = inject(DOCUMENT);
  isServer = isPlatformServer(inject(PLATFORM_ID));
  analyticsService = inject(AnalyticsService);

  get isOnline(): boolean {
    if (this.isServer) return false;

    const win = this.document.defaultView;
    return win?.navigator.onLine ?? true;
  }

  handleError(error: any) {
    if (typeof error.message === 'string') {
      // Just looking at the first line of the error message (ignoring the call stack part),
      // which should contain a pattern that we are looking for.
      const firstLine = error.message.split('\n')[0];
      if (this.isOnline && firstLine?.match(/chunk-(.*?)\.js/)) {
        // Trying to load a chunk that doesn't exist anymore
        // Users should reload the app.
        this.openErrorSnackBar();
        this.analyticsService.reportError('Chunk loading error');
      }
    }

    // We still want to log every error
    console.error(error);
  }

  openErrorSnackBar(): void {
    this.snackBar
      .openFromComponent(ErrorSnackBar, {
        panelClass: 'docs-invert-mode',
        data: {
          message: `Our docs have been updated, reload the page to see the latest.`,
          actionText: `Reload`,
        } satisfies ErrorSnackBarData,
      })
      .onAction()
      .subscribe(() => {
        this.document.location.reload();
      });
  }
}
