/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable, signal} from '@angular/core';
import {isIos} from '@angular/docs';
import {LoadingStep} from './enums/loading-steps';
import {OUT_OF_MEMORY_MSG} from './node-runtime-errors';
export const MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES = 3;
export const WEBCONTAINERS_COUNTER_KEY = 'numberOfWebcontainers';
export var ErrorType;
(function (ErrorType) {
  ErrorType[(ErrorType['UNKNOWN'] = 0)] = 'UNKNOWN';
  ErrorType[(ErrorType['COOKIES'] = 1)] = 'COOKIES';
  ErrorType[(ErrorType['OUT_OF_MEMORY'] = 2)] = 'OUT_OF_MEMORY';
  ErrorType[(ErrorType['UNSUPPORTED_BROWSER_ENVIRONMENT'] = 3)] = 'UNSUPPORTED_BROWSER_ENVIRONMENT';
})(ErrorType || (ErrorType = {}));
let NodeRuntimeState = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var NodeRuntimeState = class {
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
      NodeRuntimeState = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    _loadingStep = signal(LoadingStep.NOT_STARTED);
    loadingStep = this._loadingStep.asReadonly();
    _isResetting = signal(false);
    isResetting = this._isResetting.asReadonly();
    _error = signal(undefined);
    error = this._error.asReadonly();
    constructor() {
      this.checkUnsupportedEnvironment();
    }
    setLoadingStep(step) {
      this._loadingStep.set(step);
    }
    setIsResetting(isResetting) {
      this._isResetting.set(isResetting);
    }
    setError({message, type}) {
      type ??= this.getErrorType(message);
      this._error.set({message, type});
      this.setLoadingStep(LoadingStep.ERROR);
    }
    getErrorType(message) {
      if (message?.includes(OUT_OF_MEMORY_MSG)) {
        return ErrorType.OUT_OF_MEMORY;
      }
      if (message?.toLowerCase().includes('service worker')) {
        return ErrorType.COOKIES;
      }
      return ErrorType.UNKNOWN;
    }
    /**
     * This method defines whether the current environment is compatible
     * with the NodeRuntimeSandbox. The embedded editor requires significant
     * CPU and memory resources and can not be ran in all browsers/devices. More
     * specifically, mobile devices are affected by this, so for the best user
     * experience (to avoid crashes), we disable the NodeRuntimeSandbox and
     * recommend using desktop.
     */
    checkUnsupportedEnvironment() {
      if (isIos) {
        this.setError({
          message: 'Unsupported environment',
          type: ErrorType.UNSUPPORTED_BROWSER_ENVIRONMENT,
        });
      }
    }
  };
  return (NodeRuntimeState = _classThis);
})();
export {NodeRuntimeState};
//# sourceMappingURL=node-runtime-state.service.js.map
