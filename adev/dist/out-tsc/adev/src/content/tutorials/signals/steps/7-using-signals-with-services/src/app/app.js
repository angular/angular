import {__esDecorate, __runInitializers} from 'tslib';
import {Component, ChangeDetectionStrategy} from '@angular/core';
// TODO: Import inject from @angular/core
// TODO: Import CartStore from './cart-store'
// TODO: Import CartDisplay from './cart-display'
let App = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      // TODO: Add CartDisplay to imports array
      template: `
    <div class="shopping-app">
      <header>
        <h1>Signals with Services Demo</h1>
        <div class="cart-badge">
          Cart: Loading... items ($Loading...)
        </div>
      </header>
      
      <main>
        <!-- TODO: Add cart-display component here -->
      </main>
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
