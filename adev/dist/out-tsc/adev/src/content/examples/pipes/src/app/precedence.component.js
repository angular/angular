import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {UpperCasePipe} from '@angular/common';
let PrecedenceComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-pipe-precedence',
      templateUrl: './precedence.component.html',
      imports: [UpperCasePipe],
      styles: ['code {font-family: monospace; background-color: #eee; padding: 0.5em;}'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var PrecedenceComponent = class {
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
      PrecedenceComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    isLeft = true;
    toggleDirection() {
      this.isLeft = !this.isLeft;
    }
    isGood = true;
    toggleGood() {
      this.isGood = !this.isGood;
    }
    isUpper = true;
    toggleCase() {
      this.isUpper = !this.isUpper;
    }
  };
  return (PrecedenceComponent = _classThis);
})();
export {PrecedenceComponent};
//# sourceMappingURL=precedence.component.js.map
