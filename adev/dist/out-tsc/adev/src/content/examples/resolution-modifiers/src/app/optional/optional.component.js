import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
let OptionalComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-optional',
      templateUrl: './optional.component.html',
      styleUrls: ['./optional.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var OptionalComponent = class {
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
      OptionalComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    optional;
    constructor(optional) {
      this.optional = optional;
    }
  };
  return (OptionalComponent = _classThis);
})();
export {OptionalComponent};
// #enddocregion optional-component
// The OptionalService isn't provided here, in the @Injectable()
// providers array, or in the NgModule. If you remove @Optional()
// from the constructor, you'll get an error.
//# sourceMappingURL=optional.component.js.map
