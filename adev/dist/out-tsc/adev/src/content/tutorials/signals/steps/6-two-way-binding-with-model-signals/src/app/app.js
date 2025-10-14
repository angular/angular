import {__esDecorate, __runInitializers} from 'tslib';
// TODO: Import model from @angular/core
import {Component, ChangeDetectionStrategy} from '@angular/core';
import {CustomCheckbox} from './custom-checkbox';
let App = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      imports: [CustomCheckbox],
      template: `
    <div class="shopping-app">
      <h1>Custom Checkbox Example</h1>

      <div class="demo-section">
        <!-- TODO: Uncomment and add [(checked)] two-way binding -->
        <!--
        <custom-checkbox
          ___ADD_TWO_WAY_BINDING___
          label="I agree to the terms"
        />

        <custom-checkbox
          ___ADD_TWO_WAY_BINDING___
          label="Enable notifications"
        />
        -->

        <div class="controls">
          <p>Terms agreed:
            <!-- TODO: Replace with @if block using agreedToTerms() -->
            ???
          </p>
          <p>Notifications:
            <!-- TODO: Replace with @if block using enableNotifications() -->
            ???
          </p>
          <!-- TODO: Add (click) handlers -->
          <button>Toggle Terms from Parent</button>
          <button>Reset All</button>
        </div>
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
