import {__esDecorate, __runInitializers} from 'tslib';
import {Component, model, ChangeDetectionStrategy} from '@angular/core';
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
        <!-- Two-way binding with custom components -->
        <custom-checkbox
          [(checked)]="agreedToTerms"
          label="I agree to the terms"
        />

        <custom-checkbox
          [(checked)]="enableNotifications"
          label="Enable notifications"
        />

        <!-- Controls to test two-way binding -->
        <div class="controls">
          <p>Terms agreed:
            @if (agreedToTerms()) {
              Yes
            } @else {
              No
            }
          </p>
          <p>Notifications:
            @if (enableNotifications()) {
              Enabled
            } @else {
              Disabled
            }
          </p>
          <button (click)="toggleTermsFromParent()">Toggle Terms from Parent</button>
          <button (click)="resetAll()">Reset All</button>
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
    // Parent signal models
    agreedToTerms = model(false);
    enableNotifications = model(true);
    // Methods to test two-way binding
    toggleTermsFromParent() {
      this.agreedToTerms.set(!this.agreedToTerms());
    }
    resetAll() {
      this.agreedToTerms.set(false);
      this.enableNotifications.set(false);
    }
  };
  return (App = _classThis);
})();
export {App};
//# sourceMappingURL=app.js.map
