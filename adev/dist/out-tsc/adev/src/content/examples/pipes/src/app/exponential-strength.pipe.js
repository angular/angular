import {__esDecorate, __runInitializers} from 'tslib';
import {Pipe} from '@angular/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
 */
// #docregion pipe-class
let ExponentialStrengthPipe = (() => {
  let _classDecorators = [
    Pipe({
      name: 'exponentialStrength',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ExponentialStrengthPipe = class {
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
      ExponentialStrengthPipe = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    transform(value, exponent = 1) {
      return Math.pow(value, exponent);
    }
  };
  return (ExponentialStrengthPipe = _classThis);
})();
export {ExponentialStrengthPipe};
// #enddocregion pipe-class
//# sourceMappingURL=exponential-strength.pipe.js.map
