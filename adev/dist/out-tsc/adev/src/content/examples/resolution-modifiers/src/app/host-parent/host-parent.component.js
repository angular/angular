import {__esDecorate, __runInitializers} from 'tslib';
import {Component, inject} from '@angular/core';
import {FlowerService} from '../flower.service';
import {HostComponent} from '../host/host.component';
let HostParentComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-host-parent',
      templateUrl: './host-parent.component.html',
      styleUrls: ['./host-parent.component.css'],
      providers: [{provide: FlowerService, useValue: {emoji: '🌺'}}],
      imports: [HostComponent],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HostParentComponent = class {
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
      HostParentComponent = _classThis = _classDescriptor.value;
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
  return (HostParentComponent = _classThis);
})();
export {HostParentComponent};
//# sourceMappingURL=host-parent.component.js.map
