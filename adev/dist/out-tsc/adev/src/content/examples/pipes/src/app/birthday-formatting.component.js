import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {DatePipe} from '@angular/common';
let BirthdayFormattingComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-birthday-formatting',
      templateUrl: './birthday-formatting.component.html',
      imports: [DatePipe],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var BirthdayFormattingComponent = class {
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
      BirthdayFormattingComponent = _classThis = _classDescriptor.value;
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
    toggle = true;
    get format() {
      return this.toggle ? 'mediumDate' : 'fullDate';
    }
    toggleFormat() {
      this.toggle = !this.toggle;
    }
  };
  return (BirthdayFormattingComponent = _classThis);
})();
export {BirthdayFormattingComponent};
//# sourceMappingURL=birthday-formatting.component.js.map
