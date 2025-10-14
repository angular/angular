import {__esDecorate, __runInitializers} from 'tslib';
import {inject, Injectable} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';
// #docregion sw-update
let LogUpdateService = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var LogUpdateService = class {
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
      LogUpdateService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    updates = inject(SwUpdate);
    constructor() {
      this.updates.versionUpdates.subscribe((evt) => {
        switch (evt.type) {
          case 'VERSION_DETECTED':
            console.log(`Downloading new app version: ${evt.version.hash}`);
            break;
          case 'VERSION_READY':
            console.log(`Current app version: ${evt.currentVersion.hash}`);
            console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
            break;
          case 'VERSION_INSTALLATION_FAILED':
            console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
            break;
          case 'VERSION_FAILED':
            console.log(`Version '${evt.version.hash}' failed with error: ${evt.error}`);
            break;
        }
      });
    }
  };
  return (LogUpdateService = _classThis);
})();
export {LogUpdateService};
// #enddocregion sw-update
//# sourceMappingURL=log-update.service.js.map
