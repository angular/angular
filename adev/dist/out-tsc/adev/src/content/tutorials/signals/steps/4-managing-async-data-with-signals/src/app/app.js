import {__esDecorate, __runInitializers} from 'tslib';
// TODO: Add the resource import from @angular/core
import {Component, ChangeDetectionStrategy} from '@angular/core';
let App = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      template: `
    <div>
      <h2>User Profile Loader</h2>

      <div>
        <!-- TODO: Add (click) handlers to call loadUser() with appropriate IDs -->
        <button>Load User 1</button>
        <button>Load User 2</button>
        <button>Load Invalid User</button>
        <!-- TODO: Add (click) handler to call reloadUser() -->
        <button>Reload</button>
      </div>

      <div class="status">
        <!-- TODO: Replace with @if blocks for loading, error, and success states -->
        <!-- Use isLoading(), hasError(), and userResource.hasValue() -->
        <!-- For loading: show "Loading user..." -->
        <!-- For error: show error message with userResource.error()?.message -->
        <!-- For success: show user name and email from userResource.value() -->
        <p>Click a button to load user data</p>
      </div>
    </div>
  `,
      styleUrl: './app.css',
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var App = class {
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
      App = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (App = _classThis);
})();
export {App};
//# sourceMappingURL=app.js.map
