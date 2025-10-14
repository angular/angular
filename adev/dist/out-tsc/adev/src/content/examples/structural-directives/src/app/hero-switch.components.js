import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Component, computed, input} from '@angular/core';
let HappyHeroComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-happy-hero',
      template: 'Wow. You like {{hero().name}}. What a happy hero ... just like you.',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HappyHeroComponent = class {
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
      HappyHeroComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    hero = input.required();
  };
  return (HappyHeroComponent = _classThis);
})();
export {HappyHeroComponent};
let SadHeroComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-sad-hero',
      template: 'You like {{hero().name}}? Such a sad hero. Are you sad too?',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var SadHeroComponent = class {
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
      SadHeroComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    hero = input.required();
  };
  return (SadHeroComponent = _classThis);
})();
export {SadHeroComponent};
let ConfusedHeroComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-confused-hero',
      template: 'Are you as confused as {{hero().name}}?',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ConfusedHeroComponent = class {
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
      ConfusedHeroComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    hero = input.required();
  };
  return (ConfusedHeroComponent = _classThis);
})();
export {ConfusedHeroComponent};
let UnknownHeroComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-unknown-hero',
      template: '{{message()}}',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var UnknownHeroComponent = class {
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
      UnknownHeroComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    hero = input.required();
    message = computed(() => {
      const heroName = this.hero()?.name;
      return heroName ? `${heroName} is strange and mysterious.` : 'Are you feeling indecisive?';
    });
  };
  return (UnknownHeroComponent = _classThis);
})();
export {UnknownHeroComponent};
export const heroSwitchComponents = [
  HappyHeroComponent,
  SadHeroComponent,
  ConfusedHeroComponent,
  UnknownHeroComponent,
];
//# sourceMappingURL=hero-switch.components.js.map
