import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {OpenCloseChildComponent} from './open-close.component.4';
let ToggleAnimationsPageComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-toggle-animations-child-page',
      template: `
    <section>
      <h2>Toggle Animations</h2>

      <app-open-close-toggle></app-open-close-toggle>
    </section>
  `,
      imports: [OpenCloseChildComponent],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ToggleAnimationsPageComponent = class {
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
      ToggleAnimationsPageComponent = _classThis = _classDescriptor.value;
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
  return (ToggleAnimationsPageComponent = _classThis);
})();
export {ToggleAnimationsPageComponent};
//# sourceMappingURL=toggle-animations-page.component.js.map
