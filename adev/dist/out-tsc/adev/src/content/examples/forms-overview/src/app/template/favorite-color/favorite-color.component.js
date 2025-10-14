import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
let FavoriteColorTemplateComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-template-favorite-color',
      template: `
    Favorite Color: <input type="text" [(ngModel)]="favoriteColor">
  `,
      imports: [FormsModule],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var FavoriteColorTemplateComponent = class {
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
      FavoriteColorTemplateComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    favoriteColor = '';
  };
  return (FavoriteColorTemplateComponent = _classThis);
})();
export {FavoriteColorTemplateComponent};
//# sourceMappingURL=favorite-color.component.js.map
