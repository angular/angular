/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ErrorHandler, inject, NgZone, Injectable, EnvironmentInjector} from '../../src/core';

export const RETHROW_APPLICATION_ERRORS_DEFAULT = true;

@Injectable()
export class TestBedApplicationErrorHandler {
  private readonly zone = inject(NgZone);
  private readonly injector = inject(EnvironmentInjector);
  private userErrorHandler?: ErrorHandler;
  readonly whenStableRejectFunctions: Set<(e: unknown) => void> = new Set();

  handleError(e: unknown) {
    try {
      this.zone.runOutsideAngular(() => {
        this.userErrorHandler ??= this.injector.get(ErrorHandler);
        this.userErrorHandler.handleError(e);
      });
    } catch (userError: unknown) {
      e = userError;
    }

    // Instead of throwing the error when there are outstanding `fixture.whenStable` promises,
    // reject those promises with the error. This allows developers to write
    // expectAsync(fix.whenStable()).toBeRejected();
    if (this.whenStableRejectFunctions.size > 0) {
      for (const fn of this.whenStableRejectFunctions.values()) {
        fn(e);
      }
      this.whenStableRejectFunctions.clear();
    } else {
      throw e;
    }
  }
}
