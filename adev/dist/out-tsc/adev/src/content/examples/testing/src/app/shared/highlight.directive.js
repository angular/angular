import {__esDecorate, __runInitializers} from 'tslib';
/* eslint-disable @angular-eslint/directive-selector */
// #docregion
import {Directive, ElementRef, inject, input} from '@angular/core';
let HighlightDirective = (() => {
  let _classDecorators = [Directive({selector: '[highlight]'})];
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
    defaultColor = 'rgb(211, 211, 211)'; // lightgray
    bgColor = input('', {alias: 'highlight'});
    el = inject(ElementRef);
    constructor() {
      this.el.nativeElement.style.customProperty = true;
    }
    ngOnChanges() {
      this.el.nativeElement.style.backgroundColor = this.bgColor || this.defaultColor;
    }
  };
  return (HighlightDirective = _classThis);
})();
export {HighlightDirective};
//# sourceMappingURL=highlight.directive.js.map
