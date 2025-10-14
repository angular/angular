import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {JsonPipe} from '@angular/common';
let JsonPipeComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-json-pipe',
      template: `{{ data | json }}`,
      imports: [JsonPipe],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var JsonPipeComponent = class {
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
      JsonPipeComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    data = {
      name: 'John Doe',
      age: 30,
      address: {
        street: '123 Main St',
        city: 'Anytown',
      },
    };
  };
  return (JsonPipeComponent = _classThis);
})();
export {JsonPipeComponent};
//# sourceMappingURL=json-pipe.component.js.map
