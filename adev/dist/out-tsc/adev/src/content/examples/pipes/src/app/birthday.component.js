import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {DatePipe} from '@angular/common';
let BirthdayComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-birthday',
      templateUrl: './birthday.component.html',
      imports: [DatePipe],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var BirthdayComponent = class {
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
      BirthdayComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    birthday = new Date(1988, 3, 15); // April 15, 1988 -- since month parameter is zero-based
  };
  return (BirthdayComponent = _classThis);
})();
export {BirthdayComponent};
//# sourceMappingURL=birthday.component.js.map
