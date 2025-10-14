import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Injectable} from '@angular/core';
export class User {
  name;
  isAuthorized;
  constructor(name, isAuthorized = false) {
    this.name = name;
    this.isAuthorized = isAuthorized;
  }
}
// TODO: get the user; don't 'new' it.
const alice = new User('Alice', true);
const bob = new User('Bob', false);
let UserService = (() => {
  let _classDecorators = [
    Injectable({
      providedIn: 'root',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var UserService = class {
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
      UserService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    user = bob; // initial user is Bob
    // swap users
    getNewUser() {
      return (this.user = this.user === bob ? alice : bob);
    }
  };
  return (UserService = _classThis);
})();
export {UserService};
//# sourceMappingURL=user.service.js.map
