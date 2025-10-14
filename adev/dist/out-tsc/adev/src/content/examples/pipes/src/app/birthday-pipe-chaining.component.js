import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {DatePipe, UpperCasePipe} from '@angular/common';
let BirthdayPipeChainingComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-birthday-pipe-chaining',
      templateUrl: './birthday-pipe-chaining.component.html',
      imports: [DatePipe, UpperCasePipe],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var BirthdayPipeChainingComponent = class {
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
      BirthdayPipeChainingComponent = _classThis = _classDescriptor.value;
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
  return (BirthdayPipeChainingComponent = _classThis);
})();
export {BirthdayPipeChainingComponent};
//# sourceMappingURL=birthday-pipe-chaining.component.js.map
