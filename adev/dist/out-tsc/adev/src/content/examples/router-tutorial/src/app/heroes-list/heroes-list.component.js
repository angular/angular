import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
let HeroesListComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-heroes-list',
      templateUrl: './heroes-list.component.html',
      styleUrls: ['./heroes-list.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HeroesListComponent = class {
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
      HeroesListComponent = _classThis = _classDescriptor.value;
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
  return (HeroesListComponent = _classThis);
})();
export {HeroesListComponent};
//# sourceMappingURL=heroes-list.component.js.map
