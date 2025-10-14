import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable} from '@angular/core';
import {of} from 'rxjs';
import {delay} from 'rxjs/operators';
const ROLES = ['Hamlet', 'Ophelia', 'Romeo', 'Juliet'];
let ActorsService = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ActorsService = class {
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
      ActorsService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    isRoleTaken(role) {
      const isTaken = ROLES.includes(role);
      return of(isTaken).pipe(delay(400));
    }
  };
  return (ActorsService = _classThis);
})();
export {ActorsService};
//# sourceMappingURL=actors.service.js.map
