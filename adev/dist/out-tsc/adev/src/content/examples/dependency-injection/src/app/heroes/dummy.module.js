import {__esDecorate, __runInitializers} from 'tslib';
/// Dummy modules to satisfy Angular Language Service
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
////////
import {HeroListComponent as HeroListComponent1} from './hero-list.component.1';
let DummyModule1 = (() => {
  let _classDecorators = [
    NgModule({
      imports: [CommonModule],
      declarations: [HeroListComponent1],
      exports: [HeroListComponent1],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var DummyModule1 = class {
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
      DummyModule1 = _classThis = _classDescriptor.value;
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
  return (DummyModule1 = _classThis);
})();
export {DummyModule1};
/////////
import {HeroListComponent as HeroListComponent2} from './hero-list.component.2';
let DummyModule2 = (() => {
  let _classDecorators = [
    NgModule({
      imports: [CommonModule],
      declarations: [HeroListComponent2],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var DummyModule2 = class {
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
      DummyModule2 = _classThis = _classDescriptor.value;
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
  return (DummyModule2 = _classThis);
})();
export {DummyModule2};
/////////
import {HeroesComponent as HeroesComponent1} from './heroes.component.1';
let DummyModule3 = (() => {
  let _classDecorators = [
    NgModule({
      imports: [CommonModule, DummyModule1],
      declarations: [HeroesComponent1],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var DummyModule3 = class {
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
      DummyModule3 = _classThis = _classDescriptor.value;
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
  return (DummyModule3 = _classThis);
})();
export {DummyModule3};
//# sourceMappingURL=dummy.module.js.map
