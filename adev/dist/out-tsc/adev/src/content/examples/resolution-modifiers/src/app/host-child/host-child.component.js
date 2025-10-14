import {__esDecorate, __runInitializers} from 'tslib';
import {Component, inject} from '@angular/core';
import {FlowerService} from '../flower.service';
let HostChildComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-host-child',
      templateUrl: './host-child.component.html',
      styleUrls: ['./host-child.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HostChildComponent = class {
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
      HostChildComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    flower = inject(FlowerService);
  };
  return (HostChildComponent = _classThis);
})();
export {HostChildComponent};
//# sourceMappingURL=host-child.component.js.map
