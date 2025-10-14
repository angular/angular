import {__esDecorate, __runInitializers} from 'tslib';
import {Directive, HostBinding, HostListener} from '@angular/core';
// TODO: Import input, signal, and computed from @angular/core
let HighlightDirective = (() => {
  let _classDecorators = [
    Directive({
      selector: '[highlight]',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _instanceExtraInitializers = [];
  let _get_backgroundColor_decorators;
  let _onMouseEnter_decorators;
  let _onMouseLeave_decorators;
  var HighlightDirective = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _get_backgroundColor_decorators = [HostBinding('style.backgroundColor')];
      _onMouseEnter_decorators = [HostListener('mouseenter')];
      _onMouseLeave_decorators = [HostListener('mouseleave')];
      __esDecorate(
        this,
        null,
        _get_backgroundColor_decorators,
        {
          kind: 'getter',
          name: 'backgroundColor',
          static: false,
          private: false,
          access: {has: (obj) => 'backgroundColor' in obj, get: (obj) => obj.backgroundColor},
          metadata: _metadata,
        },
        null,
        _instanceExtraInitializers,
      );
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
    // TODO: Create signal input for color with default 'yellow'
    // TODO: Create signal input for intensity with default 0.3
    // TODO: Create internal signal for hover state (private isHovered)
    // TODO: Create computed signal for background style
    get backgroundColor() {
      return 'transparent'; // TODO: Use computed signal
    }
    onMouseEnter() {
      // TODO: Set isHovered to true
    }
    onMouseLeave() {
      // TODO: Set isHovered to false
    }
    constructor() {
      __runInitializers(this, _instanceExtraInitializers);
    }
  };
  return (HighlightDirective = _classThis);
})();
export {HighlightDirective};
//# sourceMappingURL=highlight-directive.js.map
