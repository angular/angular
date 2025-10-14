import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Pipe} from '@angular/core';
let TitleCasePipe = (() => {
  let _classDecorators = [Pipe({name: 'titlecase', pure: true})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TitleCasePipe = class {
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
      TitleCasePipe = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    transform(input) {
      return input.length === 0
        ? ''
        : input.replace(/\w\S*/g, (txt) => txt[0].toUpperCase() + txt.slice(1).toLowerCase());
    }
  };
  return (TitleCasePipe = _classThis);
})();
export {TitleCasePipe};
//# sourceMappingURL=title-case.pipe.js.map
