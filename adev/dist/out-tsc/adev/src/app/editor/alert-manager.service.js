/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable, inject} from '@angular/core';
import {LOCAL_STORAGE, WINDOW, isMobile} from '@angular/docs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ErrorSnackBar} from '../core/services/errors-handling/error-snack-bar';
export const MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES = 3;
export const WEBCONTAINERS_COUNTER_KEY = 'numberOfWebcontainers';
export var AlertReason;
(function (AlertReason) {
  AlertReason[(AlertReason['OUT_OF_MEMORY'] = 0)] = 'OUT_OF_MEMORY';
  AlertReason[(AlertReason['MOBILE'] = 1)] = 'MOBILE';
})(AlertReason || (AlertReason = {}));
let AlertManager = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AlertManager = class {
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
      AlertManager = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    localStorage = inject(LOCAL_STORAGE);
    window = inject(WINDOW);
    snackBar = inject(MatSnackBar);
    init() {
      this.listenToLocalStorageValuesChange();
      this.increaseInstancesCounter();
      this.decreaseInstancesCounterOnPageClose();
      this.checkDevice();
    }
    listenToLocalStorageValuesChange() {
      this.window.addEventListener('storage', () => {
        const countOfRunningInstances = this.getStoredCountOfWebcontainerInstances();
        this.validateRunningInstances(countOfRunningInstances);
      });
    }
    // Increase count of the running instances of the webcontainers when user will boot the webcontainer
    increaseInstancesCounter() {
      const countOfRunningInstances = this.getStoredCountOfWebcontainerInstances() + 1;
      this.localStorage?.setItem(WEBCONTAINERS_COUNTER_KEY, countOfRunningInstances.toString());
      this.validateRunningInstances(countOfRunningInstances);
    }
    // Decrease count of running instances of the webcontainers when user close the app.
    decreaseInstancesCounterOnPageClose() {
      this.window.addEventListener('beforeunload', () => {
        const countOfRunningInstances = this.getStoredCountOfWebcontainerInstances() - 1;
        this.localStorage?.setItem(WEBCONTAINERS_COUNTER_KEY, countOfRunningInstances.toString());
        this.validateRunningInstances(countOfRunningInstances);
      });
    }
    getStoredCountOfWebcontainerInstances() {
      const countStoredInLocalStorage = this.localStorage?.getItem(WEBCONTAINERS_COUNTER_KEY);
      if (!countStoredInLocalStorage || Number.isNaN(countStoredInLocalStorage)) {
        return 0;
      }
      return Number(countStoredInLocalStorage);
    }
    validateRunningInstances(countOfRunningInstances) {
      if (countOfRunningInstances > MAX_RECOMMENDED_WEBCONTAINERS_INSTANCES) {
        this.openSnackBar(AlertReason.OUT_OF_MEMORY);
      }
    }
    checkDevice() {
      if (isMobile) {
        this.openSnackBar(AlertReason.MOBILE);
      }
    }
    openSnackBar(reason) {
      let message = '';
      switch (reason) {
        case AlertReason.OUT_OF_MEMORY:
          message = `Your browser is currently limiting the memory available to run the Angular Tutorials or Playground. If you have multiple tabs open with Tutorials or Playground, please close some of them and refresh this page.`;
          break;
        case AlertReason.MOBILE:
          message = `You are running the embedded editor in a mobile device, this may result in an Out of memory error.`;
          break;
      }
      this.snackBar.openFromComponent(ErrorSnackBar, {
        panelClass: 'docs-invert-mode',
        data: {
          message,
          actionText: 'I understand',
        },
      });
    }
  };
  return (AlertManager = _classThis);
})();
export {AlertManager};
//# sourceMappingURL=alert-manager.service.js.map
