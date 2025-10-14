import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
let FavoriteColorReactiveComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-reactive-favorite-color',
      template: `
    Favorite Color: <input type="text" [formControl]="favoriteColorControl">
  `,
      imports: [ReactiveFormsModule],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var FavoriteColorReactiveComponent = class {
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
      FavoriteColorReactiveComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    favoriteColorControl = new FormControl('');
  };
  return (FavoriteColorReactiveComponent = _classThis);
})();
export {FavoriteColorReactiveComponent};
//# sourceMappingURL=favorite-color.component.js.map
