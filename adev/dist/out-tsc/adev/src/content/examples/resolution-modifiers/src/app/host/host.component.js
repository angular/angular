import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {FlowerService} from '../flower.service';
import {HostChildComponent} from '../host-child/host-child.component';
// #docregion host-component
let HostComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-host',
      templateUrl: './host.component.html',
      styleUrls: ['./host.component.css'],
      //  provide the service
      providers: [{provide: FlowerService, useValue: {emoji: '🌷'}}],
      imports: [HostChildComponent],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HostComponent = class {
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
      HostComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    flower;
    // use @Host() in the constructor when injecting the service
    constructor(flower) {
      this.flower = flower;
    }
  };
  return (HostComponent = _classThis);
})();
export {HostComponent};
// #enddocregion host-component
// if you take out @Host() and the providers array, flower will be red hibiscus
//# sourceMappingURL=host.component.js.map
