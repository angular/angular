import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
import {inject, Injectable} from '@angular/core';
// #docregion sw-replicate-available
import {filter, map} from 'rxjs/operators';
// #enddocregion sw-replicate-available
import {SwUpdate} from '@angular/service-worker';
function promptUser(event) {
  return true;
}
// #docregion sw-version-ready
let PromptUpdateService = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var PromptUpdateService = class {
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
      PromptUpdateService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    constructor() {
      const swUpdate = inject(SwUpdate);
      swUpdate.versionUpdates
        .pipe(filter((evt) => evt.type === 'VERSION_READY'))
        .subscribe((evt) => {
          if (promptUser(evt)) {
            // Reload the page to update to the latest version.
            document.location.reload();
          }
        });
      // #enddocregion sw-version-ready
      // #docregion sw-replicate-available
      // ...
      const updatesAvailable = swUpdate.versionUpdates.pipe(
        filter((evt) => evt.type === 'VERSION_READY'),
        map((evt) => ({
          type: 'UPDATE_AVAILABLE',
          current: evt.currentVersion,
          available: evt.latestVersion,
        })),
      );
      // #enddocregion sw-replicate-available
      // #docregion sw-version-ready
    }
  };
  return (PromptUpdateService = _classThis);
})();
export {PromptUpdateService};
// #enddocregion sw-version-ready
//# sourceMappingURL=prompt-update.service.js.map
