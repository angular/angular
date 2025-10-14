import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {FlowerService} from '../flower.service';
// #docregion self-component
let SelfComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-self',
      templateUrl: './self.component.html',
      styleUrls: ['./self.component.css'],
      providers: [{provide: FlowerService, useValue: {emoji: '🌷'}}],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var SelfComponent = class {
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
      SelfComponent = _classThis = _classDescriptor.value;
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
    constructor(flower) {
      this.flower = flower;
    }
  };
  return (SelfComponent = _classThis);
})();
export {SelfComponent};
// #enddocregion self-component
// This component provides the FlowerService so the injector
// doesn't have to look further up the injector tree
//# sourceMappingURL=self.component.js.map
