import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
let Child = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-child',
      styles: `.btn { padding: 5px; }`,
      template: `
    <button class="btn" (click)="addItem()">Add Item</button>
  `,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Child = class {
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
      Child = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    addItem() {}
  };
  return (Child = _classThis);
})();
export {Child};
//# sourceMappingURL=child.js.map
