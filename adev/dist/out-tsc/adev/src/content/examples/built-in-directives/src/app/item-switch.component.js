import {__esDecorate, __runInitializers} from 'tslib';
import {Component, computed, input} from '@angular/core';
let StoutItemComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-stout-item',
      template: "I'm a little {{item().name}}, short and stout!",
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var StoutItemComponent = class {
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
      StoutItemComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    item = input.required();
  };
  return (StoutItemComponent = _classThis);
})();
export {StoutItemComponent};
// #enddocregion input
let BestItemComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-best-item',
      template: 'This is the brightest {{item().name}} in town.',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var BestItemComponent = class {
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
      BestItemComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    item = input.required();
  };
  return (BestItemComponent = _classThis);
})();
export {BestItemComponent};
let DeviceItemComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-device-item',
      template: 'Which is the slimmest {{item().name}}?',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var DeviceItemComponent = class {
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
      DeviceItemComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    item = input.required();
  };
  return (DeviceItemComponent = _classThis);
})();
export {DeviceItemComponent};
let LostItemComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-lost-item',
      template: 'Has anyone seen my {{item().name}}?',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var LostItemComponent = class {
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
      LostItemComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    item = input.required();
  };
  return (LostItemComponent = _classThis);
})();
export {LostItemComponent};
let UnknownItemComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-unknown-item',
      template: '{{message()}}',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var UnknownItemComponent = class {
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
      UnknownItemComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    item = input(undefined);
    message = computed(() => {
      const itemName = this.item()?.name;
      return itemName
        ? `${itemName} is strange and mysterious.`
        : 'A mystery wrapped in a fishbowl.';
    });
  };
  return (UnknownItemComponent = _classThis);
})();
export {UnknownItemComponent};
export const ItemSwitchComponents = [
  StoutItemComponent,
  BestItemComponent,
  DeviceItemComponent,
  LostItemComponent,
  UnknownItemComponent,
];
//# sourceMappingURL=item-switch.component.js.map
