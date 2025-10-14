import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Directive, ElementRef, inject} from '@angular/core';
let HighlightDirective = (() => {
  let _classDecorators = [
    Directive({
      selector: '[appHighlight]',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HighlightDirective = class {
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
      HighlightDirective = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    el = inject(ElementRef);
    constructor() {
      this.el.nativeElement.style.backgroundColor = 'yellow';
    }
  };
  return (HighlightDirective = _classThis);
})();
export {HighlightDirective};
//# sourceMappingURL=highlight.directive.1.js.map
