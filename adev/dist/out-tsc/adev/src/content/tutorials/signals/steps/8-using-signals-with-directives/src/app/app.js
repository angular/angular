import {__esDecorate, __runInitializers} from 'tslib';
import {Component, ChangeDetectionStrategy} from '@angular/core';
import {HighlightDirective} from './highlight-directive';
let App = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      imports: [HighlightDirective],
      template: `
    <div>
      <h1>Directive with Signals</h1>

      <div highlight color="blue" intensity="0.2">
        Hover me - Blue highlight
      </div>

      <div highlight color="green" intensity="0.4">
        Hover me - Green highlight
      </div>

      <div highlight color="yellow" intensity="0.6">
        Hover me - Yellow highlight
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
