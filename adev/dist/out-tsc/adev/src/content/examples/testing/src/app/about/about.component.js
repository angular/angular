import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Component} from '@angular/core';
import {HighlightDirective} from '../shared/highlight.directive';
import {TwainComponent} from '../twain/twain.component';
let AboutComponent = (() => {
  let _classDecorators = [
    Component({
      template: `
    <h2 highlight="skyblue">About</h2>
    <h3>Quote of the day:</h3>
    <twain-quote></twain-quote>
  `,
      imports: [TwainComponent, HighlightDirective],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AboutComponent = class {
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
      AboutComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (AboutComponent = _classThis);
})();
export {AboutComponent};
//# sourceMappingURL=about.component.js.map
