import {__esDecorate, __runInitializers} from 'tslib';
import {Pipe} from '@angular/core';
let ReversePipe = (() => {
  let _classDecorators = [
    Pipe({
      name: 'reverse',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ReversePipe = class {
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
      ReversePipe = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    transform(value) {
      let reverse = '';
      for (let i = value.length - 1; i >= 0; i--) {
        reverse += value[i];
      }
      return reverse;
    }
  };
  return (ReversePipe = _classThis);
})();
export {ReversePipe};
//# sourceMappingURL=reverse.pipe.js.map
