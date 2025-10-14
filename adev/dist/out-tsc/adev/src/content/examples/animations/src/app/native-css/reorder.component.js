import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
import {Component, signal} from '@angular/core';
let ReorderComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-reorder',
      templateUrl: './reorder.component.html',
      styleUrls: ['reorder.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ReorderComponent = class {
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
      ReorderComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    show = signal(true);
    items = ['stuff', 'things', 'cheese', 'paper', 'scissors', 'rock'];
    randomize() {
      const randItems = [...this.items];
      const newItems = [];
      for (let i of this.items) {
        const max = this.items.length - newItems.length;
        const randNum = Math.floor(Math.random() * max);
        newItems.push(...randItems.splice(randNum, 1));
      }
      this.items = newItems;
    }
  };
  return (ReorderComponent = _classThis);
})();
export {ReorderComponent};
//# sourceMappingURL=reorder.component.js.map
