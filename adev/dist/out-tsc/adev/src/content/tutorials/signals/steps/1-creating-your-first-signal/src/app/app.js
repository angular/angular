import {__esDecorate, __runInitializers} from 'tslib';
// TODO: Import signal from @angular/core
import {Component, ChangeDetectionStrategy} from '@angular/core';
let App = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      template: `
    <div class="user-profile">
      <h1>User Dashboard</h1>
      <!-- TODO: Update class binding and display userStatus() -->
      <div class="status-indicator offline">
        <span class="status-dot"></span>
        Status: ???
      </div>

      <div class="status-controls">
        <!-- TODO: Add (click) and [disabled] bindings -->
        <button>
          Go Online
        </button>
        <button>
          Go Offline
        </button>
        <button class="toggle-btn">
          Toggle Status
        </button>
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
