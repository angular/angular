/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ErrorHandler, inject, NgZone, Injectable, EnvironmentInjector} from '../../src/core';
export const RETHROW_APPLICATION_ERRORS_DEFAULT = true;
let TestBedApplicationErrorHandler = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TestBedApplicationErrorHandler = class {
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
      TestBedApplicationErrorHandler = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    zone = inject(NgZone);
    injector = inject(EnvironmentInjector);
    userErrorHandler;
    whenStableRejectFunctions = new Set();
    handleError(e) {
      try {
        this.zone.runOutsideAngular(() => {
          this.userErrorHandler ??= this.injector.get(ErrorHandler);
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
  return (TestBedApplicationErrorHandler = _classThis);
})();
export {TestBedApplicationErrorHandler};
//# sourceMappingURL=application_error_handler.js.map
