import {__esDecorate, __runInitializers} from 'tslib';
import {inject, Injectable} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';
function notifyUser(message) {}
// #docregion sw-unrecoverable-state
let HandleUnrecoverableStateService = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HandleUnrecoverableStateService = class {
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
      HandleUnrecoverableStateService = _classThis = _classDescriptor.value;
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
      this.updates.unrecoverable.subscribe((event) => {
        notifyUser(
          'An error occurred that we cannot recover from:\n' +
            event.reason +
            '\n\nPlease reload the page.',
        );
      });
    }
  };
  return (HandleUnrecoverableStateService = _classThis);
})();
export {HandleUnrecoverableStateService};
// #enddocregion sw-unrecoverable-state
//# sourceMappingURL=handle-unrecoverable-state.service.js.map
