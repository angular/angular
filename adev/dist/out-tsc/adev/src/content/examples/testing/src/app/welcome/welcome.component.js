import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Component, inject, signal} from '@angular/core';
import {UserService} from '../model/user.service';
let WelcomeComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-welcome',
      template: '<h3 class="welcome"><i>{{welcome()}}</i></h3>',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var WelcomeComponent = class {
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
      WelcomeComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    welcome = signal('');
    userService = inject(UserService);
    constructor() {
      this.welcome.set(
        this.userService.isLoggedIn()
          ? 'Welcome, ' + this.userService.user().name
          : 'Please log in.',
      );
    }
  };
  return (WelcomeComponent = _classThis);
})();
export {WelcomeComponent};
// #enddocregion class
//# sourceMappingURL=welcome.component.js.map
