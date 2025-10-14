import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
import {Component, signal} from '@angular/core';
let StaggerComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-stagger',
      templateUrl: './stagger.component.html',
      styleUrls: ['stagger.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var StaggerComponent = class {
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
      StaggerComponent = _classThis = _classDescriptor.value;
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
    items = [1, 2, 3];
    refresh() {
      this.show.set(false);
      setTimeout(() => {
        this.show.set(true);
      }, 10);
    }
  };
  return (StaggerComponent = _classThis);
})();
export {StaggerComponent};
//# sourceMappingURL=stagger.component.js.map
