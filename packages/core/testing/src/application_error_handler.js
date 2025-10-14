/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ErrorHandler, inject, NgZone, Injectable, EnvironmentInjector} from '../../src/core';
export const RETHROW_APPLICATION_ERRORS_DEFAULT = true;
let TestBedApplicationErrorHandler = class TestBedApplicationErrorHandler {
  constructor() {
    this.zone = inject(NgZone);
    this.injector = inject(EnvironmentInjector);
    this.whenStableRejectFunctions = new Set();
  }
  handleError(e) {
    try {
      this.zone.runOutsideAngular(() => {
        this.userErrorHandler ?? (this.userErrorHandler = this.injector.get(ErrorHandler));
        this.userErrorHandler.handleError(e);
      });
    } catch (userError) {
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
};
TestBedApplicationErrorHandler = __decorate([Injectable()], TestBedApplicationErrorHandler);
export {TestBedApplicationErrorHandler};
//# sourceMappingURL=application_error_handler.js.map
