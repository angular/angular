import {__esDecorate, __runInitializers} from 'tslib';
// #docregion, imports
import {Directive, ElementRef, HostListener, inject, input} from '@angular/core';
// #enddocregion imports
let HighlightDirective = (() => {
  let _classDecorators = [
    Directive({
      selector: '[appHighlight]',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _instanceExtraInitializers = [];
  let _onMouseEnter_decorators;
  let _onMouseLeave_decorators;
  var HighlightDirective = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _onMouseEnter_decorators = [HostListener('mouseenter')];
      _onMouseLeave_decorators = [HostListener('mouseleave')];
      __esDecorate(
        this,
        null,
        _onMouseEnter_decorators,
        {
          kind: 'method',
          name: 'onMouseEnter',
          static: false,
          private: false,
          access: {has: (obj) => 'onMouseEnter' in obj, get: (obj) => obj.onMouseEnter},
          metadata: _metadata,
        },
        null,
        _instanceExtraInitializers,
      );
      __esDecorate(
        this,
        null,
        _onMouseLeave_decorators,
        {
          kind: 'method',
          name: 'onMouseLeave',
          static: false,
          private: false,
          access: {has: (obj) => 'onMouseLeave' in obj, get: (obj) => obj.onMouseLeave},
          metadata: _metadata,
        },
        null,
        _instanceExtraInitializers,
      );
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
    el = (__runInitializers(this, _instanceExtraInitializers), inject(ElementRef));
    // #docregion input
    appHighlight = input('');
    // #enddocregion input
    // #docregion mouse-enter
    onMouseEnter() {
      this.highlight(this.appHighlight() || 'red');
    }
    // #enddocregion mouse-enter
    onMouseLeave() {
      this.highlight('');
    }
    highlight(color) {
      this.el.nativeElement.style.backgroundColor = color;
    }
  };
  return (HighlightDirective = _classThis);
})();
export {HighlightDirective};
//# sourceMappingURL=highlight.directive.3.js.map
