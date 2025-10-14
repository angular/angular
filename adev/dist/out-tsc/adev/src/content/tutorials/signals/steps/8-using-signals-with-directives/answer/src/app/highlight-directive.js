import {__esDecorate, __runInitializers} from 'tslib';
import {Directive, input, computed, signal} from '@angular/core';
let HighlightDirective = (() => {
  let _classDecorators = [
    Directive({
      selector: '[highlight]',
      host: {
        '[style.backgroundColor]': 'backgroundStyle()',
        '(mouseenter)': 'onMouseEnter()',
        '(mouseleave)': 'onMouseLeave()',
      },
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
    // Signal inputs
    color = input('yellow');
    intensity = input(0.3);
    // Internal signal state
    isHovered = signal(false);
    // Computed signal for background style
    backgroundStyle = computed(() => {
      const baseColor = this.color();
      const alpha = this.isHovered() ? this.intensity() : this.intensity() * 0.5;
      // Simple color mapping
      const colorMap = {
        'yellow': `rgba(255, 255, 0, ${alpha})`,
        'blue': `rgba(0, 100, 255, ${alpha})`,
        'green': `rgba(0, 200, 0, ${alpha})`,
        'red': `rgba(255, 0, 0, ${alpha})`,
      };
      return colorMap[baseColor] || colorMap['yellow'];
    });
    onMouseEnter() {
      this.isHovered.set(true);
    }
    onMouseLeave() {
      this.isHovered.set(false);
    }
  };
  return (HighlightDirective = _classThis);
})();
export {HighlightDirective};
//# sourceMappingURL=highlight-directive.js.map
