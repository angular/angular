import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {ExponentialStrengthPipe} from './exponential-strength.pipe';
let PowerBoosterComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-power-booster',
      template: `
    <h2>Power Booster</h2>
    <p>Super power boost: {{2 | exponentialStrength: 10}}</p>
  `,
      imports: [ExponentialStrengthPipe],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var PowerBoosterComponent = class {
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
      PowerBoosterComponent = _classThis = _classDescriptor.value;
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
  return (PowerBoosterComponent = _classThis);
})();
export {PowerBoosterComponent};
//# sourceMappingURL=power-booster.component.js.map
